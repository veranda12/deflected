import type { SettingsMap } from "./content-defaults";

// Describes how each settings section is edited in the admin. The same
// descriptor drives both the form (rendering) and the server action (parsing),
// so a field can't be saved unless it is declared here.

export type FieldType =
  | "text"
  | "textarea"
  | "list" // one item per line -> string[]
  | "points" // "Judul | isi" per line -> {title, body}[]
  | "pairs" // "Label | nilai" per line -> {label, value}[]
  | "lines" // "Judul | deskripsi | item, item" per line -> {title, body, items}[]
  | "bool";

export type FieldDef = { path: string; label: string; type: FieldType; max?: number; hint?: string; required?: boolean };

export type SectionKey = keyof SettingsMap;

export const CONTENT_SECTIONS: Partial<Record<SectionKey, { title: string; description: string; fields: FieldDef[] }>> = {
  hero: {
    title: "Hero beranda",
    description: "Bagian pertama yang dilihat pengunjung.",
    fields: [
      { path: "title", label: "Judul", type: "textarea", max: 120, required: true, hint: "Setiap baris baru menjadi satu baris judul. Ideal 2 sampai 3 baris." },
      { path: "subtitle", label: "Subjudul", type: "textarea", max: 320 },
      { path: "primaryCta", label: "Teks tombol WhatsApp", type: "text", max: 40, required: true },
      { path: "secondaryCta", label: "Teks tombol katalog", type: "text", max: 40, required: true },
      { path: "imageAlt", label: "Keterangan foto hero", type: "text", max: 200, hint: "Dipakai sebagai alt text dan keterangan di bawah foto." },
    ],
  },
  home: {
    title: "Section beranda",
    description: "Judul dan teks setiap section di beranda.",
    fields: [
      { path: "categoriesTitle", label: "Judul section kategori", type: "text", max: 80 },
      { path: "categoriesIntro", label: "Intro section kategori", type: "textarea", max: 300 },
      { path: "craftTitle", label: "Judul section material", type: "text", max: 80 },
      { path: "craftIntro", label: "Intro section material", type: "textarea", max: 300 },
      { path: "materials", label: "Daftar bahan", type: "list", hint: "Satu bahan per baris. Juga dipakai sebagai pilihan bahan di form penawaran." },
      { path: "techniques", label: "Daftar teknik", type: "list", hint: "Satu teknik per baris." },
      { path: "craftNote", label: "Catatan material", type: "text", max: 200 },
      { path: "processTitle", label: "Judul section proses", type: "text", max: 80 },
      { path: "processIntro", label: "Intro section proses", type: "textarea", max: 300 },
      { path: "workTitle", label: "Judul section hasil produksi", type: "text", max: 80 },
      { path: "workIntro", label: "Intro section hasil produksi", type: "textarea", max: 300 },
      { path: "clientsTitle", label: "Judul daftar organisasi", type: "text", max: 100 },
      { path: "clientsNote", label: "Catatan daftar organisasi", type: "text", max: 200 },
      { path: "whyTitle", label: "Judul section keunggulan", type: "text", max: 80 },
      { path: "whyPoints", label: "Poin keunggulan", type: "points", hint: "Satu poin per baris, format Judul | penjelasan" },
      { path: "faqTitle", label: "Judul FAQ", type: "text", max: 80 },
      { path: "ctaTitle", label: "Judul CTA penutup", type: "text", max: 100 },
      { path: "ctaBody", label: "Teks CTA penutup", type: "textarea", max: 300 },
    ],
  },
  about: {
    title: "Halaman Tentang",
    description: "Profil perusahaan dari company profile.",
    fields: [
      { path: "title", label: "Judul", type: "text", max: 120, required: true },
      { path: "intro", label: "Intro", type: "textarea", max: 500 },
      { path: "focus", label: "Fokus layanan", type: "list" },
      { path: "challengeTitle", label: "Judul perbandingan pengadaan", type: "text", max: 120 },
      { path: "fragmented", label: "Pengadaan terfragmentasi", type: "list" },
      { path: "coordinated", label: "Pendekatan terkoordinasi", type: "list" },
      { path: "challengeNote", label: "Catatan perbandingan", type: "text", max: 250 },
      { path: "valueTitle", label: "Judul proposisi nilai", type: "text", max: 120 },
      { path: "valuePoints", label: "Proposisi nilai", type: "points", hint: "Judul | penjelasan" },
      { path: "partnershipTitle", label: "Judul model kemitraan", type: "text", max: 120 },
      { path: "projectBased", label: "Cocok untuk pesanan proyek", type: "list" },
      { path: "recurring", label: "Cocok untuk pesanan berulang", type: "list" },
      { path: "partnershipNote", label: "Catatan kemitraan", type: "textarea", max: 300 },
    ],
  },
  services: {
    title: "Halaman Layanan",
    description: "Lini layanan, kustomisasi, dan alur pesanan.",
    fields: [
      { path: "title", label: "Judul", type: "text", max: 120, required: true },
      { path: "intro", label: "Intro", type: "textarea", max: 400 },
      { path: "lines", label: "Lini layanan", type: "lines", hint: "Satu lini per baris: Judul | deskripsi | item, item, item" },
      { path: "customizationTitle", label: "Judul kustomisasi", type: "text", max: 120 },
      { path: "customization", label: "Tabel kustomisasi", type: "pairs", hint: "Label | isi, satu per baris" },
      { path: "customizationNote", label: "Catatan kustomisasi", type: "text", max: 200 },
      { path: "process", label: "Alur pesanan", type: "points", hint: "Judul tahap | penjelasan, satu per baris. Juga tampil di beranda." },
      { path: "processNote", label: "Catatan alur", type: "textarea", max: 300 },
      { path: "disclaimer", label: "Disclaimer workwear", type: "text", max: 250 },
    ],
  },
  footer: {
    title: "Footer",
    description: "Teks singkat di bagian bawah setiap halaman.",
    fields: [
      { path: "blurb", label: "Deskripsi singkat", type: "textarea", max: 200 },
      { path: "hashtag", label: "Hashtag", type: "text", max: 40 },
    ],
  },
  company: {
    title: "Identitas dan kontak",
    description: "Dipakai di header, footer, halaman kontak, tombol WhatsApp, dan data terstruktur Google.",
    fields: [
      { path: "name", label: "Nama perusahaan", type: "text", max: 80, required: true },
      { path: "shortName", label: "Nama singkat", type: "text", max: 30 },
      { path: "tagline", label: "Tagline", type: "text", max: 120 },
      { path: "description", label: "Deskripsi perusahaan", type: "textarea", max: 400 },
      { path: "whatsapp", label: "Nomor WhatsApp (format 62...)", type: "text", max: 16, required: true, hint: "Hanya angka, contoh 6282218311200" },
      { path: "whatsappDisplay", label: "Nomor WhatsApp untuk ditampilkan", type: "text", max: 24 },
      { path: "whatsappGreeting", label: "Pesan pembuka WhatsApp", type: "text", max: 200 },
      { path: "email", label: "Email", type: "text", max: 120, required: true },
      { path: "address", label: "Alamat", type: "textarea", max: 250 },
      { path: "mapsUrl", label: "Link Google Maps", type: "text", max: 400 },
      { path: "instagram", label: "URL Instagram", type: "text", max: 200, hint: "URL lengkap. Kosongkan jika belum ada." },
      { path: "tiktok", label: "URL TikTok", type: "text", max: 200 },
      { path: "facebook", label: "URL Facebook", type: "text", max: 200 },
      { path: "linkedin", label: "URL LinkedIn", type: "text", max: 200 },
    ],
  },
  seo: {
    title: "SEO default",
    description: "Dipakai bila halaman tidak punya meta sendiri.",
    fields: [
      { path: "siteName", label: "Nama situs", type: "text", max: 60, required: true },
      { path: "defaultTitle", label: "Meta title default", type: "text", max: 70, required: true },
      { path: "defaultDescription", label: "Meta description default", type: "textarea", max: 170, required: true },
      ...(["home", "about", "services", "catalog", "portfolio", "contact"] as const).flatMap((k) => {
        const name = { home: "Beranda", about: "Tentang", services: "Layanan", catalog: "Katalog", portfolio: "Portofolio", contact: "Kontak" }[k];
        return [
          { path: `pages.${k}.title`, label: `${name}: meta title`, type: "text" as const, max: 70 },
          { path: `pages.${k}.description`, label: `${name}: meta description`, type: "textarea" as const, max: 170 },
          { path: `pages.${k}.noindex`, label: `${name}: noindex`, type: "bool" as const },
        ];
      }),
    ],
  },
};

