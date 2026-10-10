/**
 * Hindu festival dates from tithi rules (Smarta conventions used by North Indian panchangs).
 * Each festival: amanta lunar month, tithi (0-29), and the part of the day ("kala") in which the
 * tithi must prevail. Validated against published New Delhi dates for 2026-2027 (see About page).
 */
import { Planet, RiseTransitFlag } from "@swisseph/node";
import { jdToLocalIso, lunarMonthAt, riseSet, LUNAR_MONTHS, nakshatraIndex } from "./panchang";
import { tithiOccurrences, sunrise, sunset, addDays, localMidnightJd, type Place } from "./calendar";

export type Kala = "sunrise" | "purvahna" | "madhyahna" | "aparahna" | "pradosh" | "nishita" | "moonrise" | "sunset";

export interface FestivalDef {
  slug: string;
  name: string;
  hindi: string;
  /** Amanta month index, 0 = Chaitra. */
  month: number;
  /** Tithi index 0-29 (0 = Shukla Pratipada, 14 = Purnima, 15 = Krishna Pratipada, 29 = Amavasya). */
  tithi: number;
  kala: Kala;
  /** When the tithi prevails in the kala on two days: which to take. */
  prefer?: "first" | "second";
  /** Offset in days from the computed date (e.g. Holi = Holika Dahan + 1). */
  offset?: number;
  /** Festival-specific classical rule overriding the generic kala rule. */
  rule?: "raksha" | "holika" | "janmashtami" | "purvahna3";
  desc: string;
}

const M = Object.fromEntries(LUNAR_MONTHS.map((m, i) => [m, i])) as Record<string, number>;

