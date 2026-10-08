/**
 * Dosha computation — determines the five major dosha flags
 * from a Vedic birth chart.
 *
 * Doshas computed:
 *   1. Manglik (Mangal) — Mars in 1st, 2nd, 4th, 7th, 8th, 12th from Lagna or Moon
 *   2. Kaal Sarp — all 7 planets within one half of the Rahu–Ketu axis (by longitude)
 *   3. Sade Sati — transiting Saturn in the 12th, 1st or 2nd sign from the natal Moon
 *   4. Pitra — specific Rahu/Ketu/Saturn combinations
 *   5. Nadi — reported for information only (a matching factor, never flagged)
 */

import type { AstroChart, PlanetPosition } from "./astro-engine";
import { currentSaturnSignIndex } from "./transits";

export interface DoshaFlags {
  manglik: boolean;
  manglikDetails: string;
  kaalSarp: boolean;
  kaalSarpDetails: string;
  sadeSati: boolean;
  sadeSatiDetails: string;
  pitra: boolean;
  pitraDetails: string;
  nadi: boolean;
  nadiDetails: string;
}

// ---------------------------------------------------------------------------
// Nakshatra Nadi mapping (Aadi / Madhya / Antya)
// ---------------------------------------------------------------------------
// Standard Ashtakoota classification. The sequence zig-zags in groups of
// three: Aadi, Madhya, Antya, Antya, Madhya, Aadi, Aadi, Madhya, Antya ...
//   Aadi (Vata):    Ashwini, Ardra, Punarvasu, Uttara Phalguni, Hasta,
//                   Jyeshtha, Mula, Shatabhisha, Purva Bhadrapada
//   Madhya (Pitta): Bharani, Mrigashira, Pushya, Purva Phalguni, Chitra,
//                   Anuradha, Purva Ashadha, Dhanishtha, Uttara Bhadrapada
//   Antya (Kapha):  Krittika, Rohini, Ashlesha, Magha, Swati, Vishakha,
//                   Uttara Ashadha, Shravana, Revati
export const NAKSHATRA_NADI: string[] = [
  "Aadi", "Madhya", "Antya",   // Ashwini, Bharani, Krittika
  "Antya", "Madhya", "Aadi",   // Rohini, Mrigashira, Ardra
  "Aadi", "Madhya", "Antya",   // Punarvasu, Pushya, Ashlesha
  "Antya", "Madhya", "Aadi",   // Magha, Purva Phalguni, Uttara Phalguni
  "Aadi", "Madhya", "Antya",   // Hasta, Chitra, Swati
  "Antya", "Madhya", "Aadi",   // Vishakha, Anuradha, Jyeshtha
  "Aadi", "Madhya", "Antya",   // Mula, Purva Ashadha, Uttara Ashadha
  "Antya", "Madhya", "Aadi",   // Shravana, Dhanishtha, Shatabhisha
  "Aadi", "Madhya", "Antya",   // Purva Bhadrapada, Uttara Bhadrapada, Revati
];

const SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

function getSignIndex(lon: number): number {
  return Math.floor(((lon % 360) + 360) % 360 / 30);
}


// ---------------------------------------------------------------------------
// Dosha: Manglik
// ---------------------------------------------------------------------------

export interface ManglikAnalysis {
  present: boolean;
  fromLagna: boolean;
  fromMoon: boolean;
  fromVenus: boolean;
  marsSign: string;
  houseFromLagna: number;
  houseFromMoon: number;
  houseFromVenus: number;
  /** Commonly cited mitigating factors found in the chart (traditions differ). */
  mitigations: string[];
  details: string;
}

const MANGLIK_HOUSES = [1, 2, 4, 7, 8, 12];

/** House (1-12) of `lon` counted from the sign of `fromLon` (whole-sign). */
function houseFrom(fromLon: number, lon: number): number {
  return ((getSignIndex(lon) - getSignIndex(fromLon) + 12) % 12) + 1;
}

/**
 * Manglik (Kuja) dosha: Mars in the 1st, 2nd, 4th, 7th, 8th or 12th house
 * counted from the Lagna or the Moon (Venus reported for reference, as some
 * South Indian traditions also count from Venus).
 */
