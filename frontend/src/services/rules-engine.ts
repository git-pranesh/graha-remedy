/**
 * Rules Engine — deterministic, pure-logic module that matches
 * afflicted grahas in a user's chart against problem categories,
 * then returns personalised remedy entries with plain-language explanations.
 *
 * NO AI / LLM calls anywhere — 100% rule-based lookup and intersection.
 */

import { readJsonData } from "../utils";
import type { AstroChart, PlanetPosition, VimshottariDasha } from "./astro-engine";
import type { DoshaFlags } from "./dosha";

// ─── Types ──────────────────────────────────────────────────────────────────

export type AfflictionSeverity = "none" | "mild" | "moderate" | "severe";

export interface AfflictionInfo {
  graha: string;
  severity: AfflictionSeverity;
  reasons: string[];
}

export interface RemedyEntry {
  graha: string;
  grahaName: string;
  severity: AfflictionSeverity;
  reasons: string[];
  /** Plain-language explanation of why this graha was flagged. */
  plainExplanation: string;
  /** Short category-specific context line. */
  categoryContext: string;
  remedies: {
    mantras: Array<string | Record<string, any>>;
    /** Transliterated mantra for audio/read-aloud use. */
    mantraTransliteration: string;
    fasting: string[];
    donations: string[];
    /** Step-by-step home puja instructions. */
    pujaSteps: string[];
    temples: string[];
    /** Recommended deity or temple type. */
    deity: string;
    /** Description of deity and associated temple type. */
    deityDescription: string;
  };
}

export interface CategoryResult {
  category: string;
  classicalGrahas: string[];
  afflictedMatched: string[];
  usedFallback: boolean;
  fallbackGraha: string | null;
  remedies: RemedyEntry[];
}

export interface RulesEngineResult {
  categories: CategoryResult[];
  totalRemedies: number;
}

// ─── Static Data ────────────────────────────────────────────────────────────

const CATEGORY_GRAHAS: Record<string, string[]> = {
  health:        ["sun", "moon", "saturn", "mars"],
  finance:       ["jupiter", "venus", "mercury", "saturn"],
  career:        ["sun", "saturn", "jupiter", "mercury"],
  relationships: ["venus", "moon", "mars", "jupiter"],
  litigation:    ["saturn", "mars", "rahu"],
  mental_peace:  ["moon", "jupiter", "ketu", "saturn"],
};

const CATEGORY_HOUSES: Record<string, number[]> = {
  health:        [1, 6, 8],
  finance:       [2, 6, 11],
  career:        [10, 6, 2],
  relationships: [7, 5, 4],
  litigation:    [6, 12, 3],
  mental_peace:  [1, 4, 12],
};


/** Natural karakas (significators) for each life domain. */
const CATEGORY_KARAKAS: Record<string, string[]> = {
  health:        ["sun", "mars", "saturn"],
  finance:       ["jupiter", "venus", "mercury", "mars", "saturn"],
  career:        ["sun", "saturn", "jupiter"],
  relationships: ["venus", "jupiter", "mars"],
  litigation:    ["mars", "saturn", "rahu"],
  mental_peace:  ["moon", "jupiter", "ketu"],
};

