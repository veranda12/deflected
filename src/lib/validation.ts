import { z } from "zod";
import { FINISHING_OPTIONS, QUANTITY_OPTIONS } from "./inquiry-options";

const text = (max: number) => z.string().trim().max(max, `Maksimal ${max} karakter`);

/** Indonesian mobile numbers: accepts 08xx, 628xx, +628xx; normalised to 628xx. */
export const whatsappSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s().-]/g, ""))
  .refine((v) => /^(\+?62|0)8\d{7,12}$/.test(v), "Nomor WhatsApp tidak valid, contoh 0812xxxxxxx")
  .transform((v) => v.replace(/^\+/, "").replace(/^0/, "62"));

export const inquirySchema = z.object({
  name: text(100).min(2, "Nama wajib diisi"),
  company: text(150).optional().default(""),
  whatsapp: whatsappSchema,
  email: z
    .string()
    .trim()
    .max(200)
    .refine((v) => v === "" || z.email().safeParse(v).success, "Format email tidak valid")
    .optional()
    .default(""),
  productTypes: z.array(text(80)).min(1, "Pilih minimal satu jenis produk").max(10),
  quantity: z.enum(QUANTITY_OPTIONS, { error: "Pilih perkiraan jumlah" }),
  material: text(120).optional().default(""),
  finishing: z.array(z.enum(FINISHING_OPTIONS)).max(5).optional().default([]),
  targetDate: text(60).optional().default(""),
  notes: text(2000).optional().default(""),
  consent: z.literal("on", { error: "Mohon setujui penggunaan data untuk tindak lanjut" }),
  sourcePath: text(200).optional().default(""),
});

export type InquiryInput = z.infer<typeof inquirySchema>;

export const passwordSchema = z
  .string()
  .min(12, "Minimal 12 karakter")
  .max(128, "Maksimal 128 karakter")
  .refine((v) => /[a-zA-Z]/.test(v) && /\d/.test(v), "Gunakan kombinasi huruf dan angka");

export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "_");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
