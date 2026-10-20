import { asc } from "drizzle-orm";
import { PageTitle } from "@/components/admin/ui";
import { getDb } from "@/db";
import { categories } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { ProductForm } from "../product-form";

export default async function NewProduct() {
  await requireAdmin();
  const cats = await getDb().select({ id: categories.id, name: categories.name }).from(categories).orderBy(asc(categories.sortOrder));
  return (
    <>
      <PageTitle title="Tambah produk" description="Simpan dulu, lalu unggah foto di halaman berikutnya." back={{ href: "/admin/produk", label: "Kembali ke produk" }} />
      <ProductForm product={null} variantsText="" categories={cats} />
    </>
  );
}
