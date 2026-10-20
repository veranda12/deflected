"use server";

import { and, count, eq, ne } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { adminUsers, sessions } from "@/db/schema";
import { fail, isUuid, ok, runAdmin, str, type ActionResult } from "@/lib/admin-guard";
import { logAudit } from "@/lib/audit";
import { hashPassword } from "@/lib/crypto";
import { fieldErrors, passwordSchema } from "@/lib/validation";

const createSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(80),
  email: z.string().trim().toLowerCase().max(200).pipe(z.email("Email tidak valid")),
  role: z.enum(["owner", "editor"]),
  password: passwordSchema,
});

export async function createAdmin(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  return runAdmin(
    async (user) => {
      const parsed = createSchema.safeParse({ name: str(fd, "name", 80), email: str(fd, "email", 200), role: str(fd, "role", 10), password: str(fd, "password", 200) });
      if (!parsed.success) return fail("Periksa kembali isian.", fieldErrors(parsed.error));
      const d = parsed.data;
      const [row] = await getDb()
        .insert(adminUsers)
        .values({ name: d.name, email: d.email, role: d.role, passwordHash: await hashPassword(d.password) })
        .returning({ id: adminUsers.id });
      await logAudit(user, "create", "admin_user", row.id, `Membuat admin ${d.email} (${d.role})`);
      return ok(`Akun ${d.email} dibuat. Sampaikan password sementara secara langsung, minta segera diganti.`);
    },
    { role: "owner" },
  );
}

async function ownersLeft(excludeId: string) {
  const [{ n }] = await getDb()
    .select({ n: count() })
    .from(adminUsers)
    .where(and(eq(adminUsers.role, "owner"), eq(adminUsers.isActive, true), ne(adminUsers.id, excludeId)));
  return n;
}

export async function updateAdmin(id: string, _prev: ActionResult, fd: FormData): Promise<ActionResult> {
  return runAdmin(
    async (user) => {
      if (!isUuid(id)) return fail("ID tidak valid.");
      const role = str(fd, "role", 10) === "owner" ? "owner" : "editor";
      const isActive = fd.get("isActive") === "on";
      const db = getDb();
      const [target] = await db.select().from(adminUsers).where(eq(adminUsers.id, id));
      if (!target) return fail("Pengguna tidak ditemukan.");
      if ((role !== "owner" || !isActive) && target.role === "owner" && (await ownersLeft(id)) === 0) {
        return fail("Harus ada minimal satu owner aktif.");
      }
      const password = str(fd, "password", 200);
      // Saving also clears a temporary login lock.
      const patch: Partial<typeof adminUsers.$inferInsert> = { role, isActive, failedLoginCount: 0, lockedUntil: null, updatedAt: new Date() };
      if (password) {
        const p = passwordSchema.safeParse(password);
        if (!p.success) return fail("Password belum memenuhi syarat.", { password: p.error.issues[0].message });
        patch.passwordHash = await hashPassword(password);
        patch.passwordChangedAt = new Date();
      }
      await db.update(adminUsers).set(patch).where(eq(adminUsers.id, id));
      if (!isActive || password) await db.delete(sessions).where(eq(sessions.userId, id));
      await logAudit(user, "update", "admin_user", id, `Mengubah ${target.email}: role ${role}, ${isActive ? "aktif" : "nonaktif"}${password ? ", reset password" : ""}`);
      return ok("Pengguna diperbarui.");
    },
    { role: "owner" },
  );
}
