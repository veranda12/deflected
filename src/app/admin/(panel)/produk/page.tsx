import { and, asc, eq, ilike, inArray, or, type SQL } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";
import { Badge, EmptyState, filterInput, PageTitle, Table } from "@/components/admin/ui";
import { buttonClass } from "@/components/ui/button";
import { getDb } from "@/db";
import { categories, media, productImages, products } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { mediaUrl } from "@/lib/storage-url";
import { formatDate } from "@/lib/utils";

type Props = { searchParams: Promise<Record<string, string | undefined>> };

export default async function AdminProducts({ searchParams }: Props) {
  await requireAdmin();
  const sp = await searchParams;
  const q = (sp.q ?? "").slice(0, 80);
  const status = sp.status === "draft" || sp.status === "published" ? sp.status : "";
  const cat = sp.kategori ?? "";
  const db = getDb();
  const where: SQL[] = [];
  if (q) where.push(or(ilike(products.name, `%${q}%`), ilike(products.slug, `%${q}%`))!);
  if (status) where.push(eq(products.status, status));
  if (/^[0-9a-f-]{36}$/.test(cat)) where.push(eq(products.categoryId, cat));

  const [rows, cats] = await Promise.all([
    db
      .select({ p: products, catName: categories.name })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(where.length ? and(...where) : undefined)
      .orderBy(asc(products.sortOrder), asc(products.name)),
    db.select({ id: categories.id, name: categories.name }).from(categories).orderBy(asc(categories.sortOrder)),
  ]);
  const ids = rows.map((r) => r.p.id);
  const thumbs = ids.length
    ? await db
        .select({ productId: productImages.productId, key: media.key, sort: productImages.sortOrder })
        .from(productImages)
        .innerJoin(media, eq(productImages.mediaId, media.id))
        .where(inArray(productImages.productId, ids))
        .orderBy(asc(productImages.sortOrder))
    : [];
  const thumbOf = (id: string) => thumbs.find((t) => t.productId === id)?.key;

  return (
    <>
      <PageTitle
        title="Produk"
        description="Kelola katalog yang tampil di situs. Produk draft tidak terlihat oleh pengunjung."
        actions={
          <Link href="/admin/produk/baru" className={buttonClass("primary")}>
            Tambah produk
          </Link>
        }
      />
      {sp.dihapus && <p role="status" className="mb-4 rounded-sm bg-success-soft px-4 py-3 text-sm text-success">Produk dihapus.</p>}
      <form method="get" className="mb-5 flex flex-wrap gap-2" role="search">
        <input name="q" defaultValue={q} placeholder="Cari nama atau slug" className={`${filterInput} min-w-56 flex-1`} aria-label="Cari produk" />
        <select name="status" defaultValue={status} className={filterInput} aria-label="Filter status">
          <option value="">Semua status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        <select name="kategori" defaultValue={cat} className={filterInput} aria-label="Filter kategori">
          <option value="">Semua kategori</option>
          {cats.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button type="submit" className={buttonClass("dark")}>
          Terapkan
        </button>
      </form>

      {rows.length === 0 ? (
        <EmptyState
          title={q || status || cat ? "Tidak ada produk yang cocok" : "Belum ada produk"}
          body={q || status || cat ? "Ubah kata kunci atau filter." : "Tambahkan produk pertama untuk mengisi katalog."}
          action={{ href: "/admin/produk/baru", label: "Tambah produk" }}
        />
      ) : (
        <Table head={["Produk", "Kategori", "Status", "Diperbarui", ""]}>
          {rows.map(({ p, catName }) => {
            const t = thumbOf(p.id);
            return (
              <tr key={p.id} className="hover:bg-mist/60">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative size-12 shrink-0 overflow-hidden rounded-xs bg-cloud">
                      {t && <Image src={mediaUrl(t)} alt="" fill sizes="48px" className="object-cover" />}
                    </div>
                    <div className="min-w-0">
                      <Link href={`/admin/produk/${p.id}`} className="font-semibold text-ink hover:text-blue-strong hover:underline">
                        {p.name}
                      </Link>
                      <p className="truncate text-[0.78rem] text-text-3">/produk/{p.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-text-2">{catName ?? "-"}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    {p.status === "published" ? <Badge tone="success">Published</Badge> : <Badge>Draft</Badge>}
                    {p.isFeatured && <Badge tone="info">Unggulan</Badge>}
                    {!t && <Badge tone="warning">Tanpa foto</Badge>}
                  </div>
                </td>
                <td className="px-4 py-3 text-text-2">{formatDate(p.updatedAt)}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/produk/${p.id}`} className="font-semibold text-blue-strong hover:underline">
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
