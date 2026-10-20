import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { IconWhatsApp } from "@/components/icons";
import { ProductCard, ProjectCard } from "@/components/site/cards";
import { Gallery } from "@/components/site/gallery";
import { Breadcrumbs } from "@/components/site/page-hero";
import { buttonClass } from "@/components/ui/button";
import { findRedirect, getCatalog, getPortfolio } from "@/lib/queries";
import { buildMetadata, JsonLd, productJsonLd } from "@/lib/seo";
import { getSettings } from "@/lib/settings";
import { paragraphs, waLink } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const [{ slug }, { products }] = await Promise.all([params, getCatalog()]);
  const p = products.find((x) => x.slug === slug);
  if (!p) return {};
  return buildMetadata({
    path: `/produk/${p.slug}`,
    title: p.seoTitle || `${p.name} Kustom`,
    description: p.seoDescription || p.summary,
    image: p.ogImage ?? p.images[0],
    noindex: p.noindex,
  });
}

export default async function ProductPage({ params }: Props) {
  const [{ slug }, { products }, portfolio, settings] = await Promise.all([params, getCatalog(), getPortfolio(), getSettings()]);
  const product = products.find((x) => x.slug === slug);
  if (!product) {
    const moved = await findRedirect("product", slug);
    if (moved) permanentRedirect(`/produk/${moved}`);
    notFound();
  }
  const { company } = settings;
  const waText = `Halo Deflected, saya tertarik dengan produk ${product.name}. Boleh minta info bahan dan penawarannya?`;
  const related = products.filter((p) => p.id !== product.id && p.category?.id === product.category?.id).slice(0, 4);
  const examples = portfolio
    .filter((pr) => pr.category?.id === product.category?.id && pr.materials.some((m) => product.materials.some((pm) => m.toLowerCase().includes(pm.toLowerCase().split(" ")[0]))))
    .slice(0, 3);

  const specRows = [
    product.materials.length ? { label: "Bahan", value: product.materials.join(", ") } : null,
    product.techniques.length ? { label: "Teknik", value: product.techniques.join(", ") } : null,
    product.useCases.length ? { label: "Cocok untuk", value: product.useCases.join(", ") } : null,
    ...product.specs.filter((s) => !["bahan", "teknik"].includes(s.label.toLowerCase())),
  ].filter((r): r is { label: string; value: string } => !!r);

  const crumbs = [
    { name: "Beranda", path: "/" },
    { name: "Katalog", path: "/katalog" },
    ...(product.category ? [{ name: product.category.name, path: `/katalog/kategori/${product.category.slug}` }] : []),
    { name: product.name, path: `/produk/${product.slug}` },
  ];

  return (
    <>
      <section className="pt-[calc(var(--header-h)+40px)] pb-[var(--section-y)]">
        <div className="container-x">
          <Breadcrumbs items={crumbs} />
          <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-6">
              <Gallery images={product.images} label={product.name} />
            </div>
            <div className="lg:col-span-6 lg:pt-4">
              {product.category && (
                <Link href={`/katalog/kategori/${product.category.slug}`} className="inline-flex min-h-6 items-center text-sm font-semibold text-blue-strong hover:underline">
                  {product.category.name}
                </Link>
              )}
              <h1 className="display-lg mt-3 text-ink">{product.name}</h1>
              <p className="mt-5 text-[1.08rem] leading-relaxed text-text-2">{product.summary}</p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href={waLink(company.whatsapp, waText)} target="_blank" rel="noopener noreferrer" className={buttonClass("primary", "lg")}>
                  <IconWhatsApp className="size-5" />
                  <span>Tanya via WhatsApp</span>
                </a>
                <Link href={`/kontak?produk=${encodeURIComponent(product.name)}#penawaran`} className={buttonClass("outline", "lg")}>
                  Minta penawaran
                </Link>
              </div>

              {specRows.length > 0 && (
                <dl className="mt-10 border-t border-line">
                  {specRows.map((r) => (
                    <div key={r.label} className="grid gap-1 border-b border-line py-4 sm:grid-cols-[150px_1fr] sm:gap-6">
                      <dt className="text-sm font-semibold text-text-2">{r.label}</dt>
                      <dd className="text-ink">{r.value}</dd>
                    </div>
                  ))}
                </dl>
              )}

              {product.variants.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-sm font-semibold text-text-2">Varian</h2>
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                    {product.variants.map((v) => (
                      <li key={v.name} className="rounded-sm border border-line p-4">
                        <p className="font-semibold text-ink">{v.name}</p>
                        {v.detail && <p className="mt-1 text-sm text-text-2">{v.detail}</p>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {product.description && (
                <div className="mt-10 space-y-4 leading-relaxed text-text-2">
                  {paragraphs(product.description).map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              )}
              <p className="mt-8 rounded-sm bg-mist p-4 text-[0.9rem] text-text-2">
                Harga bergantung pada bahan, teknik, dan jumlah. Kirim perkiraan kebutuhan Anda, tim kami akan menyiapkan penawaran.
              </p>
            </div>
          </div>
        </div>
      </section>

      {examples.length > 0 && (
        <section className="section-y bg-mist" aria-labelledby="contoh">
          <div className="container-x">
            <h2 id="contoh" className="display-md text-ink">
              Contoh pesanan serupa
            </h2>
            <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-3 lg:gap-x-6">
              {examples.map((p) => (
                <ProjectCard key={p.id} project={p} sizes="(min-width: 1024px) 30vw, 50vw" />
              ))}
            </div>
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="section-y" aria-labelledby="terkait">
          <div className="container-x">
            <div className="flex items-end justify-between gap-6">
              <h2 id="terkait" className="display-md text-ink">
                Produk terkait
              </h2>
              {product.category && (
                <Link href={`/katalog/kategori/${product.category.slug}`} className="hidden font-semibold text-blue-strong hover:text-ink sm:inline">
                  Semua {product.category.name}
                </Link>
              )}
            </div>
            <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
              {related.map((p) => (
                <li key={p.id}>
                  <ProductCard product={p} sizes="(min-width: 1024px) 23vw, 50vw" />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
      <JsonLd data={productJsonLd(product, company.name)} />
    </>
  );
}
