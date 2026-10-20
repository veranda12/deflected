import "server-only";
import { and, asc, eq, inArray } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { getDb } from "@/db";
import {
  categories,
  clients,
  faqs,
  media,
  portfolioImages,
  portfolioProjects,
  productImages,
  products,
  productVariants,
  slugRedirects,
  type SpecRow,
} from "@/db/schema";

export const CATALOG_TAG = "catalog";
export const PORTFOLIO_TAG = "portfolio";
export const FAQ_TAG = "faq";
export const CLIENTS_TAG = "clients";

export type Img = { key: string; alt: string; width: number | null; height: number | null };

export type CategoryView = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  cover: Img | null;
  seoTitle: string | null;
  seoDescription: string | null;
  productCount: number;
  projectCount: number;
};

export type ProductView = {
  id: string;
  slug: string;
  name: string;
  summary: string;
  description: string;
  category: { id: string; slug: string; name: string } | null;
  materials: string[];
  techniques: string[];
  useCases: string[];
  specs: SpecRow[];
  variants: { name: string; detail: string }[];
  isFeatured: boolean;
  images: Img[];
  ogImage: Img | null;
  seoTitle: string | null;
  seoDescription: string | null;
  noindex: boolean;
  updatedAt: string;
};

export type ProjectView = {
  id: string;
  slug: string;
  title: string;
  clientName: string;
  productLabel: string;
  category: { id: string; slug: string; name: string } | null;
  materials: string[];
  techniques: string[];
  summary: string;
  description: string;
  year: number | null;
  isFeatured: boolean;
  images: Img[];
  seoTitle: string | null;
  seoDescription: string | null;
  noindex: boolean;
  updatedAt: string;
};

async function mediaMap(ids: string[]) {
  if (ids.length === 0) return new Map<string, Img>();
  const rows = await getDb().select().from(media).where(inArray(media.id, ids));
  return new Map(rows.map((m) => [m.id, { key: m.key, alt: m.alt, width: m.width, height: m.height }]));
}

async function loadCatalog() {
  const db = getDb();
  const [cats, prods] = await Promise.all([
    db.select().from(categories).where(eq(categories.isPublished, true)).orderBy(asc(categories.sortOrder), asc(categories.name)),
    db.select().from(products).where(eq(products.status, "published")).orderBy(asc(products.sortOrder), asc(products.name)),
  ]);
  const productIds = prods.map((p) => p.id);
  const [imgs, variants, projectsCount] = await Promise.all([
    productIds.length
      ? db
          .select({ productId: productImages.productId, mediaId: productImages.mediaId, alt: productImages.alt, sortOrder: productImages.sortOrder })
          .from(productImages)
          .where(inArray(productImages.productId, productIds))
          .orderBy(asc(productImages.sortOrder))
      : Promise.resolve([]),
    productIds.length
      ? db.select().from(productVariants).where(inArray(productVariants.productId, productIds)).orderBy(asc(productVariants.sortOrder))
      : Promise.resolve([]),
    db
      .select({ categoryId: portfolioProjects.categoryId })
      .from(portfolioProjects)
      .where(eq(portfolioProjects.status, "published")),
  ]);
  const mm = await mediaMap([
    ...new Set([
      ...imgs.map((i) => i.mediaId),
      ...cats.map((c) => c.coverMediaId).filter((x): x is string => !!x),
      ...prods.map((p) => p.ogMediaId).filter((x): x is string => !!x),
    ]),
  ]);
  const catById = new Map(cats.map((c) => [c.id, c]));

  const productViews: ProductView[] = prods.map((p) => {
    const c = p.categoryId ? catById.get(p.categoryId) : undefined;
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      summary: p.summary,
      description: p.description,
      category: c ? { id: c.id, slug: c.slug, name: c.name } : null,
      materials: p.materials,
      techniques: p.techniques,
      useCases: p.useCases,
      specs: p.specs,
      variants: variants.filter((v) => v.productId === p.id).map((v) => ({ name: v.name, detail: v.detail })),
      isFeatured: p.isFeatured,
      images: imgs
        .filter((i) => i.productId === p.id)
        .map((i) => {
          const m = mm.get(i.mediaId);
          return m ? { ...m, alt: i.alt || m.alt || p.name } : null;
        })
        .filter((x): x is Img => !!x),
      ogImage: p.ogMediaId ? (mm.get(p.ogMediaId) ?? null) : null,
      seoTitle: p.seoTitle,
      seoDescription: p.seoDescription,
      noindex: p.noindex,
      updatedAt: p.updatedAt.toISOString(),
    };
  });

  const categoryViews: CategoryView[] = cats.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    tagline: c.tagline,
    description: c.description,
    cover: c.coverMediaId ? (mm.get(c.coverMediaId) ?? null) : null,
    seoTitle: c.seoTitle,
    seoDescription: c.seoDescription,
    productCount: productViews.filter((p) => p.category?.id === c.id).length,
    projectCount: projectsCount.filter((p) => p.categoryId === c.id).length,
  }));

  return { categories: categoryViews, products: productViews };
}

