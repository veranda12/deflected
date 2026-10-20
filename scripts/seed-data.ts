// Catalog and portfolio seed data transcribed from "Katalog DFLCTD" and the
// Deflected Corporate Deck. Image names refer to files in seed-assets/images.

const APD_NOTE = "Produk ini adalah apparel bermerek, bukan perlengkapan pelindung diri (APD) bersertifikasi.";
const KEMEJA_DESCRIPTION = `Material dan kustomisasi disesuaikan dengan kebutuhan kerja, kenyamanan, dan branding. ${APD_NOTE}`;

// Categories follow the client's split (no "&" in names). Teamwear and Workwear start hidden until they have products.
export const SEED_CATEGORIES: { slug: string; name: string; tagline: string; description: string; cover: string; isPublished?: boolean }[] = [
  {
    slug: "kaos-polo",
    name: "Kaos",
    tagline: "Apparel harian dengan sablon dan bordir.",
    description:
      "Kaos kustom untuk apparel karyawan, kampanye promosi, merchandise komunitas, company gathering, dan seragam bermerek.",
    cover: "cover-kaos",
  },
  {
    slug: "polo-shirt",
    name: "Polo Shirt",
    tagline: "Polo shirt CVC Pique dengan bordir untuk tim dan karyawan.",
    description:
      "Polo shirt kustom untuk apparel karyawan, kampanye promosi, merchandise komunitas, company gathering, dan seragam bermerek.",
    cover: "cover-polo-row",
  },
  {
    slug: "jersey-teamwear",
    name: "Jersey",
    tagline: "Jersey kustom untuk tim, event, dan komunitas.",
    description:
      "Mendukung kegiatan olahraga, event karyawan, identitas organisasi dan komunitas, serta program merchandise bermerek.",
    cover: "cover-jersey",
  },
  {
    slug: "teamwear",
    name: "Teamwear",
    tagline: "Teamwear dan apparel event kustom.",
    description: "Teamwear dan apparel event kustom untuk tim, event, dan kegiatan karyawan.",
    cover: "cover-jersey",
    isPublished: false,
  },
  {
    slug: "jaket-outerwear",
    name: "Jaket",
    tagline: "Jaket racing, bomber, dan jaket kerja kustom.",
    description:
      "Untuk komunitas korporat, kelompok karyawan, tim organisasi, merchandise event, dan apparel bermerek.",
    cover: "cover-jaket",
  },
  {
    slug: "outerwear",
    name: "Outerwear",
    tagline: "Varsity jacket dan hoodie kustom.",
    description: "Varsity jacket dan hoodie untuk komunitas, tim organisasi, dan kegiatan karyawan.",
    cover: "cover-jaket",
  },
  {
    slug: "kemeja-workwear",
    name: "Kemeja",
    tagline: "Kemeja bordir dan pecah pola dengan identitas kustom.",
    description: KEMEJA_DESCRIPTION,
    cover: "cover-kemeja",
  },
  {
    slug: "rompi",
    name: "Rompi",
    tagline: "Rompi bordir berfuring untuk kebutuhan kerja.",
    description: KEMEJA_DESCRIPTION,
    cover: "cover-kemeja",
  },
  {
    slug: "workwear",
    name: "Workwear",
    tagline: "Apparel kerja profesional dengan identitas kustom.",
    description: KEMEJA_DESCRIPTION,
    cover: "cover-kemeja",
    isPublished: false,
  },
  {
    slug: "merchandise",
    name: "Merchandise Korporat",
    tagline: "Totebag, medali, pin, ID card, dan lainnya.",
    description:
      "Merchandise untuk event korporat, kampanye promosi, employee engagement, program komunitas, penghargaan, serta registrasi dan identifikasi peserta.",
    cover: "cover-merch",
  },
] as const;

type SeedProduct = {
  slug: string;
  name: string;
  category: string;
  summary: string;
  description: string;
  materials: string[];
  techniques: string[];
  useCases: string[];
  specs?: { label: string; value: string }[];
  variants?: { name: string; detail: string }[];
  images: { file: string; alt: string }[];
  featured?: boolean;
};

