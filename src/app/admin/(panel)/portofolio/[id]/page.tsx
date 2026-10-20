import { asc, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DangerButton } from "@/components/admin/danger-button";
import { Panel } from "@/components/admin/form";
import { ImageList } from "@/components/admin/image-list";
import { PageTitle } from "@/components/admin/ui";
import { Uploader } from "@/components/admin/uploader";
import { getDb } from "@/db";
import { categories, media, portfolioImages, portfolioProjects } from "@/db/schema";
import { isUuid } from "@/lib/admin-guard";
import { requireAdmin } from "@/lib/auth";
import { deleteProject, moveProjectImage, removeProjectImage, updateProjectImage } from "../actions";
import { ProjectForm } from "../project-form";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | undefined>> };

export default async function EditProject({ params, searchParams }: Props) {
  await requireAdmin();
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  if (!isUuid(id)) notFound();
  const db = getDb();
  const [project] = await db.select().from(portfolioProjects).where(eq(portfolioProjects.id, id)).limit(1);
  if (!project) notFound();
  const [cats, imgs] = await Promise.all([
    db.select({ id: categories.id, name: categories.name }).from(categories).orderBy(asc(categories.sortOrder)),
    db
      .select({ rowId: portfolioImages.id, key: media.key, alt: portfolioImages.alt })
      .from(portfolioImages)
      .innerJoin(media, eq(portfolioImages.mediaId, media.id))
      .where(eq(portfolioImages.projectId, id))
      .orderBy(asc(portfolioImages.sortOrder)),
  ]);
  return (
    <>
      <PageTitle
        title={project.title}
        back={{ href: "/admin/portofolio", label: "Kembali ke portofolio" }}
        actions={
          project.status === "published" ? (
            <Link href={`/portofolio/${project.slug}`} target="_blank" className="text-sm font-semibold text-blue-strong hover:underline">
              Lihat di situs
            </Link>
          ) : null
        }
      />
      {sp.baru && <p role="status" className="mb-4 rounded-sm bg-success-soft px-4 py-3 text-sm text-success">Proyek dibuat. Sekarang unggah fotonya.</p>}
      <div className="space-y-6">
        <Panel title="Foto proyek" description="Foto pertama menjadi sampul. Viewer di situs menampilkan semua foto." actions={<Uploader target="portfolio" targetId={project.id} />}>
          <ImageList rows={imgs} updateAlt={updateProjectImage} move={moveProjectImage} remove={removeProjectImage} />
        </Panel>
        <ProjectForm project={project} categories={cats} />
        <Panel title="Zona berbahaya">
          <DangerButton action={deleteProject.bind(null, project.id)} confirmText={`Hapus proyek "${project.title}"?`}>
            Hapus proyek
          </DangerButton>
        </Panel>
      </div>
    </>
  );
}
