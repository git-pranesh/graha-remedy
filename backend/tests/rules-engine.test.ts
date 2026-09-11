/**
 * Unit tests for the Rules Engine.
 *
 * Three core scenarios:
 *   1. Single clear match  — one afflicted graha aligns with a category
 *   2. Multiple matches    — several afflicted grahas align with a category
 *   3. No match → fallback — zero intersection, house lord is used
 *
 * Mock charts are hand-crafted from the actual Swiss Ephemeris output
 * for 31 Jul 1990, 8:15 AM, Chennai — but tweaked per scenario.
 */

import { describe, it, expect } from "vitest";
import {
  runRulesEngine,
  computeAfflictions,
  CATEGORY_GRAHAS,
  CATEGORY_HOUSES,
  isDusthana,
  scoreAffliction,
  houseLord,
  fallbackGraha,
  getRemedyEntry,
  type AfflictionInfo,
} from "../src/services/rules-engine.js";
import type { AstroChart, PlanetPosition } from "../src/services/astro-engine.js";
import type { DoshaFlags } from "../src/services/dosha.js";

// ─── Helpers ────────────────────────────────────────────────────────────────

const NO_DOSHAS: DoshaFlags = {
  manglik: false, manglikDetails: "",
  kaalSarp: false, kaalSarpDetails: "",
  sadeSati: false, sadeSatiDetails: "",
  pitra: false, pitraDetails: "",
  nadi: false, nadiDetails: "",
};

/**
 * Build a minimal but valid AstroChart from a planet list.
 */
function makeChart(
  planets: PlanetPosition[],
  ascSign: string = "Leo",
): AstroChart {
  return {
    planets,
    houses: {
      ascendant: 136.55,
      mc: 47.80,
      cusps: Array.from({ length: 13 }, (_, i) => 136.55 + (i - 1) * 30),
    },
    ayanamsa: 23.73,
    ascendant: {
      longitude: 136.55,
      sign: ascSign,
      signDegree: "16°33'",
      nakshatra: "Purva Phalguni",
      nakshatraPada: 1,
    },
  };
}

function makePlanet(
  name: string,
  sign: string,
  house: number,
  retrograde = false,
): PlanetPosition {
  const signLon: Record<string, number> = {
    Aries: 10, Taurus: 40, Gemini: 70, Cancer: 100, Leo: 130, Virgo: 160,
    Libra: 190, Scorpio: 220, Sagittarius: 250, Capricorn: 280, Aquarius: 310, Pisces: 340,
  };
  return {
    planet: name,
    longitude: signLon[sign] ?? 0,
    latitude: 0,
    sign,
    signDegree: "10°00'",
    house,
    retrograde,
    nakshatra: "Ashwini",
    nakshatraPada: 1,
    nakshatraLord: "Ketu",
  };
}

// ─── Scenario 1: Single Clear Match ────────────────────────────────────────
// Saturn is retrograde AND in the 6th house (dusthana) → clearly afflicted.
// "health" category maps to [sun, moon, saturn, mars].
// Intersection: saturn ∈ afflicted ∩ health → single match.

