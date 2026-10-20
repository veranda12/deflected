import { CatalogView, filterProducts, readFilters } from "@/components/site/catalog-view";
import { PageHero } from "@/components/site/page-hero";
import { getCatalog } from "@/lib/queries";
import { buildMetadata } from "@/lib/seo";
import { getSettings } from "@/lib/settings";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ searchParams }: Props) {
  const sp = await searchParams;
  const filtered = Object.keys(sp).length > 0;
  const s = await getSettings();
  return buildMetadata({
    path: "/katalog",
    page: "catalog",
    description:
      s.seo.pages.catalog.description ||
      "Katalog kaos, polo, jersey, jaket, kemeja, rompi, dan merchandise kustom Deflected lengkap dengan bahan dan teknik produksinya.",
    // Filtered result pages canonicalise to /katalog and stay out of the index.
    noindex: filtered,
  });
}

export default async function CatalogPage({ searchParams }: Props) {
  const [{ categories, products }, sp] = await Promise.all([getCatalog(), searchParams]);
  const filters = readFilters(sp);
  return (
    <>
      <PageHero
        crumbs={[
          { name: "Beranda", path: "/" },
          { name: "Katalog", path: "/katalog" },
        ]}
        title="Katalog produk"
        intro="Setiap produk dilengkapi contoh hasil produksi, bahan, dan teknik yang pernah kami kerjakan. Semua bisa disesuaikan dengan brief Anda."
      />
      <CatalogView
        categories={categories}
        allProducts={products}
        products={filterProducts(products, filters)}
        active={null}
        filters={filters}
        basePath="/katalog"
      />
    </>
  );
}
