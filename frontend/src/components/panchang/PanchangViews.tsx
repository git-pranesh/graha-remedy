import type { ChoghadiyaSlot, DayTimes, ElementSpan, HoraSlot, Panchang } from "../../services/panchang";
import { fmtDuration, fmtRange, fmtTime, isNow } from "../../lib/panchang-format";

function Elements({ items, base }: { items: ElementSpan[]; base: string }) {
  return (
    <>
      {items.map((e, i) => (
        <span key={`${e.name}-${i}`} className="pc-el">
          <strong>{e.name}</strong>
          {e.end ? <> until {fmtTime(e.end, base)}</> : i > 0 ? <> thereafter</> : <> all day</>}
          {i < items.length - 1 && <span className="pc-sep">, then </span>}
        </span>
      ))}
    </>
  );
}

/** The five limbs and calendar details. */
export function PanchangCore({ p }: { p: Panchang }) {
  const base = p.date;
  return (
    <table className="tool-table pc-table">
      <tbody>
        <tr><th>Tithi</th><td><Elements items={p.tithi} base={base} /></td></tr>
        <tr><th>Nakshatra</th><td><Elements items={p.nakshatra} base={base} /></td></tr>
        <tr><th>Yoga</th><td><Elements items={p.yoga} base={base} /></td></tr>
        <tr><th>Karana</th><td><Elements items={p.karana} base={base} /></td></tr>
        <tr><th>Vara (weekday)</th><td>{p.weekday.sanskrit} ({p.weekday.english})</td></tr>
        <tr><th>Paksha</th><td>{p.paksha} Paksha</td></tr>
        <tr>
          <th>Lunar month</th>
          <td>
            {p.lunarMonth.adhika ? "Adhika " : ""}
            {p.lunarMonth.amanta} (amanta) · {p.lunarMonth.adhika ? "Adhika " : ""}
            {p.lunarMonth.purnimanta} (purnimanta)
          </td>
        </tr>
        <tr><th>Samvat</th><td>Vikram Samvat {p.vikramSamvat} · Shaka {p.shakaSamvat}</td></tr>
        <tr><th>Moon sign</th><td><Elements items={p.moonSign} base={base} /></td></tr>
        <tr><th>Sun sign</th><td>{p.sunSign}</td></tr>
      </tbody>
    </table>
  );
}

export function SunMoon({ p }: { p: Panchang }) {
  const base = p.date;
  return (
    <table className="tool-table pc-table">
      <tbody>
        <tr><th>Sunrise</th><td>{fmtTime(p.sunrise, base)}</td></tr>
        <tr><th>Sunset</th><td>{fmtTime(p.sunset, base)}</td></tr>
        <tr><th>Moonrise</th><td>{p.moonrise ? fmtTime(p.moonrise, base) : "No moonrise before next sunrise"}</td></tr>
        <tr><th>Moonset</th><td>{p.moonset ? fmtTime(p.moonset, base) : "No moonset before next sunrise"}</td></tr>
        <tr><th>Day length</th><td>{fmtDuration(p.dayLengthMinutes)}</td></tr>
        <tr><th>Night length</th><td>{fmtDuration(p.nightLengthMinutes)}</td></tr>
      </tbody>
    </table>
  );
}

export function Muhurtas({ t, nowMs }: { t: Omit<DayTimes, "_jd">; nowMs?: number }) {
  const base = t.date;
  const wed = t.weekday.english === "Wednesday";
  const row = (label: string, span: { start: string; end: string }, cls: string, note?: string) => (
    <tr className={nowMs !== undefined && isNow(span, nowMs) ? "current" : undefined}>
      <th>
        <span className={`pc-dot ${cls}`} /> {label}
      </th>
      <td>
        {fmtRange(span, base)}
        {note && <span className="pc-note"> {note}</span>}
      </td>
    </tr>
  );
  return (
    <table className="tool-table pc-table">
      <tbody>
        {row("Rahu Kalam", t.rahuKalam, "bad")}
        {row("Yamaganda", t.yamaganda, "bad")}
        {row("Gulika Kalam", t.gulikaKalam, "bad")}
        {wed ? (
          <tr>
            <th><span className="pc-dot good" /> Abhijit Muhurta</th>
            <td>Not observed on Wednesdays</td>
          </tr>
        ) : (
          row("Abhijit Muhurta", t.abhijit, "good")
        )}
        {row("Brahma Muhurta", t.brahmaMuhurta, "good")}
      </tbody>
    </table>
  );
}

export function ChoghadiyaTable({ slots, base, nowMs, label }: { slots: ChoghadiyaSlot[]; base: string; nowMs?: number; label: string }) {
  return (
    <div className="tool-table-scroll">
      <table className="tool-table pc-chog">
        <caption>{label}</caption>
        <thead>
          <tr><th>Choghadiya</th><th>Time</th><th>Nature</th></tr>
        </thead>
        <tbody>
          {slots.map((c) => (
            <tr key={c.start} className={nowMs !== undefined && isNow(c, nowMs) ? "current" : undefined}>
              <td><span className={`pc-dot ${c.nature}`} /> {c.name} <span className="pc-note">({c.meaning})</span></td>
              <td>{fmtRange(c, base)}</td>
              <td>{c.nature === "good" ? "Auspicious" : c.nature === "neutral" ? "Neutral (good for travel)" : "Inauspicious"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function HoraTable({ slots, base, nowMs, label }: { slots: HoraSlot[]; base: string; nowMs?: number; label: string }) {
  return (
    <div className="tool-table-scroll">
      <table className="tool-table pc-chog">
        <caption>{label}</caption>
        <thead>
          <tr><th>Hora (planet)</th><th>Time</th></tr>
        </thead>
        <tbody>
          {slots.map((h) => (
            <tr key={h.start} className={nowMs !== undefined && isNow(h, nowMs) ? "current" : undefined}>
              <td>{h.planet}</td>
              <td>{fmtRange(h, base)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
