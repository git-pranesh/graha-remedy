import Link from "next/link";
import type { ToolReport } from "../../services/tool-report";
import {
  NAKSHATRAS,
  PLANET_REMEDY_PAGE,
  rashiByEnglish,
  dms,
  DASHA_YEARS,
} from "../../lib/jyotish-data";

export type ToolKind = "nakshatra" | "rashi" | "lagna" | "dasha" | "manglik" | "sadesati" | "kaalsarp";

const PHASE_LABEL: Record<string, string> = {
  rising: "Rising phase (Saturn in the 12th from your Moon)",
  peak: "Peak phase (Saturn over your Moon sign)",
  setting: "Setting phase (Saturn in the 2nd from your Moon)",
  kantaka: "Kantaka Shani / Dhaiya (Saturn in the 4th from your Moon)",
  ashtama: "Ashtama Shani / Dhaiya (Saturn in the 8th from your Moon)",
};

function fmtDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function RemedyLink({ planet }: { planet: string }) {
  const r = PLANET_REMEDY_PAGE[planet];
  if (!r) return null;
  return (
    <Link href={r.href} className="tool-remedy-link">
      {r.label} →
    </Link>
  );
}

function MoonUncertainty({ report, kind }: { report: ToolReport; kind: "sign" | "nakshatra" }) {
  const r = report.moonDayRange;
  if (!r) return null;
  const changes = kind === "sign" ? r.signAtStart !== r.signAtEnd : r.nakshatraAtStart !== r.nakshatraAtEnd;
  if (!changes) {
    return <p className="tool-note">Your birth time is unknown, but the Moon stayed in the same {kind} for the whole day, so this result holds.</p>;
  }
  const a = kind === "sign" ? r.signAtStart : r.nakshatraAtStart;
  const b = kind === "sign" ? r.signAtEnd : r.nakshatraAtEnd;
  return (
    <p className="tool-note tool-note-warn">
      The Moon moved from {a} to {b} during this day. Without a birth time the result could be either; the value shown
      is for 12:00 noon. Enter your birth time for a definite answer.
    </p>
  );
}

function Nakshatra({ report }: { report: ToolReport }) {
  const m = report.moon;
  const info = NAKSHATRAS.find((n) => n.name === m.nakshatra)!;
  const into = m.longitude - info.start;
  return (
    <>
      <p className="tool-kicker">Your birth nakshatra (Janma Nakshatra)</p>
      <h2 className="tool-headline">{m.nakshatra} — pada {m.pada}</h2>
      <MoonUncertainty report={report} kind="nakshatra" />
      <table className="tool-table">
        <tbody>
          <tr><th>Moon longitude (sidereal)</th><td>{dms(m.longitude)} — {dms(m.longitude, true)} {m.sign}</td></tr>
          <tr><th>Position in nakshatra</th><td>{dms(into)} of 13°20&apos;</td></tr>
          <tr><th>Nakshatra lord</th><td>{info.lord}</td></tr>
          <tr><th>Deity</th><td>{info.deity}</td></tr>
          <tr><th>Nadi</th><td>{info.nadi}</td></tr>
          <tr><th>Moon sign (rashi)</th><td>{m.sign} ({rashiByEnglish(m.sign)?.sanskrit})</td></tr>
          <tr><th>First mahadasha at birth</th><td>{info.lord}</td></tr>
        </tbody>
      </table>
      <div className="tool-next">
        <RemedyLink planet={info.lord} />
        <Link href="/mahadasha-calculator" className="tool-remedy-link">See your full Vimshottari dasha timeline →</Link>
      </div>
    </>
  );
}

