import { RevealObserver } from "@/components/site/reveal-observer";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { WhatsAppFloat } from "@/components/site/whatsapp-float";
import { getCatalog, getMediaImg } from "@/lib/queries";
import { organizationJsonLd, JsonLd } from "@/lib/seo";
import { getSettings } from "@/lib/settings";
import { waLink } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, catalog] = await Promise.all([getSettings(), getCatalog()]);
  const { company } = settings;
  const rasterLogo = await getMediaImg(settings.brand.logoMediaId);
  const wa = waLink(company.whatsapp, company.whatsappGreeting);
  const cats = catalog.categories.map((c) => ({ slug: c.slug, name: c.name, tagline: c.tagline }));
  return (
    <>
      <SiteHeader categories={cats} waHref={wa} />
      <main id="konten">{children}</main>
      <SiteFooter company={company} footer={settings.footer} categories={cats} />
      <WhatsAppFloat href={wa} />
      <RevealObserver />
      <JsonLd data={organizationJsonLd(settings, rasterLogo)} />
    </>
  );
}
