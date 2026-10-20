import "server-only";
import { hmacHex, timingSafeEqual } from "./crypto";
import { env } from "./env";

// Signed render timestamp. Bots that post instantly, replay very old forms,
// or skip the page entirely are rejected without a CAPTCHA.
const MIN_AGE_MS = 2500;
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

export async function createFormToken() {
  const ts = Date.now().toString(36);
  return `${ts}.${(await hmacHex(env.authSecret, `form:${ts}`)).slice(0, 32)}`;
}

export async function verifyFormToken(token: string | null | undefined): Promise<"ok" | "invalid" | "too_fast" | "expired"> {
  if (!token || token.length > 80) return "invalid";
  const [ts, sig] = token.split(".");
  if (!ts || !sig) return "invalid";
  const expected = (await hmacHex(env.authSecret, `form:${ts}`)).slice(0, 32);
  if (!timingSafeEqual(sig, expected)) return "invalid";
  const age = Date.now() - parseInt(ts, 36);
  if (age < MIN_AGE_MS) return "too_fast";
  if (age > MAX_AGE_MS) return "expired";
  return "ok";
}
