import type { CalendarEvent } from "../../services/calendar";
import { fmtDateShort, fmtTime } from "../../lib/panchang-format";
import { tr, type Lang } from "../../lib/hi";

const WD = { en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], hi: ["रवि", "सोम", "मंगल", "बुध", "गुरु", "शुक्र", "शनि"] };
const T = {
  en: { fast: "Fasting day", date: "Date", ek: "Ekadashi", darsha: "Darsha (vrat) day", pur: "Purnima vrat day", month: "Month (purnimanta)", begins: "Tithi begins", ends: "Tithi ends", also: "Also", alt: "(Vaishnava / Gauna)", same: "Same day", adhika: "Adhika ", paksha: "" },
  hi: { fast: "व्रत की तिथि", date: "तिथि", ek: "एकादशी", darsha: "दर्श (व्रत) दिन", pur: "पूर्णिमा व्रत दिन", month: "मास (पूर्णिमांत)", begins: "तिथि प्रारंभ", ends: "तिथि समाप्त", also: "अगले दिन भी", alt: "(वैष्णव / गौण)", same: "उसी दिन", adhika: "अधिक ", paksha: " पक्ष" },
};

export default function EventTable({ events, today, lang = "en" }: { events: CalendarEvent[]; today?: string; lang?: Lang }) {
  const k = events[0]?.kind;
  const t = T[lang];
  const wd = (d: string) => WD[lang][new Date(d + "T00:00:00Z").getUTCDay()];
  const dt = (iso: string) => `${fmtTime(iso, undefined, lang)}, ${fmtDateShort(iso.slice(0, 10), lang).replace(/ \d{4}$/, "")}`;
  const nextIdx = today ? events.findIndex((x) => x.date >= today) : -1;
  return (
    <div className="tool-table-scroll">
      <table className="tool-table tool-table-wide">
        <thead>
          <tr>
            <th>{k === "ekadashi" ? t.fast : t.date}</th>
            {k === "ekadashi" && <th>{t.ek}</th>}
            {k === "amavasya" && <th>{t.darsha}</th>}
            {k === "purnima" && <th>{t.pur}</th>}
            <th>{t.month}</th>
            <th>{t.begins}</th>
            <th>{t.ends}</th>
          </tr>
        </thead>
        <tbody>
          {events.map((e, i) => (
            <tr key={e.begins} className={i === nextIdx ? "current" : undefined}>
              <td>
                <strong>{wd(e.date)}, {fmtDateShort(e.date, lang)}</strong>
                {e.altDate && <div className="pc-note">{t.also} {wd(e.altDate)} {fmtDateShort(e.altDate, lang)} {t.alt}</div>}
              </td>
              {k === "ekadashi" && <td>{lang === "hi" ? `${tr(lang, "ekadashi", e.name ?? "")} एकादशी (${tr(lang, "paksha", e.paksha)}${t.paksha})` : `${e.name} Ekadashi (${e.paksha})`}</td>}
              {k !== "ekadashi" && <td>{e.vratDate === e.date ? t.same : `${wd(e.vratDate!)}, ${fmtDateShort(e.vratDate!, lang)}`}</td>}
              <td>{e.adhika ? t.adhika : ""}{tr(lang, "month", e.monthPurnimanta)}, {tr(lang, "paksha", e.paksha)}{t.paksha}</td>
              <td>{dt(e.begins)}</td>
              <td>{dt(e.ends)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
