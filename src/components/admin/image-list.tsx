"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { ActionResult } from "@/lib/admin-guard";
import { mediaUrl } from "@/lib/storage-url";
import { ActionForm } from "./form";

type Row = { rowId: string; key: string; alt: string };

export function ImageList({
  rows,
  updateAlt,
  move,
  remove,
}: {
  rows: Row[];
  updateAlt: (rowId: string, prev: ActionResult, fd: FormData) => Promise<ActionResult>;
  move: (rowId: string, dir: "up" | "down") => Promise<ActionResult>;
  remove: (rowId: string) => Promise<ActionResult>;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState("");

  const run = (fn: () => Promise<ActionResult>) =>
    start(async () => {
      const res = await fn();
      setError(res.ok ? "" : res.message);
      router.refresh();
    });

  if (rows.length === 0) {
    return <p className="rounded-sm border border-dashed border-line px-4 py-8 text-center text-sm text-text-2">Belum ada gambar. Unggah minimal satu foto agar tampil rapi di katalog.</p>;
  }
  return (
    <div>
      {error && (
        <p role="alert" className="mb-3 rounded-sm bg-danger-soft px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}
      <ol className="space-y-3" aria-busy={pending}>
        {rows.map((r, i) => (
          <li key={r.rowId} className="grid gap-4 rounded-sm border border-line p-3 sm:grid-cols-[96px_1fr_auto]">
            <div className="relative aspect-square w-24 overflow-hidden rounded-xs bg-cloud">
              <Image src={mediaUrl(r.key)} alt="" fill sizes="96px" className="object-cover" />
              {i === 0 && <span className="absolute top-1 left-1 rounded-xs bg-ink px-1.5 py-0.5 text-[0.68rem] font-semibold text-white">Utama</span>}
            </div>
            <ActionForm action={updateAlt.bind(null, r.rowId)} className="min-w-0">
              <label className="block text-[0.8rem] font-semibold text-ink" htmlFor={`alt-${r.rowId}`}>
                Alt text (deskripsi gambar)
              </label>
              <div className="mt-1 flex gap-2">
                <input
                  id={`alt-${r.rowId}`}
                  name="alt"
                  defaultValue={r.alt}
                  maxLength={200}
                  placeholder="Contoh: Jersey biru PLN Sinjai tampak depan"
                  className="h-10 min-w-0 flex-1 rounded-sm border border-line px-3 text-sm focus:border-blue focus:outline-none"
                />
                <button type="submit" className="h-10 rounded-sm bg-ink px-3 text-sm font-semibold text-white hover:bg-navy">
                  Simpan
                </button>
              </div>
            </ActionForm>
            <div className="flex items-start gap-1.5">
              <button type="button" disabled={i === 0 || pending} onClick={() => run(() => move(r.rowId, "up"))} className={smallBtn} aria-label="Pindah ke atas">
                Naik
              </button>
              <button type="button" disabled={i === rows.length - 1 || pending} onClick={() => run(() => move(r.rowId, "down"))} className={smallBtn} aria-label="Pindah ke bawah">
                Turun
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => window.confirm("Lepas gambar ini?") && run(() => remove(r.rowId))}
                className={`${smallBtn} text-danger hover:border-danger`}
              >
                Hapus
              </button>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

const smallBtn = "h-10 rounded-sm border border-line px-3 text-sm font-medium text-ink hover:border-ink disabled:opacity-40";
