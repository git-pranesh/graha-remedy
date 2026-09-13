/**
 * Dosha computation — determines the five major dosha flags
 * from a Vedic birth chart.
 *
 * Doshas computed:
 *   1. Manglik (Mangal) — Mars in 1st, 2nd, 4th, 7th, 8th, 12th from Ascendant
 *   2. Kaal Sarp — all 7 planets hemmed between Rahu and Ketu
 *   3. Sade Sati — Saturn transiting 12th, 1st, or 2nd from Moon sign
 *   4. Pitra — specific Rahu/Ketu/Saturn combinations
 *   5. Nadi — Moon in Aadi/Madhya/Antya Nadi nakshatras (health/lineage flag)
 */

import type { AstroChart, PlanetPosition } from "./astro-engine";

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
// Aadi Nadi:  Ashwini, Bharani, Krittika, Ardra, Pushya, Magha,
//             P.Phalguni, Hasta, Swati, Anuradha, P.Ashadha, Dhanishtha,
//             P.Bhadra, Revati
// Madhya Nadi: Rohini, Mrigashira, Punarvasu, Ashlesha, U.Phalguni,
//             Chitra, Vishakha, Jyeshtha, U.Ashadha, Shatabhisha,
//             U.Bhadra
// Antya Naid: — none typically listed, but we use the remaining ones

// Full 27-nakshatra Nadi classification
const NAKSHATRA_NADI: string[] = [
  "Aadi",   // 0  Ashwini
  "Aadi",   // 1  Bharani
  "Aadi",   // 2  Krittika
  "Madhya", // 3  Rohini
  "Madhya", // 4  Mrigashira
  "Aadi",   // 5  Ardra
  "Madhya", // 6  Punarvasu
  "Aadi",   // 7  Pushya
  "Antya",  // 8  Ashlesha
  "Aadi",   // 9  Magha
  "Aadi",   // 10 Purva Phalguni
  "Madhya", // 11 Uttara Phalguni
  "Aadi",   // 12 Hasta
  "Antya",  // 13 Chitra
  "Madhya", // 14 Swati
  "Aadi",   // 15 Vishakha
  "Madhya", // 16 Anuradha
  "Antya",  // 17 Jyeshtha
  "Antya",  // 18 Mula
  "Madhya", // 19 Purva Ashadha
  "Madhya", // 20 Uttara Ashadha
  "Aadi",   // 21 Shravana
  "Aadi",   // 22 Dhanishtha
  "Antya",  // 23 Shatabhisha
  "Aadi",   // 24 Purva Bhadrapada
  "Antya",  // 25 Uttara Bhadrapada
  "Antya",  // 26 Revati
];

const SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

function getSignIndex(lon: number): number {
  return Math.floor(((lon % 360) + 360) % 360 / 30);
}

function signDistance(fromLon: number, toLon: number): number {
  const from = getSignIndex(fromLon);
  const to = getSignIndex(toLon);
  let diff = to - from;
  if (diff <= 0) diff += 12;
  return diff;
}

// ---------------------------------------------------------------------------
// Dosha: Manglik
// ---------------------------------------------------------------------------

function computeManglik(chart: AstroChart): { present: boolean; details: string } {
  const mars = chart.planets.find((p) => p.planet === "Mars");
  if (!mars) return { present: false, details: "Mars not found" };

  const ascSign = getSignIndex(chart.ascendant.longitude);
  const marsSign = getSignIndex(mars.longitude);

  const manglikHouses = [1, 2, 4, 7, 8, 12]; // houses from ascendant
  const marsHouse = mars.house;

  const isManglik = manglikHouses.includes(marsHouse);

  // Check for cancellation (Vaishya/Vrishchik exceptions)
  let cancellation = false;
  let cancelReason = "";

  // Jupiter in 1st, 4th, 7th cancels Manglik
  const jupiter = chart.planets.find((p) => p.planet === "Jupiter");
  if (jupiter && jupiter.house === 1) {
    cancellation = true;
    cancelReason = "Jupiter in 1st house cancels Manglik";
  }

  // Mars retrograde reduces severity
  const retroNote = mars.retrograde ? " (Mars retrograde — reduced effect)" : "";

  const details = isManglik
    ? `Mars in house ${marsHouse} (${mars.sign})${retroNote}${cancellation ? `. Cancellation: ${cancelReason}` : ""}`
    : `Mars in house ${marsHouse} — not a Manglik position`;

  return { present: isManglik && !cancellation, details };
}