/** Human-readable category context: why a graha matters for this life area. */
const CATEGORY_CONTEXT: Record<string, Record<string, string>> = {
  health: {
    sun:     "The Sun governs vitality, heart health, and overall life force.",
    moon:    "The Moon rules the mind, emotions, and physical well-being.",
    saturn:  "Saturn governs chronic conditions, bones, and long-term health.",
    mars:    "Mars rules inflammation, surgery, blood disorders, and accidents.",
  },
  finance: {
    jupiter: "Jupiter governs wealth, prosperity, and financial expansion.",
    venus:   "Venus rules luxury, material comforts, and financial flow.",
    mercury: "Mercury governs business acumen, trade, and financial intellect.",
    saturn:  "Saturn rules delays, restrictions, and financial discipline.",
  },
  career: {
    sun:     "The Sun governs authority, leadership, and professional recognition.",
    saturn:  "Saturn rules career obstacles, delays, and karmic work lessons.",
    jupiter: "Jupiter governs wisdom, mentorship, and career growth.",
    mercury: "Mercury rules communication, intellect, and professional skills.",
  },
  relationships: {
    venus:   "Venus governs love, marriage, romance, and partnership harmony.",
    moon:    "The Moon rules emotional bonds, nurturing, and family ties.",
    mars:    "Mars governs passion, conflict, and assertiveness in relationships.",
    jupiter: "Jupiter rules wisdom, commitment, and spiritual partnerships.",
  },
  litigation: {
    saturn:  "Saturn governs legal matters, justice, and karmic disputes.",
    mars:    "Mars rules conflict, aggression, and adversarial situations.",
    rahu:   "Rahu governs unexpected legal entanglements and foreign disputes.",
  },
  mental_peace: {
    moon:    "The Moon rules the mind, emotional stability, and inner peace.",
    jupiter: "Jupiter governs wisdom, spiritual growth, and mental clarity.",
    ketu:   "Ketu rules detachment, spiritual liberation, and subconscious patterns.",
    saturn:  "Saturn governs discipline, depression, and karmic mental burdens.",
  },
};

const CATEGORY_LABELS: Record<string, string> = {
  health: "health and well-being",
  finance: "financial matters",
  career: "career and profession",
  relationships: "relationships and marriage",
  litigation: "litigation and legal matters",
  mental_peace: "mental peace and spiritual growth",
};

const DEBILITATION: Record<string, string> = {
  sun: "Libra", moon: "Scorpio", mars: "Cancer", mercury: "Pisces",
  jupiter: "Capricorn", venus: "Virgo", saturn: "Aries",
};

/** Exaltation signs — the opposite of debilitation. */
const EXALTATION: Record<string, string> = {
  sun: "Aries", moon: "Taurus", mars: "Capricorn", mercury: "Virgo",
  jupiter: "Cancer", venus: "Pisces", saturn: "Libra",
};

const MALEFICS = new Set(["saturn", "mars", "rahu", "ketu"]);
const BENEFICS = new Set(["jupiter", "venus", "mercury", "moon"]);

const GRAHA_NAMES: Record<string, string> = {
  sun: "Surya (Sun)", moon: "Chandra (Moon)", mars: "Mangal (Mars)",
  mercury: "Budh (Mercury)", jupiter: "Brihaspati (Jupiter)",
  venus: "Shukra (Venus)", saturn: "Shani (Saturn)",
  rahu: "Rahu (North Node)", ketu: "Ketu (South Node)",
};

const SIGN_LORDS: Record<string, string> = {
  Aries: "mars", Taurus: "venus", Gemini: "mercury", Cancer: "moon",
  Leo: "sun", Virgo: "mercury", Libra: "venus", Scorpio: "mars",
  Sagittarius: "jupiter", Capricorn: "saturn", Aquarius: "saturn",
  Pisces: "jupiter",
};

const SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

// ─── Affliction Detection ──────────────────────────────────────────────────

function isDusthana(house: number): boolean {
  return house === 6 || house === 8 || house === 12;
}

function isDebilitated(planet: PlanetPosition): boolean {
  const neecha = DEBILITATION[planet.planet.toLowerCase()];
  return neecha !== undefined && planet.sign === neecha;
}

function maleficConjunctionCount(planet: PlanetPosition, all: PlanetPosition[]): number {
  let count = 0;
  for (const o of all) {
    if (o.planet === planet.planet) continue;
    if (o.sign === planet.sign && MALEFICS.has(o.planet.toLowerCase())) count++;
  }
  return count;
}

function inMaleficOwnedSign(planet: PlanetPosition): boolean {
  const s = planet.sign;
  const map: Record<string, string[]> = { mars: ["Aries", "Scorpio"], saturn: ["Capricorn", "Aquarius"] };
  for (const [lord, signs] of Object.entries(map)) {
    if (signs.includes(s) && planet.planet.toLowerCase() !== lord) return true;
  }
  return false;
}

