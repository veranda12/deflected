// Shared between the public form (client) and server validation.
export const QUANTITY_OPTIONS = [
  "Di bawah 50 pcs",
  "50 sampai 100 pcs",
  "100 sampai 300 pcs",
  "300 sampai 1.000 pcs",
  "Lebih dari 1.000 pcs",
  "Belum pasti",
] as const;

export const FINISHING_OPTIONS = ["Sablon", "Bordir", "Sablon DTF", "Printing penuh", "Belum tahu, butuh saran"] as const;

export const OTHER_PRODUCT = "Lainnya";

export const INQUIRY_STATUS_LABEL: Record<string, string> = {
  baru: "Baru",
  dihubungi: "Sudah dihubungi",
  penawaran_dikirim: "Penawaran dikirim",
  deal: "Deal",
  batal: "Batal",
};

export const SYNC_STATUS_LABEL: Record<string, string> = {
  pending: "Menunggu",
  syncing: "Sedang sinkron",
  synced: "Tersinkron",
  failed: "Gagal",
  disabled: "Nonaktif",
};
