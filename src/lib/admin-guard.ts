import "server-only";
import { revalidateTag } from "next/cache";
import { headers } from "next/headers";
import { AuthError, requireAdmin, type SessionUser } from "./auth";
import { logSecurityEvent } from "./audit";
import { env } from "./env";
import { CATALOG_TAG, CLIENTS_TAG, FAQ_TAG, PORTFOLIO_TAG } from "./queries";
import { SETTINGS_TAG } from "./settings";

export type ActionResult = { ok: boolean; message: string; errors?: Record<string, string> };

export const ok = (message: string): ActionResult => ({ ok: true, message });
export const fail = (message: string, errors?: Record<string, string>): ActionResult => ({ ok: false, message, errors });

/** Server Actions must carry an Origin header that matches this host (CSRF defence in depth). */
async function assertSameOrigin() {
  const h = await headers();
  const origin = h.get("origin");
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!origin) return false;
  try {
    return new URL(origin).host === host || origin === env.siteUrl;
  } catch {
    return false;
  }
}

/**
 * Runs an admin Server Action body: origin check, session check, optional owner role,
 * and uniform error results. Called at the top of every exported action, so
 * authorization is re-checked on every invocation.
 */
export async function runAdmin(
  handler: (user: SessionUser) => Promise<ActionResult>,
  opts: { role?: "owner" } = {},
): Promise<ActionResult> {
  {
    if (!(await assertSameOrigin())) {
      await logSecurityEvent({ type: "access_denied", detail: "admin action with missing/foreign origin" });
      return fail("Permintaan ditolak karena asal permintaan tidak valid.");
    }
    let user: SessionUser;
    try {
      user = await requireAdmin({ role: opts.role, redirectTo: false });
    } catch (err) {
      if (err instanceof AuthError) {
        return fail(err.code === "forbidden" ? "Anda tidak memiliki akses untuk tindakan ini." : "Sesi berakhir. Silakan login ulang.");
      }
      throw err;
    }
    try {
      return await handler(user);
    } catch (err) {
      // Never leak internals (SQL, stack traces) to the browser.
      if (err && typeof err === "object" && "digest" in err) throw err; // redirect()/notFound()
      console.error("[admin-action] failed", err);
      const msg = String((err as { message?: string })?.message ?? "");
      if (/duplicate key|unique/i.test(msg) || /23505/.test(String((err as { code?: string })?.code))) {
        return fail("Data dengan slug atau email tersebut sudah ada.");
      }
      return fail("Terjadi kesalahan saat menyimpan. Coba lagi.");
    }
  }
}

export function refreshPublic(...tags: ("catalog" | "portfolio" | "faq" | "settings" | "clients")[]) {
  const map = { catalog: CATALOG_TAG, portfolio: PORTFOLIO_TAG, faq: FAQ_TAG, settings: SETTINGS_TAG, clients: CLIENTS_TAG };
  for (const t of tags) revalidateTag(map[t], { expire: 0 });
}

/* ---------- FormData helpers ---------- */

export const str = (fd: FormData, key: string, max = 5000) => String(fd.get(key) ?? "").trim().slice(0, max);
export const bool = (fd: FormData, key: string) => fd.get(key) === "on" || fd.get(key) === "true";
export const list = (fd: FormData, key: string) =>
  str(fd, key)
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 50);
export const int = (fd: FormData, key: string, fallback = 0) => {
  const n = parseInt(str(fd, key), 10);
  return Number.isFinite(n) ? n : fallback;
};
export const isUuid = (v: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
