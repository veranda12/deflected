"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { inquiries } from "@/db/schema";
import { fail, isUuid, ok, runAdmin, str, type ActionResult } from "@/lib/admin-guard";
import { logAudit } from "@/lib/audit";
import { INQUIRY_STATUS_LABEL } from "@/lib/inquiry-options";
import { INQUIRY_STATUSES } from "@/lib/inquiry-query";
import { sheetsConfigured, syncInquiry } from "@/lib/sheets";

export async function updateInquiry(id: string, _prev: ActionResult, fd: FormData): Promise<ActionResult> {
  return runAdmin(async (user) => {
    if (!isUuid(id)) return fail("ID tidak valid.");
    const status = str(fd, "status", 30);
    if (!(INQUIRY_STATUSES as readonly string[]).includes(status)) return fail("Status tidak valid.", { status: "Pilih status" });
    const [row] = await getDb()
      .update(inquiries)
      .set({ status: status as (typeof INQUIRY_STATUSES)[number], adminNotes: str(fd, "adminNotes", 3000), updatedAt: new Date() })
      .where(eq(inquiries.id, id))
      .returning({ ref: inquiries.ref });
    if (!row) return fail("Inquiry tidak ditemukan.");
    await logAudit(user, "update", "inquiry", id, `Status ${row.ref} menjadi ${INQUIRY_STATUS_LABEL[status]}`);
    return ok("Tersimpan.");
  });
}

export async function resyncInquiry(id: string): Promise<ActionResult> {
  return runAdmin(async (user) => {
    if (!isUuid(id)) return fail("ID tidak valid.");
    if (!sheetsConfigured()) return fail("Google Sheets belum dikonfigurasi. Lihat dokumentasi bagian Google Sheets.");
    const res = await syncInquiry(id);
    await logAudit(user, "sync", "inquiry", id, `Sinkron ulang Google Sheets: ${res}`);
    if (res === "synced") return ok("Tersinkron ke Google Sheets.");
    if (res === "skipped") return ok("Inquiry ini sudah tersinkron atau sedang diproses.");
    return fail("Sinkronisasi gagal. Detail error tercatat di halaman ini.");
  });
}

/** Owner-only: for data deletion requests from customers. */
export async function deleteInquiry(id: string): Promise<ActionResult> {
  return runAdmin(
    async (user) => {
      if (!isUuid(id)) return fail("ID tidak valid.");
      const [row] = await getDb().delete(inquiries).where(eq(inquiries.id, id)).returning({ ref: inquiries.ref });
      if (!row) return fail("Inquiry tidak ditemukan.");
      await logAudit(user, "delete", "inquiry", id, `Menghapus inquiry ${row.ref}`);
      redirect("/admin/inquiry?dihapus=1");
    },
    { role: "owner" },
  );
}
