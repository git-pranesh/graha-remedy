import type { CalendarEvent } from "../../services/calendar";
import { fmtDateShort, fmtTime } from "../../lib/panchang-format";

const wd = (d: string) => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date(d + "T00:00:00Z").getUTCDay()];
const dt = (iso: string) => `${fmtTime(iso)}, ${fmtDateShort(iso.slice(0, 10)).replace(/ \d{4}$/, "")}`;

export default function EventTable({ events, today }: { events: CalendarEvent[]; today?: string }) {
  const k = events[0]?.kind;
  return (
    <div className="tool-table-scroll">
      <table className="tool-table tool-table-wide">
        <thead>
          <tr>
            <th>{k === "ekadashi" ? "Fasting day" : "Date"}</th>
            {k === "ekadashi" && <th>Ekadashi</th>}
            {k === "amavasya" && <th>Darsha (vrat) day</th>}
            {k === "purnima" && <th>Purnima vrat day</th>}
            <th>Month (purnimanta)</th>
            <th>Tithi begins</th>
            <th>Tithi ends</th>
          </tr>
        </thead>
        <tbody>
          {events.map((e) => (
            <tr key={e.begins} className={today && e.date >= today && (!events.find((x) => x.date >= today) || events.find((x) => x.date >= today) === e) ? "current" : undefined}>
              <td>
                <strong>{wd(e.date)}, {fmtDateShort(e.date)}</strong>
                {e.altDate && <div className="pc-note">Also {wd(e.altDate)} {fmtDateShort(e.altDate)} (Vaishnava / Gauna)</div>}
              </td>
              {k === "ekadashi" && <td>{e.name} Ekadashi ({e.paksha})</td>}
              {k !== "ekadashi" && <td>{e.vratDate === e.date ? "Same day" : `${wd(e.vratDate!)}, ${fmtDateShort(e.vratDate!)}`}</td>}
              <td>{e.adhika ? "Adhika " : ""}{e.monthPurnimanta}, {e.paksha}</td>
              <td>{dt(e.begins)}</td>
              <td>{dt(e.ends)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
