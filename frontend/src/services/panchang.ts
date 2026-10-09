/**
 * Panchang engine — computes the daily Hindu almanac for any place and date.
 *
 * Conventions (match the widely used drik / Lahiri reckoning):
 *  - The panchang day runs from local sunrise to the next sunrise.
 *  - Sunrise/sunset: upper limb of the Sun on the horizon, with standard refraction.
 *  - Moonrise/moonset: centre of the Moon's disc on the horizon, no refraction.
 *  - Tithi: Moon−Sun elongation in 12° steps. Karana: 6° steps.
 *  - Nakshatra: sidereal Moon in 13°20′ steps. Yoga: sidereal Sun + Moon in 13°20′ steps.
 *  - Lunar month: amanta month named after the solar sign entered during it;
 *    a month with no solar ingress is Adhika (leap). Purnimanta names shift in Krishna paksha.
 *  - Rahu Kalam / Yamaganda / Gulika: daytime divided into 8 equal parts.
 *  - Choghadiya: daytime and night-time each divided into 8 equal parts.
 *  - Hora: daytime and night-time each divided into 12 equal parts.
 *  - Abhijit: 8th of 15 daytime muhurtas. Brahma Muhurta: 14th of 15 night muhurtas.
 */

import {
  julianDay,
  calculatePosition,
  calculateRiseTransitSet,
  getAyanamsa,
  Planet,
  RiseTransitFlag,
  CalculationFlag,
} from "@swisseph/node";
import { initAyanamsa } from "./ayanamsa";
import { SIDEREAL_FLAGS } from "./astro-engine";
import { utcOffsetForLocalTime } from "./geocoder";

const TROPICAL_FLAGS = CalculationFlag.SwissEphemeris | CalculationFlag.Speed;

let initialised = false;
function init() {
  if (!initialised) {
    initAyanamsa();
    initialised = true;
  }
}

// ---------------------------------------------------------------------------
// Names
// ---------------------------------------------------------------------------

export const TITHI_NAMES = [
  "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami", "Ashtami",
  "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima",
  "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami", "Ashtami",
  "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Amavasya",
];

export const NAKSHATRA_NAMES = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha",
  "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishtha", "Shatabhisha", "Purva Bhadrapada",
  "Uttara Bhadrapada", "Revati",
];

export const YOGA_NAMES = [
  "Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda", "Sukarma", "Dhriti", "Shula",
  "Ganda", "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyana",
  "Parigha", "Shiva", "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti",
];

const MOVABLE_KARANAS = ["Bava", "Balava", "Kaulava", "Taitila", "Garaja", "Vanija", "Vishti"];

/** Karana for half-tithi index 0-59. */
export function karanaName(k: number): string {
  if (k === 0) return "Kimstughna";
  if (k >= 57) return ["Shakuni", "Chatushpada", "Naga"][k - 57];
  return MOVABLE_KARANAS[(k - 1) % 7];
}

/** Lunar month names, indexed by the sidereal sign the Sun enters during the month (0 = Mesha). */
export const LUNAR_MONTHS = [
  "Chaitra", "Vaishakha", "Jyeshtha", "Ashadha", "Shravana", "Bhadrapada",
  "Ashwin", "Kartika", "Margashirsha", "Pausha", "Magha", "Phalguna",
];

export const WEEKDAYS = [
  { english: "Sunday", sanskrit: "Ravivara", lord: "Sun" },
  { english: "Monday", sanskrit: "Somavara", lord: "Moon" },
  { english: "Tuesday", sanskrit: "Mangalavara", lord: "Mars" },
  { english: "Wednesday", sanskrit: "Budhavara", lord: "Mercury" },
  { english: "Thursday", sanskrit: "Guruvara", lord: "Jupiter" },
  { english: "Friday", sanskrit: "Shukravara", lord: "Venus" },
  { english: "Saturday", sanskrit: "Shanivara", lord: "Saturn" },
];

/** Hora (planetary hour) order. */
const HORA_ORDER = ["Sun", "Venus", "Mercury", "Moon", "Saturn", "Jupiter", "Mars"];

