"use server";

import { eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDb } from "@/db";
import { adminUsers } from "@/db/schema";
import { logSecurityEvent } from "@/lib/audit";
import { createSession, destroyCurrentSession, getSession } from "@/lib/auth";
import { DUMMY_PASSWORD_HASH, verifyPassword } from "@/lib/crypto";
import { rateLimit, resetRateLimit } from "@/lib/rate-limit";
import { getClientFingerprint } from "@/lib/request";

export type LoginState = { error?: string };

const schema = z.object({
  email: z.string().trim().toLowerCase().max(200).pipe(z.email()),
  password: z.string().min(1).max(128),
});

const LOCK_AFTER = 8;
const LOCK_MINUTES = 15;
const GENERIC = "Email atau password salah.";

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const { ipHash } = await getClientFingerprint();
  const ipLimit = await rateLimit("login-ip", ipHash, 20, 15 * 60);
  if (!ipLimit.ok) {
    await logSecurityEvent({ type: "rate_limited", detail: "login per IP" });
    return { error: `Terlalu banyak percobaan login. Coba lagi dalam ${Math.ceil(ipLimit.retryAfterSec / 60)} menit.` };
  }

  const parsed = schema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { error: GENERIC };
  const { email, password } = parsed.data;

  const emailLimit = await rateLimit("login-email", email, 10, 15 * 60);
  if (!emailLimit.ok) {
    await logSecurityEvent({ type: "rate_limited", email, detail: "login per email" });
    return { error: `Terlalu banyak percobaan untuk akun ini. Coba lagi dalam ${Math.ceil(emailLimit.retryAfterSec / 60)} menit.` };
  }

  const db = getDb();
  const [user] = await db.select().from(adminUsers).where(eq(adminUsers.email, email)).limit(1);
  // Always run the hash so timing does not reveal whether the email exists.
  const valid = await verifyPassword(password, user?.passwordHash ?? DUMMY_PASSWORD_HASH);

  if (!user || !user.isActive) {
    await logSecurityEvent({ type: "login_failed", email, detail: user ? "inactive account" : "unknown email" });
    return { error: GENERIC };
  }
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    await logSecurityEvent({ type: "login_failed", email, userId: user.id, detail: "account locked" });
    return { error: `Akun dikunci sementara karena terlalu banyak percobaan gagal. Coba lagi setelah ${LOCK_MINUTES} menit.` };
  }
  if (!valid) {
    const failures = user.failedLoginCount + 1;
    const lock = failures >= LOCK_AFTER;
    await db
      .update(adminUsers)
      .set({
        failedLoginCount: lock ? 0 : failures,
        lockedUntil: lock ? sql`now() + make_interval(mins => ${LOCK_MINUTES})` : user.lockedUntil,
      })
      .where(eq(adminUsers.id, user.id));
    await logSecurityEvent({ type: lock ? "login_locked" : "login_failed", email, userId: user.id, detail: `failed attempt ${failures}` });
    return { error: GENERIC };
  }

  await db.update(adminUsers).set({ failedLoginCount: 0, lockedUntil: null, lastLoginAt: new Date() }).where(eq(adminUsers.id, user.id));
  await resetRateLimit("login-email", email);
  await createSession(user.id);
  await logSecurityEvent({ type: "login_success", email, userId: user.id });
  redirect("/admin");
}

export async function logout() {
  const session = await getSession();
  if (session) await logSecurityEvent({ type: "logout", userId: session.user.id, email: session.user.email });
  await destroyCurrentSession();
  redirect("/admin/login");
}
