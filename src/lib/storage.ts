import "server-only";

// Object keys are always generated server-side (see newMediaKey). User-supplied
// filenames never become part of a path, which rules out path traversal.
export const MEDIA_KEY_RE = /^(media\/\d{4}\/\d{2}\/[0-9a-f-]{36}|seed\/[a-z0-9-]{1,80})\.(jpg|png|webp|avif)$/;

export const MIME_BY_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
};

export function isValidMediaKey(key: string) {
  return MEDIA_KEY_RE.test(key);
}

export function newMediaKey(ext: string) {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `media/${y}/${m}/${crypto.randomUUID()}.${ext}`;
}

export function mediaUrl(key: string) {
  return `/media/${key}`;
}

interface StorageDriver {
  put(key: string, body: Uint8Array, contentType: string): Promise<void>;
  get(key: string): Promise<Uint8Array | null>;
  delete(key: string): Promise<void>;
}

async function localDriver(): Promise<StorageDriver> {
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  // Runtime-configured directory; excluded from build-time file tracing.
  const root = path.resolve(/*turbopackIgnore: true*/ process.cwd(), process.env.LOCAL_STORAGE_DIR ?? ".data/uploads");
  const resolve = (key: string) => {
    if (!isValidMediaKey(key)) throw new Error("Invalid media key");
    const full = path.resolve(root, key);
    if (!full.startsWith(root + path.sep)) throw new Error("Invalid media path");
    return full;
  };
  return {
    async put(key, body) {
      const full = resolve(key);
      await fs.mkdir(path.dirname(full), { recursive: true });
      await fs.writeFile(full, body);
    },
    async get(key) {
      try {
        return new Uint8Array(await fs.readFile(resolve(key)));
      } catch {
        return null;
      }
    },
    async delete(key) {
      await fs.rm(resolve(key), { force: true });
    },
  };
}

type R2Bucket = {
  put(key: string, value: Uint8Array, opts?: { httpMetadata?: { contentType?: string } }): Promise<unknown>;
  get(key: string): Promise<{ arrayBuffer(): Promise<ArrayBuffer> } | null>;
  delete(key: string): Promise<void>;
};

async function r2Driver(): Promise<StorageDriver> {
  // Only resolvable when running inside the Cloudflare Workers runtime via OpenNext.
  const { getCloudflareContext } = await import("@opennextjs/cloudflare");
  const bucket = (getCloudflareContext().env as unknown as { MEDIA_BUCKET?: R2Bucket }).MEDIA_BUCKET;
  if (!bucket) throw new Error("R2 binding MEDIA_BUCKET is not configured");
  return {
    async put(key, body, contentType) {
      if (!isValidMediaKey(key)) throw new Error("Invalid media key");
      await bucket.put(key, body, { httpMetadata: { contentType } });
    },
    async get(key) {
      if (!isValidMediaKey(key)) return null;
      const obj = await bucket.get(key);
      return obj ? new Uint8Array(await obj.arrayBuffer()) : null;
    },
    async delete(key) {
      if (isValidMediaKey(key)) await bucket.delete(key);
    },
  };
}

async function dbDriver(): Promise<StorageDriver> {
  // Bytes live in Postgres, so uploads work on Vercel without object storage. Fine for small previews.
  const { eq } = await import("drizzle-orm");
  const { getDb } = await import("@/db");
  const { mediaObjects } = await import("@/db/schema");
  return {
    async put(key, body, contentType) {
      if (!isValidMediaKey(key)) throw new Error("Invalid media key");
      const value = { key, mime: contentType, body: Buffer.from(body) };
      await getDb()
        .insert(mediaObjects)
        .values(value)
        .onConflictDoUpdate({ target: mediaObjects.key, set: { mime: value.mime, body: value.body } });
    },
    async get(key) {
      if (!isValidMediaKey(key)) return null;
      const [row] = await getDb()
        .select({ body: mediaObjects.body })
        .from(mediaObjects)
        .where(eq(mediaObjects.key, key))
        .limit(1);
      return row ? new Uint8Array(row.body) : null;
    },
    async delete(key) {
      if (isValidMediaKey(key)) await getDb().delete(mediaObjects).where(eq(mediaObjects.key, key));
    },
  };
}

export async function getStorage(): Promise<StorageDriver> {
  switch (process.env.STORAGE_DRIVER) {
    case "r2":
      return r2Driver();
    case "db":
      return dbDriver();
    default:
      return localDriver();
  }
}