export const FESTIVALS: FestivalDef[] = [
  { slug: "vasant-panchami", name: "Vasant Panchami", hindi: "वसंत पंचमी", month: M.Magha, tithi: 4, kala: "purvahna", desc: "Saraswati puja on Magha Shukla Panchami." },
  { slug: "maha-shivaratri", name: "Maha Shivaratri", hindi: "महाशिवरात्रि", month: M.Magha, tithi: 28, kala: "nishita", desc: "Phalguna Krishna Chaturdashi (Magha in the amanta calendar), observed on the night the tithi prevails at Nishita kaal." },
  { slug: "holi", name: "Holi", hindi: "होली", month: M.Phalguna, tithi: 14, kala: "pradosh", rule: "holika", offset: 1, desc: "Rangwali Holi (Dhulandi) on Chaitra Krishna Pratipada, the day after Holika Dahan." },
  { slug: "holika-dahan", name: "Holika Dahan", hindi: "होलिका दहन", month: M.Phalguna, tithi: 14, kala: "pradosh", rule: "holika", desc: "Bonfire on the evening of Phalguna Purnima, the night before Holi." },
  { slug: "ugadi", name: "Ugadi / Gudi Padwa", hindi: "उगादि / गुड़ी पड़वा", month: M.Chaitra, tithi: 0, kala: "sunrise", desc: "Hindu lunar new year on Chaitra Shukla Pratipada; also the first day of Chaitra Navratri." },
  { slug: "rama-navami", name: "Rama Navami", hindi: "राम नवमी", month: M.Chaitra, tithi: 8, kala: "madhyahna", desc: "Birth of Rama on Chaitra Shukla Navami, observed when Navami prevails at midday." },
  { slug: "hanuman-jayanti", name: "Hanuman Jayanti", hindi: "हनुमान जयंती", month: M.Chaitra, tithi: 14, kala: "sunrise", desc: "Chaitra Purnima (North Indian tradition)." },
  { slug: "akshaya-tritiya", name: "Akshaya Tritiya", hindi: "अक्षय तृतीया", month: M.Vaishakha, tithi: 2, kala: "purvahna", rule: "purvahna3", desc: "Vaishakha Shukla Tritiya." },
  { slug: "buddha-purnima", name: "Buddha Purnima", hindi: "बुद्ध पूर्णिमा", month: M.Vaishakha, tithi: 14, kala: "sunrise", desc: "Vaishakha Purnima." },
  { slug: "guru-purnima", name: "Guru Purnima", hindi: "गुरु पूर्णिमा", month: M.Ashadha, tithi: 14, kala: "sunrise", desc: "Ashadha Purnima, also Vyasa Purnima." },
  { slug: "hariyali-teej", name: "Hariyali Teej", hindi: "हरियाली तीज", month: M.Shravana, tithi: 2, kala: "sunrise", desc: "Shravana Shukla Tritiya." },
  { slug: "raksha-bandhan", name: "Raksha Bandhan", hindi: "रक्षा बंधन", month: M.Shravana, tithi: 14, kala: "aparahna", rule: "raksha", desc: "Shravana Purnima; rakhi is tied outside Bhadra." },
  { slug: "krishna-janmashtami", name: "Krishna Janmashtami", hindi: "कृष्ण जन्माष्टमी", month: M.Shravana, tithi: 22, kala: "nishita", rule: "janmashtami", desc: "Bhadrapada Krishna Ashtami (Shravana in the amanta calendar), observed when Ashtami prevails at midnight (Smarta)." },
  { slug: "hartalika-teej", name: "Hartalika Teej", hindi: "हरतालिका तीज", month: M.Bhadrapada, tithi: 2, kala: "sunrise", desc: "Bhadrapada Shukla Tritiya." },
  { slug: "ganesh-chaturthi", name: "Ganesh Chaturthi", hindi: "गणेश चतुर्थी", month: M.Bhadrapada, tithi: 3, kala: "madhyahna", desc: "Bhadrapada Shukla Chaturthi, observed when Chaturthi prevails at midday." },
  { slug: "anant-chaturdashi", name: "Anant Chaturdashi", hindi: "अनंत चतुर्दशी", month: M.Bhadrapada, tithi: 13, kala: "sunrise", desc: "Bhadrapada Shukla Chaturdashi; Ganesh visarjan." },
  { slug: "navratri", name: "Sharad Navratri (Ghatasthapana)", hindi: "शारदीय नवरात्रि", month: M.Ashwin, tithi: 0, kala: "sunrise", desc: "Ashwin Shukla Pratipada, first day of Sharad Navratri." },
  { slug: "durga-ashtami", name: "Durga Ashtami", hindi: "दुर्गा अष्टमी", month: M.Ashwin, tithi: 7, kala: "sunrise", desc: "Ashwin Shukla Ashtami (Maha Ashtami)." },
  { slug: "dussehra", name: "Dussehra (Vijayadashami)", hindi: "दशहरा", month: M.Ashwin, tithi: 9, kala: "aparahna", desc: "Ashwin Shukla Dashami, observed when Dashami prevails in the afternoon (Aparahna)." },
  { slug: "sharad-purnima", name: "Sharad Purnima", hindi: "शरद पूर्णिमा", month: M.Ashwin, tithi: 14, kala: "nishita", desc: "Ashwin Purnima (Kojagara), observed on the night Purnima prevails at midnight." },
  { slug: "karwa-chauth", name: "Karwa Chauth", hindi: "करवा चौथ", month: M.Ashwin, tithi: 18, kala: "moonrise", desc: "Kartika Krishna Chaturthi (Ashwin in the amanta calendar); the fast ends at moonrise." },
  { slug: "ahoi-ashtami", name: "Ahoi Ashtami", hindi: "अहोई अष्टमी", month: M.Ashwin, tithi: 22, kala: "pradosh", desc: "Kartika Krishna Ashtami (Ashwin in the amanta calendar)." },
  { slug: "dhanteras", name: "Dhanteras", hindi: "धनतेरस", month: M.Ashwin, tithi: 27, kala: "pradosh", desc: "Kartika Krishna Trayodashi (Ashwin amanta), observed when Trayodashi prevails at Pradosh." },
  { slug: "narak-chaturdashi", name: "Narak Chaturdashi", hindi: "नरक चतुर्दशी", month: M.Ashwin, tithi: 28, kala: "sunrise", desc: "Kartika Krishna Chaturdashi (Choti Diwali), Abhyang snan before sunrise." },
  { slug: "diwali", name: "Diwali (Lakshmi Puja)", hindi: "दिवाली", month: M.Ashwin, tithi: 29, kala: "pradosh", desc: "Kartika Amavasya (Ashwin in the amanta calendar); Lakshmi puja when Amavasya prevails at Pradosh." },
  { slug: "govardhan-puja", name: "Govardhan Puja", hindi: "गोवर्धन पूजा", month: M.Kartika, tithi: 0, kala: "sunrise", desc: "Kartika Shukla Pratipada." },
  { slug: "bhai-dooj", name: "Bhai Dooj", hindi: "भाई दूज", month: M.Kartika, tithi: 1, kala: "aparahna", desc: "Kartika Shukla Dwitiya, observed when Dwitiya prevails in the afternoon." },
  { slug: "chhath-puja", name: "Chhath Puja", hindi: "छठ पूजा", month: M.Kartika, tithi: 5, kala: "sunset", desc: "Kartika Shukla Shashthi; evening arghya to the setting Sun." },
  { slug: "kartik-purnima", name: "Kartik Purnima", hindi: "कार्तिक पूर्णिमा", month: M.Kartika, tithi: 14, kala: "sunrise", desc: "Kartika Purnima, Dev Deepawali." },
];

