import { asc, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DangerButton } from "@/components/admin/danger-button";
import { Panel } from "@/components/admin/form";
import { ImageList } from "@/components/admin/image-list";
import { PageTitle } from "@/components/admin/ui";
import { Uploader } from "@/components/admin/uploader";
import { getDb } from "@/db";
import { categories, media, productImages, products, productVariants } from "@/db/schema";
import { isUuid } from "@/lib/admin-guard";
import { requireAdmin } from "@/lib/auth";
import { ProductForm } from "../product-form";
import { deleteProduct, moveProductImage, removeProductImage, updateProductImage } from "../actions";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | undefined>> };

export default async function EditProduct({ params, searchParams }: Props) {
  await requireAdmin();
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  if (!isUuid(id)) notFound();
  const db = getDb();
  const [product] = await db.select().from(products).where(eq(products.id, id)).limit(1);
  if (!product) notFound();
  const [cats, imgs, variants] = await Promise.all([
    db.select({ id: categories.id, name: categories.name }).from(categories).orderBy(asc(categories.sortOrder)),
    db
      .select({ rowId: productImages.id, key: media.key, alt: productImages.alt })
      .from(productImages)
      .innerJoin(media, eq(productImages.mediaId, media.id))
      .where(eq(productImages.productId, id))
      .orderBy(asc(productImages.sortOrder)),
    db.select().from(productVariants).where(eq(productVariants.productId, id)).orderBy(asc(productVariants.sortOrder)),
  ]);

  return (
    <>
      <PageTitle
        title={product.name}
        back={{ href: "/admin/produk", label: "Kembali ke produk" }}
        actions={
          product.status === "published" ? (
            <Link href={`/produk/${product.slug}`} target="_blank" className="text-sm font-semibold text-blue-strong hover:underline">
              Lihat di situs
            </Link>
          ) : null
        }
      />
      {sp.baru && <p role="status" className="mb-4 rounded-sm bg-success-soft px-4 py-3 text-sm text-success">Produk dibuat. Sekarang unggah fotonya.</p>}
      <div className="space-y-6">
        <Panel title="Foto produk" description="Foto pertama menjadi foto utama di katalog. Isi alt text untuk aksesibilitas dan SEO." actions={<Uploader target="product" targetId={product.id} />}>
          <ImageList rows={imgs} updateAlt={updateProductImage} move={moveProductImage} remove={removeProductImage} />
        </Panel>
        <ProductForm product={product} categories={cats} variantsText={variants.map((v) => (v.detail ? `${v.name} | ${v.detail}` : v.name)).join("\n")} />
        <Panel title="Zona berbahaya">
          <DangerButton action={deleteProduct.bind(null, product.id)} confirmText={`Hapus produk "${product.name}"? Tindakan ini tidak bisa dibatalkan.`}>
            Hapus produk
          </DangerButton>
        </Panel>
      </div>
    </>
  );
}
