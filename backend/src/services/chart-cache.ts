/**
 * Chart cache — caches computed birth charts by a hash of
 * DOB + TOB + POB so repeat lookups avoid re-computation.
 * Uses an in-memory Map with optional file persistence.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CACHE_DIR = path.resolve(__dirname, "../../cache");
const CACHE_FILE = path.join(CACHE_DIR, "chart-cache.json");

interface CacheEntry {
  result: unknown;
  computedAt: string;
}

const memoryCache = new Map<string, CacheEntry>();
const MAX_ENTRIES = 500;

// ---------------------------------------------------------------------------
// Load cache from disk on startup
// ---------------------------------------------------------------------------

function loadFromDisk(): void {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const raw = fs.readFileSync(CACHE_FILE, "utf-8");
      const data = JSON.parse(raw) as Record<string, CacheEntry>;
      for (const [key, val] of Object.entries(data)) {
        memoryCache.set(key, val);
      }
      console.log(`📦 Loaded ${memoryCache.size} cached charts from disk`);
    }
  } catch {
    // Ignore — start fresh
  }
}

function saveToDisk(): void {
  try {
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
    const obj: Record<string, CacheEntry> = {};
    for (const [key, val] of memoryCache) {
      obj[key] = val;
    }
    fs.writeFileSync(CACHE_FILE, JSON.stringify(obj, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save chart cache:", err);
  }
}

// Initialize on import
loadFromDisk();

// ---------------------------------------------------------------------------
// Hash function
// ---------------------------------------------------------------------------

function createHashKey(
  year: number,
  month: number,
  day: number,
  hours: number,
  minutes: number,
  latitude: number,
  longitude: number,
): string {
  // Normalize to a stable string key
  const components = [
    year,
    String(month).padStart(2, "0"),
    String(day).padStart(2, "0"),
    String(hours).padStart(2, "0"),
    String(minutes).padStart(2, "0"),
    latitude.toFixed(4),
    longitude.toFixed(4),
  ].join(":");

  // Simple FNV-1a hash
  let hash = 0x811c9dc5;
  for (let i = 0; i < components.length; i++) {
    hash ^= components.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36);
}

// ---------------------------------------------------------------------------
// Cache API
// ---------------------------------------------------------------------------

export function getCachedChart<T>(
  year: number,
  month: number,
  day: number,
  hours: number,
  minutes: number,
  latitude: number,
  longitude: number,
): T | null {
  const key = createHashKey(year, month, day, hours, minutes, latitude, longitude);
  const entry = memoryCache.get(key);
  if (entry) {
    return entry.result as T;
  }
  return null;
}

export function setCachedChart<T>(
  year: number,
  month: number,
  day: number,
  hours: number,
  minutes: number,
  latitude: number,
  longitude: number,
  result: T,
): void {
  const key = createHashKey(year, month, day, hours, minutes, latitude, longitude);

  // Evict oldest if at capacity
  if (memoryCache.size >= MAX_ENTRIES) {
    const firstKey = memoryCache.keys().next().value;
    if (firstKey) memoryCache.delete(firstKey);
  }

  memoryCache.set(key, {
    result,
    computedAt: new Date().toISOString(),
  });

  // Persist to disk (async, fire-and-forget)
  saveToDisk();
}

export function getCacheStats(): { entries: number; maxEntries: number } {
  return { entries: memoryCache.size, maxEntries: MAX_ENTRIES };
}
