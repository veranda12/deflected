import "server-only";
import { and, eq, inArray, isNull, lt, or, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { inquiries, type Inquiry } from "@/db/schema";
import { INQUIRY_STATUS_LABEL } from "./inquiry-options";

/*
 * Google Sheets sync through a service account (JWT RS256 signed with Web Crypto,
 * so it runs on Node and on Cloudflare Workers without the googleapis SDK).
 * Flow: inquiry is stored in Postgres first, then appended here. Failures are
 * recorded on the row and retried by /api/cron/sheets-sync or from the admin.
 */

const MAX_ATTEMPTS = 8;
const LOCK_MS = 2 * 60 * 1000;

export function sheetsConfigured() {
  return !!(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY && process.env.GOOGLE_SHEETS_ID);
}

const tab = () => process.env.GOOGLE_SHEETS_TAB || "Inquiry";
// Overridable only so the flow can be tested against a local mock (see docs/TESTING.md).
const TOKEN_URL = () => process.env.GOOGLE_TOKEN_URL_OVERRIDE || "https://oauth2.googleapis.com/token";
const SHEETS_BASE = () => process.env.GOOGLE_SHEETS_API_OVERRIDE || "https://sheets.googleapis.com";

let cachedToken: { token: string; exp: number } | null = null;

function b64url(input: ArrayBuffer | string) {
  const bytes = typeof input === "string" ? new TextEncoder().encode(input) : new Uint8Array(input);
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.exp > Date.now() + 60_000) return cachedToken.token;
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!;
  const pem = process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, "\n");
  const der = Uint8Array.from(
    atob(pem.replace(/-----(BEGIN|END) PRIVATE KEY-----/g, "").replace(/\s+/g, "")),
    (c) => c.charCodeAt(0),
  );
  const key = await crypto.subtle.importKey("pkcs8", der, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = b64url(
    JSON.stringify({ iss: email, scope: "https://www.googleapis.com/auth/spreadsheets", aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600 }),
  );
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(`${header}.${claims}`));
  const res = await fetch(TOKEN_URL(), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${header}.${claims}.${b64url(sig)}` }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Google token error ${res.status}`);
  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = { token: data.access_token, exp: Date.now() + data.expires_in * 1000 };
  return data.access_token;
}

/** Prevents spreadsheet formula injection (=, +, -, @ at the start of a cell). */
function cell(v: string) {
  return /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
}

function toRow(i: Inquiry) {
  return [
    i.ref,
    new Date(i.createdAt).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }),
    i.name,
    i.company,
    i.whatsapp,
    i.email,
    i.productTypes.join(", "),
    i.quantity,
    i.material,
    i.finishing.join(", "),
    i.targetDate,
    i.notes,
    INQUIRY_STATUS_LABEL[i.status] ?? i.status,
  ].map((v) => cell(String(v ?? "")));
}

async function sheetsFetch(path: string, init?: RequestInit) {
  const token = await getAccessToken();
  const res = await fetch(`${SHEETS_BASE()}/v4/spreadsheets/${process.env.GOOGLE_SHEETS_ID}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...(init?.headers ?? {}) },
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`Sheets API ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res.json();
}

async function refExists(ref: string) {
  const data = (await sheetsFetch(`/values/${encodeURIComponent(`${tab()}!A:A`)}`)) as { values?: string[][] };
  return (data.values ?? []).some((r) => r[0] === ref);
}

async function appendRow(i: Inquiry) {
  await sheetsFetch(`/values/${encodeURIComponent(`${tab()}!A1`)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`, {
    method: "POST",
    body: JSON.stringify({ values: [toRow(i)] }),
  });
}

/**
 * Atomically claims one inquiry (status pending/failed, not locked) and syncs it.
 * The claim + ref check make retries idempotent: a row is never appended twice.
 */
export async function syncInquiry(id: string): Promise<"synced" | "failed" | "skipped" | "disabled"> {
  const db = getDb();
  if (!sheetsConfigured()) {
    await db.update(inquiries).set({ sheetStatus: "disabled" }).where(and(eq(inquiries.id, id), inArray(inquiries.sheetStatus, ["pending", "failed"])));
    return "disabled";
  }
  const [claimed] = await db
    .update(inquiries)
    .set({ sheetStatus: "syncing", sheetLockedAt: new Date(), sheetAttempts: sql`${inquiries.sheetAttempts} + 1` })
    .where(
      and(
        eq(inquiries.id, id),
        or(
          inArray(inquiries.sheetStatus, ["pending", "failed", "disabled"]),
          and(eq(inquiries.sheetStatus, "syncing"), lt(inquiries.sheetLockedAt, new Date(Date.now() - LOCK_MS))),
        ),
      ),
    )
    .returning();
  if (!claimed) return "skipped";
  try {
    if (claimed.sheetAttempts <= 1 || !(await refExists(claimed.ref))) await appendRow(claimed);
    await db
      .update(inquiries)
      .set({ sheetStatus: "synced", sheetSyncedAt: new Date(), sheetLastError: null, sheetLockedAt: null })
      .where(eq(inquiries.id, id));
    return "synced";
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    await db
      .update(inquiries)
      .set({ sheetStatus: "failed", sheetLastError: message.slice(0, 300), sheetLockedAt: null })
      .where(eq(inquiries.id, id));
    console.error("[sheets] sync failed", claimed.ref, message);
    return "failed";
  }
}

/** Retries failed/pending rows with attempts below the cap. Called by the cron endpoint. */
export async function syncPending(limit = 20) {
  if (!sheetsConfigured()) return { processed: 0, synced: 0, failed: 0, disabled: true };
  const rows = await getDb()
    .select({ id: inquiries.id })
    .from(inquiries)
    .where(
      and(
        or(inArray(inquiries.sheetStatus, ["pending", "failed", "disabled"]), and(eq(inquiries.sheetStatus, "syncing"), or(isNull(inquiries.sheetLockedAt), lt(inquiries.sheetLockedAt, new Date(Date.now() - LOCK_MS))))),
        lt(inquiries.sheetAttempts, MAX_ATTEMPTS),
      ),
    )
    .orderBy(inquiries.createdAt)
    .limit(limit);
  let synced = 0;
  let failed = 0;
  for (const r of rows) {
    const res = await syncInquiry(r.id);
    if (res === "synced") synced++;
    if (res === "failed") failed++;
  }
  return { processed: rows.length, synced, failed, disabled: false };
}
