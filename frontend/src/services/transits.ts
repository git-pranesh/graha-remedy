/**
 * Transits — sidereal (Lahiri) sign ingresses of slow planets and the
 * Saturn-from-Moon periods derived from them (Sade Sati, Kantaka/Ashtama Shani).
 *
 * Sade Sati is defined by *transiting* Saturn relative to the natal Moon sign:
 *   rising  = Saturn in the 12th sign from the Moon
 *   peak    = Saturn in the Moon sign
 *   setting = Saturn in the 2nd sign from the Moon
 * Small Panoti / Dhaiya = Saturn in the 4th (Kantaka) or 8th (Ashtama) from the Moon.
 */

import { julianDay, calculatePosition, setSiderealMode, Planet, SiderealMode } from "@swisseph/node";
import { SIDEREAL_FLAGS } from "./astro-engine";

const SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
] as const;

let initialised = false;
function init() {
  if (!initialised) {
    setSiderealMode(SiderealMode.Lahiri);
    initialised = true;
  }
}

function signIndexOf(lon: number): number {
  return Math.floor((((lon % 360) + 360) % 360) / 30);
}

function saturnSignAt(jd: number): number {
  return signIndexOf(calculatePosition(jd, Planet.Saturn, SIDEREAL_FLAGS).longitude);
}

/** Calendar date (YYYY-MM-DD) of a Julian day in the given IANA timezone (default UTC). */
export function jdToIsoDate(jd: number, timezone = "UTC"): string {
  // en-CA formats as YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date((jd - 2440587.5) * 86400000));
}

export function isoDateToJd(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return julianDay(y, m, d, 0);
}

export function todayJd(): number {
  return Date.now() / 86400000 + 2440587.5;
}

export interface SignSpan {
  sign: number;     // 0-11
  startJd: number;
  endJd: number;
}

/**
 * Continuous spans of transiting Saturn in each sidereal sign between two dates.
 * Retrograde re-entries produce separate spans. Boundaries are located to ~1 minute.
 */
export function saturnSignSpans(fromJd: number, toJd: number): SignSpan[] {
  init();
  const STEP = 2; // days; Saturn never changes sign twice within 2 days
  const spans: SignSpan[] = [];
  let curSign = saturnSignAt(fromJd);
  let spanStart = fromJd;
  let prevJd = fromJd;

  for (let jd = fromJd + STEP; jd <= toJd + STEP; jd += STEP) {
    const t = Math.min(jd, toJd);
    const s = saturnSignAt(t);
    if (s !== curSign) {
      let lo = prevJd;
      let hi = t;
      while (hi - lo > 1 / 1440) {
        const mid = (lo + hi) / 2;
        if (saturnSignAt(mid) === curSign) lo = mid;
        else hi = mid;
      }
      spans.push({ sign: curSign, startJd: spanStart, endJd: hi });
      curSign = s;
      spanStart = hi;
    }
    prevJd = t;
    if (t >= toJd) break;
  }
  spans.push({ sign: curSign, startJd: spanStart, endJd: toJd });
  return spans;
}

export type SaturnPhase = "rising" | "peak" | "setting" | "kantaka" | "ashtama";

export interface SaturnPeriod {
  phase: SaturnPhase;
  sign: string;
  start: string; // ISO date
  end: string;   // ISO date
}

export interface SadeSatiCycle {
  start: string;
  end: string;
  phases: SaturnPeriod[];
}

export interface SadeSatiReport {
  moonSign: string;
  transitSaturnSign: string;
  /** Phase running today, or null if none. */
  current: SaturnPhase | null;
  currentPeriod: SaturnPeriod | null;
  /** Complete Sade Sati cycles (12th→1st→2nd), merged across retrograde re-entries. */
  cycles: SadeSatiCycle[];
  /** Kantaka (4th) and Ashtama (8th) Shani periods. */
  dhaiya: SaturnPeriod[];
}

function phaseFor(saturnSign: number, moonSign: number): SaturnPhase | null {
  const d = (saturnSign - moonSign + 12) % 12; // 0 = same sign
  if (d === 11) return "rising";
  if (d === 0) return "peak";
  if (d === 1) return "setting";
  if (d === 3) return "kantaka";
  if (d === 7) return "ashtama";
  return null;
}

/**
 * Sade Sati and Dhaiya timeline for a natal Moon sign between two dates.
 */
export function sadeSatiReport(
  moonLongitude: number,
  fromJd: number,
  toJd: number,
  timezone = "Asia/Kolkata",
): SadeSatiReport {
  const fmt = (jd: number) => jdToIsoDate(jd, timezone);
  const moonSign = signIndexOf(moonLongitude);
  const spans = saturnSignSpans(fromJd, toJd);
  const now = todayJd();

  const periods: Array<SaturnPeriod & { startJd: number; endJd: number }> = [];
  for (const sp of spans) {
    const phase = phaseFor(sp.sign, moonSign);
    if (!phase) continue;
    periods.push({
      phase,
      sign: SIGNS[sp.sign],
      start: fmt(sp.startJd),
      end: fmt(sp.endJd),
      startJd: sp.startJd,
      endJd: sp.endJd,
    });
  }

  // Merge consecutive Sade Sati periods (rising/peak/setting, including
  // retrograde back-and-forth) into cycles.
  const cycles: SadeSatiCycle[] = [];
  let open: { startJd: number; endJd: number; phases: SaturnPeriod[] } | null = null;
  for (const p of periods) {
    const isSade = p.phase === "rising" || p.phase === "peak" || p.phase === "setting";
    if (!isSade) continue;
    const clean: SaturnPeriod = { phase: p.phase, sign: p.sign, start: p.start, end: p.end };
    // A retrograde dip out of the Sade Sati signs (gap under ~2 years) belongs to the same cycle.
    if (open && p.startJd - open.endJd < 730) {
      open.endJd = p.endJd;
      open.phases.push(clean);
    } else {
      if (open) cycles.push({ start: fmt(open.startJd), end: fmt(open.endJd), phases: open.phases });
      open = { startJd: p.startJd, endJd: p.endJd, phases: [clean] };
    }
  }
  if (open) cycles.push({ start: fmt(open.startJd), end: fmt(open.endJd), phases: open.phases });

  const currentRaw = periods.find((p) => now >= p.startJd && now < p.endJd) ?? null;
  init();
  const transitSign = saturnSignAt(now);

  return {
    moonSign: SIGNS[moonSign],
    transitSaturnSign: SIGNS[transitSign],
    current: currentRaw ? currentRaw.phase : null,
    currentPeriod: currentRaw
      ? { phase: currentRaw.phase, sign: currentRaw.sign, start: currentRaw.start, end: currentRaw.end }
      : null,
    cycles,
    dhaiya: periods
      .filter((p) => p.phase === "kantaka" || p.phase === "ashtama")
      .map((p) => ({ phase: p.phase, sign: p.sign, start: p.start, end: p.end })),
  };
}

/** Sidereal sign of transiting Saturn right now (0-11). */
export function currentSaturnSignIndex(): number {
  init();
  return saturnSignAt(todayJd());
}
