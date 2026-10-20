import { count, desc, eq } from "drizzle-orm";
import Link from "next/link";
import { Panel } from "@/components/admin/form";
import { Badge, PageTitle, statusTone } from "@/components/admin/ui";
import { getDb } from "@/db";
import { auditLogs, categories, inquiries, portfolioProjects, products } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { INQUIRY_STATUS_LABEL } from "@/lib/inquiry-options";
import { formatDateTime } from "@/lib/utils";

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const user = await requireAdmin();
  const { denied } = await searchParams;
  const db = getDb();
  const [[p], [pPub], [c], [pf], [inqNew], [inqAll], recent, activity, failedSync] = await Promise.all([
    db.select({ n: count() }).from(products),
    db.select({ n: count() }).from(products).where(eq(products.status, "published")),
    db.select({ n: count() }).from(categories),
    db.select({ n: count() }).from(portfolioProjects),
    db.select({ n: count() }).from(inquiries).where(eq(inquiries.status, "baru")),
    db.select({ n: count() }).from(inquiries),
    db.select().from(inquiries).orderBy(desc(inquiries.createdAt)).limit(6),
    db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(8),
    db.select({ n: count() }).from(inquiries).where(eq(inquiries.sheetStatus, "failed")),
  ]);
  const stats = [
    { label: "Inquiry baru", value: inqNew.n, sub: `${inqAll.n} total`, href: "/admin/inquiry?status=baru" },
    { label: "Produk", value: p.n, sub: `${pPub.n} tampil di situs`, href: "/admin/produk" },
    { label: "Kategori", value: c.n, sub: "di katalog", href: "/admin/kategori" },
    { label: "Portofolio", value: pf.n, sub: "proyek", href: "/admin/portofolio" },
  ];
  return (
    <>
      <PageTitle title={`Halo, ${user.name}`} description="Ringkasan katalog dan permintaan penawaran." />
      {denied && <p role="alert" className="mb-4 rounded-sm bg-danger-soft px-4 py-3 text-sm text-danger">Halaman tersebut hanya untuk owner.</p>}
      {failedSync[0].n > 0 && (
        <p className="mb-4 rounded-sm bg-warning-soft px-4 py-3 text-sm text-warning">
          {failedSync[0].n} inquiry gagal disinkronkan ke Google Sheets.{" "}
          <Link href="/admin/inquiry?sync=failed" className="font-semibold underline">
            Lihat
          </Link>
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="rounded-md border border-line bg-white p-5 transition-colors hover:border-ink">
            <p className="text-sm text-text-2">{s.label}</p>
            <p className="mt-1 text-3xl font-semibold text-ink">{s.value}</p>
            <p className="mt-1 text-[0.8rem] text-text-3">{s.sub}</p>
          </Link>
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Panel
          title="Inquiry terbaru"
          actions={
            <Link href="/admin/inquiry" className="text-sm font-semibold text-blue-strong hover:underline">
              Semua inquiry
            </Link>
          }
        >
          {recent.length === 0 ? (
            <p className="text-sm text-text-2">Belum ada inquiry. Permintaan dari halaman Kontak akan muncul di sini.</p>
          ) : (
            <ul className="divide-y divide-line">
              {recent.map((r) => (
                <li key={r.id}>
                  <Link href={`/admin/inquiry/${r.id}`} className="flex items-center justify-between gap-4 py-3 hover:bg-mist/60">
                    <span className="min-w-0">
                      <span className="block truncate font-semibold text-ink">
                        {r.name}
                        {r.company && <span className="font-normal text-text-2"> · {r.company}</span>}
                      </span>
                      <span className="block truncate text-[0.8rem] text-text-2">
                        {r.productTypes.join(", ")} · {r.quantity}
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <Badge tone={statusTone(r.status)}>{INQUIRY_STATUS_LABEL[r.status]}</Badge>
                      <span className="mt-1 block text-[0.75rem] text-text-3">{formatDateTime(r.createdAt)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel title="Aktivitas admin">
          {activity.length === 0 ? (
            <p className="text-sm text-text-2">Belum ada perubahan tercatat.</p>
          ) : (
            <ul className="space-y-3">
              {activity.map((a) => (
                <li key={a.id} className="text-sm">
                  <p className="text-ink">{a.summary}</p>
                  <p className="text-[0.75rem] text-text-3">
                    {a.actorEmail} · {formatDateTime(a.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
