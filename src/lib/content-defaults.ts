// Default site content. Every value here comes from the client's own materials
// (Corporate Deck, Katalog DFLCTD, color palette sheet). Admins can override all of it
// from /admin/konten; stored values are merged over these defaults.

export type CompanySettings = {
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  address: string;
  mapsUrl: string;
  email: string;
  whatsapp: string; // digits only, international format, e.g. 6282218311200
  whatsappDisplay: string;
  instagram: string; // full URL or empty
  tiktok: string;
  facebook: string;
  linkedin: string;
  whatsappGreeting: string;
};

export type HeroSettings = {
  title: string;
  subtitle: string;
  primaryCta: string;
  secondaryCta: string;
  imageMediaId: string | null;
  imageAlt: string;
};

export type Point = { title: string; body: string };

export type HomeSettings = {
  categoriesTitle: string;
  categoriesIntro: string;
  craftTitle: string;
  craftIntro: string;
  materials: string[];
  techniques: string[];
  craftNote: string;
  processTitle: string;
  processIntro: string;
  workTitle: string;
  workIntro: string;
  clientsTitle: string;
  clientsNote: string;
  whyTitle: string;
  whyPoints: Point[];
  faqTitle: string;
  ctaTitle: string;
  ctaBody: string;
};

export type AboutSettings = {
  title: string;
  intro: string;
  focus: string[];
  challengeTitle: string;
  fragmented: string[];
  coordinated: string[];
  challengeNote: string;
  valueTitle: string;
  valuePoints: Point[];
  partnershipTitle: string;
  projectBased: string[];
  recurring: string[];
  partnershipNote: string;
};

export type ServicesSettings = {
  title: string;
  intro: string;
  lines: { title: string; body: string; items: string[] }[];
  customizationTitle: string;
  customization: { label: string; value: string }[];
  customizationNote: string;
  process: Point[];
  processNote: string;
  disclaimer: string;
};

export type FooterSettings = { blurb: string; hashtag: string };

export type PageSeo = { title: string; description: string; noindex: boolean };
export type SeoSettings = {
  siteName: string;
  defaultTitle: string;
  defaultDescription: string;
  ogMediaId: string | null;
  pages: Record<"home" | "about" | "services" | "catalog" | "portfolio" | "contact", PageSeo>;
};

export type BrandSettings = { logoMediaId: string | null; faviconMediaId: string | null };

export type SettingsMap = {
  company: CompanySettings;
  hero: HeroSettings;
  home: HomeSettings;
  about: AboutSettings;
  services: ServicesSettings;
  footer: FooterSettings;
  seo: SeoSettings;
  brand: BrandSettings;
};

export const PROCESS_STEPS: Point[] = [
  { title: "Pembahasan kebutuhan", body: "Memahami jenis produk, tujuan penggunaan, kuantitas, anggaran, dan timeline." },
  { title: "Konsultasi produk", body: "Membahas material, spesifikasi, dan opsi kustomisasi yang sesuai." },
  { title: "Penawaran dan persetujuan", body: "Menyepakati lingkup, ketentuan komersial, dan spesifikasi produk." },
  { title: "Desain dan persetujuan sampel", body: "Menyepakati artwork, mockup, atau sampel fisik sebelum produksi, sesuai lingkup proyek." },
  { title: "Produksi dan pemeriksaan kualitas", body: "Mengoordinasikan produksi dan memeriksa produk terhadap spesifikasi yang disepakati." },
  { title: "Pengiriman dan serah terima", body: "Mengoordinasikan pengiriman sesuai kesepakatan." },
];

