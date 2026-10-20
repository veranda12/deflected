import Link from "next/link";
import { IconSearch } from "@/components/icons";
import { ProductCard } from "@/components/site/cards";
import { buttonClass } from "@/components/ui/button";
import type { CategoryView, ProductView } from "@/lib/queries";
import { cn } from "@/lib/utils";
import { AutoSubmitSelect } from "./auto-submit-select";

export type CatalogFilters = { q: string; bahan: string; teknik: string };

export function filterProducts(products: ProductView[], f: CatalogFilters) {
  const q = f.q.trim().toLowerCase();
  return products.filter((p) => {
    if (f.bahan && !p.materials.some((m) => m.toLowerCase() === f.bahan.toLowerCase())) return false;
    if (f.teknik && !p.techniques.some((t) => t.toLowerCase() === f.teknik.toLowerCase())) return false;
    if (!q) return true;
    const hay = [p.name, p.summary, p.category?.name ?? "", ...p.materials, ...p.techniques, ...p.useCases].join(" ").toLowerCase();
    return q.split(/\s+/).every((word) => hay.includes(word));
  });
}

export function readFilters(sp: Record<string, string | string[] | undefined>): CatalogFilters {
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v ?? "").slice(0, 80);
  return { q: one(sp.q), bahan: one(sp.bahan), teknik: one(sp.teknik) };
}

export function CatalogView({
  categories,
  allProducts,
  products,
  active,
  filters,
  basePath,
}: {
  categories: CategoryView[];
  allProducts: ProductView[];
  products: ProductView[];
  active: CategoryView | null;
  filters: CatalogFilters;
  basePath: string;
}) {
  const scope = active ? allProducts.filter((p) => p.category?.id === active.id) : allProducts;
  const materials = [...new Set(scope.flatMap((p) => p.materials))].sort((a, b) => a.localeCompare(b, "id"));
  const techniques = [...new Set(scope.flatMap((p) => p.techniques))].sort((a, b) => a.localeCompare(b, "id"));
  const hasFilter = !!(filters.q || filters.bahan || filters.teknik);

  return (
    <section className="pb-[var(--section-y)]" aria-label="Daftar produk">
      <div className="container-x">
        {/* Category tabs */}
        <nav aria-label="Kategori" className="-mx-[var(--gutter)] overflow-x-auto px-[var(--gutter)] [scrollbar-width:none]">
          <ul className="flex min-w-max gap-2 border-b border-line pb-4">
            <li>
              <Link href="/katalog" className={tabClass(!active)} aria-current={!active ? "page" : undefined}>
                Semua <span className="text-text-3">{allProducts.length}</span>
              </Link>
            </li>
            {categories.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/katalog/kategori/${c.slug}`}
                  className={tabClass(active?.id === c.id)}
                  aria-current={active?.id === c.id ? "page" : undefined}
                >
                  {c.name} <span className={active?.id === c.id ? "text-white/70" : "text-text-3"}>{c.productCount}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Search + filters. Plain GET form: works without JavaScript and keeps results shareable. */}
        <form method="get" action={basePath} role="search" className="mt-6 grid gap-3 md:grid-cols-[1fr_220px_220px_auto]">
          <label className="relative block">
            <span className="sr-only">Cari produk</span>
            <IconSearch className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-text-3" />
            <input
              type="search"
              name="q"
              defaultValue={filters.q}
              placeholder="Cari produk, bahan, atau teknik"
              maxLength={80}
              className="h-12 w-full rounded-sm border border-line bg-white pr-4 pl-12 text-[0.95rem] text-ink placeholder:text-text-3 focus:border-blue focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="sr-only">Filter bahan</span>
            <AutoSubmitSelect name="bahan" defaultValue={filters.bahan} className={selectClass}>
              <option value="">Semua bahan</option>
              {materials.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </AutoSubmitSelect>
          </label>
          <label className="block">
            <span className="sr-only">Filter teknik</span>
            <AutoSubmitSelect name="teknik" defaultValue={filters.teknik} className={selectClass}>
              <option value="">Semua teknik</option>
              {techniques.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </AutoSubmitSelect>
          </label>
          <div className="flex gap-2">
            <button type="submit" className={buttonClass("dark", "md", "h-12 flex-1 md:flex-none")}>
              Cari
            </button>
            {hasFilter && (
              <Link href={basePath} className={buttonClass("outline", "md", "h-12")}>
                Reset
              </Link>
            )}
          </div>
        </form>

        <p className="mt-6 text-[0.9rem] text-text-2" aria-live="polite">
          {hasFilter ? `${products.length} produk cocok dengan pencarian Anda` : `${products.length} produk`}
        </p>

        {products.length > 0 ? (
          <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
            {products.map((p, i) => (
              <li key={p.id} data-reveal style={{ ["--reveal-i" as string]: i % 4 }}>
                <ProductCard product={p} sizes="(min-width: 1024px) 23vw, (min-width: 768px) 31vw, 50vw" priority={i < 4} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-8 rounded-lg border border-dashed border-line px-6 py-16 text-center">
            <p className="display-sm text-ink">Belum ada produk yang cocok</p>
            <p className="mx-auto mt-3 max-w-md text-text-2">
              Coba kata kunci lain atau hapus filter. Jika produk yang Anda cari tidak ada di katalog, tanyakan langsung, banyak pesanan kami dibuat khusus.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link href={basePath} className={buttonClass("outline")}>
                Hapus filter
              </Link>
              <Link href="/kontak#penawaran" className={buttonClass("primary")}>
                Tanyakan produk khusus
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

const selectClass =
  "h-12 w-full appearance-none rounded-sm border border-line bg-white bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%230f172a%22 stroke-width=%222%22><path d=%22M6 9l6 6 6-6%22/></svg>')] bg-[length:18px] bg-[right_14px_center] bg-no-repeat pr-10 pl-4 text-[0.95rem] text-ink focus:border-blue focus:outline-none";

function tabClass(active: boolean) {
  return cn(
    "inline-flex h-11 items-center gap-2 rounded-sm px-4 text-[0.9rem] font-medium whitespace-nowrap transition-colors",
    active ? "bg-ink text-white" : "bg-mist text-ink hover:bg-cloud",
  );
}
