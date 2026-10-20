import { eq } from "drizzle-orm";
import Image from "next/image";
import { notFound } from "next/navigation";
import { DangerButton } from "@/components/admin/danger-button";
import { Panel } from "@/components/admin/form";
import { PageTitle } from "@/components/admin/ui";
import { Uploader } from "@/components/admin/uploader";
import { getDb } from "@/db";
import { categories, media } from "@/db/schema";
import { isUuid } from "@/lib/admin-guard";
import { requireAdmin } from "@/lib/auth";
import { mediaUrl } from "@/lib/storage-url";
import { deleteCategory } from "../actions";
import { CategoryForm } from "../category-form";

export default async function EditCategory({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const db = getDb();
  const [cat] = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  if (!cat) notFound();
  const [cover] = cat.coverMediaId ? await db.select().from(media).where(eq(media.id, cat.coverMediaId)) : [];
  return (
    <>
      <PageTitle title={cat.name} back={{ href: "/admin/kategori", label: "Kembali ke kategori" }} />
      <div className="space-y-6">
        <Panel title="Foto sampul" description="Tampil di kartu kategori beranda, halaman layanan, dan sebagai gambar Open Graph." actions={<Uploader target="category" targetId={cat.id} multiple={false} label="Ganti sampul" />}>
          <div className="relative aspect-[16/9] max-w-xl overflow-hidden rounded-sm bg-cloud">
            {cover ? <Image src={mediaUrl(cover.key)} alt="" fill sizes="600px" className="object-cover" /> : <p className="p-6 text-sm text-text-2">Belum ada sampul.</p>}
          </div>
        </Panel>
        <CategoryForm category={cat} />
        <Panel title="Zona berbahaya" description="Produk dan portofolio di kategori ini tidak ikut terhapus, tetapi menjadi tanpa kategori.">
          <DangerButton action={deleteCategory.bind(null, cat.id)} confirmText={`Hapus kategori "${cat.name}"?`}>
            Hapus kategori
          </DangerButton>
        </Panel>
      </div>
    </>
  );
}
