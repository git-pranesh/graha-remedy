/**
 * Hindu calendar events: Ekadashi, Amavasya, Purnima occurrences with tithi window and observance day.
 * Observance rules (Smarta, as used by most North Indian panchangs):
 *  - Udaya tithi: the civil day whose sunrise falls inside the tithi.
 *  - Ekadashi: day with Ekadashi at sunrise; if at two sunrises, the first unless it is Dashami-viddha
 *    (Dashami extends into the last 5 ghatis before that sunrise), then the second; if at no sunrise
 *    (kshaya), the day on which it begins.
 *    Trisparsha exception: if Trayodashi starts before the next sunrise, the day Ekadashi begins.
 *  - Amavasya / Purnima: "vrat" (Darsha / Purnima vrat) day is the first day the tithi prevails at the
 *    start of aparahna (3/5 of daytime);
 *    snan-daan day is the udaya day (or the begin day if kshaya).
 */
import { julianDay, Planet, RiseTransitFlag } from "@swisseph/node";
import { riseSet, segments, tithiIndex, lunarMonthAt, LUNAR_MONTHS, jdToLocalIso } from "./panchang";
import { utcOffsetForLocalTime } from "./geocoder";

export interface Place { latitude: number; longitude: number; timezone: string }

const localDate = (jd: number, tz: string) => jdToLocalIso(jd, tz).slice(0, 10);
function addDays(date: string, n: number) {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}
function localMidnightJd(date: string, tz: string) {
  const [y, m, d] = date.split("-").map(Number);
  return julianDay(y, m, d, 0) - utcOffsetForLocalTime(tz, y, m, d, 0, 0) / 24;
}
function sunrise(date: string, p: Place) {
  return riseSet(localMidnightJd(date, p.timezone), Planet.Sun, RiseTransitFlag.Rise, p.latitude, p.longitude)
    ?? localMidnightJd(date, p.timezone) + 0.25;
}
function sunset(date: string, p: Place) {
  return riseSet(sunrise(date, p), Planet.Sun, RiseTransitFlag.Set, p.latitude, p.longitude) ?? localMidnightJd(date, p.timezone) + 0.75;
}

export interface TithiOccurrence { index: number; startJd: number; endJd: number }

/** All tithi occurrences overlapping [fromJd, toJd]. */
export function tithiOccurrences(fromJd: number, toJd: number): TithiOccurrence[] {
  const segs = segments(tithiIndex, fromJd - 2, toJd + 2, 1 / 12);
  const out: TithiOccurrence[] = [];
  for (let i = 1; i < segs.length - 1; i++) {
    out.push({ index: segs[i].index, startJd: segs[i - 1].endJd!, endJd: segs[i].endJd! });
  }
  return out;
}

export type EventKind = "ekadashi" | "amavasya" | "purnima";

export interface CalendarEvent {
  kind: EventKind;
  paksha: "Shukla" | "Krishna";
  /** Purnimanta month name (North Indian convention) and amanta name. */
  monthPurnimanta: string;
  monthAmanta: string;
  adhika: boolean;
  begins: string; // ISO local
  ends: string;
  /** Main observance date (Ekadashi fast; Amavasya/Purnima snan-daan, i.e. udaya day). */
  date: string;
  /** Amavasya: Darsha day; Purnima: vrat day (may equal `date`). */
  vratDate?: string;
  /** Ekadashi: next day if the tithi touches two sunrises (Gauna / Vaishnava observance). */
  altDate?: string;
  name?: string;
}

const EKADASHI_NAMES: Record<string, [string, string]> = {
  // purnimanta month: [Krishna, Shukla]
  Chaitra: ["Papamochani", "Kamada"], Vaishakha: ["Varuthini", "Mohini"], Jyeshtha: ["Apara", "Nirjala"],
  Ashadha: ["Yogini", "Devshayani"], Shravana: ["Kamika", "Shravana Putrada"], Bhadrapada: ["Aja", "Parsva"],
  Ashwin: ["Indira", "Papankusha"], Kartika: ["Rama", "Devutthana"], Margashirsha: ["Utpanna", "Mokshada"],
  Pausha: ["Saphala", "Pausha Putrada"], Magha: ["Shattila", "Jaya"], Phalguna: ["Vijaya", "Amalaki"],
};

