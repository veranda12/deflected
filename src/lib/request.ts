import "server-only";
import { headers } from "next/headers";
import { hmacHex } from "./crypto";
import { env } from "./env";

export async function getClientInfo() {
  const h = await headers();
  const ip =
    h.get("cf-connecting-ip") ??
    h.get("x-real-ip") ??
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";
  const userAgent = (h.get("user-agent") ?? "").slice(0, 300);
  return { ip, userAgent };
}

/** IP addresses are stored as keyed hashes only (personal data minimisation). */
export async function hashIp(ip: string): Promise<string> {
  return (await hmacHex(env.authSecret, `ip:${ip}`)).slice(0, 32);
}

export async function getClientFingerprint() {
  const { ip, userAgent } = await getClientInfo();
  return { ipHash: await hashIp(ip), userAgent };
}

/** CSRF defence for Route Handlers: state-changing requests must come from our own origin. */
export function isSameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  const allowed = new Set([env.siteUrl, new URL(req.url).origin]);
  return allowed.has(origin);
}
