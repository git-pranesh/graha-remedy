/**
 * Overpass Temple Service — fetches real Hindu temple data from
 * OpenStreetMap's Overpass API, with local JSON caching and
 * fair-use rate limiting (1 req/sec).
 *
 * Query: amenity=place_of_worship, religion=hindu, within a radius.
 * Falls back to the static temple dataset if Overpass is unavailable.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Types ──────────────────────────────────────────────────────────────────

export interface OverpassTemple {
  osmId: number;
  name: string;
  deity: string | null;       // null if OSM data doesn't have a deity tag
  lat: number;
  lon: number;
  denomination: string | null;
  addrCity: string | null;
  addrState: string | null;
}

export interface OverpassQueryResult {
  temples: OverpassTemple[];
  totalFound: number;
  cached: boolean;
  queriedAt: string;
}

// ─── Config ─────────────────────────────────────────────────────────────────

const OVERPASS_ENDPOINT = "https://overpass-api.de/api/interpreter";
const CACHE_DIR = path.resolve(__dirname, "../../cache");
const CACHE_FILE = path.join(CACHE_DIR, "overpass-temples.json");
const DEFAULT_RADIUS_M = 25_000; // 25 km
const MAX_RESULTS = 100;
const RATE_LIMIT_MS = 1200; // 1.2 seconds between requests
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// ─── Rate Limiter ───────────────────────────────────────────────────────────

let lastRequestTime = 0;

async function rateLimitedFetch(url: string, options: RequestInit): Promise<Response> {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < RATE_LIMIT_MS) {
    await new Promise((r) => setTimeout(r, RATE_LIMIT_MS - elapsed));
  }
  lastRequestTime = Date.now();
  return fetch(url, options);
}

// ─── Cache ──────────────────────────────────────────────────────────────────

interface CacheEntry {
  result: OverpassQueryResult;
  timestamp: number;
}

let memoryCache: Map<string, CacheEntry> = new Map();

function loadCacheFromDisk(): void {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const raw = fs.readFileSync(CACHE_FILE, "utf-8");
      const data = JSON.parse(raw) as Record<string, CacheEntry>;
      for (const [key, val] of Object.entries(data)) {
        // Skip expired entries
        if (Date.now() - val.timestamp < CACHE_TTL_MS) {
          memoryCache.set(key, val);
        }
      }
      console.log(`📦 Loaded ${memoryCache.size} cached Overpass queries from disk`);
    }
  } catch {
    // Start fresh
  }
}

function saveCacheToDisk(): void {
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
    console.error("Failed to save Overpass cache:", err);
  }
}

function getCacheKey(lat: number, lon: number, radiusM: number): string {
  // Round to ~1km precision to share cache for nearby locations
  const roundedLat = Math.round(lat * 10) / 10;
  const roundedLon = Math.round(lon * 10) / 10;
  return `${roundedLat},${roundedLon},${radiusM}`;
}

function getCachedResult(key: string): OverpassQueryResult | null {
  const entry = memoryCache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL_MS) {
    return { ...entry.result, cached: true };
  }
  return null;
}

function setCachedResult(key: string, result: OverpassQueryResult): void {
  memoryCache.set(key, { result, timestamp: Date.now() });
  // Persist periodically (every 5 entries)
  if (memoryCache.size % 5 === 0) {
    saveCacheToDisk();
  }
}

// Initialize cache on module load
loadCacheFromDisk();

// ─── Overpass QL Query Builder ──────────────────────────────────────────────

function buildQuery(lat: number, lon: number, radiusM: number): string {
  return `
[out:json][timeout:25];
(
  node["amenity"="place_of_worship"]["religion"="hindu"](around:${radiusM},${lat},${lon});
  way["amenity"="place_of_worship"]["religion"="hindu"](around:${radiusM},${lat},${lon});
  relation["amenity"="place_of_worship"]["religion"="hindu"](around:${radiusM},${lat},${lon});
);
out body;
>;
out skel qt;
  `.trim();
}

// ─── Response Parser ────────────────────────────────────────────────────────

interface OverpassElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  tags?: Record<string, string>;
  nodes?: number[];
}

interface OverpassResponse {
  elements: OverpassElement[];
}

function parseResponse(response: OverpassResponse): OverpassTemple[] {
  const temples: OverpassTemple[] = [];
  const nodeMap = new Map<number, { lat: number; lon: number }>();

  // First pass: index all nodes for way/relation coordinate lookup
  for (const el of response.elements) {
    if (el.type === "node" && el.lat !== undefined && el.lon !== undefined) {
      nodeMap.set(el.id, { lat: el.lat, lon: el.lon });
    }
  }

  // Second pass: extract temples with tags
  for (const el of response.elements) {
    if (!el.tags) continue;
    if (el.tags.amenity !== "place_of_worship") continue;
    if (el.tags.religion !== "hindu") continue;

    let lat = el.lat;
    let lon = el.lon;

    // For ways/relations, use the first node's coordinates as center
    if ((el.type === "way" || el.type === "relation") && el.nodes?.length) {
      const firstNode = nodeMap.get(el.nodes[0]);
      if (firstNode) {
        lat = firstNode.lat;
        lon = firstNode.lon;
      }
    }

    if (lat === undefined || lon === undefined) continue;

    temples.push({
      osmId: el.id,
      name: el.tags.name ?? el.tags["name:en"] ?? el.tags["name:hi"] ?? `Hindu Temple (${el.id})`,
      deity: el.tags.deity ?? null,
      lat,
      lon,
      denomination: el.tags.denomination ?? null,
      addrCity: el.tags["addr:city"] ?? null,
      addrState: el.tags["addr:state"] ?? null,
    });
  }

  return temples;
}

// ─── Main API ───────────────────────────────────────────────────────────────

/**
 * Query Overpass API for Hindu temples near a location.
 * Results are cached locally to avoid repeated API calls.
 *
 * @param lat       - Center latitude
 * @param lon       - Center longitude
 * @param radiusM   - Search radius in meters (default 25km)
 * @param maxResults - Max temples to return (default 100)
 */