export function analyzeManglik(chart: AstroChart): ManglikAnalysis {
  const mars = chart.planets.find((p) => p.planet === "Mars")!;
  const moon = chart.planets.find((p) => p.planet === "Moon")!;
  const venus = chart.planets.find((p) => p.planet === "Venus")!;
  const jupiter = chart.planets.find((p) => p.planet === "Jupiter")!;

  const hL = houseFrom(chart.ascendant.longitude, mars.longitude);
  const hM = houseFrom(moon.longitude, mars.longitude);
  const hV = houseFrom(venus.longitude, mars.longitude);
  const fromLagna = MANGLIK_HOUSES.includes(hL);
  const fromMoon = MANGLIK_HOUSES.includes(hM);
  const fromVenus = MANGLIK_HOUSES.includes(hV);

  const mitigations: string[] = [];
  const marsSign = getSignIndex(mars.longitude);
  if (marsSign === 0 || marsSign === 7) mitigations.push(`Mars is in its own sign (${SIGNS[marsSign]})`);
  if (marsSign === 9) mitigations.push("Mars is exalted in Capricorn");
  if (getSignIndex(jupiter.longitude) === marsSign) mitigations.push("Jupiter is conjunct Mars");

  const present = fromLagna || fromMoon;
  const sources = [fromLagna && `house ${hL} from Lagna`, fromMoon && `house ${hM} from Moon`].filter(Boolean);
  const details = present
    ? `Mars in ${SIGNS[marsSign]} falls in ${sources.join(" and ")}${mitigations.length ? `. Mitigating factors: ${mitigations.join("; ")}` : ""}`
    : `Mars in ${SIGNS[marsSign]} is in house ${hL} from Lagna and house ${hM} from Moon — not a Manglik position`;

  return {
    present,
    fromLagna,
    fromMoon,
    fromVenus,
    marsSign: SIGNS[marsSign],
    houseFromLagna: hL,
    houseFromMoon: hM,
    houseFromVenus: hV,
    mitigations,
    details,
  };
}

function computeManglik(chart: AstroChart): { present: boolean; details: string } {
  const a = analyzeManglik(chart);
  return { present: a.present, details: a.details };
}

// ---------------------------------------------------------------------------
// Dosha: Kaal Sarp
// ---------------------------------------------------------------------------

/** The 12 named Kaal Sarp yogas, by the house Rahu occupies from the Lagna. */
const KAAL_SARP_NAMES = [
  "Anant", "Kulik", "Vasuki", "Shankhpal", "Padma", "Mahapadma",
  "Takshak", "Karkotak", "Shankhachud", "Ghatak", "Vishdhar", "Sheshnag",
];

export interface KaalSarpAnalysis {
  /** All seven planets lie on one side of the Rahu-Ketu axis. */
  present: boolean;
  /** Exactly one planet lies outside the hemmed half (often called partial). */
  partial: boolean;
  name: string | null;
  rahuHouse: number;
  rahuSign: string;
  ketuSign: string;
  outside: string[];
  details: string;
}

/**
 * Kaal Sarp: all seven planets (Sun to Saturn) within one 180° half of the
 * zodiac bounded by Rahu and Ketu, measured by longitude.
 */
export function analyzeKaalSarp(chart: AstroChart): KaalSarpAnalysis {
  const rahu = chart.planets.find((p) => p.planet === "Rahu")!;
  const ketu = chart.planets.find((p) => p.planet === "Ketu")!;
  const seven = chart.planets.filter((p) =>
    ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"].includes(p.planet),
  );

  // Arc from Rahu going forward in the zodiac (0-360).
  const arc = (p: PlanetPosition) => (((p.longitude - rahu.longitude) % 360) + 360) % 360;
  const firstHalf = seven.filter((p) => arc(p) < 180);   // Rahu -> Ketu
  const secondHalf = seven.filter((p) => arc(p) >= 180); // Ketu -> Rahu

  const rahuHouse = houseFrom(chart.ascendant.longitude, rahu.longitude);
  let present = false;
  let partial = false;
  let outside: string[] = [];

  if (secondHalf.length === 0 || firstHalf.length === 0) {
    present = true;
  } else if (secondHalf.length === 1 || firstHalf.length === 1) {
    partial = true;
    const lone = secondHalf.length === 1 ? secondHalf : firstHalf;
    outside = lone.map((p) => p.planet);
  } else {
    outside = (firstHalf.length < secondHalf.length ? firstHalf : secondHalf).map((p) => p.planet);
  }

  const name = present || partial ? KAAL_SARP_NAMES[rahuHouse - 1] : null;
  const details = present
    ? `All seven planets are hemmed between Rahu (${rahu.sign}) and Ketu (${ketu.sign}) — ${name} Kaal Sarp (Rahu in house ${rahuHouse} from Lagna)`
    : partial
      ? `Partial: only ${outside.join(", ")} lies outside the Rahu (${rahu.sign}) – Ketu (${ketu.sign}) axis`
      : `Planets fall on both sides of the Rahu (${rahu.sign}) – Ketu (${ketu.sign}) axis — no Kaal Sarp`;

  return { present, partial, name, rahuHouse, rahuSign: rahu.sign, ketuSign: ketu.sign, outside, details };
}

