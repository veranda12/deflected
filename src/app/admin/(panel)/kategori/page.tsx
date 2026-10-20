import { asc, count, eq } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";
import { Badge, PageTitle, Table } from "@/components/admin/ui";
import { getDb } from "@/db";
import { categories, media, products } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { mediaUrl } from "@/lib/storage-url";
import { CategoryForm } from "./category-form";

export default async function AdminCategories() {
  await requireAdmin();
  const db = getDb();
  const [rows, counts] = await Promise.all([
    db
      .select({ c: categories, cover: media.key })
      .from(categories)
      .leftJoin(media, eq(categories.coverMediaId, media.id))
      .orderBy(asc(categories.sortOrder), asc(categories.name)),
    db.select({ categoryId: products.categoryId, n: count() }).from(products).groupBy(products.categoryId),
  ]);
  return (
    <>
      <PageTitle title="Kategori" description="Kategori mengelompokkan produk di katalog dan menu navigasi." />
      <div className="space-y-8">
        {rows.length > 0 ? (
          <Table head={["Kategori", "Produk", "Status", ""]}>
            {rows.map(({ c, cover }) => (
              <tr key={c.id}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-xs bg-cloud">
                      {cover && <Image src={mediaUrl(cover)} alt="" fill sizes="64px" className="object-cover" />}
                    </div>
                    <div>
                      <Link href={`/admin/kategori/${c.id}`} className="font-semibold text-ink hover:underline">
                        {c.name}
                      </Link>
                      <p className="text-[0.78rem] text-text-3">/katalog/kategori/{c.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-text-2">{counts.find((x) => x.categoryId === c.id)?.n ?? 0}</td>
                <td className="px-4 py-3">{c.isPublished ? <Badge tone="success">Tampil</Badge> : <Badge>Disembunyikan</Badge>}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/kategori/${c.id}`} className="font-semibold text-blue-strong hover:underline">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </Table>
        ) : (
          <p className="text-sm text-text-2">Belum ada kategori. Buat kategori pertama di bawah.</p>
        )}
        <CategoryForm category={null} />
      </div>
    </>
  );
}