export const SEED_PRODUCTS: SeedProduct[] = [
  {
    slug: "kaos-cotton-combed",
    name: "Kaos Cotton Combed",
    category: "kaos-polo",
    summary: "Kaos kustom dengan pilihan ketebalan Cotton Combed 16s sampai 30s dan lima teknik sablon.",
    description:
      "Kaos harian yang paling sering dipesan untuk acara kantor, komunitas, dan kampanye promosi. Ketebalan bahan dipilih sesuai kebutuhan: 30s untuk kaos ringan, 24s dan 20s untuk pemakaian harian, 16s untuk kaos yang lebih tebal.\n\nTeknik sablon dipilih berdasarkan desain. DTF cocok untuk artwork penuh warna, polyflex untuk tulisan dan logo tegas, plastisol dan rubber untuk cetakan yang tahan lama.",
    materials: ["Cotton Combed 16s", "Cotton Combed 20s", "Cotton Combed 24s", "Cotton Combed 30s"],
    techniques: ["Sablon DTF", "Sablon Polyflex", "Sablon Plastisol", "Plastisol Reaktif", "Sablon Rubber"],
    useCases: ["Apparel karyawan", "Kampanye promosi", "Merchandise komunitas", "Company gathering"],
    specs: [
      { label: "Bahan", value: "Cotton Combed 16s, 20s, 24s, 30s" },
      { label: "Teknik", value: "DTF, Polyflex, Plastisol, Plastisol Reaktif, Rubber" },
    ],
    variants: [
      { name: "Lengan pendek", detail: "Model standar untuk kaos event dan komunitas" },
      { name: "Lengan panjang", detail: "Seperti pesanan KYB dengan Cotton Combed 16s" },
    ],
    images: [
      { file: "kurva-utara", alt: "Kaos merah Kurva Utara, Cotton Combed 24s dengan sablon plastisol" },
      { file: "jaya-baru", alt: "Kaos hitam Jaya Baru, Cotton Combed 24s dengan sablon DTF" },
      { file: "hrdwire", alt: "Kaos hitam Hrdwire, Cotton Combed 20s dengan sablon polyflex" },
      { file: "kyb-30s", alt: "Kaos putih KYB, Cotton Combed 30s dengan sablon rubber" },
      { file: "kyb-16s", alt: "Kaos hitam lengan panjang KYB, Cotton Combed 16s dengan plastisol reaktif" },
    ],
    featured: true,
  },
  {
    slug: "polo-shirt-cvc-pique",
    name: "Polo Shirt CVC Pique",
    category: "polo-shirt",
    summary: "Polo shirt berbahan CVC Pique dengan logo bordir untuk seragam dan identitas organisasi.",
    description:
      "Polo shirt untuk seragam harian, anggota organisasi, atau tim kerja yang butuh tampilan lebih rapi dari kaos. Logo atau nomor diaplikasikan dengan bordir.",
    materials: ["CVC Pique"],
    techniques: ["Bordir"],
    useCases: ["Seragam karyawan", "Anggota organisasi", "Tim kerja"],
    images: [{ file: "anggota-tps", alt: "Polo shirt biru abu Anggota TPS, CVC Pique dengan bordir nomor 12" }],
    featured: true,
  },
  {
    slug: "jersey-set",
    name: "Jersey Set",
    category: "jersey-teamwear",
    summary: "Jersey printing satu set untuk tim dan event, dengan pilihan Drifit Milano, Tusuk Jarum, atau Cordura.",
    description:
      "Jersey set dengan grafis penuh untuk tim, kontingen, dan kegiatan karyawan. Pesanan PLN Sinjai memakai Drifit Milano dengan model berhoodie, sedangkan AJT Family memakai kombinasi Tusuk Jarum dan Cordura untuk atasan dan celana.",
    materials: ["Drifit Milano", "Tusuk Jarum", "Cordura"],
    techniques: ["Printing penuh"],
    useCases: ["Event karyawan", "Tim olahraga", "Komunitas"],
    images: [
      { file: "pln-sinjai", alt: "Jersey set PLN Sinjai berbahan Drifit Milano dengan hoodie" },
      { file: "ajt-family", alt: "Jersey set AJT Family, atasan dan celana Tusuk Jarum dan Cordura" },
    ],
    featured: true,
  },
  {
    slug: "jersey-football",
    name: "Jersey Football",
    category: "jersey-teamwear",
    summary: "Jersey sepak bola dengan model kerah modern atau kerah vintage.",
    description:
      "Jersey tim sepak bola dengan grafis kustom. Rakus United memakai bahan Airwalk, sedangkan Bellator memakai bahan Jaguar dengan kerah vintage.",
    materials: ["Airwalk", "Jaguar"],
    techniques: ["Printing penuh"],
    useCases: ["Tim sepak bola", "Komunitas suporter"],
    variants: [
      { name: "Lengan panjang", detail: "Seperti pesanan Rakus United" },
      { name: "Kerah vintage", detail: "Seperti pesanan Bellator" },
    ],
    images: [
      { file: "rakus-united", alt: "Jersey football putih biru Rakus United berbahan Airwalk" },
      { file: "bellator", alt: "Jersey kerah vintage hitam Bellator berbahan Jaguar" },
    ],
  },
  {
    slug: "jersey-softball",
    name: "Jersey Softball",
    category: "jersey-teamwear",
    summary: "Jersey model baseball berkancing dengan bahan Drifit.",
    description: "Jersey softball dan baseball berkancing depan dengan tulisan tim. Contoh pesanan Gymnastic memakai bahan Drifit.",
    materials: ["Drifit"],
    techniques: ["Printing penuh"],
    useCases: ["Tim softball", "Komunitas", "Event"],
    images: [{ file: "gymnastic", alt: "Jersey softball hijau putih Gymnastic berbahan Drifit" }],
  },
  {
    slug: "polo-jersey",
    name: "Polo Jersey",
    category: "jersey-teamwear",
    summary: "Jersey berkerah polo dengan bahan Embos Geometric.",
    description: "Polo jersey dengan grafis penuh untuk tim, komunitas otomotif, dan event. Contoh pesanan DFL memakai bahan Embos Geometric.",
    materials: ["Embos Geometric"],
    techniques: ["Printing penuh"],
    useCases: ["Komunitas", "Tim event"],
    images: [{ file: "dfl-polo-jersey", alt: "Polo jersey hitam hijau DFL berbahan Embos Geometric" }],
  },
  {
    slug: "jersey-running",
    name: "Jersey Running",
    category: "jersey-teamwear",
    summary: "Singlet lari berbahan Drifit Running.",
    description: "Jersey tanpa lengan untuk event lari dan komunitas pelari, dengan gradasi warna dan grafis penuh.",
    materials: ["Drifit Running"],
    techniques: ["Printing penuh"],
    useCases: ["Event lari", "Komunitas pelari"],
    images: [{ file: "dflctd-running", alt: "Singlet lari gradasi merah biru DFLCTD berbahan Drifit Running" }],
  },
  {
    slug: "kemeja-jersey",
    name: "Kemeja Jersey",
    category: "jersey-teamwear",
    summary: "Kemeja berkancing dengan grafis penuh, bahan Tusuk Jarum.",
    description: "Kemeja dengan grafis penuh ala jersey untuk komunitas dan tim. Contoh pesanan Saleho memakai bahan Tusuk Jarum.",
    materials: ["Tusuk Jarum"],
    techniques: ["Printing penuh"],
    useCases: ["Komunitas", "Tim event"],
    images: [{ file: "saleho", alt: "Kemeja jersey putih bergrafis Saleho berbahan Tusuk Jarum" }],
  },
  {
    slug: "varsity-jacket",
    name: "Varsity Jacket",
    category: "outerwear",
    summary: "Jaket varsity Cotton Fleece dengan rib dan bordir atau sablon.",
    description:
      "Jaket varsity untuk kontingen, angkatan, dan komunitas. Badan dan lengan bisa dibuat dua warna, lengkap dengan rib di kerah, manset, dan pinggang.",
    materials: ["Cotton Fleece"],
    techniques: ["Bordir", "Sablon"],
    useCases: ["Kontingen", "Kampus", "Komunitas"],
    images: [{ file: "kontingen-pomnas-unimus", alt: "Varsity jacket navy putih Kontingen Pomnas Unimus berbahan Cotton Fleece" }],
    featured: true,
  },
  {
    slug: "jaket-kerja",
    name: "Jaket Kerja",
    category: "jaket-outerwear",
    summary: "Jaket kerja American Drill dengan saku dan logo bordir.",
    description: "Jaket berbahan American Drill untuk seragam kerja dan kegiatan organisasi, dengan saku dan logo di dada atau punggung.",
    materials: ["American Drill"],
    techniques: ["Bordir"],
    useCases: ["Seragam kerja", "Organisasi"],
    images: [
      { file: "kashe-jacket", alt: "Jaket kerja biru muda Kashe berbahan American Drill" },
      { file: "kafilah-mtqmn", alt: "Jaket hijau Kafilah MTQMN berbahan American Drill" },
    ],
  },
  {
    slug: "jaket-racing",
    name: "Jaket Racing",
    category: "jaket-outerwear",
    summary: "Jaket racing Cordura dengan grafis penuh dan banyak logo sponsor.",
    description: "Jaket racing untuk komunitas dan tim dengan grafis penuh. Contoh pesanan Khumaira Group memakai bahan Cordura.",
    materials: ["Cordura"],
    techniques: ["Printing penuh"],
    useCases: ["Komunitas", "Tim racing"],
    images: [{ file: "khumaira-group", alt: "Jaket racing putih biru Khumaira Group berbahan Cordura" }],
  },
  {
    slug: "jaket-bomber",
    name: "Jaket Bomber Zipper",
    category: "jaket-outerwear",
    summary: "Jaket bomber Taslan dengan resleting dan logo bordir.",
    description: "Jaket bomber berbahan Taslan yang ringan, dengan resleting depan dan logo bordir di dada.",
    materials: ["Taslan"],
    techniques: ["Bordir"],
    useCases: ["Seragam lembaga", "Tim kerja"],
    images: [{ file: "kashe-skill-centre", alt: "Jaket bomber hitam Kashe Skill Centre berbahan Taslan" }],
  },
  {
    slug: "hoodie",
    name: "Hoodie",
    category: "outerwear",
    summary: "Hoodie Cotton Fleece dengan logo sablon atau bordir.",
    description: "Hoodie berbahan Cotton Fleece dengan saku depan, cocok untuk merchandise tim dan komunitas.",
    materials: ["Cotton Fleece"],
    techniques: ["Sablon", "Bordir"],
    useCases: ["Merchandise tim", "Komunitas"],
    images: [{ file: "dfl-hoodie", alt: "Hoodie hitam DFL berbahan Cotton Fleece" }],
  },
  {
    slug: "kemeja-bordir",
    name: "Kemeja Bordir",
    category: "kemeja-workwear",
    summary: "Kemeja kerja berbahan Toyobo dengan logo bordir.",
    description: "Kemeja seragam dengan kombinasi warna kerah dan list, logo diaplikasikan dengan bordir.",
    materials: ["Toyobo"],
    techniques: ["Bordir"],
    useCases: ["Seragam kantor", "Lembaga pelatihan"],
    images: [{ file: "kcs", alt: "Kemeja bordir biru KCS berbahan Toyobo dengan kerah krem" }],
    featured: true,
  },
  {
    slug: "kemeja-pecah-pola",
    name: "Kemeja Bordir Pecah Pola",
    category: "kemeja-workwear",
    summary: "Kemeja American Drill dengan potongan warna dan bordir besar di punggung.",
    description:
      "Kemeja dengan potongan pola dua warna, cocok untuk komunitas dan tim yang ingin identitas kuat. Contoh pesanan MMA memakai American Drill dengan bordir di dada dan punggung.",
    materials: ["American Drill"],
    techniques: ["Bordir"],
    useCases: ["Komunitas", "Tim kerja"],
    images: [{ file: "mma", alt: "Kemeja pecah pola hitam merah MMA berbahan American Drill" }],
  },
  {
    slug: "rompi-bordir",
    name: "Rompi Bordir Berfuring",
    category: "rompi",
    summary: "Rompi berfuring dengan banyak saku, bahan Taslan waterproof atau Japan Drill.",
    description:
      "Rompi kerja dan lapangan dengan furing, saku, dan resleting. Unimus memakai Taslan waterproof dengan hoodie, Al Islam memakai Japan Drill.",
    materials: ["Taslan Waterproof", "Japan Drill"],
    techniques: ["Bordir"],
    useCases: ["Kegiatan lapangan", "Organisasi", "Kampus"],
    images: [
      { file: "unimus-rompi", alt: "Rompi berhoodie Unimus berbahan Taslan waterproof" },
      { file: "al-islam", alt: "Rompi abu Al Islam berbahan Japan Drill dengan furing" },
    ],
  },
  {
    slug: "totebag",
    name: "Totebag",
    category: "merchandise",
    summary: "Totebag kustom untuk seminar, wisuda, dan kampanye promosi.",
    description: "Totebag dengan logo dan informasi acara, untuk goodie bag peserta maupun merchandise promosi.",
    materials: [],
    techniques: ["Sablon"],
    useCases: ["Seminar dan wisuda", "Kampanye promosi"],
    images: [{ file: "totebag", alt: "Totebag biru dengan sablon logo acara" }],
    featured: true,
  },
  {
    slug: "medali-aluminium",
    name: "Medali Aluminium",
    category: "merchandise",
    summary: "Medali aluminium dengan tali kustom untuk event dan penghargaan.",
    description: "Medali untuk finisher, juara, atau penghargaan internal, lengkap dengan tali bercetak.",
    materials: ["Aluminium"],
    techniques: [],
    useCases: ["Event olahraga", "Penghargaan"],
    images: [{ file: "medali-aluminium", alt: "Dua medali aluminium emas dengan tali hijau" }],
  },
  {
    slug: "medali-akrilik",
    name: "Medali Akrilik",
    category: "merchandise",
    summary: "Medali akrilik dengan tali kustom.",
    description: "Alternatif medali yang ringan untuk event komunitas dan penghargaan.",
    materials: ["Akrilik"],
    techniques: [],
    useCases: ["Event komunitas", "Penghargaan"],
    images: [{ file: "medali-akrilik", alt: "Medali akrilik dengan tali merah putih" }],
  },
  {
    slug: "pin",
    name: "Pin",
    category: "merchandise",
    summary: "Pin logo organisasi untuk anggota dan peserta.",
    description: "Pin bulat dengan logo organisasi, untuk identitas anggota atau souvenir acara.",
    materials: [],
    techniques: [],
    useCases: ["Identitas anggota", "Souvenir"],
    images: [{ file: "pin", alt: "Dua pin bulat dengan logo PORMIKI" }],
  },
  {
    slug: "id-card",
    name: "ID Card",
    category: "merchandise",
    summary: "ID card peserta dan panitia dengan desain acara.",
    description: "ID card untuk registrasi dan identifikasi peserta, panitia, atau kru acara.",
    materials: [],
    techniques: ["Printing"],
    useCases: ["Registrasi peserta", "Panitia acara"],
    images: [{ file: "id-card", alt: "Tiga ID card acara dengan desain penuh warna" }],
  },
  {
    slug: "gantungan-kunci",
    name: "Gantungan Kunci",
    category: "merchandise",
    summary: "Gantungan kunci kustom untuk souvenir dan promosi.",
    description: "Gantungan kunci dengan bentuk dan logo kustom untuk souvenir acara maupun merchandise brand.",
    materials: [],
    techniques: [],
    useCases: ["Souvenir", "Merchandise brand"],
    images: [{ file: "gantungan-kunci", alt: "Dua gantungan kunci kustom berbentuk logo" }],
  },
];

