import { Panel } from "@/components/admin/form";
import { MediaSetting } from "@/components/admin/media-setting";
import { SectionForm } from "@/components/admin/section-form";
import { Badge, PageTitle } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { env } from "@/lib/env";
import { getMediaImg } from "@/lib/queries";
import { getSettingsFresh } from "@/lib/settings";
import { sheetsConfigured } from "@/lib/sheets";
import { setSettingMedia } from "../konten/actions";

export default async function SettingsPage() {
  await requireAdmin({ role: "owner" });
  const settings = await getSettingsFresh();
  const [logo, favicon] = await Promise.all([getMediaImg(settings.brand.logoMediaId), getMediaImg(settings.brand.faviconMediaId)]);
  const integrations = [
    { label: "Database", ok: true, note: "Terhubung" },
    { label: "Google Sheets", ok: sheetsConfigured(), note: sheetsConfigured() ? "Kredensial terpasang" : "Belum dikonfigurasi (lihat docs/DEPLOYMENT.md)" },
    { label: "Penyimpanan gambar", ok: true, note: process.env.STORAGE_DRIVER === "r2" ? "Cloudflare R2" : "Disk lokal" },
    { label: "Cron secret", ok: !!env.cronSecret, note: env.cronSecret ? "Terpasang" : "Belum diatur, retry Sheets otomatis tidak berjalan" },
  ];
  return (
    <>
      <PageTitle title="Pengaturan" description="Identitas perusahaan, kontak, dan aset brand. Hanya owner yang dapat mengubah halaman ini." />
      <div className="space-y-6">
        <SectionForm sectionKey="company" value={settings.company} />
        <Panel title="Logo dan favicon" description="Logo vektor DFLCTD sudah terpasang di situs. Logo raster dipakai untuk data terstruktur Google (Organization), favicon menggantikan ikon bawaan.">
          <div className="space-y-6">
            <MediaSetting label="Logo (raster)" hint="PNG transparan, minimal 512 px." currentKey={logo?.key ?? null} setMedia={setSettingMedia.bind(null, "brand.logoMediaId")} aspect="aspect-square" />
            <MediaSetting label="Favicon" hint="PNG persegi 512 x 512 px. Kosongkan untuk memakai ikon bawaan." currentKey={favicon?.key ?? null} setMedia={setSettingMedia.bind(null, "brand.faviconMediaId")} aspect="aspect-square" />
          </div>
        </Panel>
        <Panel title="Integrasi">
          <ul className="divide-y divide-line text-sm">
            {integrations.map((i) => (
              <li key={i.label} className="flex items-center justify-between gap-4 py-2.5">
                <span className="font-semibold text-ink">{i.label}</span>
                <span className="flex items-center gap-2 text-text-2">
                  {i.note}
                  <Badge tone={i.ok ? "success" : "warning"}>{i.ok ? "Aktif" : "Perlu tindakan"}</Badge>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[0.8rem] text-text-3">Rahasia (password database, kunci Google) disimpan sebagai environment variable di hosting dan tidak pernah ditampilkan di panel ini.</p>
        </Panel>
      </div>
    </>
  );
}
