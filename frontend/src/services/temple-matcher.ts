/**
 * Temple Matcher — finds nearby temples by deity using:
 *   1. Primary: OpenStreetMap Overpass API (real-time, cached)
 *   2. Fallback: Static curated dataset for offline/rate-limited scenarios
 *
 * When a temple from OSM lacks a deity tag (common for smaller temples),
 * it is excluded from deity-specific matches but still visible as a
 * general "Hindu temple nearby" result. The fallback recommendation
 * shows the general deity/temple type from remedies.json instead.
 */

import { readJsonData } from "../utils";
import {
  queryOverpassTemples,
  type OverpassTemple,
} from "./overpass-temples";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface NearbyTemple {
  id: string;
  name: string;
  city: string;
  state: string;
  deity: string;
  lat: number;
  lon: number;
  famous: boolean;
  distanceKm: number;
  source: "overpass" | "static";
}

export interface TempleMatchResult {
  hasLocation: boolean;
  deity: string;
  nearbyTemples: NearbyTemple[];
  fallbackRecommendation: string;
  /** Total Hindu temples found in the area (regardless of deity match). */
  totalTemplesInArea: number;
}

// ─── Static Dataset Fallback ────────────────────────────────────────────────

interface StaticTemple {
  id: string;
  name: string;
  city: string;
  state: string;
  deity: string;
  lat: number;
  lon: number;
  famous: boolean;
}

let staticTempleCache: StaticTemple[] | null = null;

function loadStaticTemples(): StaticTemple[] {
  if (!staticTempleCache) {
    const data = readJsonData("temples", "temples") as { temples: StaticTemple[] };
    staticTempleCache = data.temples ?? [];
  }
  return staticTempleCache;
}

// ─── Deity Name Normalisation ───────────────────────────────────────────────

const DEITY_SEARCH_MAP: Record<string, string[]> = {
  "Surya (Sun God)":      ["surya", "sun temple", "aditya"],
  "Chandra (Moon God)":   ["chandra", "moon", "shiva"],
  "Mangal (Mars)":        ["hanuman", "mangal", "mars"],
  "Budh (Mercury)":       ["vishnu", "ganesha", "budh"],
  "Brihaspati (Jupiter)": ["vishnu", "jupiter", "brihaspati"],
  "Shukra (Venus)":       ["lakshmi", "shukra", "venus"],
  "Shani (Saturn)":       ["shiva", "hanuman", "shani", "saturn"],
  "Rahu (North Node)":    ["durga", "vishnu", "rahu"],
  "Ketu (South Node)":    ["ganesha", "durga", "ketu"],
};

