"use server";

import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { faqs } from "@/db/schema";
import { bool, fail, int, isUuid, ok, refreshPublic, runAdmin, str, type ActionResult } from "@/lib/admin-guard";
import { logAudit } from "@/lib/audit";

export async function saveFaq(id: string | null, _prev: ActionResult, fd: FormData): Promise<ActionResult> {
  return runAdmin(async (user) => {
    if (id && !isUuid(id)) return fail("ID tidak valid.");
    const question = str(fd, "question", 300);
    const answer = str(fd, "answer", 3000);
    const errors: Record<string, string> = {};
    if (question.length < 5) errors.question = "Pertanyaan minimal 5 karakter";
    if (answer.length < 5) errors.answer = "Jawaban minimal 5 karakter";
    if (Object.keys(errors).length) return fail("Periksa kembali isian.", errors);
    const values = { question, answer, sortOrder: int(fd, "sortOrder"), isPublished: bool(fd, "isPublished"), updatedAt: new Date() };
    const db = getDb();
    if (id) {
      const [row] = await db.update(faqs).set(values).where(eq(faqs.id, id)).returning({ id: faqs.id });
      if (!row) return fail("FAQ tidak ditemukan.");
      await logAudit(user, "update", "faq", id, `Memperbarui FAQ "${question.slice(0, 60)}"`);
    } else {
      const [row] = await db.insert(faqs).values(values).returning({ id: faqs.id });
      await logAudit(user, "create", "faq", row.id, `Menambah FAQ "${question.slice(0, 60)}"`);
    }
    refreshPublic("faq");
    return ok(id ? "FAQ tersimpan." : "FAQ ditambahkan.");
  });
}

export async function deleteFaq(id: string): Promise<ActionResult> {
  return runAdmin(async (user) => {
    if (!isUuid(id)) return fail("ID tidak valid.");
    const [row] = await getDb().delete(faqs).where(eq(faqs.id, id)).returning({ q: faqs.question });
    if (!row) return fail("FAQ tidak ditemukan.");
    await logAudit(user, "delete", "faq", id, `Menghapus FAQ "${row.q.slice(0, 60)}"`);
    refreshPublic("faq");
    return ok("FAQ dihapus.");
  });
}
