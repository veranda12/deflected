import "server-only";
import { sql } from "drizzle-orm";
import { getDb } from "@/db";

export type RateLimitResult = { ok: boolean; remaining: number; retryAfterSec: number };

/**
 * Fixed-window counter stored in Postgres so limits hold across serverless instances.
 * One atomic upsert per check.
 */
export async function rateLimit(bucket: string, key: string, limit: number, windowSec: number): Promise<RateLimitResult> {
  const db = getDb();
  const rows = await db.execute<{ count: number; window_start: string }>(sql`
    insert into rate_limits (bucket, key, window_start, count)
    values (${bucket}, ${key}, now(), 1)
    on conflict (bucket, key) do update set
      count = case when rate_limits.window_start < now() - make_interval(secs => ${windowSec})
                   then 1 else rate_limits.count + 1 end,
      window_start = case when rate_limits.window_start < now() - make_interval(secs => ${windowSec})
                   then now() else rate_limits.window_start end
    returning count, window_start
  `);
  const row = rows[0];
  const count = Number(row?.count ?? 1);
  const started = row ? new Date(row.window_start).getTime() : Date.now();
  const retryAfterSec = Math.max(1, Math.ceil((started + windowSec * 1000 - Date.now()) / 1000));
  return { ok: count <= limit, remaining: Math.max(0, limit - count), retryAfterSec };
}

export async function resetRateLimit(bucket: string, key: string) {
  await getDb().execute(sql`delete from rate_limits where bucket = ${bucket} and key = ${key}`);
}
