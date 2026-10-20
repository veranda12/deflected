import Link from "next/link";
import { IconArrow } from "@/components/icons";
import { MediaImage } from "@/components/media-image";
import { CtaBand } from "@/components/site/cta-band";
import { PageHero } from "@/components/site/page-hero";
import { getCatalog } from "@/lib/queries";
import { buildMetadata } from "@/lib/seo";
import { getSettings } from "@/lib/settings";
import { cn, pad2, waLink } from "@/lib/utils";

export async function generateMetadata() {
  const s = await getSettings();
  return buildMetadata({ path: "/layanan", page: "services", description: s.seo.pages.services.description || s.services.intro });
}

// Which catalog category illustrates each service line (by position).
const LINE_CATEGORY = ["kemeja-workwear", "jersey-teamwear", "merchandise"];

export default async function ServicesPage() {
  const [settings, catalog] = await Promise.all([getSettings(), getCatalog()]);
  const { services, home, company } = settings;

  return (
    <>
      <PageHero
        crumbs={[
          { name: "Beranda", path: "/" },
          { name: "Layanan", path: "/layanan" },
        ]}
        title={services.title}
        intro={services.intro}
      />

      {/* Service lines: alternating image/text rows */}
      <section className="pb-[var(--section-y)]" aria-label="Lini layanan">
        <div className="container-x space-y-6">
          {services.lines.map((line, i) => {
            const cat = catalog.categories.find((c) => c.slug === LINE_CATEGORY[i]);
            return (
              <article key={line.title} className="grid overflow-hidden rounded-lg border border-line lg:grid-cols-2" data-reveal>
                <div className={cn("relative min-h-[280px] bg-cloud sm:min-h-[360px]", i % 2 === 1 && "lg:order-2")}>
                  <MediaImage img={cat?.cover} sizes="(min-width: 1024px) 50vw, 100vw" alt={cat ? `Contoh produk ${cat.name}` : ""} />
                </div>
                <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14">
                  <span className="font-display text-3xl text-blue">{pad2(i + 1)}</span>
                  <h2 className="display-sm mt-2 text-ink">{line.title}</h2>
                  <p className="mt-4 max-w-md leading-relaxed text-text-2">{line.body}</p>
                  <ul className="mt-6 flex flex-wrap gap-2">
                    {line.items.map((it) => (
                      <li key={it} className="rounded-xs bg-mist px-3 py-1.5 text-[0.88rem] text-ink">
                        {it}
                      </li>
                    ))}
                  </ul>
                  {cat && (
                    <Link href={`/katalog/kategori/${cat.slug}`} className="mt-7 inline-flex items-center gap-2 font-semibold text-blue-strong hover:text-ink">
                      Lihat produk {cat.name} <IconArrow className="size-4" />
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Customisation matrix */}
      <section className="on-dark section-y bg-ink text-white" aria-labelledby="kustomisasi">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 id="kustomisasi" className="display-md" data-reveal>
              {services.customizationTitle}
            </h2>
            <p className="mt-6 text-on-dark-2">{services.customizationNote}</p>
          </div>
          <dl className="lg:col-span-7 lg:col-start-6">
            {services.customization.map((row, i) => (
              <div key={row.label} className="grid gap-2 border-t border-navy-line py-6 sm:grid-cols-[200px_1fr] sm:gap-8" data-reveal style={{ ["--reveal-i" as string]: i % 2 }}>
                <dt className="font-semibold text-amber">{row.label}</dt>
                <dd className="text-[1.05rem] leading-relaxed">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Process */}
      <section className="section-y" aria-labelledby="alur">
        <div className="container-x">
          <h2 id="alur" className="display-md max-w-2xl text-ink" data-reveal>
            {home.processTitle}
          </h2>
          <ol className="mt-12 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {services.process.map((step, i) => (
              <li key={step.title} className="bg-white p-7 sm:p-8" data-reveal style={{ ["--reveal-i" as string]: i % 3 }}>
                <span className="font-display text-[3.5rem] leading-none text-blue">{pad2(i + 1)}</span>
                <h3 className="mt-4 text-[1.15rem] font-semibold text-ink">{step.title}</h3>
                <p className="mt-2 leading-relaxed text-text-2">{step.body}</p>
              </li>
            ))}
          </ol>
          <p className="mt-5 max-w-3xl text-[0.85rem] text-text-3">{services.processNote}</p>
          <p className="mt-2 max-w-3xl text-[0.85rem] text-text-3">{services.disclaimer}</p>
        </div>
      </section>

      <CtaBand title={home.ctaTitle} body={home.ctaBody} waHref={waLink(company.whatsapp, company.whatsappGreeting)} />
    </>
  );
}
