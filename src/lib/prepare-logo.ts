import { trimLogo } from "./logo-trim";

const WORK_SIDE = 1200; // large photos are reduced first; a logo never needs more detail
const OUT_SIDE = 640; // longest side of the stored PNG

function canvas(width: number, height: number) {
  const c = document.createElement("canvas");
  c.width = Math.max(1, width);
  c.height = Math.max(1, height);
  return c;
}

function context(c: HTMLCanvasElement, opts?: CanvasRenderingContext2DSettings) {
  const ctx = c.getContext("2d", opts);
  if (!ctx) throw new Error("Browser tidak mendukung pemrosesan gambar.");
  return ctx;
}

/**
 * Prepares a logo in the browser before upload: removes the white or transparent
 * background, crops to the visible mark, and scales it to a web-sized PNG. The
 * result fills a uniform box on the site regardless of how the original was framed.
 */
export async function prepareLogo(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) throw new Error("Gambar tidak bisa dibaca. Gunakan JPG, PNG, WebP, atau AVIF.");

  const k = Math.min(1, WORK_SIDE / Math.max(bitmap.width, bitmap.height));
  const work = canvas(Math.round(bitmap.width * k), Math.round(bitmap.height * k));
  const wctx = context(work, { willReadFrequently: true });
  wctx.drawImage(bitmap, 0, 0, work.width, work.height);
  bitmap.close();

  const pixels = wctx.getImageData(0, 0, work.width, work.height);
  const trimmed = trimLogo({ width: pixels.width, height: pixels.height, data: pixels.data });

  const native = canvas(trimmed.width, trimmed.height);
  const nctx = context(native);
  const imageData = nctx.createImageData(trimmed.width, trimmed.height);
  imageData.data.set(trimmed.data);
  nctx.putImageData(imageData, 0, 0);

  const s = Math.min(1, OUT_SIDE / Math.max(trimmed.width, trimmed.height));
  const out = canvas(Math.round(trimmed.width * s), Math.round(trimmed.height * s));
  const octx = context(out);
  octx.imageSmoothingQuality = "high";
  octx.drawImage(native, 0, 0, out.width, out.height);

  const blob = await new Promise<Blob | null>((resolve) => out.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("Logo gagal diproses. Coba gambar lain.");
  return new File([blob], "logo.png", { type: "image/png" });
}