function doshaTriggered(id: string, doshas: DoshaFlags): boolean {
  const l = id.toLowerCase();
  if (l === "mars" && doshas.manglik) return true;
  if (l === "saturn" && doshas.sadeSati) return true;
  if (l === "rahu" && doshas.kaalSarp) return true;
  if (l === "ketu" && doshas.kaalSarp) return true;
  return false;
}

// ─── Functional Malefics ────────────────────────────────────────────────────
// A planet becomes a "functional malefic" for a specific ascendant if it rules
// a dusthana house (6th, 8th, or 12th) for that ascendant. This is in ADDITION
// to the natural malefic/benefic classification.
//
// Example: For Leo ascendant, Saturn rules the 6th house → functional malefic.
//          For Aries ascendant, Saturn rules the 10th and 11th → NOT functional malefic.

interface FunctionalMaleficInfo {
  graha: string;
  /** Which dusthana houses this planet rules for the user's ascendant. */
  dusthanaHouses: number[];
}

/**
 * Compute which planets are functional malefics for the given ascendant.
 * Returns only planets that rule at least one dusthana house (6, 8, or 12).
 */
function computeFunctionalMalefics(chart: AstroChart): FunctionalMaleficInfo[] {
  const results: FunctionalMaleficInfo[] = [];

  // Check all 12 houses
  for (let house = 1; house <= 12; house++) {
    if (!isDusthana(house)) continue; // Only check 6th, 8th, 12th

    const lord = houseLord(house, chart);
    if (!lord) continue;

    // Check if this lord is already in our results
    const existing = results.find((r) => r.graha === lord);
    if (existing) {
      existing.dusthanaHouses.push(house);
    } else {
      results.push({ graha: lord, dusthanaHouses: [house] });
    }
  }

  return results;
}

function scoreAffliction(
  planet: PlanetPosition, all: PlanetPosition[], doshas: DoshaFlags,
): { score: number; severity: AfflictionSeverity; reasons: string[] } {
  const reasons: string[] = [];
  let score = 0;

  if (planet.retrograde && planet.planet.toLowerCase() !== "rahu" && planet.planet.toLowerCase() !== "ketu") {
    score += 1; reasons.push("retrograde");
  }
  if (isDusthana(planet.house)) {
    score += 1; reasons.push(`in house ${planet.house} (dusthana)`);
  }
  if (isDebilitated(planet)) {
    score += 1; reasons.push(`debilitated in ${planet.sign}`);
  }
  const mf = maleficConjunctionCount(planet, all);
  if (mf >= 2) { score += 1; reasons.push(`conjunct ${mf} malefics`); }
  else if (mf === 1) { score += 0.5; reasons.push("conjunct 1 malefic"); }
  if (inMaleficOwnedSign(planet)) { score += 0.5; reasons.push("in malefic-owned sign"); }
  if (doshaTriggered(planet.planet, doshas)) {
    score += 1;
    if (doshas.manglik && planet.planet.toLowerCase() === "mars") reasons.push("Manglik dosha trigger");
    if (doshas.sadeSati && planet.planet.toLowerCase() === "saturn") reasons.push("Sade Sati trigger");
    if (doshas.kaalSarp && (planet.planet.toLowerCase() === "rahu" || planet.planet.toLowerCase() === "ketu"))
      reasons.push("Kaal Sarp dosha trigger");
  }
  if (BENEFICS.has(planet.planet.toLowerCase()) && isDusthana(planet.house)) {
    score += 0.5; reasons.push("benefic weakened in dusthana");
  }

  let severity: AfflictionSeverity = "none";
  if (score >= 3) severity = "severe";
  else if (score >= 2) severity = "moderate";
  else if (score >= 1) severity = "mild";
  return { score, severity, reasons };
}

export function computeAfflictions(chart: AstroChart, doshas: DoshaFlags): AfflictionInfo[] {
  const all = chart.planets;
  return all
    .map((p) => {
      const { severity, reasons } = scoreAffliction(p, all, doshas);
      return { graha: p.planet.toLowerCase(), severity, reasons };
    })
    .filter((a) => a.severity !== "none");
}

