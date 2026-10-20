"use server";

import { and, asc, eq, gt, lt, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDb } from "@/db";
import { productImages, products, productVariants } from "@/db/schema";
import { parseSpecs, parseVariants, recordSlugChange, resolveSlug, slugSchema } from "@/lib/admin-content";
import { bool, fail, int, isUuid, list, ok, refreshPublic, runAdmin, str, type ActionResult } from "@/lib/admin-guard";
import { logAudit } from "@/lib/audit";
import { fieldErrors } from "@/lib/validation";

const productSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(120),
  slug: slugSchema,
  categoryId: z.string().refine((v) => v === "" || isUuid(v), "Kategori tidak valid"),
  summary: z.string().max(300, "Ringkasan maksimal 300 karakter"),
  description: z.string().max(5000),
  status: z.enum(["draft", "published"]),
  seoTitle: z.string().max(70, "Meta title maksimal 70 karakter"),
  seoDescription: z.string().max(170, "Meta description maksimal 170 karakter"),
});

export async function saveProduct(id: string | null, _prev: ActionResult, fd: FormData): Promise<ActionResult> {
  return runAdmin(async (user) => {
    if (id && !isUuid(id)) return fail("ID tidak valid.");
    const name = str(fd, "name", 120);
    const parsed = productSchema.safeParse({
      name,
      slug: resolveSlug(str(fd, "slug", 80), name),
      categoryId: str(fd, "categoryId", 40),
      summary: str(fd, "summary", 400),
      description: str(fd, "description", 6000),
      status: str(fd, "status", 20) || "draft",
      seoTitle: str(fd, "seoTitle", 100),
      seoDescription: str(fd, "seoDescription", 200),
    });
    if (!parsed.success) return fail("Periksa kembali isian yang ditandai.", fieldErrors(parsed.error));
    const d = parsed.data;
    const db = getDb();
    const values = {
      name: d.name,
      slug: d.slug,
      categoryId: d.categoryId || null,
      summary: d.summary,
      description: d.description,
      materials: list(fd, "materials"),
      techniques: list(fd, "techniques"),
      useCases: list(fd, "useCases"),
      specs: parseSpecs(str(fd, "specs", 4000)),
      status: d.status,
      isFeatured: bool(fd, "isFeatured"),
      noindex: bool(fd, "noindex"),
      sortOrder: int(fd, "sortOrder"),
      seoTitle: d.seoTitle || null,
      seoDescription: d.seoDescription || null,
      updatedAt: new Date(),
    };
    const variants = parseVariants(str(fd, "variants", 4000));

    if (!id) {
      const [row] = await db
        .insert(products)
        .values({ ...values, publishedAt: d.status === "published" ? new Date() : null })
        .returning({ id: products.id });
      if (variants.length) await db.insert(productVariants).values(variants.map((v, i) => ({ ...v, productId: row.id, sortOrder: i })));
      await logAudit(user, "create", "product", row.id, `Membuat produk "${d.name}"`);
      refreshPublic("catalog");
      redirect(`/admin/produk/${row.id}?baru=1`);
    }

    const [current] = await db.select().from(products).where(eq(products.id, id)).limit(1);
    if (!current) return fail("Produk tidak ditemukan.");
    await db
      .update(products)
      .set({ ...values, publishedAt: d.status === "published" ? (current.publishedAt ?? new Date()) : current.publishedAt })
      .where(eq(products.id, id));
    await db.delete(productVariants).where(eq(productVariants.productId, id));
    if (variants.length) await db.insert(productVariants).values(variants.map((v, i) => ({ ...v, productId: id, sortOrder: i })));
    await recordSlugChange("product", id, current.slug, d.slug);
    await logAudit(user, "update", "product", id, `Memperbarui produk "${d.name}"${current.slug !== d.slug ? ` (slug ${current.slug} ke ${d.slug})` : ""}`);
    refreshPublic("catalog");
    return ok("Produk tersimpan.");
  });
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  return runAdmin(async (user) => {
    if (!isUuid(id)) return fail("ID tidak valid.");
    const db = getDb();
    const [row] = await db.delete(products).where(eq(products.id, id)).returning({ name: products.name });
    if (!row) return fail("Produk tidak ditemukan.");
    await logAudit(user, "delete", "product", id, `Menghapus produk "${row.name}"`);
    refreshPublic("catalog");
    redirect("/admin/produk?dihapus=1");
  });
}

export async function updateProductImage(rowId: string, _prev: ActionResult, fd: FormData): Promise<ActionResult> {
  return runAdmin(async (user) => {
    if (!isUuid(rowId)) return fail("ID tidak valid.");
    const alt = str(fd, "alt", 200);
    const [row] = await getDb().update(productImages).set({ alt }).where(eq(productImages.id, rowId)).returning({ productId: productImages.productId });
    if (!row) return fail("Gambar tidak ditemukan.");
    await logAudit(user, "update", "product_image", rowId, "Mengubah alt text gambar produk");
    refreshPublic("catalog");
    return ok("Alt text tersimpan.");
  });
}

export async function moveProductImage(rowId: string, direction: "up" | "down"): Promise<ActionResult> {
  return runAdmin(async (user) => {
    if (!isUuid(rowId)) return fail("ID tidak valid.");
    const db = getDb();
    const [row] = await db.select().from(productImages).where(eq(productImages.id, rowId)).limit(1);
    if (!row) return fail("Gambar tidak ditemukan.");
    const [swap] = await db
      .select()
      .from(productImages)
      .where(
        and(
          eq(productImages.productId, row.productId),
          direction === "up" ? lt(productImages.sortOrder, row.sortOrder) : gt(productImages.sortOrder, row.sortOrder),
        ),
      )
      .orderBy(direction === "up" ? desc(productImages.sortOrder) : asc(productImages.sortOrder))
      .limit(1);
    if (!swap) return ok("");
    await db.update(productImages).set({ sortOrder: swap.sortOrder }).where(eq(productImages.id, row.id));
    await db.update(productImages).set({ sortOrder: row.sortOrder }).where(eq(productImages.id, swap.id));
    await logAudit(user, "reorder", "product_image", rowId, "Mengubah urutan gambar produk");
    refreshPublic("catalog");
    return ok("Urutan diperbarui.");
  });
}

export async function removeProductImage(rowId: string): Promise<ActionResult> {
  return runAdmin(async (user) => {
    if (!isUuid(rowId)) return fail("ID tidak valid.");
    const [row] = await getDb().delete(productImages).where(eq(productImages.id, rowId)).returning({ productId: productImages.productId });
    if (!row) return fail("Gambar tidak ditemukan.");
    await logAudit(user, "delete", "product_image", rowId, "Melepas gambar dari produk");
    refreshPublic("catalog");
    return ok("Gambar dilepas dari produk.");
  });
}
