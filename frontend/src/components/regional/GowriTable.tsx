import type { GowriSlot } from "../../services/panchang";
import { GOWRI_INFO } from "../../lib/gowri";
import { fmtRange, isNow } from "../../lib/panchang-format";

export default function GowriTable({ slots, base, now, label, tamil = false }: { slots: GowriSlot[]; base: string; now?: number; label: string; tamil?: boolean }) {
  return (
    <div className="tool-table-scroll">
      <table className="tool-table pc-chog">
        <caption>{label}</caption>
        <thead><tr><th>{tamil ? "கௌரி" : "Gowri"}</th><th>{tamil ? "நேரம்" : "Time"}</th><th>{tamil ? "பலன்" : "Nature"}</th></tr></thead>
        <tbody>
          {slots.map((g) => (
            <tr key={g.start} className={now !== undefined && isNow(g, now) ? "current" : undefined}>
              <td><span className={`pc-dot ${g.good ? "good" : "bad"}`} /> {tamil ? GOWRI_INFO[g.name].ta : `${g.name} (${GOWRI_INFO[g.name].ta})`}</td>
              <td>{fmtRange(g, base, tamil ? "ta" : "en")}</td>
              <td>{tamil ? (g.good ? "நல்ல நேரம்" : "தவிர்க்கவும்") : `${GOWRI_INFO[g.name].meaning}${g.good ? " — Nalla Neram" : ""}`}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
