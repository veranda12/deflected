import { ActionForm, Panel, Submit, TextArea, TextField, Toggle } from "@/components/admin/form";
import type { Category } from "@/db/schema";
import { saveCategory } from "./actions";

export function CategoryForm({ category }: { category: Category | null }) {
  const c = category;
  return (
    <ActionForm action={saveCategory.bind(null, c?.id ?? null)} className="space-y-6">
      <Panel title={c ? "Detail kategori" : "Kategori baru"}>
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="Nama" name="name" required maxLength={80} defaultValue={c?.name} />
          <TextField label="Slug URL" name="slug" maxLength={80} defaultValue={c?.slug} hint="Kosongkan untuk dibuat dari nama." />
          <TextField className="sm:col-span-2" label="Tagline" name="tagline" maxLength={160} defaultValue={c?.tagline} hint="Satu kalimat pendek di kartu kategori." />
          <TextArea className="sm:col-span-2" label="Deskripsi" name="description" rows={3} maxLength={1000} defaultValue={c?.description} />
          <TextField label="Meta title" name="seoTitle" maxLength={70} defaultValue={c?.seoTitle ?? ""} />
          <TextField label="Urutan tampil" name="sortOrder" type="number" defaultValue={c?.sortOrder ?? 0} />
          <TextArea className="sm:col-span-2" label="Meta description" name="seoDescription" rows={2} maxLength={170} defaultValue={c?.seoDescription ?? ""} />
          <Toggle label="Tampilkan di situs" name="isPublished" defaultChecked={c ? c.isPublished : true} />
        </div>
        <div className="mt-6 flex justify-end">
          <Submit>{c ? "Simpan kategori" : "Buat kategori"}</Submit>
        </div>
      </Panel>
    </ActionForm>
  );
}
