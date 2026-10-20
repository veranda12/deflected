import "server-only";
import { and, eq, ilike, or, type SQL } from "drizzle-orm";
import { inquiries } from "@/db/schema";

export const INQUIRY_STATUSES = ["baru", "dihubungi", "penawaran_dikirim", "deal", "batal"] as const;
export const SYNC_STATUSES = ["pending", "syncing", "synced", "failed", "disabled"] as const;

export type InquiryFilters = { q: string; status: string; sync: string };

export function readInquiryFilters(sp: Record<string, string | undefined>): InquiryFilters {
  return {
    q: (sp.q ?? "").slice(0, 80),
    status: (INQUIRY_STATUSES as readonly string[]).includes(sp.status ?? "") ? sp.status! : "",
    sync: (SYNC_STATUSES as readonly string[]).includes(sp.sync ?? "") ? sp.sync! : "",
  };
}

export function inquiryWhere(f: InquiryFilters) {
  const where: SQL[] = [];
  if (f.q) {
    const like = `%${f.q}%`;
    where.push(or(ilike(inquiries.name, like), ilike(inquiries.company, like), ilike(inquiries.whatsapp, like), ilike(inquiries.ref, like), ilike(inquiries.email, like))!);
  }
  if (f.status) where.push(eq(inquiries.status, f.status as (typeof INQUIRY_STATUSES)[number]));
  if (f.sync) where.push(eq(inquiries.sheetStatus, f.sync as (typeof SYNC_STATUSES)[number]));
  return where.length ? and(...where) : undefined;
}
