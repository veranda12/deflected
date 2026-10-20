import { PageHero } from "@/components/site/page-hero";
import { buildMetadata } from "@/lib/seo";
import { getSettings } from "@/lib/settings";

export async function generateMetadata() {
  return buildMetadata({
    path: "/kebijakan-privasi",
    title: "Kebijakan Privasi",
    description: "Data apa yang dikumpulkan Deflected melalui situs ini, untuk apa, dan bagaimana Anda dapat memintanya dihapus.",
  });
}

export default async function PrivacyPage() {
  const { company } = await getSettings();
  const sections = [
    {
      h: "Data yang kami kumpulkan",
      p: [
        "Saat Anda mengisi form permintaan penawaran, kami menyimpan nama, perusahaan atau organisasi, nomor WhatsApp, email, serta detail kebutuhan produksi yang Anda tulis.",
        "Untuk mencegah spam dan penyalahgunaan, kami mencatat alamat IP dalam bentuk hash satu arah. Alamat IP asli tidak disimpan.",
      ],
    },
    {
      h: "Untuk apa data dipakai",
      p: [
        "Data dipakai untuk menghubungi Anda, menyiapkan penawaran, dan menindaklanjuti pesanan. Kami tidak menjual data Anda dan tidak memakainya untuk iklan pihak ketiga.",
        "Permintaan penawaran disimpan di basis data kami dan disalin ke spreadsheet internal tim penjualan (Google Sheets) agar bisa ditindaklanjuti.",
      ],
    },
    {
      h: "Cookie",
      p: ["Situs publik ini tidak memasang cookie pelacak. Cookie hanya dipakai di area admin untuk menjaga sesi login staf."],
    },
    {
      h: "Hak Anda",
      p: [
        `Anda dapat meminta salinan, perbaikan, atau penghapusan data Anda dengan menghubungi ${company.email} atau WhatsApp ${company.whatsappDisplay}. Sertakan nomor referensi permintaan Anda bila ada.`,
      ],
    },
  ];
  return (
    <>
      <PageHero
        crumbs={[
          { name: "Beranda", path: "/" },
          { name: "Kebijakan privasi", path: "/kebijakan-privasi" },
        ]}
        title="Kebijakan privasi"
        intro="Ringkas dan apa adanya: data apa yang kami simpan, untuk apa, dan cara memintanya dihapus."
      />
      <section className="pb-[var(--section-y)]">
        <div className="container-x">
          <div className="max-w-2xl space-y-10">
            {sections.map((s) => (
              <div key={s.h}>
                <h2 className="text-[1.25rem] font-semibold text-ink">{s.h}</h2>
                {s.p.map((t, i) => (
                  <p key={i} className="mt-3 leading-relaxed text-text-2">
                    {t}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