function Rashi({ report }: { report: ToolReport }) {
  const m = report.moon;
  const r = rashiByEnglish(m.sign)!;
  return (
    <>
      <p className="tool-kicker">Your Moon sign (Janma Rashi)</p>
      <h2 className="tool-headline">
        {r.sanskrit} ({r.english}) · {r.hindi}
      </h2>
      <MoonUncertainty report={report} kind="sign" />
      <table className="tool-table">
        <tbody>
          <tr><th>Moon position</th><td>{dms(m.longitude, true)} {m.sign}</td></tr>
          <tr><th>Rashi lord</th><td>{r.lord}</td></tr>
          <tr><th>Birth nakshatra</th><td>{m.nakshatra}, pada {m.pada}</td></tr>
          {report.ascendant && (
            <tr><th>Ascendant (Lagna)</th><td>{report.ascendant.sign} ({rashiByEnglish(report.ascendant.sign)?.sanskrit})</td></tr>
          )}
          <tr>
            <th>Sun sign (sidereal)</th>
            <td>{report.planets.find((p) => p.planet === "Sun")?.sign}</td>
          </tr>
        </tbody>
      </table>
      <p className="tool-note">
        Your Vedic Moon sign is often different from your Western &ldquo;star sign&rdquo;, which is based on the tropical
        Sun.
      </p>
      <div className="tool-next">
        <RemedyLink planet={r.lord} />
        <Link href="/sade-sati-calculator" className="tool-remedy-link">Check Sade Sati for {r.sanskrit} rashi →</Link>
      </div>
    </>
  );
}