// ─── Plain-Language Explanation ─────────────────────────────────────────────

/**
 * Generate a user-friendly explanation of why a graha is flagged
 * for a given category, in plain English.
 */
function generateExplanation(
  graha: string,
  planet: PlanetPosition | undefined,
  severity: AfflictionSeverity,
  reasons: string[],
  category: string,
  chart: AstroChart,
): string {
  const name = GRAHA_NAMES[graha] ?? graha;
  const sign = planet?.sign ?? "unknown";
  const house = planet?.house ?? 0;
  const retro = planet?.retrograde ?? false;
  const catLabel = CATEGORY_LABELS[category] ?? category;

  // Build the core sentence
  const parts: string[] = [];

  // Opening: state what the graha governs
  const context = CATEGORY_CONTEXT[category]?.[graha];
  if (context) {
    parts.push(context);
  }

  // Chart-specific: where is this graha in the user's chart?
  if (planet) {
    parts.push(
      `In your chart, ${name} sits in ${sign} (house ${house})` +
      (retro ? " and is retrograde" : "") + "."
    );
  }

  // Severity + reasons
  const severityDesc: Record<string, string> = {
    severe: "significantly weakened",
    moderate: "notably afflicted",
    mild: "mildly troubled",
  };
  if (severity !== "none") {
    parts.push(
      `This placement makes ${name} ${severityDesc[severity]},` +
      ` which commonly affects ${catLabel}.`
    );
  }

  // Specific reason detail
  if (reasons.includes("retrograde")) {
    parts.push(`Being retrograde adds an internalised, karmic dimension to its effects.`);
  }
  if (reasons.some((r) => r.includes("dusthana"))) {
    parts.push(`Placement in a dusthana house (6th, 8th, or 12th) creates obstacles and hidden challenges.`);
  }
  if (reasons.some((r) => r.includes("debilitated"))) {
    parts.push(`Being debilitated in ${sign} reduces its ability to protect and support you in this area.`);
  }
  if (reasons.some((r) => r.includes("conjunct"))) {
    parts.push(`Malefic conjunctions compound the difficulties.`);
  }
  if (reasons.some((r) => r.includes("dosha trigger"))) {
    parts.push(`This is an active dosha trigger in your chart, amplifying the challenges.`);
  }

  return parts.join(" ");
}

/**
 * Generate a short category-specific context sentence.
 */
function generateCategoryContext(graha: string, category: string): string {
  return CATEGORY_CONTEXT[category]?.[graha] ?? "";
}

// ─── House Lord ─────────────────────────────────────────────────────────────

function houseLord(houseNum: number, chart: AstroChart): string | null {
  const ascIdx = SIGNS.indexOf(chart.ascendant.sign);
  const houseIdx = (ascIdx + (houseNum - 1)) % 12;
  return SIGN_LORDS[SIGNS[houseIdx]] ?? null;
}

function fallbackGraha(category: string, chart: AstroChart): string | null {
  const houses = CATEGORY_HOUSES[category];
  if (!houses?.length) return null;
  return houseLord(houses[0], chart);
}

// ─── Remedy Data ────────────────────────────────────────────────────────────

let remediesCache: Record<string, any> | null = null;

function loadRemedies(): Record<string, any> {
  if (!remediesCache) {
    remediesCache = readJsonData("remedies") as Record<string, any>;
  }
  return remediesCache;
}

/**
 * Find the planet object from the chart by name (case-insensitive).
 */
function findPlanet(chart: AstroChart, name: string): PlanetPosition | undefined {
  return chart.planets.find((p) => p.planet.toLowerCase() === name.toLowerCase());
}

