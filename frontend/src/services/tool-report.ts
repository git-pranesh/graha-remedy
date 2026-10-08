/**
 * Tool report — one deterministic computation that powers every standalone
 * calculator page (nakshatra, rashi, lagna, dasha, manglik, sade sati, kaal sarp).
 */

import { computeChart, type BirthInput } from "./chart";
import { calculateBirthChart, type PlanetPosition } from "./astro-engine";
import { utcOffsetForLocalTime } from "./geocoder";
import { analyzeManglik, analyzeKaalSarp, type ManglikAnalysis, type KaalSarpAnalysis } from "./dosha";
import { sadeSatiReport, isoDateToJd, type SadeSatiReport } from "./transits";

export interface ToolInput extends BirthInput {
  /** When true, time of birth is unknown; Moon-based results are checked across the whole day. */
  timeUnknown?: boolean;
}

export interface MoonDayRange {
  /** Moon sign / nakshatra at 00:00 and 23:59 local time on the birth date. */
  signAtStart: string;
  signAtEnd: string;
  nakshatraAtStart: string;
  nakshatraAtEnd: string;
}

export interface ToolReport {
  input: { date: string; time: string | null; place: string; timezone: string; latitude: number; longitude: number };
  utcOffset: number;
  ayanamsa: number;
  planets: PlanetPosition[];
  ascendant: { longitude: number; sign: string; nakshatra: string; pada: number } | null;
  moon: { longitude: number; sign: string; nakshatra: string; pada: number; nakshatraLord: string };
  moonDayRange: MoonDayRange | null;
  dasha: {
    current: { lord: string; start: string; end: string };
    currentAntardasha: { lord: string; start: string; end: string };
    balanceAtBirth: { lord: string; years: number };
    sequence: Array<{ lord: string; start: string; end: string; antardashas: Array<{ lord: string; start: string; end: string }> }>;
  } | null;
  manglik: ManglikAnalysis | null;
  kaalSarp: KaalSarpAnalysis;
  sadeSati: SadeSatiReport;
}

function moonAt(dateIso: string, hh: number, mm: number, tz: string, lat: number, lon: number) {
  const [y, m, d] = dateIso.split("-").map(Number);
  const off = utcOffsetForLocalTime(tz, y, m, d, hh, mm);
  const c = calculateBirthChart(y, m, d, hh + mm / 60 - off, lat, lon);
  return c.planets.find((p) => p.planet === "Moon")!;
}

export async function computeToolReport(input: ToolInput): Promise<ToolReport> {
  const timeUnknown = Boolean(input.timeUnknown);
  const time = timeUnknown ? "12:00" : input.timeOfBirth;
  const res = await computeChart({ ...input, timeOfBirth: time });

  const { chart, dasha, geo } = res;
  const [y, mo, d] = input.dateOfBirth.split("-").map(Number);
  const [hh, mi] = time.split(":").map(Number);
  const utcOffset = utcOffsetForLocalTime(geo.timezone, y, mo, d, hh, mi);
  const moon = chart.planets.find((p) => p.planet === "Moon")!;

  let moonDayRange: MoonDayRange | null = null;
  if (timeUnknown) {
    const a = moonAt(input.dateOfBirth, 0, 0, geo.timezone, geo.latitude, geo.longitude);
    const b = moonAt(input.dateOfBirth, 23, 59, geo.timezone, geo.latitude, geo.longitude);
    moonDayRange = {
      signAtStart: a.sign,
      signAtEnd: b.sign,
      nakshatraAtStart: a.nakshatra!,
      nakshatraAtEnd: b.nakshatra!,
    };
  }

  const birthJd = isoDateToJd(input.dateOfBirth);
  const sadeSati = sadeSatiReport(moon.longitude, birthJd, birthJd + 365.25 * 100, geo.timezone);

  const today = todayIso();
  const current = dasha.sequence.find((md) => md.start <= today && today < md.end) ?? dasha.sequence[0];

  return {
    input: {
      date: input.dateOfBirth,
      time: timeUnknown ? null : input.timeOfBirth,
      place: geo.placeName,
      timezone: geo.timezone,
      latitude: geo.latitude,
      longitude: geo.longitude,
    },
    utcOffset,
    ayanamsa: chart.ayanamsa,
    planets: chart.planets,
    ascendant: timeUnknown
      ? null
      : {
          longitude: chart.ascendant.longitude,
          sign: chart.ascendant.sign,
          nakshatra: chart.ascendant.nakshatra,
          pada: chart.ascendant.nakshatraPada,
        },
    moon: {
      longitude: moon.longitude,
      sign: moon.sign,
      nakshatra: moon.nakshatra!,
      pada: moon.nakshatraPada!,
      nakshatraLord: moon.nakshatraLord!,
    },
    moonDayRange,
    // Dasha balance depends on the exact Moon degree; with unknown time it can be off by months.
    dasha: timeUnknown
      ? null
      : {
          current: { lord: current.lord, start: current.start, end: current.end },
          currentAntardasha: { lord: dasha.currentAntardasha, start: dasha.antardashaStart, end: dasha.antardashaEnd },
          balanceAtBirth: { lord: dasha.mahadashaLord, years: dasha.balanceYears },
          sequence: dasha.sequence,
        },
    manglik: timeUnknown ? null : analyzeManglik(chart),
    // The named Kaal Sarp type depends on Rahu's house from the Lagna, so it needs a birth time.
    kaalSarp: timeUnknown ? { ...analyzeKaalSarp(chart), name: null } : analyzeKaalSarp(chart),
    sadeSati,
  };
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}
