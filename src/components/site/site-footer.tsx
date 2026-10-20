import Link from "next/link";
import { IconInstagram, IconMail, IconPin, IconWhatsApp } from "@/components/icons";
import { LogoMark, Wordmark } from "@/components/logo";
import type { CompanySettings, FooterSettings } from "@/lib/content-defaults";
import { waLink } from "@/lib/utils";

type Props = {
  company: CompanySettings;
  footer: FooterSettings;
  categories: { slug: string; name: string }[];
};

export function SiteFooter({ company, footer, categories }: Props) {
  const socials = [
    { href: company.instagram, label: "Instagram" },
    { href: company.tiktok, label: "TikTok" },
    { href: company.facebook, label: "Facebook" },
    { href: company.linkedin, label: "LinkedIn" },
  ].filter((s) => s.href);
  const year = new Date().getFullYear();

  return (
    <footer className="on-dark relative overflow-hidden bg-ink text-white">
      <div className="container-x pt-20 pb-10">
        <div className="grid gap-14 lg:grid-cols-[1.3fr_1fr_1fr_1.2fr]">
          <div>
            <Link href="/" aria-label="Deflected, ke beranda" className="inline-flex items-end gap-3 text-white">
              <LogoMark className="h-14 w-auto text-blue" />
              <Wordmark className="h-7 w-auto" />
            </Link>
            <p className="mt-6 max-w-xs text-[0.95rem] leading-relaxed text-on-dark-2">{footer.blurb}</p>
            <p className="mt-5 font-display text-2xl tracking-wide text-amber">{footer.hashtag}</p>
          </div>

          <nav aria-label="Halaman">
            <h2 className="text-sm font-semibold text-white">Halaman</h2>
            <ul className="mt-4 space-y-2.5 text-[0.95rem] text-on-dark-2">
              {[
                ["/tentang", "Tentang"],
                ["/layanan", "Layanan"],
                ["/katalog", "Katalog produk"],
                ["/portofolio", "Portofolio"],
                ["/kontak", "Kontak"],
                ["/kebijakan-privasi", "Kebijakan privasi"],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Kategori produk">
            <h2 className="text-sm font-semibold text-white">Kategori</h2>
            <ul className="mt-4 space-y-2.5 text-[0.95rem] text-on-dark-2">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link href={`/katalog/kategori/${c.slug}`} className="hover:text-white">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-sm font-semibold text-white">Kontak</h2>
            <ul className="mt-4 space-y-3.5 text-[0.95rem] text-on-dark-2">
              <li>
                <a
                  href={waLink(company.whatsapp, company.whatsappGreeting)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-start gap-3 hover:text-white"
                >
                  <IconWhatsApp className="mt-0.5 size-[18px] shrink-0 text-white" />
                  {company.whatsappDisplay}
                </a>
              </li>
              <li>
                <a href={`mailto:${company.email}`} className="inline-flex items-start gap-3 [overflow-wrap:anywhere] hover:text-white">
                  <IconMail className="mt-0.5 size-[18px] shrink-0 text-white" />
                  <span>
                    {company.email.split("@")[0]}
                    <wbr />@{company.email.split("@")[1]}
                  </span>
                </a>
              </li>
              <li>
                <a href={company.mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-3 hover:text-white">
                  <IconPin className="mt-0.5 size-[18px] shrink-0 text-white" />
                  {company.address}
                </a>
              </li>
            </ul>
            {socials.length > 0 && (
              <ul className="mt-6 flex gap-2">
                {socials.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-11 items-center gap-2 rounded-sm border border-navy-line px-3 text-sm hover:border-white"
                    >
                      {s.label === "Instagram" && <IconInstagram className="size-[18px]" />}
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Oversized wordmark: the brand name as the footer's closing image. */}
      <div aria-hidden className="pointer-events-none container-x -mb-[2.2vw] select-none">
        <Wordmark className="w-full text-navy-800" />
      </div>
      <div className="relative border-t border-navy-line">
        <div className="container-x flex flex-col gap-2 py-6 text-sm text-on-dark-2 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {company.name}. Hak cipta dilindungi.
          </p>
          <p>Kab. Semarang, Jawa Tengah</p>
        </div>
      </div>
    </footer>
  );
}