type SeedProject = {
  slug: string;
  title: string;
  client: string;
  category: string;
  productLabel: string;
  materials: string[];
  techniques: string[];
  image: string;
  alt: string;
  featured?: boolean;
};

export const SEED_PROJECTS: SeedProject[] = [
  { slug: "pln-sinjai-jersey-set", title: "Jersey set PLN Sinjai", client: "PLN Sinjai", category: "jersey-teamwear", productLabel: "Jersey Set", materials: ["Drifit Milano"], techniques: ["Printing penuh"], image: "pln-sinjai", alt: "Jersey set PLN Sinjai berhoodie dengan grafis penuh", featured: true },
  { slug: "kontingen-pomnas-unimus-varsity", title: "Varsity jacket Kontingen Pomnas Unimus", client: "Universitas Muhammadiyah Semarang", category: "outerwear", productLabel: "Varsity Jacket", materials: ["Cotton Fleece"], techniques: ["Bordir", "Sablon"], image: "kontingen-pomnas-unimus", alt: "Varsity jacket navy putih Kontingen Pomnas Unimus tampak depan dan belakang", featured: true },
  { slug: "kurva-utara-kaos", title: "Kaos Kurva Utara", client: "Kurva Utara", category: "kaos-polo", productLabel: "T-Shirt", materials: ["Cotton Combed 24s"], techniques: ["Sablon Plastisol"], image: "kurva-utara", alt: "Kaos merah Kurva Utara dengan ilustrasi suporter", featured: true },
  { slug: "mma-kemeja-pecah-pola", title: "Kemeja pecah pola MMA", client: "MMA", category: "kemeja-workwear", productLabel: "Kemeja Bordir Pecah Pola", materials: ["American Drill"], techniques: ["Bordir"], image: "mma", alt: "Kemeja hitam merah MMA dengan bordir di dada dan punggung", featured: true },
  { slug: "khumaira-group-jaket-racing", title: "Jaket racing Khumaira Group", client: "Khumaira Group", category: "jaket-outerwear", productLabel: "Jaket Racing", materials: ["Cordura"], techniques: ["Printing penuh"], image: "khumaira-group", alt: "Jaket racing putih biru Khumaira Group dengan logo sponsor", featured: true },
  { slug: "kyb-kaos-cotton-combed-30s", title: "Kaos KYB", client: "KYB", category: "kaos-polo", productLabel: "T-Shirt", materials: ["Cotton Combed 30s"], techniques: ["Sablon Rubber"], image: "kyb-30s", alt: "Kaos putih KYB dengan ilustrasi pegunungan", featured: true },
  { slug: "kashe-skill-centre-bomber", title: "Jaket bomber Kashe Skill Centre", client: "Kashe Skill Centre", category: "jaket-outerwear", productLabel: "Jacket Bomber Zipper", materials: ["Taslan"], techniques: ["Bordir"], image: "kashe-skill-centre", alt: "Jaket bomber hitam Kashe Skill Centre dengan logo KSC" },
  { slug: "rakus-united-jersey", title: "Jersey Rakus United", client: "Rakus United", category: "jersey-teamwear", productLabel: "Jersey Team Football", materials: ["Airwalk"], techniques: ["Printing penuh"], image: "rakus-united", alt: "Jersey football lengan panjang putih biru Rakus United" },
  { slug: "saleho-kemeja-jersey", title: "Kemeja jersey Saleho", client: "Saleho", category: "jersey-teamwear", productLabel: "Kemeja Jersey", materials: ["Tusuk Jarum"], techniques: ["Printing penuh"], image: "saleho", alt: "Kemeja jersey putih Saleho dengan ilustrasi merah" },
  { slug: "kcs-kemeja-bordir", title: "Kemeja bordir KCS", client: "KCS", category: "kemeja-workwear", productLabel: "Kemeja Bordir", materials: ["Toyobo"], techniques: ["Bordir"], image: "kcs", alt: "Kemeja biru KCS dengan kerah krem dan logo bordir" },
  { slug: "ajt-family-jersey-set", title: "Jersey set AJT Family", client: "AJT Family", category: "jersey-teamwear", productLabel: "Jersey Set", materials: ["Tusuk Jarum", "Cordura"], techniques: ["Printing penuh"], image: "ajt-family", alt: "Jersey set biru oranye AJT Family, atasan dan celana" },
  { slug: "gymnastic-jersey-softball", title: "Jersey softball Gymnastic", client: "Gymnastic", category: "jersey-teamwear", productLabel: "Jersey Softball", materials: ["Drifit"], techniques: ["Printing penuh"], image: "gymnastic", alt: "Jersey softball hijau putih Gymnastic" },
  { slug: "bellator-jersey-vintage", title: "Jersey kerah vintage Bellator", client: "Bellator", category: "jersey-teamwear", productLabel: "Jersey Krah Vintage", materials: ["Jaguar"], techniques: ["Printing penuh"], image: "bellator", alt: "Jersey hitam kerah vintage Bellator" },
  { slug: "dflctd-jersey-running", title: "Singlet lari DFLCTD", client: "DFLCTD", category: "jersey-teamwear", productLabel: "Jersey Running", materials: ["Drifit Running"], techniques: ["Printing penuh"], image: "dflctd-running", alt: "Singlet lari gradasi merah biru DFLCTD" },
  { slug: "dfl-polo-jersey", title: "Polo jersey DFL", client: "DFL", category: "jersey-teamwear", productLabel: "Polo Jersey", materials: ["Embos Geometric"], techniques: ["Printing penuh"], image: "dfl-polo-jersey", alt: "Polo jersey hitam hijau DFL" },
  { slug: "anggota-tps-polo", title: "Polo shirt Anggota TPS", client: "Anggota TPS", category: "polo-shirt", productLabel: "Polo Shirt", materials: ["CVC Pique"], techniques: ["Bordir"], image: "anggota-tps", alt: "Polo shirt biru abu dengan bordir nomor 12" },
  { slug: "jaya-baru-kaos", title: "Kaos Jaya Baru", client: "Jaya Baru", category: "kaos-polo", productLabel: "T-Shirt", materials: ["Cotton Combed 24s"], techniques: ["Sablon DTF"], image: "jaya-baru", alt: "Kaos hitam Jaya Baru tampak depan dan belakang" },
  { slug: "hrdwire-kaos", title: "Kaos Hrdwire", client: "Hrdwire", category: "kaos-polo", productLabel: "T-Shirt", materials: ["Cotton Combed 20s"], techniques: ["Sablon Polyflex"], image: "hrdwire", alt: "Kaos hitam Hrdwire dengan sablon polyflex hijau stabilo" },
  { slug: "kyb-kaos-cotton-combed-16s", title: "Kaos lengan panjang KYB", client: "KYB", category: "kaos-polo", productLabel: "T-Shirt", materials: ["Cotton Combed 16s"], techniques: ["Plastisol Reaktif"], image: "kyb-16s", alt: "Kaos hitam KYB lengan panjang dan pendek" },
  { slug: "kashe-jaket-kerja", title: "Jaket kerja Kashe", client: "Kashe", category: "jaket-outerwear", productLabel: "Jacket", materials: ["American Drill"], techniques: ["Bordir"], image: "kashe-jacket", alt: "Jaket kerja biru muda Kashe tampak depan dan belakang" },
  { slug: "kafilah-mtqmn-jaket", title: "Jaket Kafilah MTQMN", client: "Kafilah MTQMN", category: "jaket-outerwear", productLabel: "Jaket", materials: ["American Drill"], techniques: ["Bordir"], image: "kafilah-mtqmn", alt: "Jaket hijau Kafilah MTQMN tampak depan dan belakang" },
  { slug: "dfl-hoodie", title: "Hoodie DFL", client: "DFL", category: "outerwear", productLabel: "Hoodie", materials: ["Cotton Fleece"], techniques: ["Sablon"], image: "dfl-hoodie", alt: "Hoodie hitam DFL" },
  { slug: "unimus-rompi-bordir", title: "Rompi bordir Unimus", client: "Universitas Muhammadiyah Semarang", category: "rompi", productLabel: "Rompi Bordir Berfuring", materials: ["Taslan", "Waterproof"], techniques: ["Bordir"], image: "unimus-rompi", alt: "Rompi berhoodie Unimus dengan logo bordir" },
  { slug: "al-islam-rompi", title: "Rompi Al Islam", client: "Al Islam", category: "rompi", productLabel: "Rompi Bordir Furing", materials: ["Japan Drill"], techniques: ["Bordir"], image: "al-islam", alt: "Rompi abu Al Islam dengan saku dan resleting" },
];

