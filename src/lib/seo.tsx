import "server-only";
import type { Metadata } from "next";
import type { SettingsMap } from "./content-defaults";
import { env } from "./env";
import { getMediaImg, type Img, type ProductView, type ProjectView } from "./queries";
import { getSettings } from "./settings";
import { mediaUrl } from "./storage-url";

type PageKey = keyof SettingsMap["seo"]["pages"];

export function absoluteUrl(path: string) {
  return `${env.siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function buildMetadata(input: {
  path: string;
  page?: PageKey;
  title?: string | null;
  description?: string | null;
  image?: Img | null;
  noindex?: boolean;
  type?: "website" | "article";
}): Promise<Metadata> {
  const settings = await getSettings();
  const seo = settings.seo;
  const pageSeo = input.page ? seo.pages[input.page] : undefined;
  const title = input.title || pageSeo?.title || seo.defaultTitle;
  const description = input.description || pageSeo?.description || seo.defaultDescription;
  const ogImg = input.image ?? (await getMediaImg(seo.ogMediaId)) ?? (await getMediaImg(settings.hero.imageMediaId));
  const noindex = input.noindex || pageSeo?.noindex;
  const isHome = input.path === "/";
  const fullTitle = isHome || title === seo.defaultTitle ? title : `${title} | ${seo.siteName}`;
  const favicon = await getMediaImg(settings.brand.faviconMediaId);

  return {
    title: { absolute: fullTitle },
    description,
    alternates: { canonical: absoluteUrl(input.path) },
    robots: noindex ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: {
      type: input.type ?? "website",
      locale: "id_ID",
      url: absoluteUrl(input.path),
      siteName: seo.siteName,
      title: fullTitle,
      description,
      images: ogImg ? [{ url: absoluteUrl(mediaUrl(ogImg.key)), width: ogImg.width ?? undefined, height: ogImg.height ?? undefined, alt: ogImg.alt }] : undefined,
    },
    twitter: { card: "summary_large_image", title: fullTitle, description },
    icons: favicon ? { icon: mediaUrl(favicon.key) } : undefined,
  };
}

/** JSON-LD script. `<` is escaped so content can never close the script tag. */
export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export function organizationJsonLd(s: SettingsMap, rasterLogo?: Img | null) {
  const sameAs = [s.company.instagram, s.company.tiktok, s.company.facebook, s.company.linkedin].filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${env.siteUrl}/#organization`,
    name: s.company.name,
    alternateName: ["Deflected", "DFLCTD"],
    url: env.siteUrl,
    // Google requires a raster logo for rich results; the SVG is the fallback.
    logo: rasterLogo ? absoluteUrl(mediaUrl(rasterLogo.key)) : absoluteUrl("/logo-dflctd.svg"),
    email: s.company.email,
    telephone: `+${s.company.whatsapp}`,
    description: s.company.description,
    address: { "@type": "PostalAddress", streetAddress: s.company.address, addressRegion: "Jawa Tengah", addressCountry: "ID" },
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: absoluteUrl(it.path) })),
  };
}

/**
 * Catalog items are made to order and priced per quotation, so there is no public price to put in an
 * Offer. Google's Product snippets require offers, review or aggregateRating, none of which exist
 * honestly here, so the item is described as the production service it is.
 */
export function productServiceJsonLd(p: ProductView, companyName: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: p.name,
    description: p.summary || p.description,
    image: p.images.map((i) => absoluteUrl(mediaUrl(i.key))),
    ...(p.category ? { category: p.category.name } : {}),
    provider: { "@type": "Organization", "@id": `${env.siteUrl}/#organization`, name: companyName },
    url: absoluteUrl(`/produk/${p.slug}`),
  };
}

export function projectJsonLd(p: ProjectView, companyName: string) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: p.title,
    description: p.summary,
    image: p.images.map((i) => absoluteUrl(mediaUrl(i.key))),
    creator: { "@type": "Organization", "@id": `${env.siteUrl}/#organization`, name: companyName },
    url: absoluteUrl(`/portofolio/${p.slug}`),
  };
}
