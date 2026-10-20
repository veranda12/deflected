import { and, eq, max } from "drizzle-orm";
import { getDb } from "@/db";
import { categories, media, portfolioImages, portfolioProjects, productImages, products } from "@/db/schema";
import { refreshPublic, isUuid } from "@/lib/admin-guard";
import { logAudit, logSecurityEvent } from "@/lib/audit";
import { AuthError, requireAdmin } from "@/lib/auth";
import { detectImage } from "@/lib/image-meta";
import { rateLimit } from "@/lib/rate-limit";
import { isSameOrigin } from "@/lib/request";
import { getStorage, newMediaKey } from "@/lib/storage";

const MAX_BYTES = 5 * 1024 * 1024;
const MAX_FILES = 10;

type Target = "product" | "portfolio" | "category" | "library";

export async function POST(req: Request) {
  if (!isSameOrigin(req)) {
    await logSecurityEvent({ type: "access_denied", detail: "media upload with foreign origin" });
    return Response.json({ error: "Asal permintaan tidak valid." }, { status: 403 });
  }
  let user;
  try {
    user = await requireAdmin({ redirectTo: false });
  } catch (e) {
    if (e instanceof AuthError) return Response.json({ error: "Sesi berakhir. Silakan login ulang." }, { status: 401 });
    throw e;
  }
  const limit = await rateLimit("upload", user.id, 60, 600);
  if (!limit.ok) return Response.json({ error: "Terlalu banyak unggahan. Coba lagi beberapa menit lagi." }, { status: 429 });

  const len = Number(req.headers.get("content-length") ?? 0);
  if (len > MAX_BYTES * MAX_FILES + 100_000) return Response.json({ error: "Total ukuran unggahan terlalu besar." }, { status: 413 });

  const form = await req.formData();
  const target = String(form.get("target") ?? "library") as Target;
  const targetId = String(form.get("targetId") ?? "");
  if (!["product", "portfolio", "category", "library"].includes(target)) return Response.json({ error: "Target tidak valid." }, { status: 400 });
  if (target !== "library" && !isUuid(targetId)) return Response.json({ error: "ID tidak valid." }, { status: 400 });

  const db = getDb();
  // Make sure the record exists before writing files (prevents attaching to arbitrary IDs).
  if (target === "product" && !(await db.select({ id: products.id }).from(products).where(eq(products.id, targetId))).length)
    return Response.json({ error: "Produk tidak ditemukan." }, { status: 404 });
  if (target === "portfolio" && !(await db.select({ id: portfolioProjects.id }).from(portfolioProjects).where(eq(portfolioProjects.id, targetId))).length)
    return Response.json({ error: "Proyek tidak ditemukan." }, { status: 404 });
  if (target === "category" && !(await db.select({ id: categories.id }).from(categories).where(eq(categories.id, targetId))).length)
    return Response.json({ error: "Kategori tidak ditemukan." }, { status: 404 });

  const files = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) return Response.json({ error: "Pilih minimal satu gambar." }, { status: 400 });
  if (files.length > MAX_FILES) return Response.json({ error: `Maksimal ${MAX_FILES} gambar per unggahan.` }, { status: 400 });

  const storage = await getStorage();
  const created: { id: string; key: string }[] = [];
  const rejected: string[] = [];
  for (const file of files) {
    const name = file.name.slice(0, 120);
    if (file.size > MAX_BYTES) {
      rejected.push(`${name}: lebih dari 5 MB`);
      continue;
    }
    const bytes = new Uint8Array(await file.arrayBuffer());
    const info = detectImage(bytes); // magic bytes, not the browser-declared type
    if (!info) {
      rejected.push(`${name}: bukan JPG, PNG, WebP, atau AVIF`);
      continue;
    }
    if (info.width && info.height && (info.width > 12000 || info.height > 12000)) {
      rejected.push(`${name}: dimensi terlalu besar`);
      continue;
    }
    const key = newMediaKey(info.ext);
    await storage.put(key, bytes, info.mime);
    const [row] = await db
      .insert(media)
      .values({ key, filename: name.replace(/[^\w.\- ]+/g, "_"), mime: info.mime, size: bytes.length, width: info.width, height: info.height, createdBy: user.id })
      .returning({ id: media.id, key: media.key });
    created.push(row);
  }

  if (created.length && target === "product") {
    const [{ value }] = await db.select({ value: max(productImages.sortOrder) }).from(productImages).where(eq(productImages.productId, targetId));
    await db.insert(productImages).values(created.map((c, i) => ({ productId: targetId, mediaId: c.id, sortOrder: (value ?? -1) + 1 + i })));
    refreshPublic("catalog");
  }
  if (created.length && target === "portfolio") {
    const [{ value }] = await db.select({ value: max(portfolioImages.sortOrder) }).from(portfolioImages).where(eq(portfolioImages.projectId, targetId));
    await db.insert(portfolioImages).values(created.map((c, i) => ({ projectId: targetId, mediaId: c.id, sortOrder: (value ?? -1) + 1 + i })));
    refreshPublic("portfolio");
  }
  if (created.length && target === "category") {
    await db.update(categories).set({ coverMediaId: created[0].id, updatedAt: new Date() }).where(and(eq(categories.id, targetId)));
    refreshPublic("catalog");
  }
  if (created.length) await logAudit(user, "upload", target, targetId || null, `Mengunggah ${created.length} gambar`);

  return Response.json({ created, rejected }, { status: created.length ? 201 : 400 });
}