/** Choghadiya named for the planet ruling it, in HORA_ORDER. */
const CHOGHADIYA_BY_PLANET: Record<string, { name: string; nature: "good" | "neutral" | "bad"; meaning: string }> = {
  Sun: { name: "Udveg", nature: "bad", meaning: "Anxiety" },
  Venus: { name: "Char", nature: "neutral", meaning: "Moving" },
  Mercury: { name: "Labh", nature: "good", meaning: "Gain" },
  Moon: { name: "Amrit", nature: "good", meaning: "Nectar" },
  Saturn: { name: "Kaal", nature: "bad", meaning: "Loss" },
  Jupiter: { name: "Shubh", nature: "good", meaning: "Auspicious" },
  Mars: { name: "Rog", nature: "bad", meaning: "Illness" },
};

/** Which of the 8 daytime parts (1-8) is Rahu Kalam / Yamaganda / Gulika, by weekday (0 = Sunday). */
const RAHU_PART = [8, 2, 7, 5, 6, 4, 3];
const YAMAGANDA_PART = [5, 4, 3, 2, 1, 7, 6];
const GULIKA_PART = [7, 6, 5, 4, 3, 2, 1];

// ---------------------------------------------------------------------------
// Astronomy helpers
// ---------------------------------------------------------------------------

const norm360 = (x: number) => ((x % 360) + 360) % 360;

function tropicalLon(jd: number, body: Planet): number {
  return calculatePosition(jd, body, TROPICAL_FLAGS).longitude;
}

function siderealLon(jd: number, body: Planet): number {
  init();
  return norm360(calculatePosition(jd, body, SIDEREAL_FLAGS).longitude);
}

/** Moon − Sun elongation (0-360); identical in tropical and sidereal frames. */
function elongation(jd: number): number {
  return norm360(tropicalLon(jd, Planet.Moon) - tropicalLon(jd, Planet.Sun));
}

export const tithiIndex = (jd: number) => Math.floor(elongation(jd) / 12);
const karanaIndex = (jd: number) => Math.floor(elongation(jd) / 6);
const nakshatraIndex = (jd: number) => Math.floor(siderealLon(jd, Planet.Moon) / (360 / 27));
const yogaIndex = (jd: number) =>
  Math.floor(norm360(siderealLon(jd, Planet.Sun) + siderealLon(jd, Planet.Moon)) / (360 / 27));
export const sunSignIndex = (jd: number) => Math.floor(siderealLon(jd, Planet.Sun) / 30);
const moonSignIndex = (jd: number) => Math.floor(siderealLon(jd, Planet.Moon) / 30);

export interface Segment {
  index: number;
  /** End of this element (Julian day UT), or null if it continues past the panchang day. */
  endJd: number | null;
}

/**
 * Successive values of an index function between two instants, with the instant each one ends.
 * The step must be shorter than the shortest possible duration of a value.
 */
export function segments(fn: (jd: number) => number, startJd: number, endJd: number, stepDays: number): Segment[] {
  const out: Segment[] = [];
  let cur = fn(startJd);
  let prevJd = startJd;
  for (let t = startJd + stepDays; ; t += stepDays) {
    const tt = Math.min(t, endJd);
    const v = fn(tt);
    if (v !== cur) {
      let lo = prevJd;
      let hi = tt;
      while (hi - lo > 1 / 86400) {
        const mid = (lo + hi) / 2;
        if (fn(mid) === cur) lo = mid;
        else hi = mid;
      }
      out.push({ index: cur, endJd: hi });
      cur = fn(hi + 1e-7);
      prevJd = hi;
      // Re-check the rest of this step from the transition.
      t = hi;
      continue;
    }
    prevJd = tt;
    if (tt >= endJd) break;
  }
  out.push({ index: cur, endJd: null });
  return out;
}

/** Rise/set flag bits (Swiss Ephemeris): geometric centre of the disc, no refraction. */
const DISC_CENTER_NO_REFRACTION = 256 | 512;

export function riseSet(jd: number, body: Planet, event: number, lat: number, lon: number): number | null {
  try {
    const r = calculateRiseTransitSet(jd, body, event, lon, lat, 0);
    return Number.isFinite(r.time) && r.time > 0 ? r.time : null;
  } catch {
    return null; // e.g. polar day/night
  }
}

