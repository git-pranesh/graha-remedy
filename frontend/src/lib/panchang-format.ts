import { HI_MONTHS_GREG, L, tr, type Lang } from "./hi";

/** Formatting helpers for panchang times. All inputs are ISO strings with a UTC offset. */

const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** "6:18 AM", or "4:54 AM (9 Oct)" when the time falls on a later calendar day than `baseDate`. */
export function fmtTime(iso: string | null, baseDate?: string, lang: Lang = "en"): string {
  if (!iso) return "—";
  const date = iso.slice(0, 10);
  let h = Number(iso.slice(11, 13));
  const m = iso.slice(14, 16);
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  const t = `${h}:${m} ${ampm}`;
  if (baseDate && date !== baseDate) {
    const [, mo, d] = date.split("-").map(Number);
    return `${t} (${d} ${lang === "hi" ? HI_MONTHS_GREG[mo - 1].slice(0, 4) : MONTHS_SHORT[mo - 1]})`;
  }
  return t;
}

export function fmtRange(span: { start: string; end: string }, baseDate?: string, lang: Lang = "en"): string {
  return `${fmtTime(span.start, baseDate, lang)} – ${fmtTime(span.end, baseDate, lang)}`;
}

/** "Thursday, 8 October 2026" */
export function fmtDateLong(date: string, lang: Lang = "en"): string {
  const [y, m, d] = date.split("-").map(Number);
  const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return `${tr(lang, "weekday", WEEKDAYS[wd])}, ${d} ${lang === "hi" ? HI_MONTHS_GREG[m - 1] : MONTHS_LONG[m - 1]} ${y}`;
}

/** "8 Oct 2026" */
export function fmtDateShort(date: string, lang: Lang = "en"): string {
  const [y, m, d] = date.split("-").map(Number);
  return `${d} ${lang === "hi" ? HI_MONTHS_GREG[m - 1] : MONTHS_SHORT[m - 1]} ${y}`;
}

export function fmtDuration(minutes: number, lang: Lang = "en"): string {
  return `${Math.floor(minutes / 60)} ${L[lang].h} ${minutes % 60} ${L[lang].min}`;
}

/** Add days to a YYYY-MM-DD date. */
export function addDays(date: string, n: number): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

/** True if `nowMs` falls in [start, end). */
export function isNow(span: { start: string; end: string }, nowMs: number): boolean {
  return Date.parse(span.start) <= nowMs && nowMs < Date.parse(span.end);
}
