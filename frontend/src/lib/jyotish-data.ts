/**
 * Static Jyotish reference data used by calculator pages.
 * Values are the standard classical assignments (Lahiri / Parashari tradition).
 */

export interface RashiInfo {
  index: number;      // 0-11
  english: string;    // Western name of the sidereal sign
  sanskrit: string;
  hindi: string;
  lord: string;
  start: number;      // sidereal longitude where the sign begins
}

export const RASHIS: RashiInfo[] = [
  { index: 0, english: "Aries", sanskrit: "Mesha", hindi: "मेष", lord: "Mars", start: 0 },
  { index: 1, english: "Taurus", sanskrit: "Vrishabha", hindi: "वृषभ", lord: "Venus", start: 30 },
  { index: 2, english: "Gemini", sanskrit: "Mithuna", hindi: "मिथुन", lord: "Mercury", start: 60 },
  { index: 3, english: "Cancer", sanskrit: "Karka", hindi: "कर्क", lord: "Moon", start: 90 },
  { index: 4, english: "Leo", sanskrit: "Simha", hindi: "सिंह", lord: "Sun", start: 120 },
  { index: 5, english: "Virgo", sanskrit: "Kanya", hindi: "कन्या", lord: "Mercury", start: 150 },
  { index: 6, english: "Libra", sanskrit: "Tula", hindi: "तुला", lord: "Venus", start: 180 },
  { index: 7, english: "Scorpio", sanskrit: "Vrishchika", hindi: "वृश्चिक", lord: "Mars", start: 210 },
  { index: 8, english: "Sagittarius", sanskrit: "Dhanu", hindi: "धनु", lord: "Jupiter", start: 240 },
  { index: 9, english: "Capricorn", sanskrit: "Makara", hindi: "मकर", lord: "Saturn", start: 270 },
  { index: 10, english: "Aquarius", sanskrit: "Kumbha", hindi: "कुंभ", lord: "Saturn", start: 300 },
  { index: 11, english: "Pisces", sanskrit: "Meena", hindi: "मीन", lord: "Jupiter", start: 330 },
];

export function rashiByEnglish(name: string): RashiInfo | undefined {
  return RASHIS.find((r) => r.english === name);
}

export interface NakshatraInfo {
  index: number;      // 0-26
  name: string;
  lord: string;       // Vimshottari lord
  deity: string;
  nadi: "Aadi" | "Madhya" | "Antya";
  start: number;      // sidereal longitude where it begins
}

const NAK_NAMES = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
  "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
  "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishtha", "Shatabhisha",
  "Purva Bhadrapada", "Uttara Bhadrapada", "Revati",
];
const NAK_DEITIES = [
  "Ashwini Kumaras", "Yama", "Agni", "Brahma (Prajapati)", "Soma", "Rudra",
  "Aditi", "Brihaspati", "Nagas (Sarpa)", "Pitris", "Bhaga", "Aryaman",
  "Savitr", "Tvashtr (Vishwakarma)", "Vayu", "Indra and Agni", "Mitra", "Indra",
  "Nirriti", "Apas", "Vishvedevas", "Vishnu", "Eight Vasus", "Varuna",
  "Aja Ekapada", "Ahir Budhnya", "Pushan",
];
export const DASHA_ORDER = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"] as const;
const NADI_PATTERN: NakshatraInfo["nadi"][] = ["Aadi", "Madhya", "Antya", "Antya", "Madhya", "Aadi"];

export const NAKSHATRA_SPAN = 360 / 27; // 13°20'

export const NAKSHATRAS: NakshatraInfo[] = NAK_NAMES.map((name, i) => ({
  index: i,
  name,
  lord: DASHA_ORDER[i % 9],
  deity: NAK_DEITIES[i],
  nadi: NADI_PATTERN[i % 6],
  start: i * NAKSHATRA_SPAN,
}));

/** Vimshottari mahadasha length in years. Total 120. */
export const DASHA_YEARS: Record<string, number> = {
  Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7, Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17,
};

/** The 12 Kaal Sarp yogas by Rahu's house from the Lagna. */
export const KAAL_SARP_TYPES = [
  "Anant", "Kulik", "Vasuki", "Shankhpal", "Padma", "Mahapadma",
  "Takshak", "Karkotak", "Shankhachud", "Ghatak", "Vishdhar", "Sheshnag",
];

/** Format a longitude as D°MM' (within its 30° sign when `withinSign`). */
export function dms(lon: number, withinSign = false): string {
  const v = withinSign ? ((lon % 30) + 30) % 30 : lon;
  let d = Math.floor(v);
  let m = Math.round((v - d) * 60);
  if (m === 60) { d += 1; m = 0; }
  return `${d}°${String(m).padStart(2, "0")}'`;
}

/** Remedy library page for each graha, where one exists. */
export const PLANET_REMEDY_PAGE: Record<string, { href: string; label: string }> = {
  Sun: { href: "/remedies/surya-mantra", label: "Surya (Sun) mantra & remedies" },
  Moon: { href: "/remedies/moon-remedies", label: "Moon (Chandra) remedies" },
  Mars: { href: "/remedies/mangal-mantra", label: "Mangal (Mars) mantra & remedies" },
  Mercury: { href: "/remedies/mercury-planet-remedies", label: "Mercury (Budh) remedies" },
  Jupiter: { href: "/remedies/brihaspati-mantra", label: "Brihaspati (Jupiter) mantra" },
  Venus: { href: "/remedies/shukra-mantra", label: "Shukra (Venus) mantra" },
  Saturn: { href: "/remedies/shani-mantra", label: "Shani (Saturn) mantra & remedies" },
  Rahu: { href: "/remedies/rahu-remedies", label: "Rahu remedies" },
  Ketu: { href: "/remedies/ketu-remedy", label: "Ketu remedies" },
};

/** 1 -> "1st", 2 -> "2nd", 11 -> "11th", 23 -> "23rd". */
export function ordinal(n: number): string {
  const s = n % 100;
  if (s >= 11 && s <= 13) return `${n}th`;
  return `${n}${({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[n % 10] ?? "th"}`;
}