function sunriseDaysInside(o: TithiOccurrence, p: Place): string[] {
  const d0 = localDate(o.startJd, p.timezone);
  return [d0, addDays(d0, 1), addDays(d0, 2)].filter((d) => {
    const sr = sunrise(d, p);
    return sr >= o.startJd && sr < o.endJd;
  });
}

export function calendarEvents(year: number, p: Place, kinds: EventKind[] = ["ekadashi", "amavasya", "purnima"]): CalendarEvent[] {
  const from = localMidnightJd(`${year}-01-01`, p.timezone);
  const to = localMidnightJd(`${year + 1}-01-01`, p.timezone);
  const want = new Set<number>();
  if (kinds.includes("ekadashi")) { want.add(10); want.add(25); }
  if (kinds.includes("purnima")) want.add(14);
  if (kinds.includes("amavasya")) want.add(29);
  const out: CalendarEvent[] = [];
  for (const o of tithiOccurrences(from, to)) {
    if (!want.has(o.index)) continue;
    const krishna = o.index >= 15;
    const kind: EventKind = o.index === 14 ? "purnima" : o.index === 29 ? "amavasya" : "ekadashi";
    const mid = (o.startJd + o.endJd) / 2;
    const { amantaIdx, adhika } = lunarMonthAt(mid);
    const amanta = LUNAR_MONTHS[amantaIdx];
    const purnimanta = krishna && !adhika ? LUNAR_MONTHS[(amantaIdx + 1) % 12] : amanta;
    const days = sunriseDaysInside(o, p);
    const beginDay = localDate(o.startJd, p.timezone);
    const ev: CalendarEvent = {
      kind, paksha: krishna ? "Krishna" : "Shukla", monthPurnimanta: purnimanta, monthAmanta: amanta, adhika,
      begins: jdToLocalIso(o.startJd, p.timezone), ends: jdToLocalIso(o.endJd, p.timezone), date: days[0] ?? beginDay,
    };
    if (kind === "ekadashi") {
      if (days.length === 2) {
        const sr = sunrise(days[0], p);
        const prevSr = sunrise(addDays(days[0], -1), p);
        const viddha = o.startJd > sr - ((sr - prevSr) * 5) / 60;
        ev.date = viddha ? days[1] : days[0];
        if (!viddha) ev.altDate = days[1];
      }
      // Trisparsha: Ekadashi touches only one sunrise and Trayodashi begins before the next sunrise
      // (Ekadashi, Dwadashi, Trayodashi in one day) — Smartas fast on the day Ekadashi begins.
      if (days.length === 1 && beginDay < days[0]) {
        const next = tithiOccurrences(o.endJd, o.endJd + 3).find((x) => x.index === o.index + 2);
        if (next && next.startJd < sunrise(addDays(days[0], 1), p)) ev.date = beginDay;
      }
      const n = EKADASHI_NAMES[purnimanta];
      ev.name = adhika ? (krishna ? "Parama" : "Padmini") : n ? n[krishna ? 0 : 1] : undefined;
    } else {
      // first day on which the tithi prevails at the start of aparahna (3/5 of daytime)
      const cand = [beginDay, addDays(beginDay, 1)].find((d) => {
        const sr = sunrise(d, p);
        const t = sr + ((sunset(d, p) - sr) * 3) / 5;
        return t >= o.startJd && t < o.endJd;
      });
      ev.vratDate = cand ?? ev.date;
    }
    if (localDate(o.endJd, p.timezone) < `${year}-01-01` || ev.date.slice(0, 4) !== String(year)) continue;
    out.push(ev);
  }
  return out;
}