/** Most recent new moon (elongation = 0) before `jd`. */
export function previousNewMoon(jd: number): number {
  let t = jd - elongation(jd) / 12.19; // mean relative speed ~12.19°/day
  // Refine with Newton steps on elongation (wrapping near 0/360).
  for (let i = 0; i < 8; i++) {
    let e = elongation(t);
    if (e > 180) e -= 360;
    t -= e / 12.19;
  }
  if (t > jd) t -= 29.53;
  return t;
}

export function nextNewMoon(jd: number): number {
  return previousNewMoon(jd + 31);
}

/** Amanta month index (0 = Chaitra) and Adhika flag for the lunar month containing `jd`. */
export function lunarMonthAt(jd: number): { amantaIdx: number; adhika: boolean } {
  const nm1 = previousNewMoon(jd);
  const nm2 = nextNewMoon(nm1 + 1);
  const s1 = sunSignIndex(nm1);
  return { amantaIdx: (s1 + 1) % 12, adhika: s1 === sunSignIndex(nm2) };
}

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface TimeSpan {
  start: string; // ISO with offset, e.g. 2026-10-08T13:36:00+05:30
  end: string;
}

export interface ElementSpan {
  name: string;
  /** null when it lasts beyond the next sunrise */
  end: string | null;
}

export interface ChoghadiyaSlot extends TimeSpan {
  name: string;
  nature: "good" | "neutral" | "bad";
  meaning: string;
}

export interface HoraSlot extends TimeSpan {
  planet: string;
}

