import { notFound, permanentRedirect } from "next/navigation";
import { CatalogView, filterProducts, readFilters } from "@/components/site/catalog-view";
import { PageHero } from "@/components/site/page-hero";
import { findRedirect, getCatalog } from "@/lib/queries";
import { buildMetadata } from "@/lib/seo";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params, searchParams }: Props) {
  const [{ slug }, sp, { categories }] = await Promise.all([params, searchParams, getCatalog()]);
  const cat = categories.find((c) => c.slug === slug);
  if (!cat) return {};
  return buildMetadata({
    path: `/katalog/kategori/${cat.slug}`,
    title: cat.seoTitle || `${cat.name} Kustom`,
    description: cat.seoDescription || cat.description,
    image: cat.cover,
    noindex: Object.keys(sp).length > 0,
  });
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const [{ slug }, sp, { categories, products }] = await Promise.all([params, searchParams, getCatalog()]);
  const cat = categories.find((c) => c.slug === slug);
  if (!cat) {
    const moved = await findRedirect("category", slug);
    if (moved) permanentRedirect(`/katalog/kategori/${moved}`);
    notFound();
  }
  const filters = readFilters(sp);
  const inCat = products.filter((p) => p.category?.id === cat.id);
  return (
    <>
      <PageHero
        crumbs={[
          { name: "Beranda", path: "/" },
          { name: "Katalog", path: "/katalog" },
          { name: cat.name, path: `/katalog/kategori/${cat.slug}` },
        ]}
        title={cat.name}
        intro={cat.description}
      />
      <CatalogView
        categories={categories}
        allProducts={products}
        products={filterProducts(inCat, filters)}
        active={cat}
        filters={filters}
        basePath={`/katalog/kategori/${cat.slug}`}
      />
    </>
  );
}
