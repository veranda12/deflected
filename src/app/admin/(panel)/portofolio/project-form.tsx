import { ActionForm, Panel, SelectField, Submit, TextArea, TextField, Toggle } from "@/components/admin/form";
import type { PortfolioProject } from "@/db/schema";
import { saveProject } from "./actions";

export function ProjectForm({ project, categories }: { project: PortfolioProject | null; categories: { id: string; name: string }[] }) {
  const p = project;
  return (
    <ActionForm action={saveProject.bind(null, p?.id ?? null)} className="space-y-6">
      <Panel title="Detail proyek">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="Judul" name="title" required maxLength={140} defaultValue={p?.title} placeholder="Jersey set PLN Sinjai" />
          <TextField label="Slug URL" name="slug" maxLength={80} defaultValue={p?.slug} hint="Kosongkan untuk dibuat dari judul." />
          <TextField label="Nama klien" name="clientName" maxLength={140} defaultValue={p?.clientName} hint="Pastikan klien setuju namanya ditampilkan." />
          <TextField label="Jenis produk" name="productLabel" maxLength={100} defaultValue={p?.productLabel} placeholder="Jersey Set" />
          <SelectField
            label="Kategori"
            name="categoryId"
            defaultValue={p?.categoryId ?? ""}
            options={[{ value: "", label: "Tanpa kategori" }, ...categories.map((c) => ({ value: c.id, label: c.name }))]}
          />
          <SelectField
            label="Status"
            name="status"
            defaultValue={p?.status ?? "draft"}
            options={[
              { value: "draft", label: "Draft (tidak tampil)" },
              { value: "published", label: "Published (tampil di situs)" },
            ]}
          />
          <TextArea label="Bahan" name="materials" rows={2} defaultValue={p?.materials.join(", ")} hint="Pisahkan dengan koma." />
          <TextArea label="Teknik" name="techniques" rows={2} defaultValue={p?.techniques.join(", ")} hint="Pisahkan dengan koma." />
          <TextField label="Tahun produksi" name="year" inputMode="numeric" maxLength={4} defaultValue={p?.year ?? ""} hint="Opsional." />
          <TextField label="Urutan tampil" name="sortOrder" type="number" defaultValue={p?.sortOrder ?? 0} />
          <TextArea className="sm:col-span-2" label="Ringkasan" name="summary" rows={2} maxLength={400} defaultValue={p?.summary} />
          <TextArea className="sm:col-span-2" label="Cerita proyek" name="description" rows={5} maxLength={5000} defaultValue={p?.description} hint="Opsional. Kebutuhan klien, tantangan, dan hasilnya." />
        </div>
      </Panel>
      <Panel title="Tampilan dan SEO">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="Meta title" name="seoTitle" maxLength={70} defaultValue={p?.seoTitle ?? ""} />
          <TextArea label="Meta description" name="seoDescription" rows={2} maxLength={170} defaultValue={p?.seoDescription ?? ""} />
          <Toggle label="Proyek unggulan" name="isFeatured" defaultChecked={p?.isFeatured} hint="Tampil di beranda dan baris teratas portofolio." />
          <Toggle label="Noindex" name="noindex" defaultChecked={p?.noindex} />
        </div>
      </Panel>
      <div className="flex justify-end">
        <Submit>{p ? "Simpan perubahan" : "Buat proyek"}</Submit>
      </div>
    </ActionForm>
  );
}