export interface Panchang {
  date: string;            // YYYY-MM-DD (local civil date)
  timezone: string;
  latitude: number;
  longitude: number;
  weekday: (typeof WEEKDAYS)[number];
  sunrise: string | null;
  sunset: string | null;
  nextSunrise: string | null;
  moonrise: string | null;
  moonset: string | null;
  dayLengthMinutes: number;
  nightLengthMinutes: number;
  paksha: "Shukla" | "Krishna";
  tithi: ElementSpan[];
  nakshatra: ElementSpan[];
  yoga: ElementSpan[];
  karana: ElementSpan[];
  moonSign: ElementSpan[];
  sunSign: string;
  lunarMonth: { amanta: string; purnimanta: string; adhika: boolean };
  vikramSamvat: number;
  shakaSamvat: number;
  ayanamsa: number;
  rahuKalam: TimeSpan;
  yamaganda: TimeSpan;
  gulikaKalam: TimeSpan;
  abhijit: TimeSpan;
  brahmaMuhurta: TimeSpan;
  choghadiya: { day: ChoghadiyaSlot[]; night: ChoghadiyaSlot[] };
  hora: { day: HoraSlot[]; night: HoraSlot[] };
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

/** ISO-8601 local time with numeric offset, rounded to the minute. */
export function jdToLocalIso(jd: number, timezone: string): string {
  const ms = Math.round(((jd - 2440587.5) * 86400000) / 60000) * 60000;
  const d = new Date(ms);
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(d)
      .map((p) => [p.type, p.value]),
  );
  const off = new Intl.DateTimeFormat("en-US", { timeZone: timezone, timeZoneName: "longOffset" })
    .formatToParts(d)
    .find((p) => p.type === "timeZoneName")!
    .value.replace("GMT", "");
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:00${off || "+00:00"}`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

/** Local civil date (YYYY-MM-DD) "today" in a timezone. */
export function todayInTimezone(timezone: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" }).format(
    new Date(),
  );
}

export interface DayTimes {
  date: string;
  timezone: string;
  weekday: (typeof WEEKDAYS)[number];
  sunrise: string | null;
  sunset: string | null;
  nextSunrise: string | null;
  dayLengthMinutes: number;
  nightLengthMinutes: number;
  rahuKalam: TimeSpan;
  yamaganda: TimeSpan;
  gulikaKalam: TimeSpan;
  abhijit: TimeSpan;
  brahmaMuhurta: TimeSpan;
  choghadiya: { day: ChoghadiyaSlot[]; night: ChoghadiyaSlot[] };
  hora: { day: HoraSlot[]; night: HoraSlot[] };
  /** internal: Julian days used by computePanchang */
  _jd: { localMidnight: number; dayStart: number; dayEnd: number; panchangEnd: number };
}

/**
 * Sunrise-based timings only (rahu kalam, choghadiya, hora, muhurtas). Cheap: three rise/set
 * calculations, no lunar elements.
 */
export function computeDayTimes(date: string, latitude: number, longitude: number, timezone: string): DayTimes {
  init();
  const [y, m, d] = date.split("-").map(Number);
  const offset = utcOffsetForLocalTime(timezone, y, m, d, 0, 0);
  const localMidnightJd = julianDay(y, m, d, 0) - offset / 24;
  const iso = (jd: number | null) => (jd === null ? null : jdToLocalIso(jd, timezone));

  const sunrise = riseSet(localMidnightJd, Planet.Sun, RiseTransitFlag.Rise, latitude, longitude);
  const sunset = sunrise ? riseSet(sunrise, Planet.Sun, RiseTransitFlag.Set, latitude, longitude) : null;
  const nextSunrise = sunrise ? riseSet(sunrise + 0.5, Planet.Sun, RiseTransitFlag.Rise, latitude, longitude) : null;
  const prevSunset = riseSet(localMidnightJd - 1, Planet.Sun, RiseTransitFlag.Set, latitude, longitude);

  // Fallback for polar latitudes: use local 06:00–18:00 so timings still compute.
  const dayStart = sunrise ?? localMidnightJd + 0.25;
  const dayEnd = sunset ?? localMidnightJd + 0.75;
  const panchangEnd = nextSunrise ?? localMidnightJd + 1.25;

  const dayLen = dayEnd - dayStart;
  const nightLen = panchangEnd - dayEnd;
  const part = (start: number, len: number, n: number, i: number) => start + (len * i) / n;
  const tspan = (a: number, b: number): TimeSpan => ({ start: iso(a)!, end: iso(b)! });

  const weekdayIdx = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  const weekday = WEEKDAYS[weekdayIdx];
  const eighth = (p: number) => tspan(part(dayStart, dayLen, 8, p - 1), part(dayStart, dayLen, 8, p));

  const dayLordIdx = HORA_ORDER.indexOf(weekday.lord);
  const chogDay: ChoghadiyaSlot[] = [];
  const chogNight: ChoghadiyaSlot[] = [];
  for (let i = 0; i < 8; i++) {
    const pd = HORA_ORDER[(dayLordIdx + i) % 7];
    chogDay.push({ ...CHOGHADIYA_BY_PLANET[pd], ...tspan(part(dayStart, dayLen, 8, i), part(dayStart, dayLen, 8, i + 1)) });
    const pn = HORA_ORDER[(dayLordIdx + 5 + 5 * i) % 7];
    chogNight.push({ ...CHOGHADIYA_BY_PLANET[pn], ...tspan(part(dayEnd, nightLen, 8, i), part(dayEnd, nightLen, 8, i + 1)) });
  }

  const horaDay: HoraSlot[] = [];
  const horaNight: HoraSlot[] = [];
  for (let i = 0; i < 12; i++) {
    horaDay.push({ planet: HORA_ORDER[(dayLordIdx + i) % 7], ...tspan(part(dayStart, dayLen, 12, i), part(dayStart, dayLen, 12, i + 1)) });
    horaNight.push({ planet: HORA_ORDER[(dayLordIdx + 12 + i) % 7], ...tspan(part(dayEnd, nightLen, 12, i), part(dayEnd, nightLen, 12, i + 1)) });
  }

  const prevNightLen = prevSunset !== null ? dayStart - prevSunset : nightLen;

  return {
    date,
    timezone,
    weekday,
    sunrise: iso(sunrise),
    sunset: iso(sunset),
    nextSunrise: iso(nextSunrise),
    dayLengthMinutes: Math.round(dayLen * 1440),
    nightLengthMinutes: Math.round(nightLen * 1440),
    rahuKalam: eighth(RAHU_PART[weekdayIdx]),
    yamaganda: eighth(YAMAGANDA_PART[weekdayIdx]),
    gulikaKalam: eighth(GULIKA_PART[weekdayIdx]),
    abhijit: tspan(part(dayStart, dayLen, 15, 7), part(dayStart, dayLen, 15, 8)),
    brahmaMuhurta: tspan(dayStart - (prevNightLen * 2) / 15, dayStart - prevNightLen / 15),
    choghadiya: { day: chogDay, night: chogNight },
    hora: { day: horaDay, night: horaNight },
    _jd: { localMidnight: localMidnightJd, dayStart, dayEnd, panchangEnd },
  };
}

export function computePanchang(date: string, latitude: number, longitude: number, timezone: string): Panchang {
  const t = computeDayTimes(date, latitude, longitude, timezone);
  const { dayStart, panchangEnd } = t._jd;
  const [y, m] = date.split("-").map(Number);
  const iso = (jd: number | null) => (jd === null ? null : jdToLocalIso(jd, timezone));

  // Moonrise/moonset use the Moon's disc centre without refraction (common panchang convention).
  const moonrise = riseSet(dayStart, Planet.Moon, RiseTransitFlag.Rise | DISC_CENTER_NO_REFRACTION, latitude, longitude);
  const moonset = riseSet(dayStart, Planet.Moon, RiseTransitFlag.Set | DISC_CENTER_NO_REFRACTION, latitude, longitude);

  const span = (fn: (jd: number) => number, names: (i: number) => string, step: number): ElementSpan[] =>
    segments(fn, dayStart, panchangEnd, step).map((s) => ({ name: names(s.index), end: iso(s.endJd) }));

  const tithiAtSunrise = tithiIndex(dayStart);

  // Lunar month (amanta): new moon that began the current month and the next one.
  const nm1 = previousNewMoon(dayStart);
  const nm2 = nextNewMoon(nm1 + 1);
  const signAtNm1 = sunSignIndex(nm1);
  const signAtNm2 = sunSignIndex(nm2);
  const adhika = signAtNm1 === signAtNm2;
  const amantaIdx = (signAtNm1 + 1) % 12;
  const amanta = LUNAR_MONTHS[amantaIdx];
  const krishna = tithiAtSunrise >= 15;
  // Purnimanta: Krishna paksha takes the next month's name, except inside an Adhika month,
  // whose two pakshas keep the Adhika name in both systems.
  const purnimanta = krishna && !adhika ? LUNAR_MONTHS[(amantaIdx + 1) % 12] : amanta;

  // Vikram Samvat changes at Chaitra Shukla Pratipada.
  const beforeChaitra = amantaIdx >= 10 || (amantaIdx === 9 && m <= 3);
  const vikramSamvat = y + (beforeChaitra ? 56 : 57);

  const { _jd, ...times } = t;
  void _jd;
  return {
    ...times,
    latitude,
    longitude,
    moonrise: moonrise !== null && moonrise < panchangEnd ? iso(moonrise) : null,
    moonset: moonset !== null && moonset < panchangEnd ? iso(moonset) : null,
    paksha: krishna ? "Krishna" : "Shukla",
    tithi: span(tithiIndex, (i) => `${i < 15 ? "Shukla" : "Krishna"} ${TITHI_NAMES[i]}`, 1 / 12),
    nakshatra: span(nakshatraIndex, (i) => NAKSHATRA_NAMES[i], 1 / 12),
    yoga: span(yogaIndex, (i) => YOGA_NAMES[i], 1 / 12),
    karana: span(karanaIndex, karanaName, 1 / 24),
    moonSign: span(moonSignIndex, (i) => SIGN_SANSKRIT[i], 1 / 6),
    sunSign: SIGN_SANSKRIT[sunSignIndex(dayStart)],
    lunarMonth: { amanta, purnimanta, adhika },
    vikramSamvat,
    shakaSamvat: vikramSamvat - 135,
    ayanamsa: getAyanamsa(dayStart),
  };
}

export const SIGN_SANSKRIT = [
  "Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya",
  "Tula", "Vrishchika", "Dhanu", "Makara", "Kumbha", "Meena",
];
