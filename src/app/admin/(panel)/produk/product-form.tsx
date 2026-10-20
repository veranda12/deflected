import { ActionForm, Panel, SelectField, Submit, TextArea, TextField, Toggle } from "@/components/admin/form";
import type { Product } from "@/db/schema";
import { saveProduct } from "./actions";

export function ProductForm({
  product,
  variantsText,
  categories,
}: {
  product: Product | null;
  variantsText: string;
  categories: { id: string; name: string }[];
}) {
  const p = product;
  return (
    <ActionForm action={saveProduct.bind(null, p?.id ?? null)} className="space-y-6">
      <Panel title="Informasi produk">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="Nama produk" name="name" required defaultValue={p?.name} maxLength={120} />
          <TextField
            label="Slug URL"
            name="slug"
            defaultValue={p?.slug}
            maxLength={80}
            hint={p ? "Mengubah slug otomatis membuat redirect 301 dari URL lama." : "Kosongkan untuk dibuat dari nama."}
          />
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
          <TextArea className="sm:col-span-2" label="Ringkasan" name="summary" rows={2} maxLength={300} defaultValue={p?.summary} hint="Satu sampai dua kalimat. Tampil di bawah judul dan sebagai meta description bawaan." />
          <TextArea className="sm:col-span-2" label="Deskripsi" name="description" rows={6} maxLength={5000} defaultValue={p?.description} hint="Teks biasa. Pisahkan paragraf dengan satu baris kosong." />
        </div>
      </Panel>

      <Panel title="Spesifikasi" description="Pisahkan item dengan koma atau baris baru.">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextArea label="Bahan" name="materials" rows={3} defaultValue={p?.materials.join(", ")} placeholder="Cotton Combed 24s, CVC Pique" />
          <TextArea label="Teknik" name="techniques" rows={3} defaultValue={p?.techniques.join(", ")} placeholder="Sablon DTF, Bordir" />
          <TextArea label="Cocok untuk" name="useCases" rows={3} defaultValue={p?.useCases.join(", ")} placeholder="Seragam karyawan, event" />
          <TextArea
            label="Spesifikasi tambahan"
            name="specs"
            rows={3}
            defaultValue={p?.specs.map((s) => `${s.label}: ${s.value}`).join("\n")}
            hint="Satu baris per item, format Label: nilai"
            placeholder="Ukuran: S sampai XXL"
          />
          <TextArea
            className="sm:col-span-2"
            label="Varian"
            name="variants"
            rows={3}
            defaultValue={variantsText}
            hint="Satu baris per varian, format Nama | keterangan"
            placeholder="Lengan panjang | Untuk acara outdoor"
          />
        </div>
      </Panel>

      <Panel title="Tampilan dan SEO">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="Meta title" name="seoTitle" maxLength={70} defaultValue={p?.seoTitle ?? ""} hint="Maks 70 karakter. Kosongkan untuk memakai nama produk." />
          <TextField label="Urutan tampil" name="sortOrder" type="number" defaultValue={p?.sortOrder ?? 0} hint="Angka kecil tampil lebih dulu." />
          <TextArea className="sm:col-span-2" label="Meta description" name="seoDescription" rows={2} maxLength={170} defaultValue={p?.seoDescription ?? ""} hint="Maks 170 karakter. Kosongkan untuk memakai ringkasan." />
          <Toggle label="Produk unggulan" name="isFeatured" defaultChecked={p?.isFeatured} hint="Diprioritaskan di beberapa bagian situs." />
          <Toggle label="Noindex" name="noindex" defaultChecked={p?.noindex} hint="Minta mesin pencari tidak mengindeks halaman ini." />
        </div>
      </Panel>

      <div className="flex justify-end">
        <Submit>{p ? "Simpan perubahan" : "Buat produk"}</Submit>
      </div>
    </ActionForm>
  );
}
