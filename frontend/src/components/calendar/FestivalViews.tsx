import Link from "next/link";
import ContentShell from "../site/ContentShell";
import StaleGuard from "../panchang/StaleGuard";
import { FESTIVALS, festivalDates, kalaWindow, type FestivalDef, type Kala } from "../../services/festivals";
import { cityBySlug } from "../../lib/cities";
import { jdToLocalIso } from "../../services/panchang";
import { DELHI } from "../../lib/calendar-pages";
import { fmtDateLong, fmtDateShort, fmtTime, fmtRange } from "../../lib/panchang-format";
import { todayInTimezone, TITHI_NAMES, LUNAR_MONTHS } from "../../services/panchang";

export const FEST_YEARS = [2026, 2027];

export const FEST_NOTE =
  "Dates are calculated for New Delhi with the Swiss Ephemeris (Lahiri ayanamsa) using the Smarta rules followed by most North Indian panchangs: each festival is kept on the day its tithi prevails at the prescribed time of day, with the classical tie-break rules for Raksha Bandhan, Holika Dahan, Janmashtami and Akshaya Tritiya. All 57 of our 2026–2027 dates that could be checked match independently published panchang dates. Regional and sectarian (Vaishnava/ISKCON) dates can differ by a day; dates can also differ outside India.";

const KALA_TEXT: Record<Kala, string> = {
  sunrise: "at sunrise (udaya tithi)",
  purvahna: "in the forenoon (purvahna)",
  madhyahna: "at midday (madhyahna, the third fifth of daytime)",
  aparahna: "in the afternoon (aparahna, the fourth fifth of daytime)",
  pradosh: "at pradosh (the first fifth of the night after sunset)",
  nishita: "at nishita (the midnight muhurta)",
  moonrise: "at moonrise",
  sunset: "at sunset",
};

function tithiLabel(f: FestivalDef): string {
  const pak = f.tithi < 15 ? "Shukla" : "Krishna";
  const name = TITHI_NAMES[f.tithi];
  const amanta = LUNAR_MONTHS[f.month];
  const purn = f.tithi >= 15 ? LUNAR_MONTHS[(f.month + 1) % 12] : amanta;
  return f.tithi >= 15 && purn !== amanta
    ? `${purn} ${pak} ${name} (${amanta} in the amanta calendar)`
    : `${amanta} ${pak === "Shukla" && name === "Purnima" ? "" : pak + " "}${name}`;
}

const allDates = (y: number) => festivalDates(y, DELHI);

