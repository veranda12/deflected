"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { IconChevronLeft, IconChevronRight, IconClose, IconExpand } from "@/components/icons";
import { mediaUrl } from "@/lib/storage-url";
import { cn } from "@/lib/utils";

type GImg = { key: string; alt: string; width: number | null; height: number | null };

/** Product/project gallery with thumbnails and a native <dialog> viewer (Escape and focus handling built in). */
export function Gallery({ images, label }: { images: GImg[]; label: string }) {
  const [index, setIndex] = useState(0);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const count = images.length;
  const go = useCallback((d: number) => setIndex((i) => (i + d + count) % count), [count]);

  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    const onKey = (e: KeyboardEvent) => {
      if (!dlg.open) return;
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [go]);

  if (count === 0) {
    return (
      <div className="grid aspect-[4/5] place-items-center rounded-lg border border-dashed border-line bg-mist text-sm text-text-3">
        Foto produk belum tersedia
      </div>
    );
  }
  const current = images[index];

  return (
    <div>
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-cloud cut-corner">
        <Image
          key={current.key}
          src={mediaUrl(current.key)}
          alt={current.alt}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          loading={index === 0 ? "eager" : undefined}
          fetchPriority={index === 0 ? "high" : undefined}
          className="animate-[fade-up_500ms_var(--ease-out)] object-cover"
        />
        <button
          type="button"
          onClick={() => dialogRef.current?.showModal()}
          className="absolute right-3 bottom-3 inline-flex h-11 items-center gap-2 rounded-sm bg-white/95 px-3.5 text-sm font-semibold text-ink hover:bg-white"
        >
          <IconExpand className="size-4" /> Perbesar
        </button>
        {count > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} aria-label="Foto sebelumnya" className={navBtn("left-3")}>
              <IconChevronLeft className="size-5" />
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Foto berikutnya" className={navBtn("right-3")}>
              <IconChevronRight className="size-5" />
            </button>
          </>
        )}
      </div>

      {count > 1 && (
        <ul className="mt-3 grid grid-cols-5 gap-2" aria-label={`Foto ${label}`}>
          {images.map((img, i) => (
            <li key={img.key}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Tampilkan foto ${i + 1}: ${img.alt}`}
                aria-current={i === index}
                className={cn(
                  "relative block aspect-square w-full overflow-hidden rounded-xs bg-cloud ring-offset-2 transition",
                  i === index ? "ring-2 ring-ink" : "opacity-70 hover:opacity-100",
                )}
              >
                <Image src={mediaUrl(img.key)} alt="" fill sizes="96px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <dialog
        ref={dialogRef}
        aria-label={`Foto ${label}`}
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-ink/96 p-0 text-white backdrop:bg-ink/80"
        onClick={(e) => {
          if (e.target === dialogRef.current) dialogRef.current.close();
        }}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-4 py-3 sm:px-6">
            <p className="text-sm text-on-dark-2" aria-live="polite">
              {index + 1} / {count}
            </p>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="grid size-11 place-items-center rounded-sm hover:bg-white/10"
              aria-label="Tutup"
              autoFocus
            >
              <IconClose className="size-6" />
            </button>
          </div>
          <div className="relative flex-1">
            <Image src={mediaUrl(current.key)} alt={current.alt} fill sizes="100vw" className="object-contain" />
          </div>
          <p className="px-4 py-4 text-center text-sm text-on-dark-2 sm:px-6">{current.alt}</p>
          {count > 1 && (
            <div className="absolute inset-y-0 flex w-full items-center justify-between px-2 pointer-events-none sm:px-4">
              <button type="button" onClick={() => go(-1)} aria-label="Foto sebelumnya" className="pointer-events-auto grid size-12 place-items-center rounded-sm bg-white/10 hover:bg-white/20">
                <IconChevronLeft className="size-6" />
              </button>
              <button type="button" onClick={() => go(1)} aria-label="Foto berikutnya" className="pointer-events-auto grid size-12 place-items-center rounded-sm bg-white/10 hover:bg-white/20">
                <IconChevronRight className="size-6" />
              </button>
            </div>
          )}
        </div>
      </dialog>
    </div>
  );
}

function navBtn(pos: string) {
  return cn("absolute top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-sm bg-white/90 text-ink hover:bg-white", pos);
}
