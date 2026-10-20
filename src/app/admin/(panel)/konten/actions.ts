"use server";

import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { media, siteSettings } from "@/db/schema";
import { fail, isUuid, ok, refreshPublic, runAdmin, type ActionResult } from "@/lib/admin-guard";
import { logAudit } from "@/lib/audit";
import { CONTENT_SECTIONS, fromFieldText, setPath, type SectionKey } from "@/lib/content-schema";
import { getSettingsFresh } from "@/lib/settings";

const OWNER_ONLY: SectionKey[] = ["company"];

export async function saveSection(key: SectionKey, _prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const section = CONTENT_SECTIONS[key];
  if (!section) return fail("Bagian tidak dikenal.");
  return runAdmin(
    async (user) => {
      const current = (await getSettingsFresh())[key] as unknown as Record<string, unknown>;
      const next = structuredClone(current);
      const errors: Record<string, string> = {};
      for (const f of section.fields) {
        const name = f.path.replace(/\./g, "__");
        if (f.type === "bool") {
          setPath(next, f.path, fd.get(name) === "on");
          continue;
        }
        const raw = String(fd.get(name) ?? "");
        if (f.max && raw.trim().length > f.max) errors[name] = `Maksimal ${f.max} karakter`;
        const value = fromFieldText(f.type, raw, f.max);
        if (f.required && (value === "" || (Array.isArray(value) && value.length === 0))) errors[name] = "Wajib diisi";
        setPath(next, f.path, value);
      }
      if (key === "company") {
        const c = next as { whatsapp: string; email: string; instagram: string; tiktok: string; facebook: string; linkedin: string; mapsUrl: string };
        if (!/^62\d{8,13}$/.test(c.whatsapp)) errors.whatsapp = "Format 62 diikuti nomor, tanpa spasi";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email)) errors.email = "Email tidak valid";
        for (const k of ["instagram", "tiktok", "facebook", "linkedin", "mapsUrl"] as const) {
          if (c[k] && !/^https:\/\/[^\s]+$/.test(c[k])) errors[k] = "Harus URL lengkap yang diawali https://";
        }
      }
      if (Object.keys(errors).length) return fail("Periksa kembali isian yang ditandai.", errors);
      await getDb()
        .insert(siteSettings)
        .values({ key, value: next, updatedBy: user.id })
        .onConflictDoUpdate({ target: siteSettings.key, set: { value: next, updatedAt: new Date(), updatedBy: user.id } });
      await logAudit(user, "update", "settings", key, `Memperbarui konten "${section.title}"`);
      refreshPublic("settings");
      return ok(`${section.title} tersimpan.`);
    },
    { role: OWNER_ONLY.includes(key) ? "owner" : undefined },
  );
}

const MEDIA_SLOTS = {
  "hero.imageMediaId": { key: "hero", field: "imageMediaId", owner: false },
  "seo.ogMediaId": { key: "seo", field: "ogMediaId", owner: false },
  "brand.logoMediaId": { key: "brand", field: "logoMediaId", owner: true },
  "brand.faviconMediaId": { key: "brand", field: "faviconMediaId", owner: true },
} as const;
export type MediaSlot = keyof typeof MEDIA_SLOTS;

export async function setSettingMedia(slot: MediaSlot, mediaId: string | null): Promise<ActionResult> {
  const def = MEDIA_SLOTS[slot];
  if (!def) return fail("Slot tidak dikenal.");
  return runAdmin(
    async (user) => {
      if (mediaId !== null) {
        if (!isUuid(mediaId)) return fail("ID tidak valid.");
        const [m] = await getDb().select({ id: media.id }).from(media).where(eq(media.id, mediaId));
        if (!m) return fail("Gambar tidak ditemukan.");
      }
      const current = (await getSettingsFresh())[def.key] as unknown as Record<string, unknown>;
      const next = { ...current, [def.field]: mediaId };
      await getDb()
        .insert(siteSettings)
        .values({ key: def.key, value: next, updatedBy: user.id })
        .onConflictDoUpdate({ target: siteSettings.key, set: { value: next, updatedAt: new Date(), updatedBy: user.id } });
      await logAudit(user, "update", "settings", slot, mediaId ? "Mengganti gambar pengaturan" : "Menghapus gambar pengaturan");
      refreshPublic("settings");
      return ok("Gambar tersimpan.");
    },
    { role: def.owner ? "owner" : undefined },
  );
}
