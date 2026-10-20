"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { ActionResult } from "@/lib/admin-guard";
import { mediaUrl } from "@/lib/storage-url";
import { Uploader } from "./uploader";

/** Single-image setting (hero photo, OG image, logo, favicon). */
export function MediaSetting({
  label,
  hint,
  currentKey,
  setMedia,
  aspect = "aspect-[16/9]",
}: {
  label: string;
  hint?: string;
  currentKey: string | null;
  setMedia: (mediaId: string | null) => Promise<ActionResult>;
  aspect?: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<ActionResult | null>(null);
  const apply = (id: string | null) =>
    start(async () => {
      const res = await setMedia(id);
      setMsg(res);
      router.refresh();
    });
  return (
    <div className="grid gap-4 sm:grid-cols-[220px_1fr]">
      <div className={`relative ${aspect} overflow-hidden rounded-sm border border-line bg-mist`}>
        {currentKey ? <Image src={mediaUrl(currentKey)} alt="" fill sizes="220px" className="object-cover" /> : <p className="p-4 text-[0.8rem] text-text-3">Belum diatur</p>}
      </div>
      <div>
        <p className="text-[0.9rem] font-semibold text-ink">{label}</p>
        {hint && <p className="mt-0.5 text-[0.8rem] text-text-3">{hint}</p>}
        <div className="mt-3 flex flex-wrap items-start gap-3">
          <Uploader target="library" multiple={false} label={currentKey ? "Ganti gambar" : "Unggah gambar"} onUploaded={(ids) => ids[0] && apply(ids[0])} />
          {currentKey && (
            <button type="button" disabled={pending} onClick={() => apply(null)} className="h-11 rounded-sm border border-line px-4 text-sm font-semibold text-danger hover:border-danger">
              Hapus
            </button>
          )}
        </div>
        {msg?.message && (
          <p role={msg.ok ? "status" : "alert"} className={`mt-2 text-sm ${msg.ok ? "text-success" : "text-danger"}`}>
            {msg.message}
          </p>
        )}
      </div>
    </div>
  );
}
