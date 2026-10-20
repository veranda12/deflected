import Link from "next/link";
import { IconArrow, IconCheck } from "@/components/icons";
import { MediaImage } from "@/components/media-image";
import { ClientLogos } from "@/components/site/client-logos";
import { CtaBand } from "@/components/site/cta-band";
import { PageHero } from "@/components/site/page-hero";
import { getCatalog, getClients, getMediaImg } from "@/lib/queries";
import { buildMetadata } from "@/lib/seo";
import { getSettings } from "@/lib/settings";
import { pad2, waLink } from "@/lib/utils";

export async function generateMetadata() {
  const s = await getSettings();
  return buildMetadata({ path: "/tentang", page: "about", description: s.seo.pages.about.description || s.about.intro });
}

export default async function AboutPage() {
  const [settings, catalog, clients] = await Promise.all([getSettings(), getCatalog(), getClients()]);
  const { about, company, home } = settings;
  const heroImg = await getMediaImg(settings.hero.imageMediaId);
  const jacket = catalog.categories.find((c) => c.slug === "jaket-outerwear")?.cover;

  return (
    <>
      <PageHero
        crumbs={[
          { name: "Beranda", path: "/" },
          { name: "Tentang", path: "/tentang" },
        ]}
        title={about.title}
        intro={about.intro}
      />

      <section className="pb-[var(--section-y)]">
        <div className="container-x grid gap-5 sm:grid-cols-12">
          <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-cloud cut-corner sm:col-span-8" data-reveal="clip">
            <MediaImage img={heroImg} sizes="(min-width: 640px) 66vw, 100vw" alt={settings.hero.imageAlt} priority />
          </div>
          <div className="flex flex-col justify-between gap-6 rounded-lg bg-ink p-7 text-white sm:col-span-4 on-dark" data-reveal>
            <p className="text-sm font-semibold text-amber">Fokus kami</p>
            <ol className="space-y-5">
              {about.focus.map((f, i) => (
                <li key={f} className="grid grid-cols-[40px_1fr] items-baseline">
                  <span className="font-display text-2xl text-blue">{pad2(i + 1)}</span>
                  <span className="text-[1.05rem] font-semibold">{f}</span>
                </li>
              ))}
            </ol>
            <p className="font-display text-3xl tracking-wide text-white">{settings.footer.hashtag}</p>
          </div>
        </div>
      </section>

      {/* Fragmented vs coordinated procurement */}
      <section className="section-y bg-mist" aria-labelledby="tantangan">
        <div className="container-x">
          <h2 id="tantangan" className="display-md max-w-3xl text-ink" data-reveal>
            {about.challengeTitle}
          </h2>
          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            <div className="rounded-lg border border-line bg-white p-7 sm:p-9" data-reveal>
              <h3 className="text-[1.1rem] font-semibold text-text-2">Pengadaan terfragmentasi</h3>
              <ul className="mt-6 space-y-4">
                {about.fragmented.map((t) => (
                  <li key={t} className="flex gap-3 text-text-2">
                    <span aria-hidden className="mt-2.5 h-px w-4 shrink-0 bg-text-3" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="on-dark rounded-lg bg-navy p-7 text-white sm:p-9 cut-corner" data-reveal style={{ ["--reveal-i" as string]: 1 }}>
              <h3 className="text-[1.1rem] font-semibold">Pendekatan terkoordinasi bersama Deflected</h3>
              <ul className="mt-6 space-y-4">
                {about.coordinated.map((t) => (
                  <li key={t} className="flex gap-3">
                    <IconCheck className="mt-0.5 size-5 shrink-0 text-amber" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="mt-5 text-[0.85rem] text-text-3">{about.challengeNote}</p>
        </div>
      </section>

      {/* Value */}
      <section className="section-y" aria-labelledby="nilai">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 id="nilai" className="display-md text-ink" data-reveal>
              {about.valueTitle}
            </h2>
            {jacket && (
              <div className="relative mt-10 hidden aspect-[4/3] overflow-hidden rounded-lg bg-cloud lg:block" data-reveal="clip">
                <MediaImage img={jacket} sizes="40vw" alt="Varsity jacket, jaket kerja, dan jaket racing produksi Deflected" />
              </div>
            )}
          </div>
          <dl className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:col-span-6 lg:col-start-7 lg:self-center">
            {about.valuePoints.map((v, i) => (
              <div key={v.title} data-reveal style={{ ["--reveal-i" as string]: i }} className="border-t-2 border-ink pt-5">
                <dt className="text-[1.15rem] font-semibold text-ink">{v.title}</dt>
                <dd className="mt-2 leading-relaxed text-text-2">{v.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Partnership models */}
      <section className="section-y border-t border-line" aria-labelledby="kemitraan">
        <div className="container-x">
          <h2 id="kemitraan" className="display-md max-w-3xl text-ink" data-reveal>
            {about.partnershipTitle}
          </h2>
          <div className="mt-12 grid gap-5 lg:grid-cols-[1fr_1.15fr]">
            <div className="rounded-lg bg-blue-soft p-7 sm:p-9" data-reveal>
              <h3 className="display-sm text-ink">Pesanan berbasis proyek</h3>
              <p className="mt-2 text-sm font-semibold text-blue-strong">Cocok untuk</p>
              <ul className="mt-4 space-y-2.5 text-ink">
                {about.projectBased.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
            <div className="on-dark rounded-lg bg-ink p-7 text-white sm:p-9" data-reveal style={{ ["--reveal-i" as string]: 1 }}>
              <h3 className="display-sm">Pesanan korporat berulang</h3>
              <p className="mt-2 text-sm font-semibold text-amber">Cocok untuk</p>
              <ul className="mt-4 space-y-2.5">
                {about.recurring.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          </div>
          <p className="mt-5 max-w-3xl text-[0.85rem] text-text-3">{about.partnershipNote}</p>
        </div>
      </section>

      {clients.length > 0 && (
        <section className="section-y bg-mist" aria-labelledby="organisasi">
          <div className="container-x grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <h2 id="organisasi" className="display-sm text-ink">
                {home.clientsTitle}
              </h2>
              <Link href="/portofolio" className="mt-5 inline-flex items-center gap-2 font-semibold text-blue-strong hover:text-ink">
                Lihat hasil produksi <IconArrow className="size-4" />
              </Link>
            </div>
            <div className="lg:col-span-8">
              <ClientLogos clients={clients} />
              <p className="mt-4 text-[0.85rem] text-text-3">{home.clientsNote}</p>
            </div>
          </div>
        </section>
      )}

      <CtaBand title={home.ctaTitle} body={home.ctaBody} waHref={waLink(company.whatsapp, company.whatsappGreeting)} />
    </>
  );
}
