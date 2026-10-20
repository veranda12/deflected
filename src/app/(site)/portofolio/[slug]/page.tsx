import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { IconWhatsApp } from "@/components/icons";
import { ProjectCard } from "@/components/site/cards";
import { Gallery } from "@/components/site/gallery";
import { Breadcrumbs } from "@/components/site/page-hero";
import { buttonClass } from "@/components/ui/button";
import { findRedirect, getPortfolio } from "@/lib/queries";
import { buildMetadata, JsonLd, projectJsonLd } from "@/lib/seo";
import { getSettings } from "@/lib/settings";
import { paragraphs, waLink } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const [{ slug }, projects] = await Promise.all([params, getPortfolio()]);
  const p = projects.find((x) => x.slug === slug);
  if (!p) return {};
  return buildMetadata({
    path: `/portofolio/${p.slug}`,
    title: p.seoTitle || p.title,
    description: p.seoDescription || p.summary,
    image: p.images[0],
    noindex: p.noindex,
    type: "article",
  });
}

export default async function ProjectPage({ params }: Props) {
  const [{ slug }, projects, settings] = await Promise.all([params, getPortfolio(), getSettings()]);
  const project = projects.find((x) => x.slug === slug);
  if (!project) {
    const moved = await findRedirect("portfolio", slug);
    if (moved) permanentRedirect(`/portofolio/${moved}`);
    notFound();
  }
  const { company } = settings;
  const related = projects.filter((p) => p.id !== project.id && p.category?.id === project.category?.id).slice(0, 3);
  const waText = `Halo Deflected, saya ingin membuat ${project.productLabel.toLowerCase()} seperti contoh "${project.title}". Boleh minta penawarannya?`;

  const facts = [
    { label: "Klien", value: project.clientName },
    { label: "Produk", value: project.productLabel },
    { label: "Bahan", value: project.materials.join(", ") },
    { label: "Teknik", value: project.techniques.join(", ") },
    { label: "Tahun", value: project.year ? String(project.year) : "" },
  ].filter((f) => f.value);

  return (
    <>
      <section className="pt-[calc(var(--header-h)+40px)] pb-[var(--section-y)]">
        <div className="container-x">
          <Breadcrumbs
            items={[
              { name: "Beranda", path: "/" },
              { name: "Portofolio", path: "/portofolio" },
              { name: project.title, path: `/portofolio/${project.slug}` },
            ]}
          />
          <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-7">
              <Gallery images={project.images} label={project.title} />
            </div>
            <div className="lg:col-span-5 lg:pt-4">
              {project.category && (
                <Link href={`/portofolio?kategori=${project.category.slug}`} className="inline-flex min-h-6 items-center text-sm font-semibold text-blue-strong hover:underline">
                  {project.category.name}
                </Link>
              )}
              <h1 className="display-lg mt-3 text-ink">{project.title}</h1>
              {project.summary && <p className="mt-5 text-[1.05rem] leading-relaxed text-text-2">{project.summary}</p>}
              <dl className="mt-8 border-t border-line">
                {facts.map((f) => (
                  <div key={f.label} className="grid grid-cols-[110px_1fr] gap-4 border-b border-line py-3.5">
                    <dt className="text-sm font-semibold text-text-2">{f.label}</dt>
                    <dd className="text-ink">{f.value}</dd>
                  </div>
                ))}
              </dl>
              {project.description && (
                <div className="mt-8 space-y-4 leading-relaxed text-text-2">
                  {paragraphs(project.description).map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              )}
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a href={waLink(company.whatsapp, waText)} target="_blank" rel="noopener noreferrer" className={buttonClass("primary", "lg")}>
                  <IconWhatsApp className="size-5" />
                  <span>Buat pesanan serupa</span>
                </a>
                {project.category && (
                  <Link href={`/katalog/kategori/${project.category.slug}`} className={buttonClass("outline", "lg")}>
                    Lihat katalog {project.category.name}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section-y bg-mist" aria-labelledby="lainnya">
          <div className="container-x">
            <h2 id="lainnya" className="display-md text-ink">
              Proyek lain di kategori ini
            </h2>
            <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-3 lg:gap-x-6">
              {related.map((p) => (
                <ProjectCard key={p.id} project={p} sizes="(min-width: 1024px) 30vw, 50vw" />
              ))}
            </div>
          </div>
        </section>
      )}
      <JsonLd data={projectJsonLd(project, company.name)} />
    </>
  );
}