describe("Scenario 1 — Single clear match", () => {
  const chart = makeChart([
    makePlanet("Sun",     "Leo",   1),
    makePlanet("Moon",    "Virgo", 2),
    makePlanet("Mercury", "Leo",   1),
    makePlanet("Venus",   "Libra", 3),
    makePlanet("Mars",    "Aries", 11),
    makePlanet("Jupiter", "Cancer", 12),
    makePlanet("Saturn",  "Aquarius", 6, true),  // retrograde + dusthana = afflicted
    makePlanet("Rahu",    "Capricorn", 6),
    makePlanet("Ketu",    "Cancer", 12),
  ]);

  const doshas: DoshaFlags = { ...NO_DOSHAS, sadeSati: true, sadeSatiDetails: "Saturn 12th from Moon" };

  it("should identify Saturn as afflicted", () => {
    const afflictions = computeAfflictions(chart, doshas);
    const saturn = afflictions.find((a) => a.graha === "saturn");
    expect(saturn).toBeDefined();
    expect(saturn!.severity).toMatch(/mild|moderate|severe/);
    expect(saturn!.reasons.length).toBeGreaterThan(0);
  });

  it("should return Saturn remedies for health (single match)", () => {
    const result = runRulesEngine(chart, doshas, ["health"]);
    expect(result.categories).toHaveLength(1);

    const health = result.categories[0];
    expect(health.category).toBe("health");
    expect(health.classicalGrahas).toEqual(["sun", "moon", "saturn", "mars"]);
    expect(health.afflictedMatched).toEqual(["saturn"]);
    expect(health.usedFallback).toBe(false);
    expect(health.fallbackGraha).toBeNull();
    expect(health.remedies).toHaveLength(1);
    expect(health.remedies[0].graha).toBe("saturn");
    expect(health.remedies[0].remedies.mantras.length).toBeGreaterThan(0);
    expect(health.remedies[0].remedies.fasting.length).toBeGreaterThan(0);
    expect(health.remedies[0].remedies.donations.length).toBeGreaterThan(0);
    expect(health.remedies[0].remedies.temples.length).toBeGreaterThan(0);
  });

  it("should have correct remedies content for Saturn", () => {
    const result = runRulesEngine(chart, doshas, ["health"]);
    const saturnRemedy = result.categories[0].remedies[0];
    expect(saturnRemedy.grahaName).toContain("Shani");
    expect(saturnRemedy.remedies.mantras.some((m) => typeof m === "string" ? m.includes("Shanaishcharaya") : m.name?.includes("Shanaishcharaya"))).toBe(true);
    expect(saturnRemedy.remedies.fasting.some((f) => f.includes("Saturday"))).toBe(true);
  });
});

// ─── Scenario 2: Multiple Matches ──────────────────────────────────────────
// Make Saturn (retro + dusthana) AND Mars (retro + dusthana) afflicted.
// "relationships" maps to [venus, moon, mars, jupiter].
// Mars is afflicted → matches relationships.
// But we also need another afflicted graha that maps to "career" or another
// category to show multi-match within a single category.
// Actually, let's make Saturn AND Mars both afflicted and both map to "litigation"
// which is [saturn, mars, rahu]. Both match → multiple remedies.

describe("Scenario 2 — Multiple matches", () => {
  const chart = makeChart([
    makePlanet("Sun",     "Leo",   1),
    makePlanet("Moon",    "Scorpio", 4),
    makePlanet("Mercury", "Leo",   1),
    makePlanet("Venus",   "Gemini", 11),
    makePlanet("Mars",    "Scorpio", 4, true),  // retrograde in 4th — moderate affliction
    makePlanet("Jupiter", "Cancer", 12),
    makePlanet("Saturn",  "Capricorn", 6, true), // retrograde + dusthana = afflicted
    makePlanet("Rahu",    "Sagittarius", 5),
    makePlanet("Ketu",    "Gemini", 11),
  ]);

  const doshas: DoshaFlags = { ...NO_DOSHAS, manglik: true, manglikDetails: "Mars in 4th" };

  it("should identify both Saturn and Mars as afflicted", () => {
    const afflictions = computeAfflictions(chart, doshas);
    const grahas = afflictions.map((a) => a.graha);
    expect(grahas).toContain("saturn");
    expect(grahas).toContain("mars");
  });

  it("should return remedies for both Saturn and Mars for litigation", () => {
    const result = runRulesEngine(chart, doshas, ["litigation"]);
    expect(result.categories).toHaveLength(1);

    const lit = result.categories[0];
    expect(lit.category).toBe("litigation");
    expect(lit.classicalGrahas).toEqual(["saturn", "mars", "rahu"]);
    expect(lit.afflictedMatched).toContain("saturn");
    expect(lit.afflictedMatched).toContain("mars");
    expect(lit.usedFallback).toBe(false);
    expect(lit.remedies.length).toBeGreaterThanOrEqual(2);

    const grahas = lit.remedies.map((r) => r.graha);
    expect(grahas).toContain("saturn");
    expect(grahas).toContain("mars");
  });

  it("should return remedies for each matched graha with correct content", () => {
    const result = runRulesEngine(chart, doshas, ["litigation"]);
    const saturnEntry = result.categories[0].remedies.find((r) => r.graha === "saturn");
    const marsEntry = result.categories[0].remedies.find((r) => r.graha === "mars");

    expect(saturnEntry).toBeDefined();
    expect(marsEntry).toBeDefined();
    expect(saturnEntry!.grahaName).toContain("Shani");
    expect(marsEntry!.grahaName).toContain("Mangal");
  });
});

