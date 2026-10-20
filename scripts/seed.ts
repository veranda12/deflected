/* Seeds the database with the client's catalog, portfolio, FAQ and an owner account.
 * Run: npm run db:seed            (skips catalog if it already exists)
 *      npm run db:seed -- --reset (wipes catalog, portfolio, FAQ, media rows first)
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { readFile, readdir, mkdir, copyFile } from "node:fs/promises";
import path from "node:path";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../src/db/schema";
import { hashPassword, randomToken } from "../src/lib/crypto";
import { detectImage } from "../src/lib/image-meta";
import { SEED_CATEGORIES, SEED_CLIENTS, SEED_FAQS, SEED_PRODUCTS, SEED_PROJECTS } from "./seed-data";

const reset = process.argv.includes("--reset");
const client = postgres(process.env.DATABASE_URL!, { max: 1 });
const db = drizzle(client, { schema });
const ASSET_DIR = path.resolve("seed-assets/images");
const CLIENT_LOGO_DIR = path.resolve("seed-assets/clients");

async function seedMedia(dir: string) {
  const files = (await readdir(dir)).filter((f) => /\.(webp|png)$/.test(f));
  const ids = new Map<string, string>();
  const driver = process.env.STORAGE_DRIVER ?? "local";
  const localRoot = path.resolve(process.env.LOCAL_STORAGE_DIR ?? ".data/uploads");
  if (driver === "local") await mkdir(path.join(localRoot, "seed"), { recursive: true });

  for (const file of files) {
    const name = file.replace(/\.(webp|png)$/, "");
    const buf = new Uint8Array(await readFile(path.join(dir, file)));
    const info = detectImage(buf);
    if (!info) throw new Error(`Not an image: ${file}`);
    const key = `seed/${name}.${info.ext}`;
    if (driver === "local") await copyFile(path.join(dir, file), path.join(localRoot, key));
    if (driver === "db") {
      await db.insert(schema.mediaObjects).values({ key, mime: info.mime, body: Buffer.from(buf) }).onConflictDoNothing();
    }
    const [existing] = await db.select().from(schema.media).where(eq(schema.media.key, key));
    if (existing) {
      ids.set(name, existing.id);
      continue;
    }
    const [row] = await db
      .insert(schema.media)
      .values({ key, filename: file, mime: info.mime, size: buf.length, width: info.width, height: info.height, alt: "" })
      .returning({ id: schema.media.id });
    ids.set(name, row.id);
  }
  if (driver === "r2") {
    console.log("STORAGE_DRIVER is r2: upload seed-assets/images and seed-assets/clients to the bucket with `npm run media:upload-r2`.");
  }
  return ids;
}

async function main() {
  if (reset) {
    await db.delete(schema.portfolioProjects);
    await db.delete(schema.products);
    await db.delete(schema.categories);
    await db.delete(schema.faqs);
    await db.delete(schema.slugRedirects);
    await db.delete(schema.siteSettings);
    await db.delete(schema.clients);
    await db.delete(schema.media);
    console.log("Reset catalog, portfolio, FAQ, clients, settings and media rows.");
  }

  const mediaIds = new Map([...(await seedMedia(ASSET_DIR)), ...(await seedMedia(CLIENT_LOGO_DIR))]);
  const mid = (name: string) => {
    const id = mediaIds.get(name);
    if (!id) throw new Error(`Missing seed image ${name}`);
    return id;
  };

  const existingCats = await db.select({ id: schema.categories.id }).from(schema.categories).limit(1);
  if (existingCats.length === 0) {
    const catIds = new Map<string, string>();
    for (const [i, c] of SEED_CATEGORIES.entries()) {
      const [row] = await db
        .insert(schema.categories)
        .values({
          slug: c.slug,
          name: c.name,
          tagline: c.tagline,
          description: c.description,
          coverMediaId: mid(c.cover),
          sortOrder: i,
          isPublished: c.isPublished ?? true,
        })
        .returning({ id: schema.categories.id });
      catIds.set(c.slug, row.id);
    }

    for (const [i, p] of SEED_PRODUCTS.entries()) {
      const [row] = await db
        .insert(schema.products)
        .values({
          slug: p.slug,
          name: p.name,
          categoryId: catIds.get(p.category)!,
          summary: p.summary,
          description: p.description,
          materials: p.materials,
          techniques: p.techniques,
          useCases: p.useCases,
          specs: p.specs ?? [],
          status: "published",
          isFeatured: !!p.featured,
          sortOrder: i,
          publishedAt: new Date(),
        })
        .returning({ id: schema.products.id });
      if (p.images.length) {
        await db
          .insert(schema.productImages)
          .values(p.images.map((img, j) => ({ productId: row.id, mediaId: mid(img.file), alt: img.alt, sortOrder: j })));
      }
      if (p.variants?.length) {
        await db
          .insert(schema.productVariants)
          .values(p.variants.map((v, j) => ({ productId: row.id, name: v.name, detail: v.detail, sortOrder: j })));
      }
    }

    for (const [i, p] of SEED_PROJECTS.entries()) {
      const summary = `${p.productLabel} untuk ${p.client}, bahan ${p.materials.join(" dan ")}${p.techniques.length ? ` dengan ${p.techniques.join(" dan ").toLowerCase()}` : ""}.`;
      const [row] = await db
        .insert(schema.portfolioProjects)
        .values({
          slug: p.slug,
          title: p.title,
          clientName: p.client,
          categoryId: catIds.get(p.category)!,
          productLabel: p.productLabel,
          materials: p.materials,
          techniques: p.techniques,
          summary,
          description: "",
          status: "published",
          isFeatured: !!p.featured,
          sortOrder: i,
        })
        .returning({ id: schema.portfolioProjects.id });
      await db.insert(schema.portfolioImages).values({ projectId: row.id, mediaId: mid(p.image), alt: p.alt, sortOrder: 0 });
    }

    await db.insert(schema.faqs).values(SEED_FAQS.map((f, i) => ({ question: f.q, answer: f.a, sortOrder: i })));

    await db
      .insert(schema.siteSettings)
      .values({ key: "hero", value: { imageMediaId: mid("cover-jersey") } })
      .onConflictDoNothing();
    console.log(`Seeded ${SEED_CATEGORIES.length} categories, ${SEED_PRODUCTS.length} products, ${SEED_PROJECTS.length} projects, ${SEED_FAQS.length} FAQs.`);
  } else {
    console.log("Catalog already present, skipped (use --reset to rebuild).");
  }

  const existingClients = await db.select({ id: schema.clients.id }).from(schema.clients).limit(1);
  if (existingClients.length === 0) {
    await db
      .insert(schema.clients)
      .values(SEED_CLIENTS.map((c, i) => ({ name: c.name, logoMediaId: mid(c.logo), sortOrder: i, isPublished: true })));
    console.log(`Seeded ${SEED_CLIENTS.length} clients.`);
  }

  const owners = await db.select({ id: schema.adminUsers.id }).from(schema.adminUsers).limit(1);
  if (owners.length === 0) {
    const email = (process.env.SEED_ADMIN_EMAIL || "admin@deflected.id").toLowerCase();
    const password = process.env.SEED_ADMIN_PASSWORD || randomToken(18);
    if (password.length < 12) throw new Error("SEED_ADMIN_PASSWORD must be at least 12 characters");
    await db.insert(schema.adminUsers).values({ email, name: "Owner", passwordHash: await hashPassword(password), role: "owner" });
    if (!process.env.SEED_ADMIN_PASSWORD) {
      // Never print the password: write it to a gitignored file for the operator.
      const { writeFile } = await import("node:fs/promises");
      await mkdir(".dev", { recursive: true });
      await writeFile(".dev/admin-credentials.txt", `email: ${email}\npassword: ${password}\n`, { mode: 0o600 });
      console.log(`Created owner ${email}. Generated password saved to .dev/admin-credentials.txt (change it after first login).`);
    } else {
      console.log(`Created owner ${email}.`);
    }
  }
  await client.end();
}

main().catch(async (err) => {
  console.error(err);
  await client.end();
  process.exit(1);
});
