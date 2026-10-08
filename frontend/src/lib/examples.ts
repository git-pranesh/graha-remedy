import { computeToolReport, type ToolReport } from "../services/tool-report";
import { NAKSHATRAS, NAKSHATRA_SPAN, RASHIS, dms } from "./jyotish-data";

/** Fixed sample birth used for worked examples on calculator pages. */
export const EXAMPLE_BIRTH = {
  dateOfBirth: "1990-08-15",
  timeOfBirth: "06:30",
  placeOfBirth: "Chennai, Tamil Nadu, India",
  label: "15 August 1990, 6:30 AM, Chennai",
};

let cached: Promise<ToolReport> | null = null;

/** Engine output for the sample birth (computed on the server at render time). */
export function exampleReport(): Promise<ToolReport> {
  if (!cached) {
    cached = computeToolReport({
      dateOfBirth: EXAMPLE_BIRTH.dateOfBirth,
      timeOfBirth: EXAMPLE_BIRTH.timeOfBirth,
      placeOfBirth: EXAMPLE_BIRTH.placeOfBirth,
    });
  }
  return cached;
}

/** "Aries 13°20′ – 26°40′" style range for a span of the zodiac. */
export function zodiacRange(start: number, span: number): string {
  const end = start + span;
  const s1 = RASHIS[Math.floor(start / 30)].english;
  const endSignIdx = Math.floor((end - 1e-9) / 30);
  const s2 = RASHIS[endSignIdx].english;
  const endWithin = end - endSignIdx * 30;
  const endStr = `${Math.floor(endWithin)}°${String(Math.round((endWithin % 1) * 60)).padStart(2, "0")}'`;
  return s1 === s2 ? `${s1} ${dms(start, true)} – ${endStr}` : `${s1} ${dms(start, true)} – ${s2} ${endStr}`;
}

/** Nakshatra padas contained in each rashi, e.g. "Ashwini 1–4, Bharani 1–4, Krittika 1". */
export function nakshatrasInRashi(signIndex: number): string {
  const parts: string[] = [];
  const padaSpan = NAKSHATRA_SPAN / 4;
  for (let p = 0; p < 9; p++) {
    const lon = signIndex * 30 + p * padaSpan + padaSpan / 2;
    const n = NAKSHATRAS[Math.floor(lon / NAKSHATRA_SPAN)];
    const pada = Math.floor((lon % NAKSHATRA_SPAN) / padaSpan) + 1;
    const last = parts.length ? parts[parts.length - 1] : null;
    if (last && last.startsWith(n.name + " ")) {
      const first = last.slice(n.name.length + 1).split("–")[0];
      parts[parts.length - 1] = `${n.name} ${first}–${pada}`;
    } else {
      parts.push(`${n.name} ${pada}`);
    }
  }
  return parts.join(", ");
}