export const DEFAULT_SETTINGS: SettingsMap = {
  company: {
    name: "Deflected Apparel",
    shortName: "DFLCTD",
    tagline: "Corporate apparel dan merchandise kustom",
    description:
      "Deflected menyediakan apparel dan merchandise kustom untuk perusahaan, organisasi, tim, dan event. Produksi tangan pertama dari Kabupaten Semarang.",
    address: "Brangkongan Kidul, Ujung-ujung, Kec. Pabelan, Kab. Semarang, Jawa Tengah",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Brangkongan+Kidul+Ujung-ujung+Pabelan+Semarang",
    email: "deflectedapparelfinance@gmail.com",
    whatsapp: "6282218311200",
    whatsappDisplay: "+62 822-1831-1200",
    instagram: "",
    tiktok: "",
    facebook: "",
    linkedin: "",
    whatsappGreeting: "Halo Deflected, saya ingin konsultasi produksi apparel.",
  },
  hero: {
    title: "Satu mitra untuk\nseragam, jersey,\ndan merchandise",
    subtitle:
      "Kaos, polo, jersey, jaket, kemeja kerja, sampai merchandise event. Spesifikasi, desain, dan jadwal dibahas sejak awal, lalu diproduksi langsung oleh tim kami.",
    primaryCta: "Konsultasi via WhatsApp",
    secondaryCta: "Lihat katalog produk",
    imageMediaId: null,
    imageAlt: "Jersey kustom produksi Deflected untuk PLN Sinjai, Saleho, Rakus United, dan Gymnastic",
  },
  home: {
    categoriesTitle: "Apa yang kami produksi",
    categoriesIntro: "Lima lini produk dalam satu alur pemesanan. Pilih kategori untuk melihat contoh hasil produksi beserta materialnya.",
    craftTitle: "Material dan teknik yang sudah kami kerjakan",
    craftIntro:
      "Setiap produk di katalog kami tercatat lengkap dengan bahan dan metode cetaknya. Daftar ini diambil dari pesanan yang sudah selesai diproduksi.",
    materials: [
      "Cotton Combed 16s",
      "Cotton Combed 20s",
      "Cotton Combed 24s",
      "Cotton Combed 30s",
      "CVC Pique",
      "Drifit",
      "Drifit Milano",
      "Drifit Running",
      "Airwalk",
      "Jaguar",
      "Embos Geometric",
      "Tusuk Jarum",
      "Cordura",
      "American Drill",
      "Japan Drill",
      "Toyobo",
      "Taslan",
      "Cotton Fleece",
    ],
    techniques: ["Sablon DTF", "Sablon Polyflex", "Sablon Plastisol", "Plastisol Reaktif", "Sablon Rubber", "Bordir", "Full printing"],
    craftNote: "Opsi material dan teknik dibahas sesuai jenis produk dan kebutuhan proyek.",
    processTitle: "Dari brief sampai serah terima",
    processIntro: "Enam tahap yang sama untuk pesanan sekali jalan maupun pengadaan rutin, supaya spesifikasi tidak berubah di tengah jalan.",
    workTitle: "Hasil produksi",
    workIntro: "Sebagian pesanan yang sudah kami kerjakan untuk perusahaan, kampus, komunitas, dan tim olahraga.",
    clientsTitle: "Organisasi yang tercantum di katalog kami",
    clientsNote: "Daftar ini tidak menyatakan nilai kontrak atau jenis hubungan kerja.",
    whyTitle: "Fleksibel di produk, rapi di eksekusi",
    whyPoints: [
      { title: "Beragam kategori dalam satu pesanan", body: "Kaos, jersey, jaket, kemeja, dan merchandise bisa dipesan lewat satu mitra dan satu jalur komunikasi." },
      { title: "Kustomisasi sesuai brief", body: "Logo, nama komunitas, dan artwork diterapkan mengikuti brief proyek Anda." },
      { title: "Material dan metode cetak terdokumentasi", body: "Bahan dan teknik setiap produk dicatat, jadi pesanan ulang bisa dibuat dengan spesifikasi yang sama." },
      { title: "Spesifikasi dan persetujuan yang jelas", body: "Kuantitas, anggaran, dan timeline dibahas bersama, lalu artwork atau sampel disetujui sebelum produksi." },
    ],
    faqTitle: "Pertanyaan yang sering masuk",
    ctaTitle: "Ceritakan kebutuhan apparel tim Anda",
    ctaBody: "Kirim jenis produk, perkiraan jumlah, dan target waktu. Tim kami akan membahas material, spesifikasi, dan penawaran yang sesuai.",
  },
  about: {
    title: "Menyederhanakan pengadaan apparel dan merchandise korporat",
    intro:
      "Deflected menyediakan apparel dan merchandise kustom untuk perusahaan, organisasi, tim, dan event. Kami memproduksi sendiri dari Kabupaten Semarang dengan semangat #MadeWithPride.",
    focus: ["Apparel korporat dan profesional", "Teamwear dan apparel event kustom", "Merchandise korporat kustom"],
    challengeTitle: "Lebih dari produk: pengadaan yang lebih terkoordinasi",
    fragmented: [
      "Banyak vendor untuk tiap kategori produk",
      "Koordinasi berulang di setiap pesanan",
      "Spesifikasi dan branding tidak seragam",
      "Kuantitas, anggaran, dan jadwal sulit diselaraskan",
      "Pemilihan dan persetujuan produk memakan waktu",
    ],
    coordinated: [
      "Satu mitra untuk berbagai kategori produk",
      "Satu alur komunikasi dari brief hingga pengiriman",
      "Spesifikasi dibahas dan disepakati sejak awal",
      "Kuantitas, anggaran, dan timeline dibahas bersama",
      "Konsultasi material dan persetujuan desain terstruktur",
    ],
    challengeNote: "Tantangan di sisi kiri adalah gambaran umum di industri, bukan kondisi yang pasti dialami setiap perusahaan.",
    valueTitle: "Satu mitra untuk berbagai kebutuhan bisnis",
    valuePoints: [
      { title: "Variasi produk", body: "Berbagai kategori apparel dan merchandise melalui satu mitra bisnis." },
      { title: "Kustomisasi", body: "Desain, branding, dan spesifikasi disesuaikan dengan kebutuhan proyek." },
      { title: "Pilihan material dan teknik", body: "Kain dan metode kustomisasi dipilih sesuai jenis produk yang dituju." },
      { title: "Eksekusi terkoordinasi", body: "Komunikasi terstruktur dari pembahasan kebutuhan hingga pengiriman." },
    ],
    partnershipTitle: "Untuk pesanan sekali jalan maupun berulang",
    projectBased: ["Event perusahaan", "Kegiatan karyawan", "Kampanye promosi", "Teamwear dan apparel komunitas", "Merchandise kustom"],
    recurring: ["Kebutuhan apparel yang berulang", "Seragam karyawan", "Merchandise tim", "Kebutuhan pengadaan yang terencana"],
    partnershipNote:
      "Skema harga, prioritas produksi, atau layanan khusus lainnya disepakati sesuai proyek dan berlaku setelah dikonfirmasi Deflected.",
  },
  services: {
    title: "Layanan produksi apparel dan merchandise",
    intro: "Tiga lini layanan dengan satu alur kerja. Anda cukup menyampaikan kebutuhan, kami bantu dari pemilihan bahan sampai pengiriman.",
    lines: [
      {
        title: "Apparel korporat dan profesional",
        body: "Seragam dan pakaian kerja yang membawa identitas perusahaan, dari kemeja bordir sampai jaket dan rompi.",
        items: ["Kemeja bordir", "Kemeja pecah pola", "Polo shirt", "Jaket kerja", "Rompi berfuring", "Hoodie"],
      },
      {
        title: "Teamwear dan apparel event",
        body: "Jersey printing, kaos event, dan jaket komunitas untuk olahraga, gathering, kontingen, dan kegiatan karyawan.",
        items: ["Jersey set", "Jersey football", "Jersey softball", "Jersey running", "Polo jersey", "Kaos event", "Varsity jacket", "Jaket racing"],
      },
      {
        title: "Merchandise korporat",
        body: "Merchandise untuk event, promosi, penghargaan, serta registrasi dan identifikasi peserta.",
        items: ["Totebag", "Medali aluminium", "Medali akrilik", "Pin", "ID card", "Gantungan kunci", "Tumbler", "Topi", "Gelang"],
      },
    ],
    customizationTitle: "Dari kebutuhan produk hingga hasil kustom",
    customization: [
      { label: "Pemilihan material", value: "Cotton Combed, CVC Pique, Drifit, Cordura, American Drill, Taslan, Toyobo" },
      { label: "Desain dan identitas visual", value: "Logo, nama komunitas, dan artwork diterapkan sesuai brief" },
      { label: "Sablon dan bordir", value: "DTF, Polyflex, Plastisol, Plastisol Reaktif, Rubber, dan Bordir" },
      { label: "Warna dan grafis", value: "Kombinasi warna dan grafis menyeluruh pada jersey, jaket racing, dan kaos" },
      { label: "Detail dan finishing", value: "Rib varsity, furing rompi, saku, dan resleting pada produk tertentu" },
    ],
    customizationNote: "Opsi material dan teknik dibahas sesuai kebutuhan produk dan proyek.",
    process: PROCESS_STEPS,
    processNote:
      "Ketersediaan sampel, lead time produksi, prosedur inspeksi, dan komitmen pengiriman mengikuti lingkup proyek yang disepakati.",
    disclaimer: "Produk workwear kami adalah apparel bermerek, bukan klaim perlengkapan pelindung diri (APD) bersertifikasi.",
  },
  footer: {
    blurb: "Corporate apparel dan merchandise kustom untuk perusahaan, organisasi, tim, dan event.",
    hashtag: "#MadeWithPride",
  },
  seo: {
    siteName: "Deflected Apparel",
    defaultTitle: "Deflected Apparel | Seragam, Jersey, dan Merchandise Kustom",
    defaultDescription:
      "Produksi kaos, polo, jersey, jaket, kemeja kerja, dan merchandise kustom untuk perusahaan, organisasi, tim, dan event. Konsultasi dan penawaran via WhatsApp.",
    ogMediaId: null,
    pages: {
      home: { title: "", description: "", noindex: false },
      about: { title: "Tentang Deflected", description: "", noindex: false },
      services: { title: "Layanan Produksi Apparel dan Merchandise", description: "", noindex: false },
      catalog: { title: "Katalog Produk", description: "", noindex: false },
      portfolio: { title: "Portofolio Produksi", description: "", noindex: false },
      contact: { title: "Kontak dan Permintaan Penawaran", description: "", noindex: false },
    },
  },
  brand: { logoMediaId: null, faviconMediaId: null },
};

export const SETTING_KEYS = Object.keys(DEFAULT_SETTINGS) as (keyof SettingsMap)[];
