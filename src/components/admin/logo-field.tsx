"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { buttonClass } from "@/components/ui/button";
import { prepareLogo } from "@/lib/prepare-logo";
import { mediaUrl } from "@/lib/storage-url";

type Logo = { id: string; key: string };

/**
 * Logo picker for admin forms. Picking a file processes it in the browser, uploads
 * it to the media library, and writes the media id into a hidden field so the
 * form saves it. Clears itself when the form resets after a successful create.
 */
export function LogoField({ initial, name = "logoMediaId" }: { initial: Logo | null; name?: string }) {
  const [logo, setLogo] = useState<Logo | null>(initial);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const hiddenRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const form = hiddenRef.current?.form;
    if (!form) return;
    const clear = () => {
      setLogo(null);
      setMsg(null);
    };
    form.addEventListener("reset", clear);
    return () => form.removeEventListener("reset", clear);
  }, []);

  async function pick(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setMsg(null);
    try {
      const prepared = await prepareLogo(file);
      const fd = new FormData();
      fd.set("target", "library");
      fd.append("files", prepared);
      const res = await fetch("/api/admin/media", { method: "POST", body: fd });
      const data = (await res.json().catch(() => ({}))) as { created?: Logo[]; rejected?: string[]; error?: string };
      const created = data.created?.[0];
      if (!res.ok || !created) throw new Error(data.error ?? data.rejected?.[0] ?? "Logo gagal diunggah.");
      setLogo({ id: created.id, key: created.key });
      setMsg({ ok: true, text: "Logo siap. Klik Simpan untuk menerapkannya." });
    } catch (err) {
      const text = err instanceof TypeError ? "Koneksi terputus saat mengunggah. Coba lagi." : err instanceof Error ? err.message : "Logo gagal diproses.";
      setMsg({ ok: false, text });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-4 sm:grid-cols-[180px_1fr] sm:items-start">
      <div className="relative flex h-28 items-center justify-center overflow-hidden rounded-sm border border-line bg-mist p-3">
        {logo ? (
          <Image src={mediaUrl(logo.key)} alt="" fill sizes="180px" className="object-contain p-3" />
        ) : (
          <p className="text-[0.8rem] text-text-3">Belum ada logo</p>
        )}
      </div>
      <div>
        <p className="text-[0.85rem] font-semibold text-ink">Logo</p>
        <p className="mt-0.5 text-[0.8rem] text-text-3">
          JPG, PNG, WebP, atau AVIF. Latar putih dihapus dan logo dipotong otomatis agar ukurannya seragam di situs.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <label className={buttonClass("outline", "md", busy ? "pointer-events-none opacity-60" : "cursor-pointer")}>
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              disabled={busy}
              onChange={(e) => {
                pick(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            {busy ? "Memproses..." : logo ? "Ganti logo" : "Unggah logo"}
          </label>
          {logo && (
            <button
              type="button"
              onClick={() => {
                setLogo(null);
                setMsg(null);
              }}
              className="h-11 rounded-sm border border-line px-4 text-sm font-semibold text-danger hover:border-danger"
            >
              Hapus logo
            </button>
          )}
        </div>
        {msg && (
          <p role={msg.ok ? "status" : "alert"} className={`mt-2 text-sm ${msg.ok ? "text-success" : "text-danger"}`}>
            {msg.text}
          </p>
        )}
      </div>
      <input ref={hiddenRef} type="hidden" name={name} value={logo?.id ?? ""} />
    </div>
  );
}