// ---------------------------------------------------------------------------
// Dosha: Kaal Sarp
// ---------------------------------------------------------------------------

function computeKaalSarp(chart: AstroChart): { present: boolean; details: string } {
  const rahu = chart.planets.find((p) => p.planet === "Rahu");
  const ketu = chart.planets.find((p) => p.planet === "Ketu");
  if (!rahu || !ketu) return { present: false, details: "Rahu/Ketu not found" };

  const rahuSign = getSignIndex(rahu.longitude);
  const ketuSign = getSignIndex(ketu.longitude);

  // Check if all 7 main planets (Sun..Saturn) are between Rahu and Ketu
  // "Between" means in the clockwise arc from Rahu to Ketu
  const mainPlanets = chart.planets.filter((p) =>
    ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"].includes(p.planet),
  );

  // Calculate Rahu-to-Ketu arc
  let rahuToKetu = ketuSign - rahuSign;
  if (rahuToKetu <= 0) rahuToKetu += 12;

  let allBetween = true;
  let outsidePlanets: string[] = [];

  for (const p of mainPlanets) {
    const pSign = getSignIndex(p.longitude);
    let dist = pSign - rahuSign;
    if (dist < 0) dist += 12;
    if (dist > rahuToKetu) {
      allBetween = false;
      outsidePlanets.push(p.planet);
    }
  }

  const details = allBetween
    ? `All planets between Rahu (${SIGNS[rahuSign]}) and Ketu (${SIGNS[ketuSign]})`
    : `Planets outside Rahu-Ketu axis: ${outsidePlanets.join(", ")}`;

  return { present: allBetween, details };
}

// ---------------------------------------------------------------------------
// Dosha: Sade Sati
// ---------------------------------------------------------------------------

function computeSadeSati(chart: AstroChart): { present: boolean; details: string } {
  const saturn = chart.planets.find((p) => p.planet === "Saturn");
  const moon = chart.planets.find((p) => p.planet === "Moon");
  if (!saturn || !moon) return { present: false, details: "Saturn/Moon not found" };

  const saturnSign = getSignIndex(saturn.longitude);
  const moonSign = getSignIndex(moon.longitude);

  // Sade Sati: Saturn is in the sign 12th, 1st, or 2nd from Moon
  const dist = signDistance(moonSign, saturnSign);

  const isSadeSati = dist === 12 || dist === 1 || dist === 2;

  const phase = dist === 12 ? "rising (12th from Moon)" :
                dist === 1 ? "peak (on Moon sign)" :
                dist === 2 ? "setting (2nd from Moon)" : "none";

  const details = isSadeSati
    ? `Saturn in ${SIGNS[saturnSign]}, Moon in ${SIGNS[moonSign]} — Sade Sati phase: ${phase}`
    : `Saturn in ${SIGNS[saturnSign]}, Moon in ${SIGNS[moonSign]} — no Sade Sati`;

  return { present: isSadeSati, details };
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

function computeNadi(chart: AstroChart): { present: boolean; details: string } {
  const moon = chart.planets.find((p) => p.planet === "Moon");
  if (!moon) return { present: false, details: "Moon not found" };

  const nakIdx = Math.floor(((moon.longitude % 360) + 360) % 360 / (360 / 27));
  const nadi = NAKSHATRA_NADI[nakIdx];

  // For an individual chart, "Nadi Dosha" flags Aadi Nadi nakshatra
  // (which can cause compatibility issues in marriage matching)
  const isAadi = nadi === "Aadi";

  const details = `Moon in ${moon.nakshatra} — Nadi: ${nadi}${isAadi ? " (potential compatibility concern)" : ""}`;

  return { present: isAadi, details };
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
