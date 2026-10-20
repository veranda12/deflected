import Link from "next/link";
import { Panel } from "@/components/admin/form";
import { MediaSetting } from "@/components/admin/media-setting";
import { SectionForm } from "@/components/admin/section-form";
import { PageTitle } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { getMediaImg } from "@/lib/queries";
import { getSettingsFresh } from "@/lib/settings";
import { cn } from "@/lib/utils";
import { setSettingMedia } from "./actions";

const TABS = [
  { id: "beranda", label: "Beranda" },
  { id: "tentang", label: "Tentang" },
  { id: "layanan", label: "Layanan" },
  { id: "footer", label: "Footer" },
] as const;

export default async function ContentPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  await requireAdmin();
  const { tab = "beranda" } = await searchParams;
  const settings = await getSettingsFresh();
  const heroImg = await getMediaImg(settings.hero.imageMediaId);

  return (
    <>
      <PageTitle title="Konten halaman" description="Ubah teks dan gambar situs. Perubahan langsung tampil setelah disimpan." />
      <nav aria-label="Bagian konten" className="mb-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Link
            key={t.id}
            href={`/admin/konten?tab=${t.id}`}
            aria-current={tab === t.id ? "page" : undefined}
            className={cn("inline-flex h-10 items-center rounded-sm px-4 text-sm font-semibold", tab === t.id ? "bg-ink text-white" : "bg-white text-ink hover:bg-cloud")}
          >
            {t.label}
          </Link>
        ))}
        <Link href="/admin/faq" className="inline-flex h-10 items-center rounded-sm bg-white px-4 text-sm font-semibold text-ink hover:bg-cloud">
          FAQ
        </Link>
      </nav>
      <div className="space-y-6">
        {tab === "beranda" && (
          <>
            <Panel title="Foto hero" description="Rasio potret 4:5 paling pas. Gunakan foto produk asli beresolusi tinggi.">
              <MediaSetting label="Foto utama beranda" currentKey={heroImg?.key ?? null} setMedia={setSettingMedia.bind(null, "hero.imageMediaId")} aspect="aspect-[4/5]" />
            </Panel>
            <SectionForm sectionKey="hero" value={settings.hero} />
            <SectionForm sectionKey="home" value={settings.home} />
          </>
        )}
        {tab === "tentang" && <SectionForm sectionKey="about" value={settings.about} />}
        {tab === "layanan" && <SectionForm sectionKey="services" value={settings.services} />}
        {tab === "footer" && <SectionForm sectionKey="footer" value={settings.footer} />}
      </div>
    </>
  );
}