export interface FestivalDate {
  def: FestivalDef;
  date: string;
  begins: string;
  ends: string;
}

export function kalaWindow(date: string, kala: Kala, p: Place): [number, number] {
  return window(date, kala, p);
}

function window(date: string, kala: Kala, p: Place): [number, number] {
  const sr = sunrise(date, p);
  const ss = sunset(date, p);
  const nsr = sunrise(addDays(date, 1), p);
  const D = ss - sr, N = nsr - ss;
  switch (kala) {
    case "sunrise": return [sr, sr];
    case "sunset": return [ss, ss];
    case "purvahna": return [sr, sr + D / 2];
    case "madhyahna": return [sr + (2 * D) / 5, sr + (3 * D) / 5];
    case "aparahna": return [sr + (3 * D) / 5, sr + (4 * D) / 5];
    case "pradosh": return [ss, ss + N / 5];
    case "nishita": return [ss + (7 * N) / 15, ss + (8 * N) / 15];
    case "moonrise": {
      const mr = riseSet(localMidnightJd(date, p.timezone) + 0.5, Planet.Moon, RiseTransitFlag.Rise, p.latitude, p.longitude) ?? ss;
      return [mr, mr];
    }
  }
}

function coverage(w: [number, number], a: number, b: number): number {
  if (w[0] === w[1]) return w[0] >= a && w[0] < b ? 1 : 0;
  return Math.max(0, Math.min(w[1], b) - Math.max(w[0], a)) / (w[1] - w[0]);
}

