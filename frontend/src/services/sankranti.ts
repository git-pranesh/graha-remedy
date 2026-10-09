/**
 * Sankranti: the moment the Sun enters each sidereal (Lahiri) sign.
 * Observance date: the date of the moment, or the next date if the moment falls after local sunset.
 */
import { julianDay, calculatePosition, setSiderealMode, Planet, RiseTransitFlag, SiderealMode } from "@swisseph/node";
import { SIDEREAL_FLAGS } from "./astro-engine";
import { riseSet, jdToLocalIso } from "./panchang";
import { utcOffsetForLocalTime } from "./geocoder";

export const SANKRANTI_NAMES = [
  "Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya", "Tula", "Vrishchika", "Dhanu", "Makara", "Kumbha", "Meena",
] as const;

export interface Sankranti {
  signIndex: number;
  name: string;
  /** ISO local time of the Sun's ingress. */
  moment: string;
  transitDate: string;
  observedDate: string;
}

let initialised = false;
function init() {
  if (!initialised) {
    setSiderealMode(SiderealMode.Lahiri);
    initialised = true;
  }
}

const sunLon = (jd: number) => ((calculatePosition(jd, Planet.Sun, SIDEREAL_FLAGS).longitude % 360) + 360) % 360;

export function sankrantis(year: number, p: { latitude: number; longitude: number; timezone: string }): Sankranti[] {
  init();
  const off = utcOffsetForLocalTime(p.timezone, year, 1, 1, 0, 0);
  const from = julianDay(year, 1, 1, 0) - off / 24 - 1;
  const to = julianDay(year + 1, 1, 1, 0) - off / 24 + 1;
  const out: Sankranti[] = [];
  let prev = from;
  for (let t = from + 1; t <= to; t += 1) {
    const a = Math.floor(sunLon(prev) / 30), b = Math.floor(sunLon(t) / 30);
    if (a !== b) {
      let lo = prev, hi = t;
      while (hi - lo > 1 / 86400) {
        const mid = (lo + hi) / 2;
        if (Math.floor(sunLon(mid) / 30) === a) lo = mid; else hi = mid;
      }
      const iso = jdToLocalIso(hi, p.timezone);
      const transitDate = iso.slice(0, 10);
      const sunset = riseSet(hi - 0.5, Planet.Sun, RiseTransitFlag.Set, p.latitude, p.longitude);
      // sunset on the local date of the moment
      const [y, m, d] = transitDate.split("-").map(Number);
      const mid0 = julianDay(y, m, d, 0) - utcOffsetForLocalTime(p.timezone, y, m, d, 0, 0) / 24;
      const ss = riseSet(mid0 + 0.4, Planet.Sun, RiseTransitFlag.Set, p.latitude, p.longitude) ?? sunset;
      const after = ss !== null && hi >= ss;
      const observedDate = after ? new Date(Date.UTC(y, m - 1, d + 1)).toISOString().slice(0, 10) : transitDate;
      out.push({ signIndex: b, name: SANKRANTI_NAMES[b], moment: iso, transitDate, observedDate });
    }
    prev = t;
  }
  return out.filter((s) => s.transitDate.startsWith(String(year)));
}