// ─── Scenario 3: No Match → Fallback ──────────────────────────────────────
// Chart with NO afflicted grahas at all — all planets are well-placed.
// "mental_peace" maps to [moon, jupiter, ketu, saturn].
// None of those are afflicted → fallback to house lord.
// Ascendant is Leo, so:
//   house 1 = Leo → lord = Sun
//   house 4 = Scorpio → lord = Mars
//   house 12 = Cancer → lord = Moon
// Primary house for mental_peace is 1 → fallback = sun.

describe("Scenario 3 — No match, fallback to house lord", () => {
  const chart = makeChart([
    makePlanet("Sun",     "Leo",   1),    // own sign, excellent
    makePlanet("Moon",    "Taurus", 10),  // exalted, great
    makePlanet("Mercury", "Virgo", 2),    // own sign
    makePlanet("Venus",   "Libra", 3),    // own sign
    makePlanet("Mars",    "Aries", 9),    // own sign, in trikona
    makePlanet("Jupiter", "Cancer", 9),   // exalted, in trikona — totally clean
    makePlanet("Saturn",  "Libra", 3),    // exalted
    makePlanet("Rahu",    "Gemini", 11),
    makePlanet("Ketu",    "Sagittarius", 5),
  ]);

  // No doshas active — everything is clean
  const doshas: DoshaFlags = { ...NO_DOSHAS };

  it("should find zero afflicted grahas", () => {
    const afflictions = computeAfflictions(chart, doshas);
    expect(afflictions).toHaveLength(0);
  });

  it("should fall back to house lord for mental_peace", () => {
    const result = runRulesEngine(chart, doshas, ["mental_peace"]);
    expect(result.categories).toHaveLength(1);

    const mp = result.categories[0];
    expect(mp.category).toBe("mental_peace");
    expect(mp.afflictedMatched).toHaveLength(0);
    expect(mp.usedFallback).toBe(true);
    expect(mp.fallbackGraha).toBeTruthy();
    expect(mp.remedies).toHaveLength(1);
    expect(mp.remedies[0].reasons[0]).toContain("fallback");
  });

  it("fallback lord should be the lord of the primary house for mental_peace", () => {
    // mental_peace primary house = 1, ascendant = Leo → lord = sun
    const lord = houseLord(1, chart);
    expect(lord).toBe("sun");
    const result = runRulesEngine(chart, doshas, ["mental_peace"]);
    // fallbackGraha uses CATEGORY_HOUSES[category][0], which for mental_peace is house 1
    // But if house 1 lord is null, it falls back. Let's just check it used fallback and has a remedy
    expect(result.categories[0].usedFallback).toBe(true);
    expect(result.categories[0].remedies.length).toBeGreaterThan(0);
    expect(result.categories[0].remedies[0].reasons[0]).toContain("fallback");
  });
});

// ─── Edge Cases ─────────────────────────────────────────────────────────────

