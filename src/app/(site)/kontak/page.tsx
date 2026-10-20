import { IconMail, IconPin, IconWhatsApp } from "@/components/icons";
import { PageHero } from "@/components/site/page-hero";
import { QuoteForm } from "@/components/site/quote-form";
import { buttonClass } from "@/components/ui/button";
import { createFormToken } from "@/lib/form-token";
import { getCatalog } from "@/lib/queries";
import { buildMetadata } from "@/lib/seo";
import { getSettings } from "@/lib/settings";
import { waLink } from "@/lib/utils";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata() {
  const s = await getSettings();
  return buildMetadata({
    path: "/kontak",
    page: "contact",
    description: s.seo.pages.contact.description || "Hubungi Deflected lewat WhatsApp, email, atau isi form permintaan penawaran untuk produksi apparel dan merchandise kustom.",
  });
}

export default async function ContactPage({ searchParams }: Props) {
  const [settings, catalog, sp, formToken] = await Promise.all([getSettings(), getCatalog(), searchParams, createFormToken()]);
  const { company, home } = settings;
  const productOptions = catalog.categories.map((c) => c.name);
  const requested = typeof sp.produk === "string" ? sp.produk.slice(0, 80) : "";
  // A product link pre-selects its category so visitors land on a half-filled form.
  const fromProduct = catalog.products.find((p) => p.name === requested);
  const preselect = fromProduct?.category?.name;

  return (
    <>
      <PageHero
        crumbs={[
          { name: "Beranda", path: "/" },
          { name: "Kontak", path: "/kontak" },
        ]}
        title="Mari bahas proyek Anda"
        intro="Cara tercepat adalah WhatsApp. Jika kebutuhan Anda lebih rinci, isi form penawaran di bawah, datanya langsung masuk ke tim kami."
      />

      <section className="pb-[var(--section-y)]">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <aside className="space-y-4 lg:col-span-4">
            <div className="on-dark rounded-lg bg-ink p-7 text-white cut-corner">
              <h2 className="display-sm">WhatsApp</h2>
              <p className="mt-2 text-[0.95rem] text-on-dark-2">Untuk konsultasi produk, bahan, dan penawaran.</p>
              <p className="mt-5 text-xl font-semibold">{company.whatsappDisplay}</p>
              <a href={waLink(company.whatsapp, company.whatsappGreeting)} target="_blank" rel="noopener noreferrer" className={buttonClass("primary", "md", "mt-5 w-full")}>
                <IconWhatsApp className="size-5" />
                <span>Chat sekarang</span>
              </a>
            </div>
            <div className="rounded-lg border border-line p-7">
              <ul className="space-y-5">
                <li className="flex gap-3">
                  <IconMail className="mt-0.5 size-5 shrink-0 text-blue-strong" />
                  <div>
                    <p className="text-sm font-semibold text-text-2">Email</p>
                    <a href={`mailto:${company.email}`} className="text-ink [overflow-wrap:anywhere] hover:text-blue-strong hover:underline">
                      {company.email.split("@")[0]}
                      <wbr />@{company.email.split("@")[1]}
                    </a>
                  </div>
                </li>
                <li className="flex gap-3">
                  <IconPin className="mt-0.5 size-5 shrink-0 text-blue-strong" />
                  <div>
                    <p className="text-sm font-semibold text-text-2">Alamat produksi</p>
                    <p className="text-ink">{company.address}</p>
                    <a href={company.mapsUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-sm font-semibold text-blue-strong hover:underline">
                      Buka di Google Maps
                    </a>
                  </div>
                </li>
              </ul>
            </div>
            <p className="px-1 text-[0.85rem] leading-relaxed text-text-3">{home.ctaBody}</p>
          </aside>

          <div id="penawaran" className="scroll-mt-32 lg:col-span-8">
            <div className="rounded-lg border border-line p-6 sm:p-10">
              <h2 className="display-md text-ink">Form permintaan penawaran</h2>
              <p className="mt-3 max-w-xl text-text-2">Isi kolom wajib saja sudah cukup. Detail lain bisa dibahas saat konsultasi.</p>
              <div className="mt-8">
                <QuoteForm
                  formToken={formToken}
                  productOptions={productOptions}
                  materialOptions={home.materials}
                  preselectProduct={preselect}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