function Lagna({ report }: { report: ToolReport }) {
  const a = report.ascendant!;
  const r = rashiByEnglish(a.sign)!;
  return (
    <>
      <p className="tool-kicker">Your ascendant (Lagna)</p>
      <h2 className="tool-headline">
        {r.sanskrit} Lagna ({r.english}) · {dms(a.longitude, true)}
      </h2>
      <table className="tool-table">
        <tbody>
          <tr><th>Lagna lord</th><td>{r.lord}</td></tr>
          <tr><th>Lagna nakshatra</th><td>{a.nakshatra}, pada {a.pada}</td></tr>
          <tr><th>Moon sign</th><td>{report.moon.sign}</td></tr>
        </tbody>
      </table>
      <h3 className="tool-subhead">Planets by house (whole-sign houses from Lagna)</h3>
      <table className="tool-table tool-table-wide">
        <thead>
          <tr><th>Planet</th><th>Sign</th><th>Degree</th><th>House</th><th>Nakshatra</th></tr>
        </thead>
        <tbody>
          {report.planets.map((p) => (
            <tr key={p.planet}>
              <td>{p.planet}{p.retrograde && p.planet !== "Rahu" && p.planet !== "Ketu" ? " (R)" : ""}</td>
              <td>{p.sign}</td>
              <td>{p.signDegree}</td>
              <td>{p.house}</td>
              <td>{p.nakshatra} {p.nakshatraPada}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="tool-note">
        The Lagna changes sign roughly every two hours, so it depends on an accurate birth time. If your time is
        approximate and the Lagna degree is near 0° or 30°, the sign may differ.
      </p>
      <div className="tool-next">
        <RemedyLink planet={r.lord} />
      </div>
    </>
  );
}

function Dasha({ report }: { report: ToolReport }) {
  const d = report.dasha!;
  const today = new Date().toISOString().slice(0, 10);
  return (
    <>
      <p className="tool-kicker">Your current Vimshottari dasha</p>
      <h2 className="tool-headline">
        {d.current.lord} Mahadasha · {d.currentAntardasha.lord} Antardasha
      </h2>
      <table className="tool-table">
        <tbody>
          <tr><th>Mahadasha</th><td>{d.current.lord}: {fmtDate(d.current.start)} – {fmtDate(d.current.end)} ({DASHA_YEARS[d.current.lord]} years)</td></tr>
          <tr><th>Antardasha</th><td>{d.currentAntardasha.lord}: {fmtDate(d.currentAntardasha.start)} – {fmtDate(d.currentAntardasha.end)}</td></tr>
          <tr><th>Dasha at birth</th><td>{d.balanceAtBirth.lord}, {d.balanceAtBirth.years.toFixed(2)} years remaining</td></tr>
          <tr><th>Birth nakshatra</th><td>{report.moon.nakshatra} (lord {report.moon.nakshatraLord})</td></tr>
        </tbody>
      </table>
      <h3 className="tool-subhead">Mahadasha timeline</h3>
      <div className="tool-timeline">
        {d.sequence.map((md) => {
          const isCurrent = md.start <= today && today < md.end;
          return (
            <details key={md.start} className={`tool-dasha${isCurrent ? " current" : ""}`} open={isCurrent}>
              <summary>
                <strong>{md.lord}</strong> {fmtDate(md.start)} – {fmtDate(md.end)}
                {isCurrent && <span className="tool-badge">running now</span>}
              </summary>
              <table className="tool-table tool-table-wide">
                <thead><tr><th>Antardasha</th><th>From</th><th>To</th></tr></thead>
                <tbody>
                  {md.antardashas.map((ad) => (
                    <tr key={ad.start} className={ad.start <= today && today < ad.end ? "current" : undefined}>
                      <td>{md.lord}–{ad.lord}</td>
                      <td>{fmtDate(ad.start)}</td>
                      <td>{fmtDate(ad.end)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </details>
          );
        })}
      </div>
      <div className="tool-next">
        <RemedyLink planet={d.current.lord} />
        {d.currentAntardasha.lord !== d.current.lord && <RemedyLink planet={d.currentAntardasha.lord} />}
      </div>
    </>
  );
}

function Manglik({ report }: { report: ToolReport }) {
  const m = report.manglik!;
  return (
    <>
      <p className="tool-kicker">Manglik (Mangal / Kuja) dosha check</p>
      <h2 className="tool-headline">{m.present ? "Manglik dosha is present" : "Not Manglik"}</h2>
      <table className="tool-table">
        <tbody>
          <tr><th>Mars sign</th><td>{m.marsSign}</td></tr>
          <tr><th>Mars from Lagna</th><td>House {m.houseFromLagna} {m.fromLagna ? "— Manglik position" : "— not a Manglik position"}</td></tr>
          <tr><th>Mars from Moon</th><td>House {m.houseFromMoon} {m.fromMoon ? "— Manglik position" : "— not a Manglik position"}</td></tr>
          <tr><th>Mars from Venus</th><td>House {m.houseFromVenus} {m.fromVenus ? "— Manglik position (South Indian practice)" : ""}</td></tr>
        </tbody>
      </table>
      {m.present && m.mitigations.length > 0 && (
        <p className="tool-note">
          Commonly cited mitigating factors in your chart: {m.mitigations.join("; ")}. Traditions differ on which factors
          cancel the dosha.
        </p>
      )}
      {m.present && (
        <p className="tool-note">
          Traditional matching compares both charts: Manglik dosha is generally considered balanced when both partners are
          Manglik.
        </p>
      )}
      <div className="tool-next">
        <RemedyLink planet="Mars" />
      </div>
    </>
  );
}

function SadeSati({ report }: { report: ToolReport }) {
  const s = report.sadeSati;
  const today = new Date().toISOString().slice(0, 10);
  const r = rashiByEnglish(s.moonSign)!;
  const next = s.cycles.find((c) => c.start > today);
  const running = s.cycles.find((c) => c.start <= today && today <= c.end);
  return (
    <>
      <p className="tool-kicker">Sade Sati for {r.sanskrit} ({r.english}) Moon sign</p>
      <h2 className="tool-headline">
        {running ? "You are in Sade Sati now" : s.current ? "Shani Dhaiya is running now" : "You are not in Sade Sati now"}
      </h2>
      <MoonUncertainty report={report} kind="sign" />
      <table className="tool-table">
        <tbody>
          <tr><th>Transiting Saturn today</th><td>{s.transitSaturnSign}</td></tr>
          <tr><th>Current phase</th><td>{s.current ? PHASE_LABEL[s.current] : "None"}</td></tr>
          {running && <tr><th>This Sade Sati</th><td>{fmtDate(running.start)} – {fmtDate(running.end)}</td></tr>}
          {!running && next && <tr><th>Next Sade Sati</th><td>{fmtDate(next.start)} – {fmtDate(next.end)}</td></tr>}
        </tbody>
      </table>
      <h3 className="tool-subhead">Sade Sati periods in your lifetime</h3>
      <table className="tool-table tool-table-wide">
        <thead><tr><th>Phase</th><th>Saturn in</th><th>From</th><th>To</th></tr></thead>
        <tbody>
          {s.cycles.flatMap((c, ci) =>
            c.phases.map((p) => (
              <tr key={`${ci}-${p.start}`} className={p.start <= today && today < p.end ? "current" : undefined}>
                <td>Cycle {ci + 1} · {p.phase}</td>
                <td>{p.sign}</td>
                <td>{fmtDate(p.start)}</td>
                <td>{fmtDate(p.end)}</td>
              </tr>
            )),
          )}
        </tbody>
      </table>
      <h3 className="tool-subhead">Shani Dhaiya (Kantaka and Ashtama Shani)</h3>
      <table className="tool-table tool-table-wide">
        <thead><tr><th>Type</th><th>Saturn in</th><th>From</th><th>To</th></tr></thead>
        <tbody>
          {s.dhaiya.map((p) => (
            <tr key={p.start} className={p.start <= today && today < p.end ? "current" : undefined}>
              <td>{p.phase === "kantaka" ? "Kantaka (4th)" : "Ashtama (8th)"}</td>
              <td>{p.sign}</td>
              <td>{fmtDate(p.start)}</td>
              <td>{fmtDate(p.end)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="tool-note">Separate rows for the same phase mean Saturn&apos;s retrograde motion took it back into the previous sign for a while.</p>
      <div className="tool-next">
        <RemedyLink planet="Saturn" />
      </div>
    </>
  );
}

function KaalSarp({ report }: { report: ToolReport }) {
  const k = report.kaalSarp;
  return (
    <>
      <p className="tool-kicker">Kaal Sarp dosh check</p>
      <h2 className="tool-headline">
        {k.present ? `Kaal Sarp dosh is present${k.name ? ` — ${k.name} Kaal Sarp` : ""}` : "No Kaal Sarp dosh"}
      </h2>
      <table className="tool-table">
        <tbody>
          <tr><th>Rahu</th><td>{k.rahuSign}{report.ascendant ? `, house ${k.rahuHouse} from Lagna` : ""}</td></tr>
          <tr><th>Ketu</th><td>{k.ketuSign}</td></tr>
          <tr>
            <th>Planets outside the Rahu–Ketu axis</th>
            <td>{k.present ? "None — all seven are on one side" : k.outside.join(", ")}</td>
          </tr>
        </tbody>
      </table>
      <h3 className="tool-subhead">Planet positions</h3>
      <table className="tool-table tool-table-wide">
        <thead><tr><th>Planet</th><th>Sign</th><th>Longitude</th></tr></thead>
        <tbody>
          {report.planets.map((p) => (
            <tr key={p.planet}><td>{p.planet}</td><td>{p.sign}</td><td>{dms(p.longitude)}</td></tr>
          ))}
        </tbody>
      </table>
      {k.partial && (
        <p className="tool-note">
          Only {k.outside.join(", ")} lies outside the axis. Some astrologers call this a partial Kaal Sarp; most
          classical texts do not treat it as Kaal Sarp dosh.
        </p>
      )}
      <div className="tool-next">
        <RemedyLink planet="Rahu" />
        <RemedyLink planet="Ketu" />
      </div>
    </>
  );
}

export default function ToolResult({ tool, report }: { tool: ToolKind; report: ToolReport }) {
  switch (tool) {
    case "nakshatra": return <Nakshatra report={report} />;
    case "rashi": return <Rashi report={report} />;
    case "lagna": return <Lagna report={report} />;
    case "dasha": return <Dasha report={report} />;
    case "manglik": return <Manglik report={report} />;
    case "sadesati": return <SadeSati report={report} />;
    case "kaalsarp": return <KaalSarp report={report} />;
  }
}