export function festivalDates(year: number, p: Place, defs: FestivalDef[] = FESTIVALS): FestivalDate[] {
  const from = localMidnightJd(`${year}-01-01`, p.timezone) - 3;
  const to = localMidnightJd(`${year + 1}-01-01`, p.timezone) + 3;
  const occ = tithiOccurrences(from, to);
  const out: FestivalDate[] = [];
  for (const def of defs) {
    for (const o of occ) {
      if (o.index !== def.tithi) continue;
      const { amantaIdx, adhika } = lunarMonthAt((o.startJd + o.endJd) / 2);
      if (adhika || amantaIdx !== def.month) continue;
      const d0 = jdToLocalIso(o.startJd, p.timezone).slice(0, 10);
      const cands = [addDays(d0, -1), d0, addDays(d0, 1), addDays(d0, 2)]
        .map((d) => ({ d, c: coverage(window(d, def.kala, p), o.startJd, o.endJd) }))
        .filter((x) => x.c > 0);
      let date: string;
      const special = def.rule ? specialRule(def.rule, o, d0, p) : null;
      if (special) date = special;
      else if (cands.length === 0) date = d0;
      else if (cands.length === 1) date = cands[0].d;
      else if (def.prefer === "second") date = cands[cands.length - 1].d;
      else if (def.prefer === "first") date = cands[0].d;
      else date = cands.reduce((a, b) => (b.c > a.c ? b : a)).d;
      if (def.offset) date = addDays(date, def.offset);
      if (date.startsWith(String(year))) {
        out.push({ def, date, begins: jdToLocalIso(o.startJd, p.timezone), ends: jdToLocalIso(o.endJd, p.timezone) });
      }
    }
  }
  return out.sort((a, b) => a.date.localeCompare(b.date));
}

const ROHINI = 3;

/** Classical rules (Dharmasindhu / Nirnayasindhu) as applied by Drik-style Smarta panchangs. */
function specialRule(rule: NonNullable<FestivalDef["rule"]>, o: { startJd: number; endJd: number }, d0: string, p: Place): string | null {
  const days = [d0, addDays(d0, 1), addDays(d0, 2)];
  if (rule === "raksha") {
    // Purnima at sunrise lasting at least 6 ghatis (2/5 of a muhurta-day ≈ 2h24m): that day (Bhadra is over).
    for (const d of days) {
      const sr = sunrise(d, p);
      if (sr >= o.startJd && sr < o.endJd && o.endJd - sr >= 6 / 60) return d;
    }
    return null;
  }
  if (rule === "purvahna3") {
    // Forenoon-prevailing tithi present on two days: the second only if it lasts 3 muhurtas (~6 ghatis) after sunrise.
    const both = days.filter((d) => coverage(window(d, "purvahna", p), o.startJd, o.endJd) > 0);
    if (both.length < 2) return both[0] ?? null;
    const sr2 = sunrise(both[1], p);
    return o.endJd - sr2 >= 0.1 ? both[1] : both[0];
  }
  if (rule === "holika") {
    // First day with Purnima at Pradosh. If on the next day Purnima lasts 3.5 prahars after sunrise
    // and Pratipada is longer than Purnima (vriddhi), Holika Dahan moves to that next day.
    const first = days.find((d) => coverage(window(d, "pradosh", p), o.startJd, o.endJd) > 0);
    if (!first) return null;
    const nd = addDays(first, 1);
    const sr = sunrise(nd, p), ss = sunset(nd, p);
    const next = tithiOccurrences(o.endJd - 0.1, o.endJd + 2).find((x) => x.startJd >= o.endJd - 1e-6);
    const vriddhi = next ? next.endJd - next.startJd > o.endJd - o.startJd : false;
    if (sr >= o.startJd && o.endJd >= sr + 0.875 * (ss - sr) && vriddhi) return nd;
    return first;
  }
  if (rule === "janmashtami") {
    // Midnight (Nishita) with Ashtami and Rohini > Rohini at Nishita on a day Ashtami prevails at sunrise > Ashtami at Nishita.
    let best: string | null = null, bestScore = 0;
    for (const d of [addDays(d0, -1), ...days]) {
      const w = window(d, "nishita", p);
      const mid = (w[0] + w[1]) / 2;
      const ash = mid >= o.startJd && mid < o.endJd;
      const roh = nakshatraIndex(mid) === ROHINI;
      const sr = sunrise(d, p);
      const ashSunrise = sr >= o.startJd && sr < o.endJd;
      const score = ash && roh ? 3 : roh && ashSunrise ? 2 : ash ? 1 : 0;
      if (score > bestScore) { best = d; bestScore = score; }
    }
    return best;
  }
  return null;
}
