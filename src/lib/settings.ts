import "server-only";
import { unstable_cache } from "next/cache";
import { getDb } from "@/db";
import { siteSettings } from "@/db/schema";
import { DEFAULT_SETTINGS, type SettingsMap } from "./content-defaults";

export const SETTINGS_TAG = "settings";

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Deep merge stored JSON over defaults so new fields always have a value. */
function merge<T>(base: T, override: unknown): T {
  if (!isPlainObject(base) || !isPlainObject(override)) return (override ?? base) as T;
  const out: Record<string, unknown> = { ...base };
  for (const [k, v] of Object.entries(override)) {
    if (v === undefined) continue;
    out[k] = isPlainObject((base as Record<string, unknown>)[k]) ? merge((base as Record<string, unknown>)[k], v) : v;
  }
  return out as T;
}

async function loadSettings(): Promise<SettingsMap> {
  const rows = await getDb().select().from(siteSettings);
  const stored = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  const result = { ...DEFAULT_SETTINGS } as SettingsMap;
  for (const key of Object.keys(DEFAULT_SETTINGS) as (keyof SettingsMap)[]) {
    if (key in stored) (result as Record<string, unknown>)[key] = merge(DEFAULT_SETTINGS[key], stored[key]);
  }
  return result;
}

export const getSettings = unstable_cache(loadSettings, ["site-settings-v1"], {
  tags: [SETTINGS_TAG],
  revalidate: 3600,
});

/** Uncached read for the admin editor. */
export const getSettingsFresh = loadSettings;
