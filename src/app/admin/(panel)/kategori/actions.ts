"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDb } from "@/db";
import { categories } from "@/db/schema";
import { recordSlugChange, resolveSlug, slugSchema } from "@/lib/admin-content";
import { bool, fail, int, isUuid, ok, refreshPublic, runAdmin, str, type ActionResult } from "@/lib/admin-guard";
import { logAudit } from "@/lib/audit";
import { fieldErrors } from "@/lib/validation";

const schema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(80),
  slug: slugSchema,
  tagline: z.string().max(160),
  description: z.string().max(1000),
  seoTitle: z.string().max(70, "Maks 70 karakter"),
  seoDescription: z.string().max(170, "Maks 170 karakter"),
});

export async function saveCategory(id: string | null, _prev: ActionResult, fd: FormData): Promise<ActionResult> {
  return runAdmin(async (user) => {
    if (id && !isUuid(id)) return fail("ID tidak valid.");
    const name = str(fd, "name", 80);
    const parsed = schema.safeParse({
      name,
      slug: resolveSlug(str(fd, "slug", 80), name),
      tagline: str(fd, "tagline", 200),
      description: str(fd, "description", 1200),
      seoTitle: str(fd, "seoTitle", 100),
      seoDescription: str(fd, "seoDescription", 200),
    });
    if (!parsed.success) return fail("Periksa kembali isian yang ditandai.", fieldErrors(parsed.error));
    const d = parsed.data;
    const values = {
      ...d,
      seoTitle: d.seoTitle || null,
      seoDescription: d.seoDescription || null,
      sortOrder: int(fd, "sortOrder"),
      isPublished: bool(fd, "isPublished"),
      updatedAt: new Date(),
    };
    const db = getDb();
    if (!id) {
      const [row] = await db.insert(categories).values(values).returning({ id: categories.id });
      await logAudit(user, "create", "category", row.id, `Membuat kategori "${d.name}"`);
      refreshPublic("catalog");
      redirect(`/admin/kategori/${row.id}`);
    }
    const [current] = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
    if (!current) return fail("Kategori tidak ditemukan.");
    await db.update(categories).set(values).where(eq(categories.id, id));
    await recordSlugChange("category", id, current.slug, d.slug);
    await logAudit(user, "update", "category", id, `Memperbarui kategori "${d.name}"`);
    refreshPublic("catalog", "portfolio");
    return ok("Kategori tersimpan.");
  });
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  return runAdmin(async (user) => {
    if (!isUuid(id)) return fail("ID tidak valid.");
    const [row] = await getDb().delete(categories).where(eq(categories.id, id)).returning({ name: categories.name });
    if (!row) return fail("Kategori tidak ditemukan.");
    await logAudit(user, "delete", "category", id, `Menghapus kategori "${row.name}"`);
    refreshPublic("catalog", "portfolio");
    redirect("/admin/kategori");
  });
}
