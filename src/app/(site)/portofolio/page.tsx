import Link from "next/link";
import { ProjectCard } from "@/components/site/cards";
import { CtaBand } from "@/components/site/cta-band";
import { PageHero } from "@/components/site/page-hero";
import { getCatalog, getPortfolio } from "@/lib/queries";
import { buildMetadata } from "@/lib/seo";
import { getSettings } from "@/lib/settings";
import { cn, waLink } from "@/lib/utils";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ searchParams }: Props) {
  const sp = await searchParams;
  const s = await getSettings();
  return buildMetadata({
    path: "/portofolio",
    page: "portfolio",
    description: s.seo.pages.portfolio.description || s.home.workIntro,
    noindex: Object.keys(sp).length > 0,
  });
}

export default async function PortfolioPage({ searchParams }: Props) {
  const [projects, { categories }, settings, sp] = await Promise.all([getPortfolio(), getCatalog(), getSettings(), searchParams]);
  const kat = typeof sp.kategori === "string" ? sp.kategori : "";
  const active = categories.find((c) => c.slug === kat) ?? null;
  const list = active ? projects.filter((p) => p.category?.id === active.id) : projects;
  const usedCats = categories.filter((c) => projects.some((p) => p.category?.id === c.id));
  const featured = !active ? list.filter((p) => p.isFeatured).slice(0, 2) : [];
  const rest = list.filter((p) => !featured.includes(p));
  const { home, company } = settings;

  return (
    <>
      <PageHero
        crumbs={[
          { name: "Beranda", path: "/" },
          { name: "Portofolio", path: "/portofolio" },
        ]}
        title="Hasil produksi kami"
        intro={home.workIntro}
      />

      <section className="pb-[var(--section-y)]" aria-label="Daftar portofolio">
        <div className="container-x">
          <nav aria-label="Filter kategori" className="-mx-[var(--gutter)] overflow-x-auto px-[var(--gutter)] [scrollbar-width:none]">
            <ul className="flex min-w-max gap-2 border-b border-line pb-4">
              <li>
                <Link href="/portofolio" className={tab(!active)} aria-current={!active ? "page" : undefined}>
                  Semua <span className={!active ? "text-white/70" : "text-text-3"}>{projects.length}</span>
                </Link>
              </li>
              {usedCats.map((c) => (
                <li key={c.id}>
                  <Link href={`/portofolio?kategori=${c.slug}`} className={tab(active?.id === c.id)} aria-current={active?.id === c.id ? "page" : undefined}>
                    {c.name} <span className={active?.id === c.id ? "text-white/70" : "text-text-3"}>{c.projectCount}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {list.length === 0 ? (
            <div className="mt-10 rounded-lg border border-dashed border-line px-6 py-16 text-center">
              <p className="display-sm text-ink">Belum ada proyek di kategori ini</p>
              <Link href="/portofolio" className="mt-4 inline-block font-semibold text-blue-strong underline">
                Lihat semua portofolio
              </Link>
            </div>
          ) : (
            <>
              {featured.length > 0 && (
                <div className="mt-10 grid gap-6 md:grid-cols-2">
                  {featured.map((p, i) => (
                    <div key={p.id} data-reveal style={{ ["--reveal-i" as string]: i }}>
                      <ProjectCard project={p} sizes="(min-width: 768px) 50vw, 100vw" aspect="aspect-[5/4]" />
                    </div>
                  ))}
                </div>
              )}
              <ul className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
                {rest.map((p, i) => (
                  <li key={p.id} data-reveal style={{ ["--reveal-i" as string]: i % 4 }}>
                    <ProjectCard project={p} sizes="(min-width: 1024px) 23vw, (min-width: 768px) 31vw, 50vw" />
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </section>

      <CtaBand title={home.ctaTitle} body={home.ctaBody} waHref={waLink(company.whatsapp, company.whatsappGreeting)} />
    </>
  );
}

function tab(active: boolean) {
  return cn(
    "inline-flex h-11 items-center gap-2 rounded-sm px-4 text-[0.9rem] font-medium whitespace-nowrap transition-colors",
    active ? "bg-ink text-white" : "bg-mist text-ink hover:bg-cloud",
  );
}
