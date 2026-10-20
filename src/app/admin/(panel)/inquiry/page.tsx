import { count, desc } from "drizzle-orm";
import Link from "next/link";
import { Badge, EmptyState, filterInput, PageTitle, statusTone, syncTone, Table } from "@/components/admin/ui";
import { buttonClass } from "@/components/ui/button";
import { getDb } from "@/db";
import { inquiries } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { INQUIRY_STATUS_LABEL, SYNC_STATUS_LABEL } from "@/lib/inquiry-options";
import { inquiryWhere, INQUIRY_STATUSES, readInquiryFilters, SYNC_STATUSES } from "@/lib/inquiry-query";
import { sheetsConfigured } from "@/lib/sheets";
import { formatDateTime } from "@/lib/utils";

const PAGE = 25;
type Props = { searchParams: Promise<Record<string, string | undefined>> };

export default async function AdminInquiries({ searchParams }: Props) {
  await requireAdmin();
  const sp = await searchParams;
  const f = readInquiryFilters(sp);
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const db = getDb();
  const where = inquiryWhere(f);
  const [rows, [{ total }]] = await Promise.all([
    db.select().from(inquiries).where(where).orderBy(desc(inquiries.createdAt)).limit(PAGE).offset((page - 1) * PAGE),
    db.select({ total: count() }).from(inquiries).where(where),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE));
  const qs = (extra: Record<string, string>) => new URLSearchParams({ ...(f.q && { q: f.q }), ...(f.status && { status: f.status }), ...(f.sync && { sync: f.sync }), ...extra }).toString();

  return (
    <>
      <PageTitle
        title="Inquiry"
        description="Permintaan penawaran dari form situs. Data tersimpan di database dan disalin ke Google Sheets."
        actions={
          <a href={`/api/admin/inquiries/export?${qs({})}`} className={buttonClass("outline")}>
            Ekspor CSV
          </a>
        }
      />
      {!sheetsConfigured() && (
        <p className="mb-4 rounded-sm bg-warning-soft px-4 py-3 text-sm text-warning">
          Google Sheets belum dikonfigurasi. Inquiry tetap tersimpan aman di database; sinkronisasi akan berjalan setelah kredensial diisi.
        </p>
      )}
      {sp.dihapus && <p role="status" className="mb-4 rounded-sm bg-success-soft px-4 py-3 text-sm text-success">Inquiry dihapus.</p>}
      <form method="get" className="mb-5 flex flex-wrap gap-2" role="search">
        <input name="q" defaultValue={f.q} placeholder="Nama, perusahaan, WhatsApp, atau ref" className={`${filterInput} min-w-56 flex-1`} aria-label="Cari inquiry" />
        <select name="status" defaultValue={f.status} className={filterInput} aria-label="Filter status">
          <option value="">Semua status</option>
          {INQUIRY_STATUSES.map((s) => (
            <option key={s} value={s}>
              {INQUIRY_STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        <select name="sync" defaultValue={f.sync} className={filterInput} aria-label="Filter sinkronisasi">
          <option value="">Semua sinkron</option>
          {SYNC_STATUSES.map((s) => (
            <option key={s} value={s}>
              {SYNC_STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        <button type="submit" className={buttonClass("dark")}>
          Terapkan
        </button>
      </form>

      {rows.length === 0 ? (
        <EmptyState
          title={f.q || f.status || f.sync ? "Tidak ada inquiry yang cocok" : "Belum ada inquiry"}
          body={f.q || f.status || f.sync ? "Ubah kata kunci atau filter." : "Permintaan dari form penawaran di halaman Kontak akan muncul di sini."}
        />
      ) : (
        <>
          <Table head={["Masuk", "Pelanggan", "Kebutuhan", "Status", "Sheets"]}>
            {rows.map((r) => (
              <tr key={r.id} className="align-top hover:bg-mist/60">
                <td className="px-4 py-3 whitespace-nowrap text-text-2">
                  {formatDateTime(r.createdAt)}
                  <p className="text-[0.75rem] text-text-3">{r.ref}</p>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/inquiry/${r.id}`} className="font-semibold text-ink hover:text-blue-strong hover:underline">
                    {r.name}
                  </Link>
                  <p className="text-[0.8rem] text-text-2">{r.company || "Perorangan"}</p>
                </td>
                <td className="px-4 py-3 text-text-2">
                  {r.productTypes.join(", ")}
                  <p className="text-[0.8rem] text-text-3">{r.quantity}</p>
                </td>
                <td className="px-4 py-3">
                  <Badge tone={statusTone(r.status)}>{INQUIRY_STATUS_LABEL[r.status]}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge tone={syncTone(r.sheetStatus)}>{SYNC_STATUS_LABEL[r.sheetStatus]}</Badge>
                </td>
              </tr>
            ))}
          </Table>
          <nav aria-label="Halaman" className="mt-4 flex items-center justify-between text-sm text-text-2">
            <p>
              {total} inquiry · halaman {page} dari {pages}
            </p>
            <div className="flex gap-2">
              {page > 1 && (
                <Link href={`/admin/inquiry?${qs({ page: String(page - 1) })}`} className={buttonClass("outline")}>
                  Sebelumnya
                </Link>
              )}
              {page < pages && (
                <Link href={`/admin/inquiry?${qs({ page: String(page + 1) })}`} className={buttonClass("outline")}>
                  Berikutnya
                </Link>
              )}
            </div>
          </nav>
        </>
      )}
    </>
  );
}