function FestTable({ rows, today }: { rows: ReturnType<typeof allDates>; today?: string }) {
  const next = today ? rows.findIndex((r) => r.date >= today) : -1;
  return (
    <div className="tool-table-scroll">
      <table className="tool-table tool-table-wide">
        <thead><tr><th>Date</th><th>Festival</th><th>Tithi</th><th>Tithi window (IST)</th></tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.def.slug + r.date} className={i === next ? "current" : undefined}>
              <td><strong>{fmtDateLong(r.date)}</strong></td>
              <td><Link href={`/festivals/${r.def.slug}`}>{r.def.name}</Link></td>
              <td>{tithiLabel(r.def)}</td>
              <td>{fmtTime(r.begins)}, {fmtDateShort(r.begins.slice(0, 10))} – {fmtTime(r.ends)}, {fmtDateShort(r.ends.slice(0, 10))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function FestivalsHub() {
  const today = todayInTimezone(DELHI.timezone);
  const y = Number(today.slice(0, 4));
  const upcoming = [...allDates(y), ...allDates(y + 1)].filter((r) => r.date >= today).slice(0, 12);
  return (
    <ContentShell crumbs={[{ name: "Festivals", path: "/festivals" }]} footerNote={FEST_NOTE}>
      <h1 className="seo-article-title">Upcoming Hindu Festivals and Dates</h1>
      <StaleGuard date={today} timezone={DELHI.timezone} />
      {upcoming[0] && (
        <div className="pc-hero">
          <span className="pc-hero-label">Next festival</span>
          <span className="pc-hero-time">{upcoming[0].def.name}</span>
          <span className="pc-hero-status">{fmtDateLong(upcoming[0].date)}</span>
        </div>
      )}
      <p className="tool-lead">The next twelve major Hindu festivals with their dates and tithi timings, calculated for New Delhi.</p>
      <section className="seo-content">
        <FestTable rows={upcoming} />
        <p>Full lists: {FEST_YEARS.map((yy, i) => <span key={yy}>{i > 0 && " · "}<Link href={`/festivals/${yy}`}>Hindu festivals {yy}</Link></span>)} · <Link href="/makar-sankranti">Makar Sankranti</Link> · <Link href="/ekadashi">Ekadashi</Link></p>
        <h2>All festivals</h2>
        <ul className="pc-city-links">{FESTIVALS.map((f) => <li key={f.slug}><Link href={`/festivals/${f.slug}`}>{f.name}</Link></li>)}</ul>
      </section>
    </ContentShell>
  );
}

export function FestivalsYear({ year }: { year: number }) {
  const rows = allDates(year);
  const today = todayInTimezone(DELHI.timezone);
  return (
    <ContentShell crumbs={[{ name: "Festivals", path: "/festivals" }, { name: String(year), path: `/festivals/${year}` }]} footerNote={FEST_NOTE}>
      <h1 className="seo-article-title">Hindu Festivals {year}: Complete List with Dates</h1>
      <StaleGuard date={today} timezone={DELHI.timezone} />
      <p className="tool-lead">{rows.length} major Hindu festivals in {year} with dates and tithi start and end times (New Delhi, IST). Makar Sankranti and other Sankrantis are on the <Link href={`/sankranti/${year}`}>Sankranti {year}</Link> page; Ekadashi dates on <Link href={`/ekadashi/${year}`}>Ekadashi {year}</Link>.</p>
      <section className="seo-content">
        <FestTable rows={rows} today={today} />
        <p>{FEST_YEARS.filter((y) => y !== year).map((y) => <Link key={y} href={`/festivals/${y}`}>Hindu festivals {y}</Link>)} · <Link href="/festivals">Upcoming festivals</Link></p>
      </section>
    </ContentShell>
  );
}

const COMPARE_CITIES = ["delhi", "mumbai", "chennai", "kolkata", "hyderabad", "edison", "dallas", "toronto", "london", "sydney"];
const KALA_NAME: Partial<Record<Kala, string>> = {
  purvahna: "Forenoon (purvahna) window", madhyahna: "Madhyahna puja muhurta", aparahna: "Aparahna muhurta",
  pradosh: "Pradosh kaal muhurta", nishita: "Nishita (midnight) puja muhurta",
};

/** The prescribed time-of-day window on the festival date, limited to the tithi. */
function pujaWindow(def: FestivalDef, r: { date: string; begins: string; ends: string }, place: { latitude: number; longitude: number; timezone: string }) {
  if (!KALA_NAME[def.kala] || def.offset) return null;
  const [a, b] = kalaWindow(r.date, def.kala, place);
  const s = Math.max(a, isoToJd(r.begins)), e = Math.min(b, isoToJd(r.ends));
  if (e <= s) return null;
  return { label: KALA_NAME[def.kala]!, start: jdToLocalIso(s, place.timezone), end: jdToLocalIso(e, place.timezone) };
}
const isoToJd = (iso: string) => Date.parse(iso) / 86400000 + 2440587.5;

export function FestivalPage({ def }: { def: FestivalDef }) {
  const today = todayInTimezone(DELHI.timezone);
  const rows = FEST_YEARS.map((y) => festivalDates(y, DELHI, [def])[0]).filter(Boolean);
  const next = rows.find((r) => r.date >= today) ?? rows[rows.length - 1];
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://www.graharemedy.com";
  const schema = rows.map((r) => ({
    "@type": "Event",
    name: `${def.name} ${r.date.slice(0, 4)}`,
    startDate: r.date,
    endDate: r.date,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: { "@type": "Place", name: "India", address: { "@type": "PostalAddress", addressCountry: "IN" } },
    description: def.desc,
    url: `${base}/festivals/${def.slug}`,
  }));
  return (
    <ContentShell crumbs={[{ name: "Festivals", path: "/festivals" }, { name: def.name, path: `/festivals/${def.slug}` }]} schema={schema} footerNote={FEST_NOTE}>
      <h1 className="seo-article-title">{def.name} {next.date.slice(0, 4)}: Date and Tithi Timings ({def.hindi})</h1>
      <StaleGuard date={today} timezone={DELHI.timezone} />
      <div className="pc-hero">
        <span className="pc-hero-label">{def.name} {next.date.slice(0, 4)}</span>
        <span className="pc-hero-time">{fmtDateLong(next.date)}</span>
        <span className="pc-hero-status">Tithi {fmtTime(next.begins)}, {fmtDateShort(next.begins.slice(0, 10))} to {fmtTime(next.ends)}, {fmtDateShort(next.ends.slice(0, 10))} (IST, New Delhi)</span>
      </div>
      <p className="tool-lead">{def.name} {next.date.slice(0, 4)} is on <strong>{fmtDateLong(next.date)}</strong>. {def.desc}</p>
      <section className="seo-content">
        <h2>{def.name} dates</h2>
        <table className="tool-table">
          <thead><tr><th>Year</th><th>Date</th><th>Tithi window (IST)</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.date}><td>{r.date.slice(0, 4)}</td><td><strong>{fmtDateLong(r.date)}</strong></td><td>{fmtTime(r.begins)}, {fmtDateShort(r.begins.slice(0, 10))} – {fmtTime(r.ends)}, {fmtDateShort(r.ends.slice(0, 10))}</td></tr>
            ))}
          </tbody>
        </table>
        {rows.map((r) => {
          const w = pujaWindow(def, r, DELHI);
          return w ? (
            <p key={"w" + r.date}>
              <strong>{w.label}, {r.date.slice(0, 4)} (New Delhi):</strong> {fmtRange(w, r.date)} on {fmtDateShort(r.date)}.
            </p>
          ) : null;
        })}

        <h2>{def.name} date in other cities</h2>
        <p>Calculated with each city&apos;s own sunrise, sunset and time zone. Outside India the festival can fall on a different calendar day.</p>
        <div className="tool-table-scroll">
          <table className="tool-table tool-table-wide">
            <thead><tr><th>City</th>{FEST_YEARS.map((y) => <th key={y}>{y}</th>)}{KALA_NAME[def.kala] && !def.offset && <th>{KALA_NAME[def.kala]} ({FEST_YEARS[0]}, local time)</th>}</tr></thead>
            <tbody>
              {COMPARE_CITIES.map((slug) => {
                const c = cityBySlug(slug)!;
                const place = { latitude: c.latitude, longitude: c.longitude, timezone: c.timezone };
                const ds = FEST_YEARS.map((y) => festivalDates(y, place, [def])[0]);
                const w = ds[0] ? pujaWindow(def, ds[0], place) : null;
                const differs = ds.some((d, i) => d && rows[i] && d.date !== rows[i].date);
                return (
                  <tr key={slug} className={differs ? "current" : undefined}>
                    <td><Link href={`/panchang/${slug}`}>{c.name}</Link></td>
                    {ds.map((d, i) => <td key={i}>{d ? fmtDateShort(d.date) : "—"}</td>)}
                    {KALA_NAME[def.kala] && !def.offset && <td>{w ? fmtRange(w, ds[0]!.date) : "—"}</td>}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="tool-note">Highlighted rows fall on a different date from New Delhi in at least one year.</p>

        <h2>How the date is decided</h2>
        <p>
          {def.name} falls on {tithiLabel(def)}. A tithi rarely matches a calendar day, so the festival is kept on the day the tithi prevails{" "}
          {KALA_TEXT[def.kala]}.
          {def.rule === "raksha" && " If Purnima is present at sunrise and lasts at least six ghatis (about 2 hours 24 minutes) after it, that morning is chosen, because the inauspicious Bhadra has then ended."}
          {def.rule === "holika" && " If Purnima continues for three and a half prahars of the next day and the following Pratipada is longer than Purnima, the bonfire moves to that next evening. Holi (Dhulandi) is the day after Holika Dahan."}
          {def.rule === "janmashtami" && " Midnight with both Ashtami tithi and Rohini nakshatra is preferred; otherwise a midnight with Rohini on a day that began in Ashtami, and only then a midnight with Ashtami alone. Vaishnava (ISKCON) Janmashtami is often a day later."}
          {def.rule === "purvahna3" && " When the tithi touches the forenoon on two days, the second day is taken only if the tithi lasts at least three muhurtas (about 2 hours 24 minutes) after sunrise."}
          {def.offset === 1 && " The date shown is the day after Holika Dahan."}
        </p>
        <p>
          Dates for New Delhi. In other cities the tithi times shift with the local sunrise and sunset, and occasionally the date changes.
          See today&apos;s <Link href="/panchang">panchang for your city</Link>.
        </p>
        <h2>Other festivals</h2>
        <ul className="pc-city-links">
          {FESTIVALS.filter((f) => f.slug !== def.slug).map((f) => <li key={f.slug}><Link href={`/festivals/${f.slug}`}>{f.name}</Link></li>)}
          <li><Link href="/festivals/2026">All festivals 2026</Link></li>
          <li><Link href="/festivals/2027">All festivals 2027</Link></li>
        </ul>
      </section>
    </ContentShell>
  );
}
