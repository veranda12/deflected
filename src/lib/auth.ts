import "server-only";
import { and, eq, gt, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { getDb } from "@/db";
import { adminUsers, sessions, type AdminUser } from "@/db/schema";
import { logSecurityEvent } from "./audit";
import { randomToken, sha256Hex } from "./crypto";
import { env } from "./env";
import { getClientFingerprint } from "./request";

export const SESSION_COOKIE = process.env.NODE_ENV === "production" ? "__Host-dflctd_session" : "dflctd_session";
const SESSION_ABSOLUTE_MS = 12 * 60 * 60 * 1000; // 12 hours
const SESSION_IDLE_MS = 2 * 60 * 60 * 1000; // 2 hours without activity
const TOUCH_INTERVAL_MS = 5 * 60 * 1000;

export type SessionUser = Pick<AdminUser, "id" | "email" | "name" | "role">;

export async function createSession(userId: string) {
  const token = randomToken(32);
  const id = await sha256Hex(token);
  const { ipHash, userAgent } = await getClientFingerprint();
  const expiresAt = new Date(Date.now() + SESSION_ABSOLUTE_MS);
  await getDb().insert(sessions).values({ id, userId, expiresAt, ipHash, userAgent });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: env.isProd,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

/** Validates the session cookie against the database. Cached per request. */
export const getSession = cache(async (): Promise<{ user: SessionUser; sessionId: string } | null> => {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token || token.length > 100) return null;
  const id = await sha256Hex(token);
  const db = getDb();
  const rows = await db
    .select({
      sessionId: sessions.id,
      expiresAt: sessions.expiresAt,
      lastSeenAt: sessions.lastSeenAt,
      createdAt: sessions.createdAt,
      user: {
        id: adminUsers.id,
        email: adminUsers.email,
        name: adminUsers.name,
        role: adminUsers.role,
        isActive: adminUsers.isActive,
        passwordChangedAt: adminUsers.passwordChangedAt,
      },
    })
    .from(sessions)
    .innerJoin(adminUsers, eq(sessions.userId, adminUsers.id))
    .where(and(eq(sessions.id, id), gt(sessions.expiresAt, new Date())))
    .limit(1);
  const row = rows[0];
  if (!row) return null;
  const now = Date.now();
  const idle = now - row.lastSeenAt.getTime() > SESSION_IDLE_MS;
  // Sessions created before the last password change are void.
  const stale = row.createdAt.getTime() < row.user.passwordChangedAt.getTime() - 1000;
  if (!row.user.isActive || idle || stale) {
    await db.delete(sessions).where(eq(sessions.id, id));
    return null;
  }
  if (now - row.lastSeenAt.getTime() > TOUCH_INTERVAL_MS) {
    await db.update(sessions).set({ lastSeenAt: new Date() }).where(eq(sessions.id, id));
  }
  const { id: uid, email, name, role } = row.user;
  return { user: { id: uid, email, name, role }, sessionId: row.sessionId };
});

export async function destroyCurrentSession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await getDb().delete(sessions).where(eq(sessions.id, await sha256Hex(token)));
  jar.delete(SESSION_COOKIE);
}

/**
 * Authorization gate for every admin page, Server Action and Route Handler.
 * The proxy redirect is only a UX shortcut; this check is the real one.
 */
export async function requireAdmin(opts: { role?: "owner"; redirectTo?: boolean } = {}): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    if (opts.redirectTo !== false) redirect("/admin/login");
    throw new AuthError("unauthenticated");
  }
  if (opts.role === "owner" && session.user.role !== "owner") {
    await logSecurityEvent({ type: "access_denied", userId: session.user.id, email: session.user.email, detail: "owner-only resource" });
    if (opts.redirectTo !== false) redirect("/admin?denied=1");
    throw new AuthError("forbidden");
  }
  return session.user;
}

export class AuthError extends Error {
  constructor(public code: "unauthenticated" | "forbidden") {
    super(code);
  }
}

export async function purgeExpiredSessions() {
  await getDb()
    .delete(sessions)
    .where(sql`${sessions.expiresAt} < now() or ${sessions.lastSeenAt} < now() - interval '2 hours'`);
}