function getSearchTerms(deityLabel: string): string[] {
  const terms = DEITY_SEARCH_MAP[deityLabel] ?? [];

  // Also extract Sanskrit name from parentheses: "Shani (Saturn)" → ["shani"]
  const parenMatch = deityLabel.match(/^(\w+)\s*\(/);
  if (parenMatch) {
    const sanskrit = parenMatch[1].toLowerCase();
    if (!terms.includes(sanskrit)) terms.push(sanskrit);
  }

  // Add the full lowercase label as a last resort
  const lower = deityLabel.toLowerCase();
  if (!terms.includes(lower)) terms.push(lower);

  return terms;
}

/**
 * Check if an OSM temple's deity tag matches any of our search terms.
 * OSM deity tags are freeform strings, so we do fuzzy substring matching.
 */
function deityMatches(osmDeity: string | null, searchTerms: string[]): boolean {
  if (!osmDeity) return false;
  const lower = osmDeity.toLowerCase();
  return searchTerms.some((term) => lower.includes(term));
}

// ─── Haversine ──────────────────────────────────────────────────────────────

const EARTH_RADIUS_KM = 6371;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Fallback Text ──────────────────────────────────────────────────────────

function buildFallback(deityLabel: string, totalInArea: number): string {
  // Handle multi-word parenthetical names like "Surya (Sun God)"
  const parenMatch = deityLabel.match(/^(\w+)\s*\((.+)\)$/);
  const sanskrit = parenMatch ? parenMatch[1] : deityLabel;
  const _english = parenMatch ? parenMatch[2] : deityLabel;

  if (totalInArea > 0) {
    return `${totalInArea} Hindu temple${totalInArea !== 1 ? "s" : ""} found in your area, ` +
      `but none specifically tagged for ${deityLabel}. ` +
      `Visit any Hindu temple and offer prayers to ${sanskrit}, or worship at home ` +
      `following the puja steps listed above.`;
  }

  return `No Hindu temples found in your immediate area. ` +
    `Visit any ${deityLabel} temple, or worship at home ` +
    `following the puja steps listed above.`;
}

// ─── Main API ───────────────────────────────────────────────────────────────

/**
 * Find nearby temples for a given deity near the user's location.
 * Uses Overpass API as primary source, static dataset as fallback.
 */
export async function findNearbyTemples(
  deityLabel: string,
  userLat: number | null,
  userLon: number | null,
  maxResults: number = 3,
  radiusM: number = 25_000,
): Promise<TempleMatchResult> {
  const searchTerms = getSearchTerms(deityLabel);

  // No location → return static dataset results
  if (userLat === null || userLon === null) {
    return findFromStatic(deityLabel, searchTerms, maxResults);
  }

  // Try Overpass first
  try {
    const overpassResult = await queryOverpassTemples(userLat, userLon, radiusM);
    const allTemples = overpassResult.temples;

    // Filter for deity-matching temples
    const deityMatched = allTemples
      .filter((t) => deityMatches(t.deity, searchTerms))
      .map((t) => toNearbyTemple(t, userLat, userLon, "overpass"))
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, maxResults);

    if (deityMatched.length > 0) {
      return {
        hasLocation: true,
        deity: deityLabel,
        nearbyTemples: deityMatched,
        fallbackRecommendation: "",
        totalTemplesInArea: allTemples.length,
      };
    }

    // No deity-specific match → return empty (Google Maps link handles recommendations)
    return {
      hasLocation: true,
      deity: deityLabel,
      nearbyTemples: [],
      fallbackRecommendation: "",
      totalTemplesInArea: allTemples.length,
    };
  } catch {
    // Overpass failed → fall back to static dataset
    return findFromStatic(deityLabel, searchTerms, maxResults, userLat, userLon);
  }
}

/**
 * Fallback: search the static curated dataset.
 */
function findFromStatic(
  deityLabel: string,
  searchTerms: string[],
  maxResults: number,
  userLat?: number | null,
  userLon?: number | null,
): TempleMatchResult {
  const staticTemples = loadStaticTemples();

  // Match by deity name (case-insensitive substring)
  const matched = staticTemples.filter((t) => {
    const deityLower = t.deity.toLowerCase();
    return searchTerms.some((term) => deityLower.includes(term));
  });

  if (userLat != null && userLon != null) {
    const withDist: NearbyTemple[] = matched.map((t) => ({
      ...t,
      distanceKm: Math.round(haversineDistance(userLat, userLon, t.lat, t.lon)),
      source: "static" as const,
    }));
    withDist.sort((a, b) => a.distanceKm - b.distanceKm);

    return {
      hasLocation: true,
      deity: deityLabel,
      nearbyTemples: withDist.slice(0, maxResults),
      fallbackRecommendation: withDist.length === 0 ? buildFallback(deityLabel, 0) : "",
      totalTemplesInArea: matched.length,
    };
  }

  // No location: return top famous ones
  const famous = matched
    .sort((a, b) => (b.famous ? 1 : 0) - (a.famous ? 1 : 0))
    .slice(0, maxResults)
    .map((t) => ({ ...t, distanceKm: 0, source: "static" as const }));

  return {
    hasLocation: false,
    deity: deityLabel,
    nearbyTemples: famous,
    fallbackRecommendation: buildFallback(deityLabel, matched.length),
    totalTemplesInArea: matched.length,
  };
}

/**
 * Convert an OverpassTemple to a NearbyTemple.
 */
function toNearbyTemple(
  t: OverpassTemple,
  userLat: number,
  userLon: number,
  source: "overpass" | "static",
): NearbyTemple {
  return {
    id: `osm-${t.osmId}`,
    name: t.name,
    city: t.addrCity ?? "",
    state: t.addrState ?? "",
    deity: t.deity ?? "",
    lat: t.lat,
    lon: t.lon,
    famous: false,
    distanceKm: Math.round(haversineDistance(userLat, userLon, t.lat, t.lon)),
    source,
  };
}

// ─── Exports for testing ────────────────────────────────────────────────────

export {
  DEITY_SEARCH_MAP,
  toRad,
  loadStaticTemples,
  deityMatches,
  getSearchTerms,
};
