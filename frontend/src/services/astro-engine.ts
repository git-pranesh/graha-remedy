/**
 * Astro Engine — core Swiss Ephemeris calculations for Vedic (sidereal) astrology.
 * Uses @swisseph/node for precision and Lahiri Ayanamsha.
 */

import {
  julianDay,
  calculatePosition,
  calculateHouses,
  getAyanamsa,
  close,
  Planet,
  LunarPoint,
  HouseSystem,
  CalculationFlag,
  type PlanetaryPosition,
  type HouseData,
} from "@swisseph/node";
import { initAyanamsa } from "./ayanamsa";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const SIDEREAL_FLAGS =
  CalculationFlag.SwissEphemeris | CalculationFlag.Speed | CalculationFlag.Sidereal;
// 2 | 256 | 65536 = 65794

const SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
] as const;

const NAKSHATRAS = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
  "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
  "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishtha", "Shatabhisha",
  "Purva Bhadrapada", "Uttara Bhadrapada", "Revati",
] as const;

const NAKSHATRA_LORDS = [
  "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu",
  "Jupiter", "Saturn", "Mercury", "Ketu", "Venus", "Sun",
  "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury",
  "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu",
  "Jupiter", "Saturn", "Mercury",
] as const;

// Vimshottari Dasha periods in years for each planet (in nakshatra lord order)
const DASHA_YEARS: Record<string, number> = {
  Ketu: 7,
  Venus: 20,
  Sun: 6,
  Moon: 10,
  Mars: 7,
  Rahu: 18,
  Jupiter: 16,
  Saturn: 19,
  Mercury: 17,
};

const DASHA_SEQUENCE = [
  "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu",
  "Jupiter", "Saturn", "Mercury",
];

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

export interface PlanetPosition {
  planet: string;
  longitude: number;      // sidereal ecliptic longitude (0-360)
  latitude: number;
  sign: string;
  signDegree: string;     // e.g. "14°25'"
  house: number;          // 1-12
  retrograde: boolean;
  nakshatra?: string;
  nakshatraPada?: number;
  nakshatraLord?: string;
}

export interface HouseCusps {
  ascendant: number;      // sidereal
  mc: number;             // sidereal
  cusps: number[];        // sidereal, 1-indexed
}

export interface VimshottariDasha {
  moonNakshatra: string;
  moonNakshatraPada: number;
  mahadashaLord: string;
  balanceYears: number;           // years remaining in current mahadasha
  mahadashaStart: string;         // ISO date
  mahadashaEnd: string;           // ISO date
  currentAntardasha: string;      // currently running antardasha lord
  antardashaStart: string;
  antardashaEnd: string;
  sequence: Array<{
    lord: string;
    start: string;
    end: string;
    antardashas: Array<{
      lord: string;
      start: string;
      end: string;
    }>;
  }>;
}

export interface VideshYoga {
  /** Whether foreign settlement is indicated in the chart. */
  indicated: boolean;
  /** Confidence: strong, moderate, weak */
  strength: "strong" | "moderate" | "weak";
  /** List of detected yoga indicators. */
  indicators: string[];
  /** Plain-language explanation. */
  explanation: string;
}

export interface AstroChart {
  planets: PlanetPosition[];
  houses: HouseCusps;
  ayanamsa: number;
  ascendant: {
    longitude: number;
    sign: string;
    signDegree: string;
    nakshatra: string;
    nakshatraPada: number;
  };
  videshYoga: VideshYoga;
}

// ---------------------------------------------------------------------------
// Initialisation — call once per process
// ---------------------------------------------------------------------------

let initialised = false;

function init() {
  if (!initialised) {
    initAyanamsa();
    initialised = true;
  }
}