export function getPath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((o, k) => (o && typeof o === "object" ? (o as Record<string, unknown>)[k] : undefined), obj);
}

export function setPath(obj: Record<string, unknown>, path: string, value: unknown) {
  const keys = path.split(".");
  let cur = obj;
  for (const k of keys.slice(0, -1)) {
    if (!cur[k] || typeof cur[k] !== "object") cur[k] = {};
    cur = cur[k] as Record<string, unknown>;
  }
  cur[keys[keys.length - 1]] = value;
}

/** Converts a stored value to the textarea/input representation. */
export function toFieldText(type: FieldType, v: unknown): string {
  if (type === "list") return Array.isArray(v) ? v.join("\n") : "";
  if (type === "points") return Array.isArray(v) ? (v as { title: string; body: string }[]).map((p) => `${p.title} | ${p.body}`).join("\n") : "";
  if (type === "pairs") return Array.isArray(v) ? (v as { label: string; value: string }[]).map((p) => `${p.label} | ${p.value}`).join("\n") : "";
  if (type === "lines")
    return Array.isArray(v) ? (v as { title: string; body: string; items: string[] }[]).map((l) => `${l.title} | ${l.body} | ${l.items.join(", ")}`).join("\n") : "";
  return typeof v === "string" ? v : "";
}

const rows = (s: string) =>
  s
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 40);
const parts = (l: string) => l.split("|").map((x) => x.trim());

export function fromFieldText(type: FieldType, raw: string, max = 2000): unknown {
  const s = raw.slice(0, 8000);
  if (type === "list") return rows(s).map((x) => x.slice(0, 160));
  if (type === "points") return rows(s).map((l) => ({ title: parts(l)[0].slice(0, 120), body: (parts(l)[1] ?? "").slice(0, 400) }));
  if (type === "pairs") return rows(s).map((l) => ({ label: parts(l)[0].slice(0, 80), value: (parts(l)[1] ?? "").slice(0, 400) }));
  if (type === "lines")
    return rows(s).map((l) => {
      const [title, body = "", items = ""] = parts(l);
      return { title: title.slice(0, 120), body: body.slice(0, 400), items: items.split(",").map((i) => i.trim()).filter(Boolean).slice(0, 20) };
    });
  return s.trim().slice(0, max);
}
