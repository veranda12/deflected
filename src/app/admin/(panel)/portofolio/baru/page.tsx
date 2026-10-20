import { asc } from "drizzle-orm";
import { PageTitle } from "@/components/admin/ui";
import { getDb } from "@/db";
import { categories } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { ProjectForm } from "../project-form";

export default async function NewProject() {
  await requireAdmin();
  const cats = await getDb().select({ id: categories.id, name: categories.name }).from(categories).orderBy(asc(categories.sortOrder));
  return (
    <>
      <PageTitle title="Tambah proyek" description="Simpan dulu, lalu unggah foto di halaman berikutnya." back={{ href: "/admin/portofolio", label: "Kembali ke portofolio" }} />
      <ProjectForm project={null} categories={cats} />
    </>
  );
}
