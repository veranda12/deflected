"use server";

import { and, asc, desc, eq, gt, lt } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDb } from "@/db";
import { portfolioImages, portfolioProjects } from "@/db/schema";
import { recordSlugChange, resolveSlug, slugSchema } from "@/lib/admin-content";
import { bool, fail, int, isUuid, list, ok, refreshPublic, runAdmin, str, type ActionResult } from "@/lib/admin-guard";
import { logAudit } from "@/lib/audit";
import { fieldErrors } from "@/lib/validation";

const schema = z.object({
  title: z.string().trim().min(2, "Judul minimal 2 karakter").max(140),
  slug: slugSchema,
  clientName: z.string().max(140),
  productLabel: z.string().max(100),
  categoryId: z.string().refine((v) => v === "" || isUuid(v), "Kategori tidak valid"),
  summary: z.string().max(400, "Maks 400 karakter"),
  description: z.string().max(5000),
  status: z.enum(["draft", "published"]),
  year: z.string().refine((v) => v === "" || (/^\d{4}$/.test(v) && +v >= 2000 && +v <= 2100), "Tahun tidak valid"),
  seoTitle: z.string().max(70, "Maks 70 karakter"),
  seoDescription: z.string().max(170, "Maks 170 karakter"),
});

export async function saveProject(id: string | null, _prev: ActionResult, fd: FormData): Promise<ActionResult> {
  return runAdmin(async (user) => {
    if (id && !isUuid(id)) return fail("ID tidak valid.");
    const title = str(fd, "title", 140);
    const parsed = schema.safeParse({
      title,
      slug: resolveSlug(str(fd, "slug", 80), title),
      clientName: str(fd, "clientName", 160),
      productLabel: str(fd, "productLabel", 120),
      categoryId: str(fd, "categoryId", 40),
      summary: str(fd, "summary", 500),
      description: str(fd, "description", 6000),
      status: str(fd, "status", 20) || "draft",
      year: str(fd, "year", 4),
      seoTitle: str(fd, "seoTitle", 100),
      seoDescription: str(fd, "seoDescription", 200),
    });
    if (!parsed.success) return fail("Periksa kembali isian yang ditandai.", fieldErrors(parsed.error));
    const d = parsed.data;
    const values = {
      title: d.title,
      slug: d.slug,
      clientName: d.clientName,
      productLabel: d.productLabel,
      categoryId: d.categoryId || null,
      summary: d.summary,
      description: d.description,
      status: d.status,
      year: d.year ? Number(d.year) : null,
      materials: list(fd, "materials"),
      techniques: list(fd, "techniques"),
      isFeatured: bool(fd, "isFeatured"),
      noindex: bool(fd, "noindex"),
      sortOrder: int(fd, "sortOrder"),
      seoTitle: d.seoTitle || null,
      seoDescription: d.seoDescription || null,
      updatedAt: new Date(),
    };
    const db = getDb();
    if (!id) {
      const [row] = await db.insert(portfolioProjects).values(values).returning({ id: portfolioProjects.id });
      await logAudit(user, "create", "portfolio", row.id, `Membuat portofolio "${d.title}"`);
      refreshPublic("portfolio");
      redirect(`/admin/portofolio/${row.id}?baru=1`);
    }
    const [current] = await db.select().from(portfolioProjects).where(eq(portfolioProjects.id, id)).limit(1);
    if (!current) return fail("Proyek tidak ditemukan.");
    await db.update(portfolioProjects).set(values).where(eq(portfolioProjects.id, id));
    await recordSlugChange("portfolio", id, current.slug, d.slug);
    await logAudit(user, "update", "portfolio", id, `Memperbarui portofolio "${d.title}"`);
    refreshPublic("portfolio");
    return ok("Portofolio tersimpan.");
  });
}

export async function deleteProject(id: string): Promise<ActionResult> {
  return runAdmin(async (user) => {
    if (!isUuid(id)) return fail("ID tidak valid.");
    const [row] = await getDb().delete(portfolioProjects).where(eq(portfolioProjects.id, id)).returning({ title: portfolioProjects.title });
    if (!row) return fail("Proyek tidak ditemukan.");
    await logAudit(user, "delete", "portfolio", id, `Menghapus portofolio "${row.title}"`);
    refreshPublic("portfolio");
    redirect("/admin/portofolio?dihapus=1");
  });
}

export async function updateProjectImage(rowId: string, _prev: ActionResult, fd: FormData): Promise<ActionResult> {
  return runAdmin(async (user) => {
    if (!isUuid(rowId)) return fail("ID tidak valid.");
    const [row] = await getDb().update(portfolioImages).set({ alt: str(fd, "alt", 200) }).where(eq(portfolioImages.id, rowId)).returning({ id: portfolioImages.id });
    if (!row) return fail("Gambar tidak ditemukan.");
    await logAudit(user, "update", "portfolio_image", rowId, "Mengubah alt text gambar portofolio");
    refreshPublic("portfolio");
    return ok("Alt text tersimpan.");
  });
}

export async function moveProjectImage(rowId: string, direction: "up" | "down"): Promise<ActionResult> {
  return runAdmin(async (user) => {
    if (!isUuid(rowId)) return fail("ID tidak valid.");
    const db = getDb();
    const [row] = await db.select().from(portfolioImages).where(eq(portfolioImages.id, rowId)).limit(1);
    if (!row) return fail("Gambar tidak ditemukan.");
    const [swap] = await db
      .select()
      .from(portfolioImages)
      .where(and(eq(portfolioImages.projectId, row.projectId), direction === "up" ? lt(portfolioImages.sortOrder, row.sortOrder) : gt(portfolioImages.sortOrder, row.sortOrder)))
      .orderBy(direction === "up" ? desc(portfolioImages.sortOrder) : asc(portfolioImages.sortOrder))
      .limit(1);
    if (!swap) return ok("");
    await db.update(portfolioImages).set({ sortOrder: swap.sortOrder }).where(eq(portfolioImages.id, row.id));
    await db.update(portfolioImages).set({ sortOrder: row.sortOrder }).where(eq(portfolioImages.id, swap.id));
    await logAudit(user, "reorder", "portfolio_image", rowId, "Mengubah urutan gambar portofolio");
    refreshPublic("portfolio");
    return ok("Urutan diperbarui.");
  });
}

export async function removeProjectImage(rowId: string): Promise<ActionResult> {
  return runAdmin(async (user) => {
    if (!isUuid(rowId)) return fail("ID tidak valid.");
    const [row] = await getDb().delete(portfolioImages).where(eq(portfolioImages.id, rowId)).returning({ id: portfolioImages.id });
    if (!row) return fail("Gambar tidak ditemukan.");
    await logAudit(user, "delete", "portfolio_image", rowId, "Melepas gambar dari portofolio");
    refreshPublic("portfolio");
    return ok("Gambar dilepas.");
  });
}