function getRemedyEntry(
  graha: string,
  severity: AfflictionSeverity,
  reasons: string[],
  category: string,
  chart: AstroChart,
): RemedyEntry | null {
  const remedies = loadRemedies();
  const data = remedies[graha];
  if (!data) return null;

  const planet = findPlanet(chart, graha);
  const explanation = generateExplanation(graha, planet, severity, reasons, category, chart);
  const categoryCtx = generateCategoryContext(graha, category);

  return {
    graha,
    grahaName: GRAHA_NAMES[graha] ?? graha,
    severity,
    reasons,
    plainExplanation: explanation,
    categoryContext: categoryCtx,
    remedies: {
      mantras: data.mantras ?? [],
      mantraTransliteration: data.mantraTransliteration ?? "",
      fasting: data.fasting ?? [],
      donations: data.donations ?? [],
      pujaSteps: data.pujaSteps ?? [],
      temples: data.temples ?? [],
      deity: data.deity ?? "",
      deityDescription: data.deityDescription ?? "",
    },
  };
}


// ─── Neecha Bhanga (Debilitation Cancellation) ─────────────────────────────
// A debilitated planet can have its weakness cancelled by specific conditions.
// If Neecha Bhanga applies, we should NOT flag debilitation as a pure negative.

interface NeechaBhangaResult {
  cancelled: boolean;
  /** Which rule(s) triggered the cancellation. */
  rules: string[];
}

/**
 * Check if Neecha Bhanga applies for a debilitated planet.
 * Implements the first 4 classical rules (computable without Navamsha):
 *   1. Lord of debilitation sign in Kendra (1st, 4th, 7th, 10th) from Lagna or Moon
 *   2. Planet exalted in the debilitation sign is in a Kendra
 *   3. Debilitation sign lord in its own sign or exaltation sign
 *   4. Debilitated planet conjunct with its sign lord or exaltation lord
 */
function checkNeechaBhanga(
  planet: PlanetPosition,
  chart: AstroChart,
): NeechaBhangaResult {
  const rules: string[] = [];
  const graha = planet.planet.toLowerCase();

  // Is this planet actually debilitated?
  const debSign = DEBILITATION[graha];
  if (!debSign || planet.sign !== debSign) {
    return { cancelled: false, rules: [] };
  }

  // Helper: is a sign in Kendra (1st, 4th, 7th, 10th) from the ascendant?
  function inKendraFromAscendant(sign: string): boolean {
    const ascIdx = SIGNS.indexOf(chart.ascendant.sign);
    const signIdx = SIGNS.indexOf(sign);
    const diff = ((signIdx - ascIdx) % 12 + 12) % 12;
    return diff === 0 || diff === 3 || diff === 6 || diff === 9;
  }

  // Helper: is a sign in Kendra from the Moon?
  function inKendraFromMoon(sign: string): boolean {
    const moon = chart.planets.find((p) => p.planet === "Moon");
    if (!moon) return false;
    const moonIdx = SIGNS.indexOf(moon.sign);
    const signIdx = SIGNS.indexOf(sign);
    const diff = ((signIdx - moonIdx) % 12 + 12) % 12;
    return diff === 0 || diff === 3 || diff === 6 || diff === 9;
  }

  // Rule 1: Lord of debilitation sign in Kendra from Lagna or Moon
  const debSignLord = SIGN_LORDS[debSign];
  if (debSignLord) {
    // Find where the debilitation sign lord is placed
    const lordPlanet = chart.planets.find(
      (p) => p.planet.toLowerCase() === debSignLord,
    );
    if (lordPlanet) {
      if (inKendraFromAscendant(lordPlanet.sign)) {
        rules.push(
          `Neecha Bhanga: ${GRAHA_NAMES[debSignLord] ?? debSignLord} (lord of ${debSign}) in Kendra from Lagna`,
        );
      }
      if (inKendraFromMoon(lordPlanet.sign)) {
        rules.push(
          `Neecha Bhanga: ${GRAHA_NAMES[debSignLord] ?? debSignLord} (lord of ${debSign}) in Kendra from Moon`,
        );
      }
    }
  }

  // Rule 2: Planet that would be exalted in debilitation sign is in Kendra
  // Find which planet gets exalted in the debilitation sign
  const exaltLord = Object.entries(EXALTATION).find(
    ([, sign]) => sign === debSign,
  )?.[0];
  if (exaltLord) {
    const exaltPlanet = chart.planets.find(
      (p) => p.planet.toLowerCase() === exaltLord,
    );
    if (exaltPlanet) {
      if (inKendraFromAscendant(exaltPlanet.sign)) {
        rules.push(
          `Neecha Bhanga: ${GRAHA_NAMES[exaltLord] ?? exaltLord} (exalted in ${debSign}) in Kendra from Lagna`,
        );
      }
    }
  }

  // Rule 3: Debilitation sign lord in its own sign or exaltation sign
  if (debSignLord) {
    const lordPlanet = chart.planets.find(
      (p) => p.planet.toLowerCase() === debSignLord,
    );
    if (lordPlanet) {
      const lordOwnSign = Object.entries(SIGN_LORDS).find(
        ([, lord]) => lord === debSignLord,
      )?.[0];
      const lordExaltSign = EXALTATION[debSignLord];

      if (lordPlanet.sign === lordOwnSign) {
        rules.push(
          `Neecha Bhanga: ${GRAHA_NAMES[debSignLord] ?? debSignLord} in own sign (${lordPlanet.sign})`,
        );
      }
      if (lordExaltSign && lordPlanet.sign === lordExaltSign) {
        rules.push(
          `Neecha Bhanga: ${GRAHA_NAMES[debSignLord] ?? debSignLord} in exaltation sign (${lordPlanet.sign})`,
        );
      }
    }
  }

  // Rule 4: Debilitated planet conjunct with its sign lord or exaltation lord
  const ownSign = Object.entries(SIGN_LORDS).find(
    ([, lord]) => lord === graha,
  )?.[0];
  const exaltSign = EXALTATION[graha];

  for (const other of chart.planets) {
    if (other.planet.toLowerCase() === graha) continue;
    // Conjunction = same sign
    if (other.sign === planet.sign) {
      const otherName = other.planet.toLowerCase();
      if (ownSign && otherName === SIGN_LORDS[ownSign]?.toLowerCase()) {
        rules.push(
          `Neecha Bhanga: ${GRAHA_NAMES[otherName] ?? otherName} (lord of ${ownSign}) conjunct ${GRAHA_NAMES[graha] ?? graha}`,
        );
      }
      if (
        exaltSign &&
        otherName === SIGN_LORDS[exaltSign]?.toLowerCase()
      ) {
        rules.push(
          `Neecha Bhanga: ${GRAHA_NAMES[otherName] ?? otherName} (exaltation lord) conjunct ${GRAHA_NAMES[graha] ?? graha}`,
        );
      }
    }
  }

  return { cancelled: rules.length > 0, rules };
}

