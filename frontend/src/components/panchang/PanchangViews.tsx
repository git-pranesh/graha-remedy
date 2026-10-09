import type { ChoghadiyaSlot, DayTimes, ElementSpan, HoraSlot, Panchang } from "../../services/panchang";
import { fmtDuration, fmtRange, fmtTime, isNow } from "../../lib/panchang-format";
import { L, tr, trTithi, type Lang, type NameKind } from "../../lib/hi";
import { SAMVATSARAS } from "../../lib/cycles";

/** Tamil year name: same 60-year cycle as the samvatsara, but it changes at Chithirai 1 instead of Ugadi. */
export function tamilYearName(p: Panchang): string {
  let i = SAMVATSARAS.indexOf(p.samvatsara);
  if (p.tamilDate.month === "Panguni" && p.lunarMonth.amanta === "Chaitra") i -= 1;
  if (p.tamilDate.month === "Chithirai" && p.lunarMonth.amanta === "Phalguna") i += 1;
  return SAMVATSARAS[(i + 60) % 60];
}

function Elements({ items, base, lang, kind }: { items: ElementSpan[]; base: string; lang: Lang; kind: NameKind | "tithi-full" }) {
  const l = L[lang];
  const name = (n: string) => (kind === "tithi-full" ? trTithi(lang, n) : tr(lang, kind, n));
  return (
    <>
      {items.map((e, i) => (
        <span key={`${e.name}-${i}`} className="pc-el">
          <strong>{name(e.name)}</strong>
          {e.end ? (lang !== "en" ? <> {fmtTime(e.end, base, lang)} {l.until}</> : <> {l.until} {fmtTime(e.end, base, lang)}</>) : i > 0 ? <> {l.thereafter}</> : <> {l.allDay}</>}
          {i < items.length - 1 && <span className="pc-sep">{l.then}</span>}
        </span>
      ))}
    </>
  );
}

/** The five limbs and calendar details. */
export function PanchangCore({ p, lang = "en" }: { p: Panchang; lang?: Lang }) {
  const base = p.date;
  const l = L[lang];
  return (
    <table className="tool-table pc-table">
      <tbody>
        <tr><th>{l.tithi}</th><td><Elements items={p.tithi} base={base} lang={lang} kind="tithi-full" /></td></tr>
        <tr><th>{l.nakshatra}</th><td><Elements items={p.nakshatra} base={base} lang={lang} kind="nakshatra" /></td></tr>
        <tr><th>{l.yoga}</th><td><Elements items={p.yoga} base={base} lang={lang} kind="yoga" /></td></tr>
        <tr><th>{l.karana}</th><td><Elements items={p.karana} base={base} lang={lang} kind="karana" /></td></tr>
        <tr><th>{l.vara}</th><td>{lang !== "en" ? tr(lang, "weekday", p.weekday.english) : `${p.weekday.sanskrit} (${p.weekday.english})`}</td></tr>
        <tr><th>{l.paksha}</th><td>{tr(lang, "paksha", p.paksha)} {l.pakshaWord}</td></tr>
        <tr>
          <th>{l.lunarMonth}</th>
          <td>
            {p.lunarMonth.adhika ? l.adhika : ""}{tr(lang, "month", p.lunarMonth.amanta)} ({l.amanta}) · {p.lunarMonth.adhika ? l.adhika : ""}
            {tr(lang, "month", p.lunarMonth.purnimanta)} ({l.purnimanta})
          </td>
        </tr>
        <tr><th>{l.samvat}</th><td>{l.vikram} {p.vikramSamvat} · {l.shaka} {p.shakaSamvat}</td></tr>
        <tr><th>{l.samvatsara}</th><td>{tr(lang, "samvatsara", lang === "ta" ? tamilYearName(p) : p.samvatsara)}</td></tr>
        {lang !== "te" && <tr><th>{l.tamilDate}</th><td>{tr(lang, "tamilMonth", p.tamilDate.month)} {p.tamilDate.day}</td></tr>}
        <tr><th>{l.moonSign}</th><td><Elements items={p.moonSign} base={base} lang={lang} kind="sign" /></td></tr>
        <tr><th>{l.sunSign}</th><td>{tr(lang, "sign", p.sunSign)}</td></tr>
      </tbody>
    </table>
  );
}

