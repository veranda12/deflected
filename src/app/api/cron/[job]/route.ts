import { sql } from "drizzle-orm";
import { getDb } from "@/db";
import { purgeExpiredSessions } from "@/lib/auth";
import { timingSafeEqual } from "@/lib/crypto";
import { env } from "@/lib/env";
import { syncPending } from "@/lib/sheets";

// Internal endpoints for scheduled jobs. Protected by a bearer secret, never linked publicly.
// POST /api/cron/sheets-sync   retry Google Sheets sync
// POST /api/cron/maintenance   purge expired sessions, old rate-limit rows, old security logs (90 days)

export async function POST(req: Request, ctx: { params: Promise<{ job: string }> }) {
  const auth = req.headers.get("authorization") ?? "";
  const expected = `Bearer ${env.cronSecret}`;
  if (!env.cronSecret || !timingSafeEqual(auth, expected)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const { job } = await ctx.params;
  if (job === "sheets-sync") {
    return Response.json(await syncPending(25));
  }
  if (job === "maintenance") {
    const db = getDb();
    await purgeExpiredSessions();
    await db.execute(sql`delete from rate_limits where window_start < now() - interval '1 day'`);
    await db.execute(sql`delete from security_events where created_at < now() - interval '90 days'`);
    await db.execute(sql`delete from audit_logs where created_at < now() - interval '365 days'`);
    return Response.json({ ok: true });
  }
  return Response.json({ error: "unknown job" }, { status: 404 });
}
