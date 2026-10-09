/**
 * Single place where the site's ayanamsa is set: Swiss Ephemeris Lahiri (Chitrapaksha).
 *
 * Calibration note (Oct 2026): Drik Panchang prints a Lahiri value 0.006729° (24.2″) larger than
 * Swiss Ephemeris'. Adopting that offset made our nakshatra/yoga/moon-sign end times 1–2 min later
 * than Drik's (they matched to the minute without it) and moved Sankranti moments from ~5 min early
 * to ~5 min late. Their printed value is evidently not the one their element times use, so the
 * standard Lahiri mode is kept.
 */
import { setSiderealMode, SiderealMode } from "@swisseph/node";

let done = false;

export function initAyanamsa(): void {
  if (done) return;
  setSiderealMode(SiderealMode.Lahiri);
  done = true;
}
