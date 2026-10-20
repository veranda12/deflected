"use server";

import { and, eq, ne } from "drizzle-orm";
import { getDb } from "@/db";
import { adminUsers, sessions } from "@/db/schema";
import { fail, ok, runAdmin, str, type ActionResult } from "@/lib/admin-guard";
import { logAudit, logSecurityEvent } from "@/lib/audit";
import { createSession, getSession } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/crypto";
import { rateLimit } from "@/lib/rate-limit";
import { passwordSchema } from "@/lib/validation";

export async function changePassword(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  return runAdmin(async (user) => {
    const limit = await rateLimit("pw-change", user.id, 5, 15 * 60);
    if (!limit.ok) return fail("Terlalu banyak percobaan. Coba lagi nanti.");
    const current = str(fd, "current", 128);
    const next = str(fd, "next", 200);
    const confirm = str(fd, "confirm", 200);
    const db = getDb();
    const [row] = await db.select({ hash: adminUsers.passwordHash }).from(adminUsers).where(eq(adminUsers.id, user.id));
    if (!row || !(await verifyPassword(current, row.hash))) return fail("Password saat ini salah.", { current: "Password saat ini salah" });
    const parsed = passwordSchema.safeParse(next);
    if (!parsed.success) return fail("Password baru belum memenuhi syarat.", { next: parsed.error.issues[0].message });
    if (next !== confirm) return fail("Konfirmasi tidak sama.", { confirm: "Tidak sama dengan password baru" });
    if (next === current) return fail("Password baru harus berbeda.", { next: "Harus berbeda dari password lama" });
    await db.update(adminUsers).set({ passwordHash: await hashPassword(next), passwordChangedAt: new Date(), updatedAt: new Date() }).where(eq(adminUsers.id, user.id));
    // Every existing session (other devices included) becomes invalid; start a fresh one here.
    await db.delete(sessions).where(eq(sessions.userId, user.id));
    await createSession(user.id);
    await logSecurityEvent({ type: "password_changed", userId: user.id, email: user.email });
    await logAudit(user, "password_change", "admin_user", user.id, "Mengganti password sendiri");
    return ok("Password diganti. Sesi di perangkat lain sudah dikeluarkan.");
  });
}

export async function revokeOtherSessions(): Promise<ActionResult> {
  return runAdmin(async (user) => {
    const current = await getSession();
    if (!current) return fail("Sesi tidak ditemukan.");
    const removed = await getDb()
      .delete(sessions)
      .where(and(eq(sessions.userId, user.id), ne(sessions.id, current.sessionId)))
      .returning({ id: sessions.id });
    await logSecurityEvent({ type: "session_revoked", userId: user.id, email: user.email, detail: `${removed.length} sesi lain` });
    return ok(`${removed.length} sesi lain dikeluarkan.`);
  });
}