export function SunMoon({ p, lang = "en" }: { p: Panchang; lang?: Lang }) {
  const base = p.date;
  const l = L[lang];
  return (
    <table className="tool-table pc-table">
      <tbody>
        <tr><th>{l.sunrise}</th><td>{fmtTime(p.sunrise, base, lang)}</td></tr>
        <tr><th>{l.sunset}</th><td>{fmtTime(p.sunset, base, lang)}</td></tr>
        <tr><th>{l.moonrise}</th><td>{p.moonrise ? fmtTime(p.moonrise, base, lang) : l.noMoonrise}</td></tr>
        <tr><th>{l.moonset}</th><td>{p.moonset ? fmtTime(p.moonset, base, lang) : l.noMoonset}</td></tr>
        <tr><th>{l.dayLen}</th><td>{fmtDuration(p.dayLengthMinutes, lang)}</td></tr>
        <tr><th>{l.nightLen}</th><td>{fmtDuration(p.nightLengthMinutes, lang)}</td></tr>
      </tbody>
    </table>
  );
}

export function Muhurtas({ t, nowMs, lang = "en" }: { t: Omit<DayTimes, "_jd"> & Partial<Pick<Panchang, "durMuhurtham" | "varjyam" | "amritKalam">>; nowMs?: number; lang?: Lang }) {
  const base = t.date;
  const l = L[lang];
  const wed = t.weekday.english === "Wednesday";
  const row = (label: string, span: { start: string; end: string }, cls: string, note?: string) => (
    <tr key={`${label}-${span.start}`} className={nowMs !== undefined && isNow(span, nowMs) ? "current" : undefined}>
      <th>
        <span className={`pc-dot ${cls}`} /> {label}
      </th>
      <td>
        {fmtRange(span, base, lang)}
        {note && <span className="pc-note"> {note}</span>}
      </td>
    </tr>
  );
  return (
    <table className="tool-table pc-table">
      <tbody>
        {row(l.rahu, t.rahuKalam, "bad")}
        {row(l.yama, t.yamaganda, "bad")}
        {row(l.gulika, t.gulikaKalam, "bad")}
        {wed ? (
          <tr>
            <th><span className="pc-dot good" /> {l.abhijit}</th>
            <td>{l.notWed}</td>
          </tr>
        ) : (
          row(l.abhijit, t.abhijit, "good")
        )}
        {row(l.brahma, t.brahmaMuhurta, "good")}
        {t.amritKalam?.map((a) => row(l.amrit, a, "good"))}
        {t.durMuhurtham?.map((a) => row(l.dur, a, "bad"))}
        {t.varjyam?.map((a) => row(l.varjyam, a, "bad"))}
      </tbody>
    </table>
  );
}

export function ChoghadiyaTable({ slots, base, nowMs, label, lang = "en" }: { slots: ChoghadiyaSlot[]; base: string; nowMs?: number; label: string; lang?: Lang }) {
  const l = L[lang];
  return (
    <div className="tool-table-scroll">
      <table className="tool-table pc-chog">
        <caption>{label}</caption>
        <thead>
          <tr><th>{l.chogCol}</th><th>{l.time}</th><th>{l.nature}</th></tr>
        </thead>
        <tbody>
          {slots.map((c) => (
            <tr key={c.start} className={nowMs !== undefined && isNow(c, nowMs) ? "current" : undefined}>
              <td><span className={`pc-dot ${c.nature}`} /> {tr(lang, "chog", c.name)} <span className="pc-note">({tr(lang, "chogMeaning", c.meaning)})</span></td>
              <td>{fmtRange(c, base, lang)}</td>
              <td>{l[c.nature]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function HoraTable({ slots, base, nowMs, label, lang = "en" }: { slots: HoraSlot[]; base: string; nowMs?: number; label: string; lang?: Lang }) {
  const l = L[lang];
  return (
    <div className="tool-table-scroll">
      <table className="tool-table pc-chog">
        <caption>{label}</caption>
        <thead>
          <tr><th>{l.horaCol}</th><th>{l.time}</th></tr>
        </thead>
        <tbody>
          {slots.map((h) => (
            <tr key={h.start} className={nowMs !== undefined && isNow(h, nowMs) ? "current" : undefined}>
              <td>{tr(lang, "planet", h.planet)}</td>
              <td>{fmtRange(h, base, lang)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