// ─── Diagnostic Engine ──────────────────────────────────────────────────────
// Scores each graha for a given problem category to find the MOST responsible
// planet. This replaces the old "show all afflicted grahas" approach.

interface DiagnosticScore {
  graha: string;
  totalScore: number;
  /** Breakdown of why this planet scored what it did. */
  factors: string[];
}

/**
 * Score how relevant each graha is to a specific problem category
 * for THIS person's chart. Higher score = more responsible.
 *
 * Scoring factors (weighted by traditional importance):
 *   House lord of relevant house:     +20
 *   Natural karaka of the problem:    +15
 *   Running Mahadasha:               +25
 *   Running Antardasha:              +15
 *   Afflicted in chart:              +15
 *   Severity of affliction:          +10
 *   Functional malefic (later step):  +10
 */
function diagnoseResponsiblePlanets(
  category: string,
  chart: AstroChart,
  doshas: DoshaFlags,
  dasha: VimshottariDasha,
): DiagnosticScore[] {
  const relevantHouses = CATEGORY_HOUSES[category] ?? [];
  const karakas = CATEGORY_KARAKAS[category] ?? [];
  const allPlanets = chart.planets;

  // Compute afflictions for all planets
  const afflictions = computeAfflictions(chart, doshas);
  const afflictionMap = new Map(afflictions.map((a) => [a.graha, a]));

  // Compute functional malefics for this ascendant
  const functionalMalefics = computeFunctionalMalefics(chart);
  const functionalMaleficMap = new Map(functionalMalefics.map((fm) => [fm.graha, fm]));

  // Current dasha lords (lowercase for comparison)
  const mdLord = dasha.mahadashaLord.toLowerCase();
  const adLord = dasha.currentAntardasha.toLowerCase();

  const scores: DiagnosticScore[] = [];

  // Score ALL grahas (not just the ones in CATEGORY_GRAHAS)
  // because the house lord might not be in the "classical" list
  const allGrahaNames = new Set([
    ...allPlanets.map((p) => p.planet.toLowerCase()),
    // Also include house lords that might not be in the planet list
    ...relevantHouses.map((h) => houseLord(h, chart)).filter(Boolean) as string[],
  ]);

  for (const graha of allGrahaNames) {
    const factors: string[] = [];
    let totalScore = 0;

    // Factor 1: House lordship (+20)
    // Does this planet own any of the relevant houses for THIS ascendant?
    for (const houseNum of relevantHouses) {
      const lord = houseLord(houseNum, chart);
      if (lord === graha) {
        totalScore += 20;
        factors.push(`Rules house ${houseNum} (${CATEGORY_LABELS[category] ?? category})`);
        break; // Don't double-count if it rules multiple relevant houses
      }
    }

    // Factor 2: Natural karaka (+15)
    if (karakas.includes(graha)) {
      totalScore += 15;
      factors.push(`Natural karaka (significator) of ${CATEGORY_LABELS[category] ?? category}`);
    }

    // Factor 3: Mahadasha activation (+25) — highest weight
    if (graha === mdLord) {
      totalScore += 25;
      factors.push(`Currently running Mahadasha (${dasha.mahadashaLord})`);
    }

    // Factor 4: Antardasha activation (+15)
    if (graha === adLord) {
      totalScore += 15;
      factors.push(`Currently running Antardasha (${dasha.currentAntardasha})`);
    }

    // Factor 5: Afflicted in chart (+15)
    const affliction = afflictionMap.get(graha);
    if (affliction) {
      totalScore += 15;
      // Check for Neecha Bhanga before listing debilitation as a negative
      const planetPos = chart.planets.find((p) => p.planet.toLowerCase() === graha);
      if (planetPos && isDebilitated(planetPos)) {
        const nb = checkNeechaBhanga(planetPos, chart);
        if (nb.cancelled) {
          // Debilitation is cancelled — note it as a positive, not a negative
          factors.push(`Debilitated in ${planetPos.sign} — BUT Neecha Bhanga applies: ${nb.rules[0]}`);
        } else {
          factors.push(`Afflicted: ${affliction.reasons.join(", ")}`);
        }
      } else {
        factors.push(`Afflicted: ${affliction.reasons.join(", ")}`);
      }
    }

    // Factor 6: Severity of affliction (+10 for severe)
    if (affliction?.severity === "severe") {
      totalScore += 10;
      factors.push("Severe affliction");
    }

    // Factor 7: Functional malefic (+10)
    // A planet that rules a dusthana house (6th, 8th, 12th) for THIS ascendant
    const fmInfo = functionalMaleficMap.get(graha);
    if (fmInfo) {
      totalScore += 10;
      const houseList = fmInfo.dusthanaHouses.join(" and ");
      factors.push(`Functional malefic: rules house ${houseList} (dusthana) for your ${chart.ascendant.sign} ascendant`);
    }

    // Only include planets with a meaningful score (> 0)
    if (totalScore > 0) {
      scores.push({ graha, totalScore, factors });
    }
  }

  // Sort by score descending
  scores.sort((a, b) => b.totalScore - a.totalScore);

  return scores;
}

