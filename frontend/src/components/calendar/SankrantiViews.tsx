import Link from "next/link";
import ContentShell from "../site/ContentShell";
import StaleGuard from "../panchang/StaleGuard";
import { sankrantis, type Sankranti } from "../../services/sankranti";
import { fmtDateLong, fmtDateShort, fmtTime } from "../../lib/panchang-format";
import { todayInTimezone } from "../../services/panchang";
import { DELHI } from "../../lib/calendar-pages";

export const SANKRANTI_YEARS = [2026, 2027];

const NOTE =
  "Sankranti is the moment the Sun enters a sidereal (Lahiri) sign, calculated with the Swiss Ephemeris for New Delhi and shown in Indian Standard Time. The observance date is the date of the moment, or the next date if the moment falls after local sunset. Dates agree with independently published panchangs; the exact minute can differ from them by about 5 minutes because ayanamsa values differ slightly between almanacs. Punya kaal timings vary by tradition and are not given here.";

const SIGN_ENGLISH = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];

function SankrantiTable({ items, today }: { items: Sankranti[]; today?: string }) {
  const next = today ? items.findIndex((s) => s.observedDate >= today) : -1;
  return (
    <div className="tool-table-scroll">
      <table className="tool-table tool-table-wide">
        <thead><tr><th>Sankranti</th><th>Sun enters</th><th>Moment (IST)</th><th>Observance date</th></tr></thead>
        <tbody>
          {items.map((s, i) => (
            <tr key={s.moment} className={i === next ? "current" : undefined}>
              <td><strong>{s.name} Sankranti</strong>{s.name === "Makara" ? " (Makar Sankranti)" : ""}</td>
              <td>{s.name} ({SIGN_ENGLISH[s.signIndex]})</td>
              <td>{fmtTime(s.moment)}, {fmtDateShort(s.transitDate).replace(/ \d{4}$/, "")}</td>
              <td><strong>{fmtDateShort(s.observedDate)}</strong></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SankrantiYear({ year }: { year: number }) {
  const items = sankrantis(year, DELHI);
  const today = todayInTimezone(DELHI.timezone);
  return (
    <ContentShell crumbs={[{ name: "Sankranti", path: "/sankranti" }, { name: String(year), path: `/sankranti/${year}` }]} footerNote={NOTE}>
      <h1 className="seo-article-title">Sankranti {year} Dates and Timings</h1>
      <StaleGuard date={today} timezone={DELHI.timezone} />
      <p className="tool-lead">
        All 12 Sankranti dates in {year} with the exact moment of the Sun&apos;s sign change (New Delhi, IST). A Sankranti falls roughly every 30
        days, when the Sun moves into the next sidereal rashi; Makar Sankranti, when it enters Makara (Capricorn), is the best known.
      </p>
      <section className="seo-content">
        <SankrantiTable items={items} today={today} />
        <h2>How Sankranti is calculated</h2>
        <p>
          The Sun&apos;s sidereal longitude (Lahiri ayanamsa) is followed until it crosses a multiple of 30°; the crossing is found to the second
          and rounded to the minute. If the crossing falls after local sunset, the observance moves to the next day, which is why Makar Sankranti
          sometimes falls on 15 January although the Sun enters Makara on 14 January.
        </p>
        <p>
          Other years: {SANKRANTI_YEARS.filter((y) => y !== year).map((y) => <Link key={y} href={`/sankranti/${y}`}>Sankranti {y}</Link>)} ·{" "}
          <Link href="/makar-sankranti">Makar Sankranti</Link> · <Link href="/panchang">Today&apos;s panchang</Link>
        </p>
      </section>
    </ContentShell>
  );
}

export function SankrantiHub() {
  const today = todayInTimezone(DELHI.timezone);
  const y = Number(today.slice(0, 4));
  const all = [...sankrantis(y, DELHI), ...sankrantis(y + 1, DELHI)];
  const upcoming = all.filter((s) => s.observedDate >= today).slice(0, 6);
  const next = upcoming[0];
  return (
    <ContentShell crumbs={[{ name: "Sankranti", path: "/sankranti" }]} footerNote={NOTE}>
      <h1 className="seo-article-title">Next Sankranti: Date and Time of the Sun&apos;s Sign Change</h1>
      <StaleGuard date={today} timezone={DELHI.timezone} />
      {next && (
        <div className="pc-hero">
          <span className="pc-hero-label">Next: {next.name} Sankranti</span>
          <span className="pc-hero-time">{fmtDateLong(next.observedDate)}</span>
          <span className="pc-hero-status">Sun enters {next.name} at {fmtTime(next.moment)} on {fmtDateShort(next.transitDate)} (IST, New Delhi)</span>
        </div>
      )}
      <p className="tool-lead">
        Sankranti is the day the Sun moves from one rashi to the next. The Hindu solar months begin on Sankranti, and many festivals are tied to it:
        Makar Sankranti in January, Mesha Sankranti (Baisakhi, Vishu, Puthandu) in April.
      </p>
      <section className="seo-content">
        <h2>Upcoming Sankranti dates</h2>
        <SankrantiTable items={upcoming} />
        <p>
          Full lists: {SANKRANTI_YEARS.map((yy, i) => <span key={yy}>{i > 0 && " · "}<Link href={`/sankranti/${yy}`}>Sankranti {yy}</Link></span>)} ·{" "}
          <Link href="/makar-sankranti">Makar Sankranti</Link>
        </p>
      </section>
    </ContentShell>
  );
}

export function MakarSankranti() {
  const today = todayInTimezone(DELHI.timezone);
  const y = Number(today.slice(0, 4));
  const list = [...sankrantis(y, DELHI), ...sankrantis(y + 1, DELHI)].filter((s) => s.name === "Makara");
  const next = list.find((s) => s.observedDate >= today) ?? list[list.length - 1];
  return (
    <ContentShell crumbs={[{ name: "Sankranti", path: "/sankranti" }, { name: "Makar Sankranti", path: "/makar-sankranti" }]} footerNote={NOTE}>
      <h1 className="seo-article-title">Makar Sankranti {next.observedDate.slice(0, 4)}: Date and Sankranti Moment</h1>
      <StaleGuard date={today} timezone={DELHI.timezone} />
      <div className="pc-hero">
        <span className="pc-hero-label">Makar Sankranti</span>
        <span className="pc-hero-time">{fmtDateLong(next.observedDate)}</span>
        <span className="pc-hero-status">Sun enters Makara (Capricorn) at {fmtTime(next.moment)} on {fmtDateShort(next.transitDate)} (IST, New Delhi)</span>
      </div>
      <p className="tool-lead">
        Makar Sankranti {next.observedDate.slice(0, 4)} is on <strong>{fmtDateLong(next.observedDate)}</strong>.
        {next.observedDate !== next.transitDate
          ? ` The Sun enters Makara at ${fmtTime(next.moment)} on ${fmtDateShort(next.transitDate)}, after sunset, so the festival is observed the next day.`
          : ` The Sun enters Makara at ${fmtTime(next.moment)}, before sunset, so it is observed the same day.`}
      </p>
      <section className="seo-content">
        <h2>Makar Sankranti dates by year</h2>
        <div className="tool-table-scroll">
          <table className="tool-table">
            <thead><tr><th>Year</th><th>Sun enters Makara</th><th>Observed on</th></tr></thead>
            <tbody>
              {[2026, 2027].map((yy) => {
                const s = sankrantis(yy, DELHI).find((x) => x.name === "Makara")!;
                return <tr key={yy}><td>{yy}</td><td>{fmtTime(s.moment)}, {fmtDateShort(s.transitDate)}</td><td><strong>{fmtDateLong(s.observedDate)}</strong></td></tr>;
              })}
            </tbody>
          </table>
        </div>
        <h2>Why the date moves between 14 and 15 January</h2>
        <p>
          The Sun&apos;s entry into Makara falls a few hours later each year (about six hours, with a one-day reset every leap year), so the
          date alternates between 14 and 15 January. When the entry occurs after sunset, the day is observed on the next calendar date. Makar
          Sankranti is also celebrated as Pongal in Tamil Nadu, Uttarayan in Gujarat and Magh Bihu in Assam, and is traditionally linked to the
          start of the Sun&apos;s northward journey (Uttarayana).
        </p>
        <p>All Sankranti dates: <Link href="/sankranti/2026">2026</Link> · <Link href="/sankranti/2027">2027</Link> · <Link href="/sankranti">next Sankranti</Link></p>
      </section>
    </ContentShell>
  );
}