export const getCatalog = unstable_cache(loadCatalog, ["catalog-v1"], { tags: [CATALOG_TAG], revalidate: 3600 });

async function loadPortfolio(): Promise<ProjectView[]> {
  const db = getDb();
  const [projects, cats] = await Promise.all([
    db
      .select()
      .from(portfolioProjects)
      .where(eq(portfolioProjects.status, "published"))
      .orderBy(asc(portfolioProjects.sortOrder), asc(portfolioProjects.title)),
    db.select().from(categories),
  ]);
  const ids = projects.map((p) => p.id);
  const imgs = ids.length
    ? await db
        .select()
        .from(portfolioImages)
        .where(inArray(portfolioImages.projectId, ids))
        .orderBy(asc(portfolioImages.sortOrder))
    : [];
  const mm = await mediaMap([...new Set(imgs.map((i) => i.mediaId))]);
  const catById = new Map(cats.map((c) => [c.id, c]));
  return projects.map((p) => {
    const c = p.categoryId ? catById.get(p.categoryId) : undefined;
    return {
      id: p.id,
      slug: p.slug,
      title: p.title,
      clientName: p.clientName,
      productLabel: p.productLabel,
      category: c && c.isPublished ? { id: c.id, slug: c.slug, name: c.name } : null,
      materials: p.materials,
      techniques: p.techniques,
      summary: p.summary,
      description: p.description,
      year: p.year,
      isFeatured: p.isFeatured,
      images: imgs
        .filter((i) => i.projectId === p.id)
        .map((i) => {
          const m = mm.get(i.mediaId);
          return m ? { ...m, alt: i.alt || m.alt || p.title } : null;
        })
        .filter((x): x is Img => !!x),
      seoTitle: p.seoTitle,
      seoDescription: p.seoDescription,
      noindex: p.noindex,
      updatedAt: p.updatedAt.toISOString(),
    };
  });
}

export const getPortfolio = unstable_cache(loadPortfolio, ["portfolio-v1"], {
  tags: [PORTFOLIO_TAG, CATALOG_TAG],
  revalidate: 3600,
});

export const getFaqs = unstable_cache(
  async () =>
    getDb()
      .select({ id: faqs.id, question: faqs.question, answer: faqs.answer })
      .from(faqs)
      .where(eq(faqs.isPublished, true))
      .orderBy(asc(faqs.sortOrder)),
  ["faqs-v1"],
  { tags: [FAQ_TAG], revalidate: 3600 },
);

export type ClientView = { id: string; name: string; logo: Img | null };

async function loadClients(): Promise<ClientView[]> {
  const db = getDb();
  const rows = await db
    .select({ id: clients.id, name: clients.name, logoMediaId: clients.logoMediaId })
    .from(clients)
    .where(eq(clients.isPublished, true))
    .orderBy(asc(clients.sortOrder), asc(clients.name));
  const mm = await mediaMap(rows.map((r) => r.logoMediaId).filter((x): x is string => !!x));
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    logo: r.logoMediaId ? (mm.get(r.logoMediaId) ?? null) : null,
  }));
}

export const getClients = unstable_cache(loadClients, ["clients-v1"], { tags: [CLIENTS_TAG], revalidate: 3600 });

export async function getMediaImg(id: string | null | undefined): Promise<Img | null> {
  if (!id) return null;
  return (await mediaMap([id])).get(id) ?? null;
}

/** Resolves an old slug to the current one after a rename. */
export async function findRedirect(entity: "product" | "portfolio" | "category", fromSlug: string): Promise<string | null> {
  const db = getDb();
  const [r] = await db
    .select({ toId: slugRedirects.toId })
    .from(slugRedirects)
    .where(and(eq(slugRedirects.entity, entity), eq(slugRedirects.fromSlug, fromSlug)))
    .limit(1);
  if (!r) return null;
  const table = entity === "product" ? products : entity === "portfolio" ? portfolioProjects : categories;
  const [row] = await db.select({ slug: table.slug }).from(table).where(eq(table.id, r.toId)).limit(1);
  return row?.slug ?? null;
}
