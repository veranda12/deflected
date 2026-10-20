import { getStorage, isValidMediaKey, MIME_BY_EXT } from "@/lib/storage";

export async function GET(_req: Request, ctx: { params: Promise<{ key: string[] }> }) {
  const { key: parts } = await ctx.params;
  const key = parts.join("/");
  if (!isValidMediaKey(key)) return new Response("Not found", { status: 404 });
  const body = await (await getStorage()).get(key);
  if (!body) return new Response("Not found", { status: 404 });
  const ext = key.split(".").pop()!;
  return new Response(body as BodyInit, {
    headers: {
      "Content-Type": MIME_BY_EXT[ext] ?? "application/octet-stream",
      // Keys are content-addressed by a random UUID and never overwritten.
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'",
    },
  });
}
