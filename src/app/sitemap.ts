import type { MetadataRoute } from "next";
import { env } from "@/lib/env";
import { getCatalog, getPortfolio } from "@/lib/queries";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ categories, products }, projects, settings] = await Promise.all([getCatalog(), getPortfolio(), getSettings()]);
  const base = env.siteUrl;
  const pages = settings.seo.pages;
  const staticRoutes: { path: string; key?: keyof typeof pages; priority: number }[] = [
    { path: "/", key: "home", priority: 1 },
    { path: "/tentang", key: "about", priority: 0.7 },
    { path: "/layanan", key: "services", priority: 0.8 },
    { path: "/katalog", key: "catalog", priority: 0.9 },
    { path: "/portofolio", key: "portfolio", priority: 0.8 },
    { path: "/kontak", key: "contact", priority: 0.8 },
    { path: "/kebijakan-privasi", priority: 0.2 },
  ];
  return [
    ...staticRoutes.filter((r) => !(r.key && pages[r.key].noindex)).map((r) => ({ url: `${base}${r.path}`, priority: r.priority })),
    ...categories.map((c) => ({ url: `${base}/katalog/kategori/${c.slug}`, priority: 0.8 })),
    ...products.filter((p) => !p.noindex).map((p) => ({ url: `${base}/produk/${p.slug}`, lastModified: p.updatedAt, priority: 0.7 })),
    ...projects.filter((p) => !p.noindex).map((p) => ({ url: `${base}/portofolio/${p.slug}`, lastModified: p.updatedAt, priority: 0.5 })),
  ];
}