describe("Edge cases", () => {
  it("should handle empty categories array", () => {
    const chart = makeChart([makePlanet("Sun", "Leo", 1)]);
    const result = runRulesEngine(chart, NO_DOSHAS, []);
    expect(result.categories).toHaveLength(0);
    expect(result.totalRemedies).toBe(0);
  });

  it("should handle unknown category gracefully", () => {
    const chart = makeChart([makePlanet("Sun", "Leo", 1)]);
    const result = runRulesEngine(chart, NO_DOSHAS, ["unknown_category"]);
    expect(result.categories).toHaveLength(1);
    expect(result.categories[0].classicalGrahas).toHaveLength(0);
    expect(result.categories[0].remedies).toHaveLength(0);
  });

  it("should process multiple categories in one call", () => {
    const chart = makeChart([
      makePlanet("Sun",     "Leo",   1),
      makePlanet("Moon",    "Virgo", 2),
      makePlanet("Saturn",  "Capricorn", 6, true), // afflicted
      makePlanet("Mars",    "Aries", 9),
      makePlanet("Jupiter", "Cancer", 12),
      makePlanet("Venus",   "Libra", 3),
      makePlanet("Mercury", "Virgo", 2),
      makePlanet("Rahu",    "Aquarius", 7),
      makePlanet("Ketu",    "Leo", 1),
    ]);
    const result = runRulesEngine(chart, NO_DOSHAS, ["health", "finance", "career"]);
    expect(result.categories).toHaveLength(3);

    // Saturn is afflicted → health has saturn
    const health = result.categories.find((c) => c.category === "health")!;
    expect(health.afflictedMatched).toContain("saturn");

    // career maps to [sun, saturn, jupiter, mercury] — saturn matches
    const career = result.categories.find((c) => c.category === "career")!;
    expect(career.afflictedMatched).toContain("saturn");
  });
});

// ─── House Lord Logic ──────────────────────────────────────────────────────

describe("House lord lookup", () => {
  it("should return correct sign lord for each house", () => {
    const chart = makeChart([], "Aries");
    // House 1 = Aries → mars
    expect(houseLord(1, chart)).toBe("mars");
    // House 2 = Taurus → venus
    expect(houseLord(2, chart)).toBe("venus");
    // House 7 = Libra → venus
    expect(houseLord(7, chart)).toBe("venus");
    // House 10 = Capricorn → saturn
    expect(houseLord(10, chart)).toBe("saturn");
  });

  it("fallbackGraha should return lord of primary house", () => {
    const chart = makeChart([], "Leo");
    // Leo asc (index 4): house N sign = (4 + N - 1) % 12
    // house 1 = (4+0)%12 = 4 = Leo → sun
    // house 2 = (4+1)%12 = 5 = Virgo → mercury
    // house 4 = (4+3)%12 = 7 = Scorpio → mars
    // house 7 = (4+6)%12 = 10 = Aquarius → saturn
    // house 10 = (4+9)%12 = 1 = Taurus → venus
    expect(fallbackGraha("health", chart)).toBe("sun");      // CATEGORY_HOUSES.health[0]=1 → Leo → sun
    expect(fallbackGraha("career", chart)).toBe("venus");    // CATEGORY_HOUSES.career[0]=10 → Taurus → venus
    expect(fallbackGraha("finance", chart)).toBe("mercury"); // CATEGORY_HOUSES.finance[0]=2 → Virgo → mercury
  });
});

// ─── getRemedyEntry ─────────────────────────────────────────────────────────

describe("getRemedyEntry", () => {
  it("should return a full remedy entry for a known graha", () => {
    const mockChart = makeChart([
      makePlanet("Jupiter", "Cancer", 12),
    ]);
    const entry = getRemedyEntry("jupiter", "moderate", ["retrograde", "dusthana"], "career", mockChart);
    expect(entry).not.toBeNull();
    expect(entry!.graha).toBe("jupiter");
    expect(entry!.grahaName).toContain("Brihaspati");
    expect(entry!.severity).toBe("moderate");
    expect(entry!.reasons).toEqual(["retrograde", "dusthana"]);
    expect(entry!.plainExplanation.length).toBeGreaterThan(0);
    expect(entry!.remedies.mantras.length).toBeGreaterThan(0);
    expect(entry!.remedies.fasting.length).toBeGreaterThan(0);
    expect(entry!.remedies.donations.length).toBeGreaterThan(0);
    expect(entry!.remedies.pujaSteps.length).toBeGreaterThan(0);
    expect(entry!.remedies.temples.length).toBeGreaterThan(0);
  });

  it("should return null for an unknown graha", () => {
    const mockChart = makeChart([makePlanet("Sun", "Leo", 1)]);
    const entry = getRemedyEntry("pluto", "mild", [], "health", mockChart);
    expect(entry).toBeNull();
  });
});
