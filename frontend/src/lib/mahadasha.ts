import fs from "node:fs";
import path from "node:path";
import { DASHA_ORDER, DASHA_YEARS, NAKSHATRAS } from "./jyotish-data";

/** URL slug -> dasha lord, planet data key, and existing remedy library page. */
export const MAHADASHA_PLANETS = [
  { slug: "rahu", lord: "Rahu", key: "rahu", remedy: "rahu-remedies", title: "Rahu" },
  { slug: "ketu", lord: "Ketu", key: "ketu", remedy: "ketu-remedy", title: "Ketu" },
  { slug: "shani", lord: "Saturn", key: "saturn", remedy: "shani-mantra", title: "Shani (Saturn)" },
  { slug: "mercury", lord: "Mercury", key: "mercury", remedy: "mercury-planet-remedies", title: "Mercury (Budh)" },
  { slug: "jupiter", lord: "Jupiter", key: "jupiter", remedy: "brihaspati-mantra", title: "Jupiter (Guru)" },
  { slug: "venus", lord: "Venus", key: "venus", remedy: "shukra-mantra", title: "Venus (Shukra)" },
  { slug: "sun", lord: "Sun", key: "sun", remedy: "surya-mantra", title: "Sun (Surya)" },
  { slug: "moon", lord: "Moon", key: "moon", remedy: "moon-remedies", title: "Moon (Chandra)" },
  { slug: "mars", lord: "Mars", key: "mars", remedy: "mangal-mantra", title: "Mars (Mangal)" },
] as const;

export type MahadashaPlanet = (typeof MAHADASHA_PLANETS)[number];


export function planetBySlug(slug: string): MahadashaPlanet | undefined {
  return MAHADASHA_PLANETS.find((p) => p.slug === slug);
}

/** Planet profile and remedy catalogue from the project's JSON data (same source as the remedy finder). */
export function loadPlanetData(key: string) {
  const root = [path.resolve(process.cwd(), "../data"), path.resolve(process.cwd(), "data")].find((d) => fs.existsSync(d))!;
  const planets = JSON.parse(fs.readFileSync(path.join(root, "planets/planets.json"), "utf8"));
  const remedies = JSON.parse(fs.readFileSync(path.join(root, "remedies/remedies.json"), "utf8"));
  return { planet: planets[key], remedy: remedies[key] } as {
    planet: { name: string; sanskrit: string; element: string; nature: string; day: string; color: string; gemstone: string; bodyParts: string[]; governs: string[]; weaknessCauses: string[] };
    remedy: { mantras: { name: string; practice: string; level: string; reference?: string }[]; fasting: string[]; donations: string[]; deity: string };
  };
}

/** "3 years 2 months 0 days" */
export function fmtSpan(years: number): string {
  const days = Math.round(years * 365.25);
  const y = Math.floor(days / 365.25);
  const rem = days - Math.round(y * 365.25);
  const m = Math.floor(rem / 30.4375);
  const d = Math.round(rem - m * 30.4375);
  return `${y} yr${y === 1 ? "" : "s"} ${m} mo ${d} d`;
}

export function antardashas(lord: string) {
  const Y = DASHA_YEARS[lord];
  const start = DASHA_ORDER.indexOf(lord as (typeof DASHA_ORDER)[number]);
  return Array.from({ length: 9 }, (_, i) => {
    const l = DASHA_ORDER[(start + i) % 9];
    return { lord: l, years: (Y * DASHA_YEARS[l]) / 120 };
  });
}

/** Age window in which `lord`'s mahadasha runs, for each possible first dasha lord (set by birth nakshatra). */
export function ageWindows(lord: string) {
  const Y = DASHA_YEARS[lord];
  const li = DASHA_ORDER.indexOf(lord as (typeof DASHA_ORDER)[number]);
  return DASHA_ORDER.map((first, fi) => {
    // years of full dashas between the first lord (exclusive) and `lord` (exclusive)
    let between = 0;
    for (let k = (fi + 1) % 9; k !== li; k = (k + 1) % 9) { if (k === fi) break; between += DASHA_YEARS[DASHA_ORDER[k]]; }
    if (first === lord) return { first, startMin: 0, startMax: 0, endMin: 0, endMax: Y, first_is_this: true };
    const startMin = between;
    const startMax = between + DASHA_YEARS[first];
    return { first, startMin, startMax, endMin: startMin + Y, endMax: startMax + Y, first_is_this: false };
  });
}

export function nakshatrasOf(lord: string) {
  return NAKSHATRAS.filter((n) => n.lord === lord).map((n) => n.name);
}