function computeKaalSarp(chart: AstroChart): { present: boolean; details: string } {
  const a = analyzeKaalSarp(chart);
  return { present: a.present, details: a.details };
}

// ---------------------------------------------------------------------------
// Dosha: Sade Sati
// ---------------------------------------------------------------------------

/**
 * Sade Sati right now: *transiting* Saturn in the 12th, 1st or 2nd sign from
 * the natal Moon sign. (Natal Saturn is irrelevant to Sade Sati.)
 */
function computeSadeSati(chart: AstroChart): { present: boolean; details: string } {
  const moon = chart.planets.find((p) => p.planet === "Moon");
  if (!moon) return { present: false, details: "Moon not found" };

  const moonSign = getSignIndex(moon.longitude);
  const saturnSign = currentSaturnSignIndex();
  const d = (saturnSign - moonSign + 12) % 12;

  const phase = d === 11 ? "rising (Saturn in 12th from Moon)"
    : d === 0 ? "peak (Saturn over the Moon sign)"
    : d === 1 ? "setting (Saturn in 2nd from Moon)"
    : null;

  const details = phase
    ? `Transiting Saturn in ${SIGNS[saturnSign]}, natal Moon in ${SIGNS[moonSign]} — Sade Sati ${phase}`
    : `Transiting Saturn in ${SIGNS[saturnSign]}, natal Moon in ${SIGNS[moonSign]} — no Sade Sati now`;

  return { present: phase !== null, details };
}

// ---------------------------------------------------------------------------
// Dosha: Pitra
// ---------------------------------------------------------------------------

function computePitra(chart: AstroChart): { present: boolean; details: string } {
  const rahu = chart.planets.find((p) => p.planet === "Rahu");
  const saturn = chart.planets.find((p) => p.planet === "Saturn");
  const sun = chart.planets.find((p) => p.planet === "Sun");
  const ketu = chart.planets.find((p) => p.planet === "Ketu");

  if (!rahu || !saturn || !sun) {
    return { present: false, details: "Required planets not found" };
  }

  const reasons: string[] = [];

  // Pitra Dosha indicators:
  // 1. Rahu in 1st, 5th, or 9th house
  if ([1, 5, 9].includes(rahu.house)) {
    reasons.push(`Rahu in house ${rahu.house}`);
  }

  // 2. Sun-Rahu conjunction (within same sign)
  if (getSignIndex(sun.longitude) === getSignIndex(rahu.longitude)) {
    reasons.push("Sun-Rahu conjunction");
  }

  // 3. Sun in 9th house (afflicts father house)
  if (sun.house === 9) {
    reasons.push("Sun in 9th house");
  }

  // 4. Saturn-Sun conjunction or aspect
  if (getSignIndex(sun.longitude) === getSignIndex(saturn.longitude)) {
    reasons.push("Sun-Saturn conjunction");
  }

  // 5. Ketu in 5th or 9th house
  if (ketu && [5, 9].includes(ketu.house)) {
    reasons.push(`Ketu in house ${ketu.house}`);
  }

  const details = reasons.length > 0
    ? `Indicators: ${reasons.join("; ")}`
    : "No Pitra Dosha indicators found";

  return { present: reasons.length > 0, details };
}

// ---------------------------------------------------------------------------
// Dosha: Nadi
// ---------------------------------------------------------------------------

/**
 * Nadi is a compatibility (Ashtakoota) factor: Nadi dosha exists only when
 * both partners share the same Nadi. For a single chart we report the Nadi
 * type and never flag a dosha.
 */
function computeNadi(chart: AstroChart): { present: boolean; details: string } {
  const moon = chart.planets.find((p) => p.planet === "Moon");
  if (!moon) return { present: false, details: "Moon not found" };

  const nakIdx = Math.floor((((moon.longitude % 360) + 360) % 360) / (360 / 27));
  const nadi = NAKSHATRA_NADI[nakIdx];
  return {
    present: false,
    details: `Moon in ${moon.nakshatra} — ${nadi} Nadi. Nadi dosha applies only in marriage matching, when both partners share the same Nadi.`,
  };
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function computeDoshas(chart: AstroChart): DoshaFlags {
  const manglik = computeManglik(chart);
  const kaalSarp = computeKaalSarp(chart);
  const sadeSati = computeSadeSati(chart);
  const pitra = computePitra(chart);
  const nadi = computeNadi(chart);

  return {
    manglik: manglik.present,
    manglikDetails: manglik.details,
    kaalSarp: kaalSarp.present,
    kaalSarpDetails: kaalSarp.details,
    sadeSati: sadeSati.present,
    sadeSatiDetails: sadeSati.details,
    pitra: pitra.present,
    pitraDetails: pitra.details,
    nadi: nadi.present,
    nadiDetails: nadi.details,
  };
}