export const SEED_FAQS = [
  {
    q: "Produk apa saja yang bisa dipesan di Deflected?",
    a: "Kaos dan polo shirt, jersey dan teamwear, jaket dan outerwear, kemeja dan rompi kerja, serta merchandise seperti totebag, medali, pin, ID card, gantungan kunci, tumbler, topi, dan gelang. Beberapa kategori bisa digabung dalam satu pesanan.",
  },
  {
    q: "Apakah desain bisa disesuaikan dengan logo dan brand kami?",
    a: "Bisa. Logo, nama komunitas, dan artwork diterapkan sesuai brief Anda. Sebelum produksi, artwork, mockup, atau sampel fisik disepakati terlebih dahulu sesuai lingkup proyek.",
  },
  {
    q: "Bahan apa saja yang tersedia?",
    a: "Yang sudah kami produksi antara lain Cotton Combed 16s sampai 30s, CVC Pique, Drifit, Drifit Milano, Airwalk, Jaguar, Tusuk Jarum, Cordura, American Drill, Japan Drill, Toyobo, Taslan, dan Cotton Fleece. Pilihan bahan dibahas sesuai jenis produk dan penggunaannya.",
  },
  {
    q: "Berapa jumlah minimum pemesanan?",
    a: "Jumlah minimum bergantung pada jenis produk dan teknik kustomisasi. Cantumkan perkiraan kuantitas di form penawaran atau WhatsApp, tim kami akan mengonfirmasi saat konsultasi.",
  },
  {
    q: "Berapa lama proses produksinya?",
    a: "Lead time produksi mengikuti lingkup proyek yang disepakati, termasuk jenis produk, jumlah, dan teknik. Sampaikan target tanggal Anda sejak awal supaya jadwalnya bisa dicek sebelum penawaran dibuat.",
  },
  {
    q: "Apakah saya bisa melihat sampel sebelum produksi?",
    a: "Ketersediaan sampel mengikuti lingkup proyek. Persetujuan sebelum produksi bisa berupa artwork, mockup, atau sampel fisik, tergantung kesepakatan.",
  },
  {
    q: "Apakah bisa dikirim ke luar Kabupaten Semarang?",
    a: "Pengiriman dikoordinasikan sesuai kesepakatan dalam penawaran, termasuk alamat tujuan dan jadwalnya.",
  },
  {
    q: "Bagaimana cara meminta penawaran harga?",
    a: "Isi form penawaran di halaman Kontak atau kirim pesan WhatsApp. Sertakan jenis produk, perkiraan jumlah, bahan yang diinginkan jika sudah ada, dan target waktu. Skema harga disepakati sesuai proyek.",
  },
  {
    q: "Apakah Deflected melayani pengadaan rutin untuk perusahaan?",
    a: "Ya. Selain pesanan berbasis proyek seperti event dan kampanye, kami melayani kebutuhan berulang seperti seragam karyawan dan merchandise tim, dengan spesifikasi yang dijaga konsisten antar pesanan.",
  },
  {
    q: "Apakah rompi dan workwear Deflected termasuk APD?",
    a: "Tidak. Kemeja, rompi, dan workwear kami adalah apparel bermerek, bukan klaim perlengkapan pelindung diri (APD) bersertifikasi.",
  },
];

// Client organisations shown as logos on the home and About pages. Logo files live in seed-assets/clients.
export const SEED_CLIENTS = [
  { name: "PLN", logo: "client-pln" },
  { name: "PT Yutaka Manufacturing Indonesia", logo: "client-yutaka" },
  { name: "PT Selalu Cinta Indonesia", logo: "client-sci" },
  { name: "KYB", logo: "client-kyb" },
  { name: "Sampoerna Kayoe", logo: "client-sampoerna-kayoe" },
  { name: "Hitachi", logo: "client-hitachi" },
  { name: "PORMIKI", logo: "client-pormiki" },
  { name: "Astemo", logo: "client-astemo" },
  { name: "Musashi", logo: "client-musashi" },
  { name: "XLSMART", logo: "client-xlsmart" },
  { name: "Universitas Muhammadiyah Semarang", logo: "client-unimus" },
];
