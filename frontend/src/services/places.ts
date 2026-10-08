/**
 * Offline place search over GeoNames data (CC BY 4.0, https://www.geonames.org).
 * Each result carries its IANA timezone, so no network geocoding is needed.
 * Data is built by scripts/build-places.py.
 */

import data from "../data/places.json";

type PackedPlace = [string, string, string, string, number, number, number, number, string[]];

interface PlacesFile {
  attribution: string;
  countries: Record<string, string>;
  tz: string[];
  places: PackedPlace[];
}

const DB = data as unknown as PlacesFile;

export interface Place {
  name: string;
  region: string;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  timezone: string;
  population: number;
  /** "Name, Region, Country" */
  label: string;
}

export const PLACES_ATTRIBUTION = DB.attribution;

function normalize(s: string): string {
  return s
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9 ,]/g, "")
    .trim();
}

function unpack(p: PackedPlace): Place {
  const [name, , region, cc, lat, lon, tzIdx, pop] = p;
  const country = DB.countries[cc] ?? cc;
  return {
    name,
    region,
    country,
    countryCode: cc,
    latitude: lat,
    longitude: lon,
    timezone: DB.tz[tzIdx],
    population: pop,
    label: [name, region, country].filter(Boolean).join(", "),
  };
}

/**
 * Search places by name prefix. "chennai" or "springfield, illinois" or
 * "london, canada". Results ranked: exact name match, then population.
 */
export function searchPlaces(query: string, limit = 8): Place[] {
  const parts = normalize(query).split(",").map((s) => s.trim()).filter(Boolean);
  if (parts.length === 0 || parts[0].length < 2) return [];
  const [q, ...qualifiers] = parts;

  const matches: Array<{ p: PackedPlace; exact: boolean }> = [];
  for (const p of DB.places) {
    const key = p[1];
    const alts = p[8];
    const nameHit = key.startsWith(q) || alts.some((a) => a.startsWith(q));
    if (!nameHit) continue;
    if (qualifiers.length) {
      const hay = normalize(`${p[2]} ${DB.countries[p[3]] ?? ""} ${p[3]}`);
      if (!qualifiers.every((w) => hay.includes(w))) continue;
    }
    matches.push({ p, exact: key === q || alts.includes(q) });
    if (matches.length >= 400) break; // places are pre-sorted by population
  }
  matches.sort((a, b) => Number(b.exact) - Number(a.exact) || b.p[7] - a.p[7]);
  return matches.slice(0, limit).map((m) => unpack(m.p));
}

/** Best single match for free text such as "Chennai, India". */
export function findPlace(text: string): Place | null {
  return searchPlaces(text, 1)[0] ?? null;
}
