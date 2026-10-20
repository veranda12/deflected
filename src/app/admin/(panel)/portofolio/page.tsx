import { and, asc, eq, ilike, inArray, or, type SQL } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";
import { Badge, EmptyState, filterInput, PageTitle, Table } from "@/components/admin/ui";
import { buttonClass } from "@/components/ui/button";
import { getDb } from "@/db";
import { categories, media, portfolioImages, portfolioProjects } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { mediaUrl } from "@/lib/storage-url";

type Props = { searchParams: Promise<Record<string, string | undefined>> };

export default async function AdminPortfolio({ searchParams }: Props) {
  await requireAdmin();
  const sp = await searchParams;
  const q = (sp.q ?? "").slice(0, 80);
  const status = sp.status === "draft" || sp.status === "published" ? sp.status : "";
  const where: SQL[] = [];
  if (q) where.push(or(ilike(portfolioProjects.title, `%${q}%`), ilike(portfolioProjects.clientName, `%${q}%`))!);
  if (status) where.push(eq(portfolioProjects.status, status));
  const db = getDb();
  const rows = await db
    .select({ p: portfolioProjects, catName: categories.name })
    .from(portfolioProjects)
    .leftJoin(categories, eq(portfolioProjects.categoryId, categories.id))
    .where(where.length ? and(...where) : undefined)
    .orderBy(asc(portfolioProjects.sortOrder), asc(portfolioProjects.title));
  const ids = rows.map((r) => r.p.id);
  const thumbs = ids.length
    ? await db
        .select({ projectId: portfolioImages.projectId, key: media.key })
        .from(portfolioImages)
        .innerJoin(media, eq(portfolioImages.mediaId, media.id))
        .where(inArray(portfolioImages.projectId, ids))
        .orderBy(asc(portfolioImages.sortOrder))
    : [];

  return (
    <>
      <PageTitle
        title="Portofolio"
        description="Hasil produksi yang tampil di halaman portofolio dan beranda."
        actions={
          <Link href="/admin/portofolio/baru" className={buttonClass("primary")}>
            Tambah proyek
          </Link>
        }
      />
      {sp.dihapus && <p role="status" className="mb-4 rounded-sm bg-success-soft px-4 py-3 text-sm text-success">Proyek dihapus.</p>}
      <form method="get" className="mb-5 flex flex-wrap gap-2" role="search">
        <input name="q" defaultValue={q} placeholder="Cari judul atau klien" className={`${filterInput} min-w-56 flex-1`} aria-label="Cari portofolio" />
        <select name="status" defaultValue={status} className={filterInput} aria-label="Filter status">
          <option value="">Semua status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        <button type="submit" className={buttonClass("dark")}>
          Terapkan
        </button>
      </form>
      {rows.length === 0 ? (
        <EmptyState title="Belum ada proyek" body="Tambahkan hasil produksi untuk membangun kepercayaan calon klien." action={{ href: "/admin/portofolio/baru", label: "Tambah proyek" }} />
      ) : (
        <Table head={["Proyek", "Kategori", "Status", ""]}>
          {rows.map(({ p, catName }) => {
            const t = thumbs.find((x) => x.projectId === p.id)?.key;
            return (
              <tr key={p.id}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative size-12 shrink-0 overflow-hidden rounded-xs bg-cloud">{t && <Image src={mediaUrl(t)} alt="" fill sizes="48px" className="object-cover" />}</div>
                    <div>
                      <Link href={`/admin/portofolio/${p.id}`} className="font-semibold text-ink hover:underline">
                        {p.title}
                      </Link>
                      <p className="text-[0.78rem] text-text-3">
                        {p.clientName} · {p.productLabel}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-text-2">{catName ?? "-"}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    {p.status === "published" ? <Badge tone="success">Published</Badge> : <Badge>Draft</Badge>}
                    {p.isFeatured && <Badge tone="info">Unggulan</Badge>}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/portofolio/${p.id}`} className="font-semibold text-blue-strong hover:underline">
                    Edit
                  </Link>
                </td>
              </tr>
            );
          })}
        </Table>
      )}
    </>
  );
}
