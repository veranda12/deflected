// Client-safe helper (no server-only imports).
export function mediaUrl(key: string) {
  return `/media/${key}`;
}
