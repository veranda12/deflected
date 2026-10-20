import { count, eq, or } from "drizzle-orm";
import Link from "next/link";
import { Panel } from "@/components/admin/form";
import { MediaSetting } from "@/components/admin/media-setting";
import { SectionForm } from "@/components/admin/section-form";
import { PageTitle } from "@/components/admin/ui";
import { getDb } from "@/db";
import { media, portfolioImages, productImages, products, slugRedirects } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { env } from "@/lib/env";
import { getMediaImg } from "@/lib/queries";
import { getSettingsFresh } from "@/lib/settings";
import { setSettingMedia } from "../konten/actions";

export default async function SeoPage() {
  await requireAdmin();
  const db = getDb();
  const settings = await getSettingsFresh();
  const og = await getMediaImg(settings.seo.ogMediaId);
  const [[{ noAltProduct }], [{ noAltProject }], [{ redirects }], [{ noSeo }]] = await Promise.all([
    db.select({ noAltProduct: count() }).from(productImages).innerJoin(media, eq(productImages.mediaId, media.id)).where(eq(productImages.alt, "")),
    db.select({ noAltProject: count() }).from(portfolioImages).where(eq(portfolioImages.alt, "")),
    db.select({ redirects: count() }).from(slugRedirects),
    db.select({ noSeo: count() }).from(products).where(or(eq(products.summary, ""))),
  ]);
  const checks = [
    { label: "Gambar produk tanpa alt text", value: noAltProduct, href: "/admin/produk" },
    { label: "Gambar portofolio tanpa alt text", value: noAltProject, href: "/admin/portofolio" },
    { label: "Produk tanpa ringkasan (meta description bawaan)", value: noSeo, href: "/admin/produk" },
  ];
  return (
    <>
      <PageTitle title="SEO" description="Meta default, gambar Open Graph, dan pemeriksaan sederhana. Meta per produk dan portofolio diatur di halaman edit masing-masing." />
      <div className="space-y-6">
        <Panel title="Status">
          <ul className="divide-y divide-line text-sm">
            <li className="flex justify-between gap-4 py-2.5">
              <span className="text-text-2">Sitemap</span>
              <a href="/sitemap.xml" target="_blank" className="font-semibold text-blue-strong hover:underline">
                {env.siteUrl}/sitemap.xml
              </a>
            </li>
            <li className="flex justify-between gap-4 py-2.5">
              <span className="text-text-2">Robots</span>
              <a href="/robots.txt" target="_blank" className="font-semibold text-blue-strong hover:underline">
                /robots.txt
              </a>
            </li>
            <li className="flex justify-between gap-4 py-2.5">
              <span className="text-text-2">Redirect slug aktif (301)</span>
              <span className="font-semibold text-ink">{redirects}</span>
            </li>
            {checks.map((c) => (
              <li key={c.label} className="flex justify-between gap-4 py-2.5">
                <span className="text-text-2">{c.label}</span>
                <Link href={c.href} className={`font-semibold ${c.value ? "text-warning" : "text-success"} hover:underline`}>
                  {c.value}
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Gambar Open Graph default" description="Muncul saat link situs dibagikan di WhatsApp atau media sosial. Ideal 1200 x 630 piksel.">
          <MediaSetting label="Gambar berbagi" currentKey={og?.key ?? null} setMedia={setSettingMedia.bind(null, "seo.ogMediaId")} />
        </Panel>
        <SectionForm sectionKey="seo" value={settings.seo} />
      </div>
    </>
  );
}
