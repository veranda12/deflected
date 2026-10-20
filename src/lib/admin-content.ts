import "server-only";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { slugRedirects } from "@/db/schema";
import { slugify } from "./utils";

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug hanya huruf kecil, angka, dan tanda hubung");

export function resolveSlug(input: string, fallbackFrom: string) {
  return input.trim() ? input.trim().toLowerCase() : slugify(fallbackFrom);
}

/** Keeps old URLs working after a slug rename (301 via findRedirect). */
export async function recordSlugChange(entity: "product" | "portfolio" | "category", id: string, oldSlug: string, newSlug: string) {
  if (oldSlug === newSlug) return;
  const db = getDb();
  // The new slug must not redirect anywhere any more.
  await db.delete(slugRedirects).where(and(eq(slugRedirects.entity, entity), eq(slugRedirects.fromSlug, newSlug)));
  await db
    .insert(slugRedirects)
    .values({ entity, fromSlug: oldSlug, toId: id })
    .onConflictDoUpdate({ target: [slugRedirects.entity, slugRedirects.fromSlug], set: { toId: id } });
}

/** "Label: value" per line, used for product specs. */
export function parseSpecs(text: string) {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 30)
    .map((l) => {
      const i = l.indexOf(":");
      return i > 0 ? { label: l.slice(0, i).trim().slice(0, 60), value: l.slice(i + 1).trim().slice(0, 300) } : { label: "Info", value: l.slice(0, 300) };
    });
}

/** "Name | detail" per line, used for variants. */
export function parseVariants(text: string) {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 30)
    .map((l) => {
      const [name, ...rest] = l.split("|");
      return { name: name.trim().slice(0, 80), detail: rest.join("|").trim().slice(0, 300) };
    })
    .filter((v) => v.name);
}