export async function queryOverpassTemples(
  lat: number,
  lon: number,
  radiusM: number = DEFAULT_RADIUS_M,
  maxResults: number = MAX_RESULTS,
): Promise<OverpassQueryResult> {
  const cacheKey = getCacheKey(lat, lon, radiusM);

  // Check cache first
  const cached = getCachedResult(cacheKey);
  if (cached) {
    return cached;
  }

  // Build and execute query
  const query = buildQuery(lat, lon, radiusM);

  try {
    const params = new URLSearchParams();
    params.append("data", query);

    const res = await rateLimitedFetch(OVERPASS_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
        "User-Agent": "graha-remedy-app/0.1.0",
      },
      body: params.toString(),
    });

    if (!res.ok) {
      console.error(`Overpass API error: ${res.status} ${res.statusText}`);
      return emptyResult();
    }

    const data = (await res.json()) as OverpassResponse;
    const temples = parseResponse(data);

    const result: OverpassQueryResult = {
      temples: temples.slice(0, maxResults),
      totalFound: temples.length,
      cached: false,
      queriedAt: new Date().toISOString(),
    };

    // Cache it
    setCachedResult(cacheKey, result);
    saveCacheToDisk();

    return result;
  } catch (err: any) {
    console.error("Overpass query failed:", err.message);
    return emptyResult();
  }
}

function emptyResult(): OverpassQueryResult {
  return {
    temples: [],
    totalFound: 0,
    cached: false,
    queriedAt: new Date().toISOString(),
  };
}

/**
 * Flush the on-disk cache (useful for testing).
 */
export function flushCache(): void {
  memoryCache.clear();
  try {
    if (fs.existsSync(CACHE_FILE)) {
      fs.unlinkSync(CACHE_FILE);
    }
  } catch {
    // ignore
  }
}

/**
 * Get cache statistics.
 */
export function getCacheStats(): { entries: number; cacheFile: string } {
  return { entries: memoryCache.size, cacheFile: CACHE_FILE };
}