// ─── Main ───────────────────────────────────────────────────────────────────

export function runRulesEngine(
  chart: AstroChart,
  doshas: DoshaFlags,
  categories: string[],
  dasha?: VimshottariDasha,
): RulesEngineResult {
  const afflictions = computeAfflictions(chart, doshas);
  const afflictionMap = new Map(afflictions.map((a) => [a.graha, a]));

  const categoryResults: CategoryResult[] = [];
  let totalRemedies = 0;

  for (const category of categories) {
    const classicalGrahas = CATEGORY_GRAHAS[category] ?? [];

    if (dasha) {
      // ── NEW: Use diagnostic engine to find the MOST responsible planet(s) ──
      const diagnostics = diagnoseResponsiblePlanets(category, chart, doshas, dasha);

      // Take top 2 planets (primary + secondary) that are also in the affliction list
      // or are the house lord (even if not "afflicted" by our definition)
      const topPlanets = diagnostics
        .filter((d) => {
          const aff = afflictionMap.get(d.graha);
          // Include if afflicted OR if it's the house lord (score >= 20 means house lord)
          return aff || d.totalScore >= 20;
        })
        .slice(0, 2);

      if (topPlanets.length > 0) {
        const remedies: RemedyEntry[] = [];
        for (const diag of topPlanets) {
          const aff = afflictionMap.get(diag.graha);
          const severity = aff?.severity ?? "mild";
          const reasons = diag.factors; // Use diagnostic factors as reasons
          const entry = getRemedyEntry(diag.graha, severity, reasons, category, chart);
          if (entry) remedies.push(entry);
        }
        categoryResults.push({
          category, classicalGrahas,
          afflictedMatched: topPlanets.map((d) => d.graha),
          usedFallback: false, fallbackGraha: null, remedies,
        });
        totalRemedies += remedies.length;
      } else {
        // No significant planets found — fall back to house lord
        const fallbackLord = fallbackGraha(category, chart);
        if (fallbackLord) {
          const entry = getRemedyEntry(fallbackLord, "mild", [
            `fallback: lord of house ${CATEGORY_HOUSES[category]?.[0]} governing ${category}`,
          ], category, chart);
          categoryResults.push({
            category, classicalGrahas, afflictedMatched: [],
            usedFallback: true, fallbackGraha: fallbackLord,
            remedies: entry ? [entry] : [],
          });
          if (entry) totalRemedies += 1;
        } else {
          categoryResults.push({
            category, classicalGrahas, afflictedMatched: [],
            usedFallback: false, fallbackGraha: null, remedies: [],
          });
        }
      }
    } else {
      // ── OLD PATH: No dasha provided, fall back to original logic ──
      const afflictedGrahas = new Set(afflictions.map((a) => a.graha));
      const matched = classicalGrahas.filter((g) => afflictedGrahas.has(g));

      if (matched.length > 0) {
        const remedies: RemedyEntry[] = [];
        for (const graha of matched) {
          const info = afflictionMap.get(graha)!;
          const entry = getRemedyEntry(graha, info.severity, info.reasons, category, chart);
          if (entry) remedies.push(entry);
        }
        categoryResults.push({
          category, classicalGrahas, afflictedMatched: matched,
          usedFallback: false, fallbackGraha: null, remedies,
        });
        totalRemedies += remedies.length;
      } else {
        const fallbackLord = fallbackGraha(category, chart);
        if (fallbackLord) {
          const entry = getRemedyEntry(fallbackLord, "mild", [
            `fallback: lord of house ${CATEGORY_HOUSES[category]?.[0]} governing ${category}`,
          ], category, chart);
          categoryResults.push({
            category, classicalGrahas, afflictedMatched: [],
            usedFallback: true, fallbackGraha: fallbackLord,
            remedies: entry ? [entry] : [],
          });
          if (entry) totalRemedies += 1;
        } else {
          categoryResults.push({
            category, classicalGrahas, afflictedMatched: [],
            usedFallback: false, fallbackGraha: null, remedies: [],
          });
        }
      }
    }
  }

  return { categories: categoryResults, totalRemedies };
}

export {
  CATEGORY_GRAHAS, CATEGORY_HOUSES, DEBILITATION, SIGN_LORDS,
  GRAHA_NAMES, CATEGORY_CONTEXT, CATEGORY_LABELS,
  isDusthana, isDebilitated, maleficConjunctionCount,
  scoreAffliction, houseLord, fallbackGraha, loadRemedies, getRemedyEntry,
};
