"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { buttonClass } from "@/components/ui/button";

/** Uploads images to /api/admin/media and refreshes the page. Server re-validates everything. */
export function Uploader({
  target,
  targetId,
  multiple = true,
  label = "Unggah gambar",
  onUploaded,
}: {
  target: "product" | "portfolio" | "category" | "library";
  targetId?: string;
  multiple?: boolean;
  label?: string;
  onUploaded?: (ids: string[]) => void;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function upload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy(true);
    setMsg(null);
    const fd = new FormData();
    fd.set("target", target);
    if (targetId) fd.set("targetId", targetId);
    for (const f of Array.from(files)) fd.append("files", f);
    try {
      const res = await fetch("/api/admin/media", { method: "POST", body: fd });
      const data = (await res.json().catch(() => ({}))) as { created?: { id: string }[]; rejected?: string[]; error?: string };
      if (!res.ok && !data.created?.length) {
        setMsg({ ok: false, text: data.error ?? data.rejected?.join("; ") ?? "Unggahan gagal." });
      } else {
        const n = data.created?.length ?? 0;
        setMsg({
          ok: true,
          text: `${n} gambar terunggah.${data.rejected?.length ? ` Ditolak: ${data.rejected.join("; ")}` : ""}`,
        });
        onUploaded?.(data.created?.map((c) => c.id) ?? []);
        router.refresh();
      }
    } catch {
      setMsg({ ok: false, text: "Koneksi terputus saat mengunggah. Coba lagi." });
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <label className={buttonClass("outline", "md", busy ? "pointer-events-none opacity-60" : "cursor-pointer")}>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple={multiple}
          className="sr-only"
          disabled={busy}
          onChange={(e) => upload(e.target.files)}
        />
        {busy ? "Mengunggah..." : label}
      </label>
      <p className="mt-2 text-[0.8rem] text-text-3">JPG, PNG, WebP, atau AVIF. Maks 5 MB per file, 10 file sekali unggah.</p>
      {msg && (
        <p role={msg.ok ? "status" : "alert"} className={`mt-2 text-sm ${msg.ok ? "text-success" : "text-danger"}`}>
          {msg.text}
        </p>
      )}
    </div>
  );
}
