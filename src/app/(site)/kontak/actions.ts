"use server";

import { headers } from "next/headers";
import { after } from "next/server";
import { getDb } from "@/db";
import { inquiries } from "@/db/schema";
import { logSecurityEvent } from "@/lib/audit";
import { env } from "@/lib/env";
import { verifyFormToken } from "@/lib/form-token";
import { rateLimit } from "@/lib/rate-limit";
import { getClientFingerprint } from "@/lib/request";
import { getSettings } from "@/lib/settings";
import { syncInquiry } from "@/lib/sheets";
import { waLink } from "@/lib/utils";
import { fieldErrors, inquirySchema } from "@/lib/validation";

export type InquiryState =
  | { status: "idle" }
  | { status: "error"; message: string; errors?: Record<string, string> }
  | { status: "success"; ref: string; waUrl: string };

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function newRef() {
  // Date part in WIB so the reference matches the customer's calendar day.
  const ymd = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta", year: "2-digit", month: "2-digit", day: "2-digit" })
    .format(new Date())
    .replace(/-/g, "");
  const rand = Array.from(crypto.getRandomValues(new Uint8Array(5)), (b) => ALPHABET[b % ALPHABET.length]).join("");
  return `DFL-${ymd}-${rand}`;
}

export async function submitInquiry(_prev: InquiryState, formData: FormData): Promise<InquiryState> {
  // Defence in depth on top of Next.js' own Server Action origin check:
  // reject requests that carry no Origin or a foreign one.
  const origin = (await headers()).get("origin");
  const host = (await headers()).get("x-forwarded-host") ?? (await headers()).get("host");
  if (!origin || (new URL(origin).host !== host && origin !== env.siteUrl)) {
    return { status: "error", message: "Permintaan tidak valid. Muat ulang halaman lalu coba lagi." };
  }

  // Honeypot: real visitors never see or fill this field.
  if (String(formData.get("website") ?? "") !== "") {
    await logSecurityEvent({ type: "inquiry_spam_blocked", detail: "honeypot" });
    return { status: "success", ref: "DFL-OK", waUrl: "/" };
  }
  const tokenState = await verifyFormToken(String(formData.get("formToken") ?? ""));
  if (tokenState === "too_fast" || tokenState === "invalid") {
    await logSecurityEvent({ type: "inquiry_spam_blocked", detail: `token ${tokenState}` });
    return { status: "error", message: "Form terkirim terlalu cepat atau tidak valid. Tunggu sebentar lalu kirim ulang." };
  }
  if (tokenState === "expired") {
    return { status: "error", message: "Halaman sudah terbuka terlalu lama. Muat ulang halaman lalu kirim kembali." };
  }

  const { ipHash } = await getClientFingerprint();
  const limit = await rateLimit("inquiry", ipHash, 5, 600);
  if (!limit.ok) {
    await logSecurityEvent({ type: "rate_limited", detail: "inquiry form" });
    return {
      status: "error",
      message: `Terlalu banyak permintaan dari jaringan Anda. Coba lagi dalam ${Math.ceil(limit.retryAfterSec / 60)} menit atau hubungi kami via WhatsApp.`,
    };
  }

  const parsed = inquirySchema.safeParse({
    name: formData.get("name"),
    company: formData.get("company") ?? "",
    whatsapp: formData.get("whatsapp"),
    email: formData.get("email") ?? "",
    productTypes: formData.getAll("productTypes").map(String),
    quantity: formData.get("quantity"),
    material: formData.get("material") ?? "",
    finishing: formData.getAll("finishing").map(String),
    targetDate: formData.get("targetDate") ?? "",
    notes: formData.get("notes") ?? "",
    consent: formData.get("consent") ?? "",
    sourcePath: formData.get("sourcePath") ?? "",
  });
  if (!parsed.success) {
    return { status: "error", message: "Periksa kembali isian yang ditandai.", errors: fieldErrors(parsed.error) };
  }
  const data = parsed.data;

  let ref = newRef();
  let id: string | null = null;
  for (let attempt = 0; attempt < 3 && !id; attempt++) {
    try {
      const [row] = await getDb()
        .insert(inquiries)
        .values({
          ref,
          name: data.name,
          company: data.company,
          whatsapp: data.whatsapp,
          email: data.email,
          productTypes: data.productTypes,
          quantity: data.quantity,
          material: data.material,
          finishing: data.finishing,
          targetDate: data.targetDate,
          notes: data.notes,
          sourcePath: data.sourcePath,
          ipHash,
        })
        .returning({ id: inquiries.id });
      id = row.id;
    } catch (err) {
      if (attempt === 2) {
        console.error("[inquiry] insert failed", err);
        return { status: "error", message: "Permintaan belum tersimpan karena gangguan server. Silakan coba lagi atau hubungi kami via WhatsApp." };
      }
      ref = newRef();
    }
  }

  // Sheets sync runs after the response is sent; failures are retried by cron.
  after(async () => {
    if (id) await syncInquiry(id);
  });

  const { company } = await getSettings();
  const summary = [
    `Halo Deflected, saya ${data.name}${data.company ? ` dari ${data.company}` : ""}.`,
    `Saya baru mengirim permintaan penawaran (${ref}).`,
    `Produk: ${data.productTypes.join(", ")}`,
    `Jumlah: ${data.quantity}`,
    data.targetDate ? `Target: ${data.targetDate}` : "",
  ]
    .filter(Boolean)
    .join("\n");
  return { status: "success", ref, waUrl: waLink(company.whatsapp, summary) };
}
