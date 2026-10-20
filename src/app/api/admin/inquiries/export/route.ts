import { desc } from "drizzle-orm";
import { getDb } from "@/db";
import { inquiries } from "@/db/schema";
import { logAudit } from "@/lib/audit";
import { AuthError, requireAdmin } from "@/lib/auth";
import { INQUIRY_STATUS_LABEL, SYNC_STATUS_LABEL } from "@/lib/inquiry-options";
import { inquiryWhere, readInquiryFilters } from "@/lib/inquiry-query";

function csvCell(v: string) {
  // Neutralise spreadsheet formulas, then quote.
  const safe = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
  return `"${safe.replace(/"/g, '""')}"`;
}

export async function GET(req: Request) {
  let user;
  try {
    user = await requireAdmin({ redirectTo: false });
  } catch (e) {
    if (e instanceof AuthError) return new Response("Unauthorized", { status: 401 });
    throw e;
  }
  const sp = Object.fromEntries(new URL(req.url).searchParams);
  const f = readInquiryFilters(sp);
  const rows = await getDb().select().from(inquiries).where(inquiryWhere(f)).orderBy(desc(inquiries.createdAt)).limit(10_000);
  const header = ["Ref", "Tanggal", "Nama", "Perusahaan", "WhatsApp", "Email", "Produk", "Jumlah", "Bahan", "Finishing", "Target", "Catatan", "Status", "Catatan internal", "Google Sheets"];
  const lines = [
    header.map(csvCell).join(","),
    ...rows.map((r) =>
      [
        r.ref,
        r.createdAt.toISOString(),
        r.name,
        r.company,
        r.whatsapp,
        r.email,
        r.productTypes.join("; "),
        r.quantity,
        r.material,
        r.finishing.join("; "),
        r.targetDate,
        r.notes,
        INQUIRY_STATUS_LABEL[r.status],
        r.adminNotes,
        SYNC_STATUS_LABEL[r.sheetStatus],
      ]
        .map((v) => csvCell(String(v ?? "")))
        .join(","),
    ),
  ];
  await logAudit(user, "export", "inquiry", null, `Ekspor ${rows.length} inquiry ke CSV`);
  const stamp = new Date().toISOString().slice(0, 10);
  return new Response("﻿" + lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="inquiry-deflected-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