export function cleanup() {
  close();
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function longitudeToSign(lon: number): string {
  const idx = Math.floor(((lon % 360) + 360) % 360 / 30);
  return SIGNS[idx];
}

export function formatDegMin(lon: number): string {
  const deg = Math.floor(lon % 30);
  const min = Math.floor((lon % 1) * 60);
  return `${deg}°${String(min).padStart(2, "0")}'`;
}

export function longitudeToNakshatra(lon: number): { nakshatra: string; pada: number; lord: string } {
  const normalized = ((lon % 360) + 360) % 360;
  const nakIndex = Math.floor(normalized / (360 / 27));
  const pada = Math.floor((normalized % (360 / 27)) / (360 / 108)) + 1;
  return {
    nakshatra: NAKSHATRAS[nakIndex],
    pada,
    lord: NAKSHATRA_LORDS[nakIndex],
  };
}

/**
 * Determine which house a planet falls in given a sidereal longitude
 * and sidereal house cusps.
 */
function whichHouse(planetLon: number, ascendantLon: number, cusps: number[]): number {
  // For whole-sign houses from ascendant
  const ascSign = Math.floor(((ascendantLon % 360) + 360) % 360 / 30);
  const planetSign = Math.floor(((planetLon % 360) + 360) % 360 / 30);
  let house = planetSign - ascSign + 1;
  if (house <= 0) house += 12;
  return house;
}

// ---------------------------------------------------------------------------
// Main calculation
// ---------------------------------------------------------------------------

/**
 * Detect Videsh Yoga (foreign settlement indicators) from the chart.
 * Based on classical BPHS combinations:
 * - Rahu in 12th, 7th, 9th, or 10th house
 * - 12th lord in 1st, 7th, or 9th house
 * - Moon-Rahu conjunction in dusthana
 * - Weak 4th house + strong 12th house
 */
function detectVideshYoga(chart: { planets: PlanetPosition[]; ascendant: { sign: string } }): VideshYoga {
  const indicators: string[] = [];
  let score = 0;

  const rahu = chart.planets.find((p) => p.planet === "Rahu");
  const moon = chart.planets.find((p) => p.planet === "Moon");
  const ketu = chart.planets.find((p) => p.planet === "Ketu");

  // Rahu in key houses
  if (rahu) {
    if (rahu.house === 12) { indicators.push("Rahu in 12th house — strongest indicator of foreign settlement"); score += 3; }
    else if (rahu.house === 7) { indicators.push("Rahu in 7th house — relocation through marriage or partnership"); score += 2; }
    else if (rahu.house === 9) { indicators.push("Rahu in 9th house — foreign education or spiritual migration"); score += 2; }
    else if (rahu.house === 10) { indicators.push("Rahu in 10th house — career-driven international relocation"); score += 2; }
  }

  // 12th lord in key houses
  const signs = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
  const SIGN_LORDS: Record<string, string> = {
    Aries:"mars",Taurus:"venus",Gemini:"mercury",Cancer:"moon",Leo:"sun",Virgo:"mercury",
    Libra:"venus",Scorpio:"mars",Sagittarius:"jupiter",Capricorn:"saturn",Aquarius:"saturn",Pisces:"jupiter"
  };
  const ascIdx = signs.indexOf(chart.ascendant.sign);
  const house12Sign = signs[(ascIdx + 11) % 12];
  const house12Lord = SIGN_LORDS[house12Sign];
  const planetsInHouse = (h: number) => chart.planets.filter((p) => p.house === h && !["Rahu","Ketu"].includes(p.planet));
  const house1Lord = SIGN_LORDS[chart.ascendant.sign];

  if (house12Lord) {
    // Check if 12th lord is in 1st, 7th, or 9th
    const lord12 = chart.planets.find((p) => p.planet.toLowerCase() === house12Lord);
    if (lord12 && [1, 7, 9].includes(lord12.house)) {
      indicators.push(`12th lord ${house12Lord} in house ${lord12.house} — foreign settlement pattern`);
      score += 2;
    }
  }

  // Moon-Rahu conjunction
  if (moon && rahu && moon.sign === rahu.sign) {
    indicators.push("Moon-Rahu conjunction — emotional pull toward foreign lands");
    score += 1;
  }

  // Moon-Rahu in dusthana
  if (moon && rahu && moon.sign === rahu.sign && [6,8,12].includes(moon.house)) {
    indicators.push("Moon-Rahu in dusthana — strong detachment from homeland");
    score += 1;
  }

  // Multiple planets in 12th
  const planets12 = chart.planets.filter((p) => p.house === 12 && !["Rahu","Ketu"].includes(p.planet));
  if (planets12.length >= 3) {
    indicators.push(`${planets12.length} planets in 12th house — powerful foreign residence yoga`);
    score += 2;
  }

  let strength: "strong" | "moderate" | "weak" = "weak";
  if (score >= 4) strength = "strong";
  else if (score >= 2) strength = "moderate";

  const explanation = indicators.length > 0
    ? `Your chart shows ${indicators.length} Videsh Yoga indicator${indicators.length > 1 ? "s" : ""} suggesting foreign settlement potential. ${strength === "strong" ? "This is a strong pattern." : strength === "moderate" ? "This is a moderate pattern." : "This is a mild indicator."}`
    : "No strong foreign settlement indicators found in your chart. You may maintain strong ties to your birthplace.";

  return {
    indicated: indicators.length > 0,
    strength,
    indicators,
    explanation,
  };
}

export function calculateBirthChart(
  year: number,
  month: number,
  day: number,
  hours: number,       // UTC decimal hours
  latitude: number,
  longitude: number,
): AstroChart {
  init();

  const jd = julianDay(year, month, day, hours);
  const ayanamsa = getAyanamsa(jd);

  // --- Planets ---
  const planetsList: Array<{ name: string; id: Planet | LunarPoint }> = [
    { name: "Sun", id: Planet.Sun },
    { name: "Moon", id: Planet.Moon },
    { name: "Mercury", id: Planet.Mercury },
    { name: "Venus", id: Planet.Venus },
    { name: "Mars", id: Planet.Mars },
    { name: "Jupiter", id: Planet.Jupiter },
    { name: "Saturn", id: Planet.Saturn },
    { name: "Rahu", id: LunarPoint.MeanNode },
    { name: "Ketu", id: LunarPoint.MeanNode }, // Ketu = Rahu + 180°
  ];

  const houseData: HouseData = calculateHouses(jd, latitude, longitude, HouseSystem.WholeSign);

  // Sidereal house cusps
  const siderealAsc = ((houseData.ascendant - ayanamsa) % 360 + 360) % 360;
  const siderealCusps: number[] = [0]; // index 0 unused
  for (let i = 1; i <= 12; i++) {
    const tropCusp = houseData.cusps[i];
    if (tropCusp !== undefined) {
      siderealCusps.push(((tropCusp - ayanamsa) % 360 + 360) % 360);
    } else {
      // Derive from ascendant for whole-sign
      siderealCusps.push(((siderealAsc + (i - 1) * 30) % 360));
    }
  }

  const planetPositions: PlanetPosition[] = [];

  for (const p of planetsList) {
    const pos: PlanetaryPosition = calculatePosition(jd, p.id, SIDEREAL_FLAGS);
    let siderealLon = ((pos.longitude) % 360 + 360) % 360;

    // Ketu is 180° from Rahu
    if (p.name === "Ketu") {
      siderealLon = (siderealLon + 180) % 360;
    }

    const retrograde = pos.longitudeSpeed < 0;
    const sign = longitudeToSign(siderealLon);
    const signDegree = formatDegMin(siderealLon);
    const house = whichHouse(siderealLon, siderealAsc, siderealCusps);
    const nak = longitudeToNakshatra(siderealLon);

    planetPositions.push({
      planet: p.name,
      longitude: siderealLon,
      latitude: pos.latitude,
      sign,
      signDegree,
      house,
      retrograde,
      nakshatra: nak.nakshatra,
      nakshatraPada: nak.pada,
      nakshatraLord: nak.lord,
    });
  }

  // --- Ascendant ---
  const ascNak = longitudeToNakshatra(siderealAsc);

  // --- Videsh Yoga Detection ---
  const videshYoga = detectVideshYoga({
    planets: planetPositions,
    ascendant: { sign: longitudeToSign(siderealAsc) },
  });

  return {
    planets: planetPositions,
    houses: {
      ascendant: siderealAsc,
      mc: ((houseData.mc - ayanamsa) % 360 + 360) % 360,
      cusps: siderealCusps,
    },
    ayanamsa,
    ascendant: {
      longitude: siderealAsc,
      sign: longitudeToSign(siderealAsc),
      signDegree: formatDegMin(siderealAsc),
      nakshatra: ascNak.nakshatra,
      nakshatraPada: ascNak.pada,
    },
    videshYoga,
  };
}

// ---------------------------------------------------------------------------
// Vimshottari Dasha
// ---------------------------------------------------------------------------

/**
 * Compute the full Vimshottari Dasha cycle from the Moon's nakshatra.
 * Returns the current mahadasha, antardasha, and the full sequence.
 */
export function computeVimshottariDasha(
  chart: AstroChart,
  birthYear: number,
  birthMonth: number,
  birthDay: number,
  birthHourUTC: number,
): VimshottariDasha {
  init();

  // Find Moon
  const moon = chart.planets.find((p) => p.planet === "Moon")!;
  const moonNak = moon.nakshatra!;
  const moonPada = moon.nakshatraPada!;
  const moonNakLord = moon.nakshatraLord!;

  // Birth JD
  const birthJD = julianDay(birthYear, birthMonth, birthDay, birthHourUTC);

  // Remaining portion of the first dasha lord's cycle
  // The balance = (total years of nakshatra lord - fraction elapsed) * 365.25
  // Fraction elapsed = moon longitude within the nakshatra / (360/27)
  const moonNormLon = ((moon.longitude % 360) + 360) % 360;
  const nakSpan = 360 / 27; // ~13.333°
  const nakFraction = (moonNormLon % nakSpan) / nakSpan;
  const totalDashaYears = DASHA_YEARS[moonNakLord];
  const balanceFraction = 1 - nakFraction;
  const balanceDays = balanceFraction * totalDashaYears * 365.25;

  // Start of first (current) mahadasha = birth - elapsed portion
  const elapsedDays = nakFraction * totalDashaYears * 365.25;
  const firstDashaStartJD = birthJD - elapsedDays;
  const firstDashaEndJD = firstDashaStartJD + totalDashaYears * 365.25;

  // Build the full 120-year cycle starting from the first mahadasha
  const startIdx = DASHA_SEQUENCE.indexOf(moonNakLord);
  const sequence: VimshottariDasha["sequence"] = [];
  let currentJD = firstDashaStartJD;

  for (let cycle = 0; cycle < 2; cycle++) {
    for (let i = 0; i < DASHA_SEQUENCE.length; i++) {
      const lordIdx = (startIdx + i) % DASHA_SEQUENCE.length;
      const lord = DASHA_SEQUENCE[lordIdx];
      const years = DASHA_YEARS[lord];
      const lordDays = years * 365.25;
      const lordStart = currentJD;
      const lordEnd = currentJD + lordDays;

      // Build antardashas for this mahadasha
      const antardashas: VimshottariDasha["sequence"][0]["antardashas"] = [];
      let adJD = lordStart;
      for (let j = 0; j < DASHA_SEQUENCE.length; j++) {
        const adLordIdx = (lordIdx + j) % DASHA_SEQUENCE.length;
        const adLord = DASHA_SEQUENCE[adLordIdx];
        const adFraction = DASHA_YEARS[adLord] / 120;
        const adDays = lordDays * adFraction;
        antardashas.push({
          lord: adLord,
          start: jdToDateStr(adJD),
          end: jdToDateStr(adJD + adDays),
        });
        adJD += adDays;
      }

      sequence.push({
        lord,
        start: jdToDateStr(lordStart),
        end: jdToDateStr(lordEnd),
        antardashas,
      });

      currentJD = lordEnd;

      // Stop after ~120 years or when we've covered enough
      if (cycle === 1 && i >= startIdx) break;
    }
  }

  // Find current mahadasha and antardasha based on today
  const todayJD = julianDay(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    new Date().getDate(),
    new Date().getUTCHours() + new Date().getUTCMinutes() / 60,
  );

  let currentMD = sequence[0];
  let currentAD = currentMD.antardashas[0];

  for (const md of sequence) {
    const mdStart = new Date(md.start).getTime();
    const mdEnd = new Date(md.end).getTime();
    const now = new Date().getTime();

    if (now >= mdStart && now < mdEnd) {
      currentMD = md;
      for (const ad of md.antardashas) {
        const adStart = new Date(ad.start).getTime();
        const adEnd = new Date(ad.end).getTime();
        if (now >= adStart && now < adEnd) {
          currentAD = ad;
          break;
        }
      }
      break;
    }
  }

  // Compute balance years from birth to end of first mahadasha
  const balanceYears = (firstDashaEndJD - birthJD) / 365.25;

  return {
    moonNakshatra: moonNak,
    moonNakshatraPada: moonPada,
    mahadashaLord: moonNakLord,
    balanceYears: Math.round(balanceYears * 100) / 100,
    mahadashaStart: jdToDateStr(firstDashaStartJD),
    mahadashaEnd: jdToDateStr(firstDashaEndJD),
    currentAntardasha: currentAD.lord,
    antardashaStart: currentAD.start,
    antardashaEnd: currentAD.end,
    sequence: sequence.slice(0, 12), // Return first 12 mahadashas (~120 years)
  };
}

function jdToDateStr(jd: number): string {
  const d = new Date((jd - 2440587.5) * 86400000);
  return d.toISOString().split("T")[0];
}
