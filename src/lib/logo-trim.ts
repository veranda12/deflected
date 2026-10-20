// Pixel-level logo cleanup shared by the admin uploader (browser) and the seed
// script. Removes the paper-white or transparent background that touches the
// image edge, then crops to the visible mark so every logo fills its box evenly.

export type Rgba = { width: number; height: number; data: Uint8ClampedArray };

const PAPER_MIN = 236; // channels at or above this count as white paper
const PAPER_CHROMA = 24; // max spread between channels for "neutral" paper
const VISIBLE_ALPHA = 8;

function isPaper(d: Uint8ClampedArray, i: number) {
  if (d[i + 3] < 16) return true;
  const r = d[i];
  const g = d[i + 1];
  const b = d[i + 2];
  const min = Math.min(r, g, b);
  return min >= PAPER_MIN && Math.max(r, g, b) - min <= PAPER_CHROMA;
}

export function trimLogo(img: Rgba, padRatio = 0.03): Rgba {
  const { width: w, height: h } = img;
  const data = new Uint8ClampedArray(img.data);

  // Flood fill from the border: only paper connected to the edge becomes transparent,
  // so white areas enclosed by the logo itself are left alone.
  const seen = new Uint8Array(w * h);
  const stack = new Int32Array(w * h);
  let top = 0;
  const push = (p: number) => {
    if (seen[p]) return;
    seen[p] = 1;
    stack[top++] = p;
  };
  for (let x = 0; x < w; x++) {
    push(x);
    push((h - 1) * w + x);
  }
  for (let y = 0; y < h; y++) {
    push(y * w);
    push(y * w + w - 1);
  }
  while (top > 0) {
    const p = stack[--top];
    const i = p * 4;
    if (!isPaper(data, i)) continue;
    data[i + 3] = 0;
    const x = p % w;
    const y = (p - x) / w;
    if (x > 0) push(p - 1);
    if (x < w - 1) push(p + 1);
    if (y > 0) push(p - w);
    if (y < h - 1) push(p + w);
  }

  let minX = w;
  let minY = h;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] <= VISIBLE_ALPHA) continue;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX < 0) return { width: w, height: h, data };

  const pad = Math.round(Math.max(maxX - minX + 1, maxY - minY + 1) * padRatio);
  const x0 = Math.max(0, minX - pad);
  const y0 = Math.max(0, minY - pad);
  const cw = Math.min(w - 1, maxX + pad) - x0 + 1;
  const ch = Math.min(h - 1, maxY + pad) - y0 + 1;
  const out = new Uint8ClampedArray(cw * ch * 4);
  for (let y = 0; y < ch; y++) {
    const start = ((y0 + y) * w + x0) * 4;
    out.set(data.subarray(start, start + cw * 4), y * cw * 4);
  }
  return { width: cw, height: ch, data: out };
}
