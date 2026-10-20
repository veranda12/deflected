// Detects image type from magic bytes (never trusts the declared MIME type or
// filename) and reads pixel dimensions from the header.

export type ImageInfo = { ext: "jpg" | "png" | "webp" | "avif"; mime: string; width: number | null; height: number | null };

const u16be = (b: Uint8Array, o: number) => (b[o] << 8) | b[o + 1];
const u32be = (b: Uint8Array, o: number) => ((b[o] << 24) | (b[o + 1] << 16) | (b[o + 2] << 8) | b[o + 3]) >>> 0;
const u16le = (b: Uint8Array, o: number) => b[o] | (b[o + 1] << 8);
const u24le = (b: Uint8Array, o: number) => b[o] | (b[o + 1] << 8) | (b[o + 2] << 16);
const ascii = (b: Uint8Array, o: number, n: number) => String.fromCharCode(...b.subarray(o, o + n));

function jpegSize(b: Uint8Array): [number, number] | null {
  let o = 2;
  while (o + 9 < b.length) {
    if (b[o] !== 0xff) return null;
    const marker = b[o + 1];
    const len = u16be(b, o + 2);
    // SOF0..SOF15 except DHT(C4), JPG(C8), DAC(CC)
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return [u16be(b, o + 7), u16be(b, o + 5)];
    }
    o += 2 + len;
  }
  return null;
}

function webpSize(b: Uint8Array): [number, number] | null {
  const chunk = ascii(b, 12, 4);
  if (chunk === "VP8X") return [u24le(b, 24) + 1, u24le(b, 27) + 1];
  if (chunk === "VP8 ") return [u16le(b, 26) & 0x3fff, u16le(b, 28) & 0x3fff];
  if (chunk === "VP8L") {
    const bits = b[21] | (b[22] << 8) | (b[23] << 16) | (b[24] << 24);
    return [(bits & 0x3fff) + 1, ((bits >> 14) & 0x3fff) + 1];
  }
  return null;
}

function avifSize(b: Uint8Array): [number, number] | null {
  for (let i = 0; i < Math.min(b.length - 16, 4096); i++) {
    if (b[i] === 0x69 && ascii(b, i, 4) === "ispe") return [u32be(b, i + 8), u32be(b, i + 12)];
  }
  return null;
}

export function detectImage(b: Uint8Array): ImageInfo | null {
  if (b.length < 32) return null;
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) {
    const s = jpegSize(b);
    return { ext: "jpg", mime: "image/jpeg", width: s?.[0] ?? null, height: s?.[1] ?? null };
  }
  if (b[0] === 0x89 && ascii(b, 1, 3) === "PNG") {
    return { ext: "png", mime: "image/png", width: u32be(b, 16), height: u32be(b, 20) };
  }
  if (ascii(b, 0, 4) === "RIFF" && ascii(b, 8, 4) === "WEBP") {
    const s = webpSize(b);
    return { ext: "webp", mime: "image/webp", width: s?.[0] ?? null, height: s?.[1] ?? null };
  }
  if (ascii(b, 4, 4) === "ftyp" && ["avif", "avis"].includes(ascii(b, 8, 4))) {
    const s = avifSize(b);
    return { ext: "avif", mime: "image/avif", width: s?.[0] ?? null, height: s?.[1] ?? null };
  }
  return null;
}
