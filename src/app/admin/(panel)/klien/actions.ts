"use server";

import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { clients, media } from "@/db/schema";
import { bool, fail, int, isUuid, ok, refreshPublic, runAdmin, str, type ActionResult } from "@/lib/admin-guard";
import { logAudit } from "@/lib/audit";

export async function saveClient(id: string | null, _prev: ActionResult, fd: FormData): Promise<ActionResult> {
  return runAdmin(async (user) => {
    if (id && !isUuid(id)) return fail("ID tidak valid.");
    const name = str(fd, "name", 120);
    const logoId = str(fd, "logoMediaId", 64);
    if (name.length < 2) return fail("Periksa kembali isian.", { name: "Nama minimal 2 karakter" });
    if (logoId && !isUuid(logoId)) return fail("Logo tidak valid.");

    const db = getDb();
    if (logoId) {
      const [m] = await db.select({ id: media.id }).from(media).where(eq(media.id, logoId)).limit(1);
      if (!m) return fail("Logo tidak ditemukan. Unggah ulang logo.");
    }

    const values = {
      name,
      logoMediaId: logoId || null,
      sortOrder: int(fd, "sortOrder"),
      isPublished: bool(fd, "isPublished"),
      updatedAt: new Date(),
    };
    if (id) {
      const [row] = await db.update(clients).set(values).where(eq(clients.id, id)).returning({ id: clients.id });
      if (!row) return fail("Klien tidak ditemukan.");
      await logAudit(user, "update", "client", id, `Memperbarui klien "${name.slice(0, 60)}"`);
    } else {
      const [row] = await db.insert(clients).values(values).returning({ id: clients.id });
      await logAudit(user, "create", "client", row.id, `Menambah klien "${name.slice(0, 60)}"`);
    }
    refreshPublic("clients");
    return ok(id ? "Klien tersimpan." : "Klien ditambahkan.");
  });
}

export async function deleteClient(id: string): Promise<ActionResult> {
  return runAdmin(async (user) => {
    if (!isUuid(id)) return fail("ID tidak valid.");
    const [row] = await getDb().delete(clients).where(eq(clients.id, id)).returning({ name: clients.name });
    if (!row) return fail("Klien tidak ditemukan.");
    await logAudit(user, "delete", "client", id, `Menghapus klien "${row.name.slice(0, 60)}"`);
    refreshPublic("clients");
    return ok("Klien dihapus.");
  });
}
