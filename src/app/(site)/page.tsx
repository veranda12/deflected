import Link from "next/link";
import { Fragment } from "react";
import { IconArrow, IconWhatsApp } from "@/components/icons";
import { MediaImage } from "@/components/media-image";
import { CategoryCard, ProjectCard } from "@/components/site/cards";
import { CtaBand } from "@/components/site/cta-band";
import { ClientLogos } from "@/components/site/client-logos";
import { FaqAccordion } from "@/components/site/faq-accordion";
import { buttonClass } from "@/components/ui/button";
import { getCatalog, getClients, getFaqs, getMediaImg, getPortfolio } from "@/lib/queries";
import { buildMetadata } from "@/lib/seo";
import { getSettings } from "@/lib/settings";
import { cn, pad2, waLink } from "@/lib/utils";

export async function generateMetadata() {
  return buildMetadata({ path: "/", page: "home" });
}

export default async function HomePage() {
  const [settings, catalog, portfolio, faqs, clients] = await Promise.all([getSettings(), getCatalog(), getPortfolio(), getFaqs(), getClients()]);
  const { hero, home, company } = settings;
  const heroImg = await getMediaImg(hero.imageMediaId);
  const wa = waLink(company.whatsapp, company.whatsappGreeting);
  const titleLines = hero.title.split(/\n|\|/).map((l) => l.trim()).filter(Boolean);
  const featured = portfolio.filter((p) => p.isFeatured).slice(0, 6);
  const work = featured.length >= 3 ? featured : portfolio.slice(0, 6);
  const craftShots = ["kurva-utara-kaos", "kcs-kemeja-bordir", "kontingen-pomnas-unimus-varsity"]
    .map((slug) => portfolio.find((p) => p.slug === slug))
    .filter((p): p is NonNullable<typeof p> => !!p);

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden pt-[calc(var(--header-h)+28px)] pb-16 sm:pb-24" aria-labelledby="hero-title">
        <div className="container-x grid items-end gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7 lg:pb-6">
            <h1 id="hero-title" className="display-xl text-ink">
              {titleLines.map((line, i) => (
                <span key={i} className="hero-line" style={{ ["--i" as string]: i }}>
                  <span>
                    {line}
                    {i === titleLines.length - 1 && <span className="text-amber">.</span>}
                  </span>
                </span>
              ))}
            </h1>
            <p className="hero-fade mt-7 max-w-xl text-[1.05rem] leading-relaxed text-text-2 sm:text-[1.12rem]" style={{ ["--i" as string]: 0 }}>
              {hero.subtitle}
            </p>
            <div className="hero-fade mt-9 flex flex-col gap-3 sm:flex-row" style={{ ["--i" as string]: 1 }}>
              <a href={wa} target="_blank" rel="noopener noreferrer" className={buttonClass("primary", "lg")}>
                <IconWhatsApp className="size-5" />
                <span>{hero.primaryCta}</span>
              </a>
              <Link href="/katalog" className={buttonClass("outline", "lg")}>
                {hero.secondaryCta}
              </Link>
            </div>
          </div>

          <div className="relative lg:col-span-5">
            <div className="hero-media relative aspect-[4/5] overflow-hidden rounded-lg bg-cloud cut-corner sm:aspect-[5/5] lg:aspect-[4/5]" style={{ ["--cut" as string]: "64px" }}>
              <MediaImage img={heroImg} sizes="(min-width: 1024px) 42vw, 100vw" priority alt={hero.imageAlt} />
            </div>
            <p className="hero-fade mt-3 text-[0.8rem] text-text-3" style={{ ["--i" as string]: 3 }}>
              Dalam foto: {hero.imageAlt.charAt(0).toLowerCase() + hero.imageAlt.slice(1)}.
            </p>
          </div>
        </div>

        <div className="container-x mt-14 lg:mt-20">
          <dl className="hero-fade grid gap-6 border-t border-line pt-6 sm:grid-cols-3" style={{ ["--i" as string]: 2 }}>
            {[
              ["Lini produk", catalog.categories.map((c) => c.name.replace(/\s*[,&].*$/, "")).join(", ")],
              ["Alur kerja", "Brief, penawaran, sampel, produksi, serah terima"],
              ["Lokasi produksi", "Kab. Semarang, Jawa Tengah"],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-[0.78rem] font-semibold text-blue-strong">{k}</dt>
                <dd className="mt-1 text-[0.95rem] text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ---------- Categories ---------- */}
      <section className="section-y bg-mist" aria-labelledby="kategori-title">
        <div className="container-x">
          <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
            <h2 id="kategori-title" className="display-lg text-ink lg:col-span-6" data-reveal>
              {home.categoriesTitle}
            </h2>
            <div className="lg:col-span-5 lg:col-start-8" data-reveal style={{ ["--reveal-i" as string]: 1 }}>
              <p className="text-[1.02rem] leading-relaxed text-text-2">{home.categoriesIntro}</p>
              <Link href="/katalog" className="mt-4 inline-flex items-center gap-2 font-semibold text-blue-strong hover:text-ink">
                Buka katalog lengkap <IconArrow className="size-4" />
              </Link>
            </div>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:mt-16 lg:grid-cols-12 lg:grid-rows-[300px_300px] lg:gap-5">
            {catalog.categories.slice(0, 5).map((c, i) => (
              <div
                key={c.id}
                data-reveal
                style={{ ["--reveal-i" as string]: i }}
                className={cn(
                  i === 0 && "sm:col-span-2 lg:col-span-5 lg:row-span-2",
                  i === 1 && "lg:col-span-4",
                  i === 2 && "lg:col-span-3",
                  i === 3 && "lg:col-span-3",
                  i === 4 && "sm:col-span-2 lg:col-span-4",
                )}
              >
                <CategoryCard
                  category={c}
                  index={i}
                  tall={i === 0}
                  className={cn("h-full", i === 0 ? "min-h-[440px] sm:min-h-[520px] lg:min-h-0" : "min-h-[340px] lg:min-h-0")}
                  sizes={i === 0 ? "(min-width: 1024px) 40vw, 100vw" : "(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw"}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Craft / credibility ---------- */}
      <section className="on-dark section-y bg-ink text-white" aria-labelledby="craft-title">
        <div className="container-x">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <h2 id="craft-title" className="display-lg" data-reveal>
                {home.craftTitle}
              </h2>
              <p className="mt-6 max-w-md text-[1.02rem] leading-relaxed text-on-dark-2" data-reveal style={{ ["--reveal-i" as string]: 1 }}>
                {home.craftIntro}
              </p>
            </div>
            <div className="space-y-10 lg:col-span-6 lg:col-start-7">
              <div data-reveal>
                <h3 className="text-sm font-semibold text-amber">Bahan</h3>
                <p className="mt-4 text-[clamp(1.3rem,2.2vw,1.75rem)] leading-[1.45] font-medium text-white">
                  {home.materials.map((m, i) => (
                    <Fragment key={m}>
                    <span className="whitespace-nowrap">
                      {m}
                      {i < home.materials.length - 1 && <span className="px-2 text-navy-line">/</span>}
                    </span>{" "}
                    </Fragment>
                  ))}
                </p>
              </div>
              <div data-reveal style={{ ["--reveal-i" as string]: 1 }}>
                <h3 className="text-sm font-semibold text-amber">Teknik kustomisasi</h3>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {home.techniques.map((t) => (
                    <li key={t} className="rounded-xs border border-navy-line px-3 py-2 text-[0.92rem] text-white">
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
              <p className="text-[0.88rem] text-on-dark-2">{home.craftNote}</p>
            </div>
          </div>

          {craftShots.length > 0 && (
            <ul className="mt-16 grid gap-5 sm:grid-cols-3 lg:mt-20">
              {craftShots.map((p, i) => (
                <li key={p.id} data-reveal="clip" style={{ ["--reveal-i" as string]: i }} className={cn(i === 1 && "sm:mt-12")}>
                  <Link href={`/portofolio/${p.slug}`} className="group block">
                    <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-navy">
                      <div className="zoom-media absolute inset-0">
                        <MediaImage img={p.images[0]} sizes="(min-width: 640px) 30vw, 100vw" />
                      </div>
                    </div>
                    <p className="mt-3 text-[0.95rem] font-semibold">{p.title}</p>
                    <p className="text-[0.85rem] text-on-dark-2">{[...p.materials, ...p.techniques].join(" · ")}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* ---------- Process ---------- */}
      <section className="section-y" aria-labelledby="proses-title">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-32">
              <h2 id="proses-title" className="display-lg text-ink" data-reveal>
                {home.processTitle}
              </h2>
              <p className="mt-6 text-[1.02rem] leading-relaxed text-text-2" data-reveal style={{ ["--reveal-i" as string]: 1 }}>
                {home.processIntro}
              </p>
              <Link href="/layanan" className="mt-6 inline-flex items-center gap-2 font-semibold text-blue-strong hover:text-ink">
                Detail layanan <IconArrow className="size-4" />
              </Link>
            </div>
          </div>
          <ol className="lg:col-span-7 lg:col-start-6">
            {settings.services.process.map((step, i) => (
              <li
                key={step.title}
                data-reveal
                style={{ ["--reveal-i" as string]: i % 2 }}
                className="grid grid-cols-[64px_1fr] gap-4 border-t border-line py-7 sm:grid-cols-[96px_1fr] sm:py-9"
              >
                <span className="font-display text-[3rem] leading-[0.8] text-blue sm:text-[4.25rem]">{pad2(i + 1)}</span>
                <div>
                  <h3 className="text-[1.15rem] font-semibold text-ink sm:text-[1.3rem]">{step.title}</h3>
                  <p className="mt-2 max-w-lg leading-relaxed text-text-2">{step.body}</p>
                </div>
              </li>
            ))}
            <li className="border-t border-line pt-6 text-[0.88rem] text-text-3">{settings.services.processNote}</li>
          </ol>
        </div>
      </section>

      {/* ---------- Selected work ---------- */}
      <section className="section-y bg-mist" aria-labelledby="karya-title">
        <div className="container-x">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <h2 id="karya-title" className="display-lg text-ink" data-reveal>
                {home.workTitle}
              </h2>
              <p className="mt-5 text-[1.02rem] leading-relaxed text-text-2" data-reveal style={{ ["--reveal-i" as string]: 1 }}>
                {home.workIntro}
              </p>
            </div>
            <Link href="/portofolio" className={buttonClass("dark", "md", "self-start sm:self-auto")}>
              Semua portofolio
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-8 lg:mt-16 lg:grid-cols-3 lg:gap-x-6">
            {work.map((p, i) => (
              <div key={p.id} data-reveal style={{ ["--reveal-i" as string]: i % 3 }} className={cn(i % 3 === 1 && "lg:mt-16")}>
                <ProjectCard project={p} sizes="(min-width: 1024px) 30vw, 50vw" aspect={i % 2 === 0 ? "aspect-[4/5]" : "aspect-square"} />
              </div>
            ))}
          </div>

          {clients.length > 0 && (
            <div className="mt-20 grid gap-6 border-t border-line pt-10 lg:grid-cols-12">
              <h3 className="text-[0.95rem] font-semibold text-ink lg:col-span-3">{home.clientsTitle}</h3>
              <div className="lg:col-span-9">
                <ClientLogos clients={clients} />
                <p className="mt-4 text-[0.85rem] text-text-3">{home.clientsNote}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ---------- Why Deflected ---------- */}
      <section className="section-y overflow-hidden" aria-labelledby="why-title">
        <div className="container-x grid items-center gap-14 lg:grid-cols-12">
          <div className="relative order-2 lg:order-1 lg:col-span-5">
            <WhyCollage />
          </div>
          <div className="order-1 lg:order-2 lg:col-span-6 lg:col-start-7">
            <h2 id="why-title" className="display-lg text-ink" data-reveal>
              {home.whyTitle}
            </h2>
            <ol className="mt-10 space-y-8">
              {home.whyPoints.map((pt, i) => (
                <li key={pt.title} className="grid grid-cols-[44px_1fr] gap-3" data-reveal style={{ ["--reveal-i" as string]: i }}>
                  <span className="font-display text-[2rem] leading-none text-blue">{i + 1}</span>
                  <div>
                    <h3 className="text-[1.1rem] font-semibold text-ink">{pt.title}</h3>
                    <p className="mt-1.5 leading-relaxed text-text-2">{pt.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      {faqs.length > 0 && (
        <section className="section-y border-t border-line" aria-labelledby="faq-title">
          <div className="container-x grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <h2 id="faq-title" className="display-lg text-ink" data-reveal>
                {home.faqTitle}
              </h2>
              <p className="mt-6 text-text-2">Pertanyaan Anda belum ada di sini?</p>
              <a href={wa} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-2 font-semibold text-blue-strong hover:text-ink">
                <IconWhatsApp className="size-[18px]" />
                Tanyakan lewat WhatsApp
              </a>
            </div>
            <div className="lg:col-span-7 lg:col-start-6">
              <FaqAccordion items={faqs} />
            </div>
          </div>
        </section>
      )}

      <CtaBand title={home.ctaTitle} body={home.ctaBody} waHref={wa} />
    </>
  );
}

async function WhyCollage() {
  const { categories } = await getCatalog();
  const a = categories.find((c) => c.slug === "kemeja-workwear")?.cover ?? categories[0]?.cover;
  const b = categories.find((c) => c.slug === "kaos-polo")?.cover ?? categories[1]?.cover;
  return (
    <div className="relative pb-16 sm:pb-24">
      <div className="relative aspect-[4/5] w-[82%] overflow-hidden rounded-lg bg-cloud cut-corner" data-reveal="clip">
        <MediaImage img={a} sizes="(min-width: 1024px) 34vw, 80vw" alt="Kemeja, rompi, dan jaket kerja produksi Deflected" />
      </div>
      <div
        className="absolute right-0 bottom-0 aspect-square w-[52%] overflow-hidden rounded-lg border-[6px] border-white bg-cloud"
        data-reveal="clip"
        style={{ ["--reveal-i" as string]: 2 }}
      >
        <MediaImage img={b} sizes="(min-width: 1024px) 22vw, 50vw" alt="Kaos kustom produksi Deflected untuk KYB dan Kurva Utara" />
      </div>
    </div>
  );
}
