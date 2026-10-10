import Link from "next/link";
import ContentShell from "../site/ContentShell";
import StaleGuard from "../panchang/StaleGuard";
import GowriTable from "./GowriTable";
import type { City } from "../../lib/cities";
import { cityDayTimes, cityPanchang, cityToday } from "../../lib/panchang-data";
import { addDays, fmtDateLong, fmtDateShort, fmtRange, isNow, nowMs } from "../../lib/panchang-format";
import { GOWRI_INFO } from "../../lib/gowri";
import { REGIONAL_CITIES } from "../../lib/regional";
import { TA_CITY } from "../../lib/i18n-south";
import { tr } from "../../lib/hi";
import type { GowriSlot, TimeSpan } from "../../services/panchang";

const overlaps = (a: TimeSpan, b: TimeSpan) => Date.parse(a.start) < Date.parse(b.end) && Date.parse(b.start) < Date.parse(a.end);

const NOTE =
  "Gowri Panchangam divides daytime (local sunrise to sunset) and night (sunset to next sunrise) into eight equal parts each, named by the traditional weekday tables; Amirdha, Uthi, Laabam, Dhanam and Sugam are the good periods (Gowri Nalla Neram). Calculated with the Swiss Ephemeris for each city's sunrise and sunset; our timings match published Tamil Gowri Panchangam data within one minute. Printed Tamil calendars also show a separate fixed-clock 'Nalla Neram' that varies by publisher; it is not reproduced here.";

export default function NallaNeramPage({ city, hub = false }: { city: City; hub?: boolean }) {
  const date = cityToday(city);
  const t = cityDayTimes(city, date);
  const p = cityPanchang(city, date);
  const now = nowMs();
  const taName = TA_CITY[city.slug] ?? city.name;
  const bad = [t.rahuKalam, t.yamaganda, t.gulikaKalam];
  const good = (s: GowriSlot) => s.good && !bad.some((b) => overlaps(s, b));
  const all = [...t.gowri.day, ...t.gowri.night];
  const current = all.find((g) => isNow(g, now));
  const nextGood = all.find((g) => Date.parse(g.start) > now && good(g));
  const dayGood = t.gowri.day.filter(good);
  const week = Array.from({ length: 7 }, (_, i) => cityDayTimes(city, addDays(date, i)));
  const faqs = [
    { q: "What is Gowri Nalla Neram?", a: "The good periods of the Gowri Panchangam: Amirdha, Uthi, Laabam, Dhanam and Sugam. Rogam, Soram and Visham are avoided for new work. Many people also avoid any good period that overlaps Rahu Kalam, Yamagandam or Kuligai." },
    { q: "Why are the times different from my printed calendar?", a: "Gowri periods are one-eighth of the actual day or night, so they move with the local sunrise and sunset. Printed calendars often assume a fixed 6:00 AM sunrise, and their separate 'Nalla Neram' row is a fixed-clock table chosen by each publisher." },
    { q: "Is Gowri Panchangam the same as Choghadiya?", a: "They are built the same way — eight equal parts of day and night — but use different names and weekday sequences. Choghadiya is used mainly in North and West India, Gowri Panchangam in Tamil Nadu." },
  ];

  return (
    <ContentShell
      switchTo={{ href: `/ta/panchangam/${city.slug}`, label: "தமிழ் பஞ்சாங்கம்" }}
      crumbs={hub ? [{ name: "Nalla Neram", path: "/nalla-neram" }] : [{ name: "Nalla Neram", path: "/nalla-neram" }, { name: city.name, path: `/nalla-neram/${city.slug}` }]}
      schema={[{ "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }]}
      footerNote={NOTE}
    >
      <h1 className="seo-article-title">Nalla Neram Today in {city.name} <span lang="ta">(இன்றைய நல்ல நேரம் – {taName})</span></h1>
      <StaleGuard date={date} timezone={city.timezone} />
      <p className="tool-kicker">{fmtDateLong(date)} · <span lang="ta">{tr("ta", "tamilMonth", p.tamilDate.month)} {p.tamilDate.day}</span></p>
      {current && (
        <div className="pc-hero">
          <span className="pc-hero-label">Running now</span>
          <span className="pc-hero-time">{current.name} <span lang="ta">({GOWRI_INFO[current.name].ta})</span> — {current.good ? "Nalla Neram" : "avoid"}</span>
          <span className="pc-hero-status">{fmtRange(current, date)}{nextGood ? ` · next good period: ${nextGood.name}, ${fmtRange(nextGood, date)}` : ""}</span>
        </div>
      )}
      <p className="tool-lead">
        Gowri Nalla Neram in {city.name} today (good periods that avoid Rahu Kalam, Yamagandam and Kuligai):{" "}
        {dayGood.length ? dayGood.map((g, i) => <span key={g.start}><strong>{g.name}</strong> {fmtRange(g, date)}{i < dayGood.length - 1 ? ", " : "."}</span>) : "none during daytime."}{" "}
        Rahu Kalam {fmtRange(t.rahuKalam, date)}, Yamagandam {fmtRange(t.yamaganda, date)}, Kuligai {fmtRange(t.gulikaKalam, date)}.
      </p>
      <section className="seo-content">
        <h2>Day Gowri Panchangam</h2>
        <GowriTable slots={t.gowri.day} base={date} now={now} label={`Sunrise to sunset, ${city.name}`} />
        <h2>Night Gowri Panchangam</h2>
        <GowriTable slots={t.gowri.night} base={date} now={now} label={`Sunset to next sunrise, ${city.name}`} />

        <h2>Nalla Neram for the next 7 days</h2>
        <div className="tool-table-scroll">
          <table className="tool-table tool-table-wide">
            <thead><tr><th>Date</th><th>Daytime Nalla Neram (avoiding Rahu, Yama, Kuligai)</th><th>Rahu Kalam</th></tr></thead>
            <tbody>
              {week.map((d) => {
                const g = d.gowri.day.filter((s) => s.good && ![d.rahuKalam, d.yamaganda, d.gulikaKalam].some((b) => overlaps(s, b)));
                return (
                  <tr key={d.date} className={d.date === date ? "current" : undefined}>
                    <td>{d.weekday.english.slice(0, 3)}, {fmtDateShort(d.date)}</td>
                    <td>{g.map((s) => `${s.name} ${fmtRange(s, d.date)}`).join("; ") || "—"}</td>
                    <td>{fmtRange(d.rahuKalam, d.date)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <h2>How Gowri Nalla Neram is calculated</h2>
        <p>
          Daytime from local sunrise to sunset and night from sunset to the next sunrise are each split into eight equal Gowri periods. Each weekday
          has its own traditional sequence of the eight names. Because the periods are fractions of the real day, they shift a little every day and
          differ between cities — {city.name}&apos;s sunrise today is at {fmtRange({ start: t.sunrise!, end: t.sunrise! }, date).split(" – ")[0]}.
        </p>

        <h2>Frequently asked questions</h2>
        {faqs.map((f) => <details key={f.q} className="tool-faq"><summary>{f.q}</summary><p>{f.a}</p></details>)}

        <h2>Nalla Neram in other cities</h2>
        <ul className="pc-city-links">
          {REGIONAL_CITIES.ta.filter((s) => s !== city.slug || hub).map((s) => <li key={s}><Link href={`/nalla-neram/${s}`}>{s === "edison" ? "New Jersey" : s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</Link></li>)}
        </ul>
        <p><Link href={`/ta/panchangam/${city.slug}`} lang="ta">தமிழ் பஞ்சாங்கம் – {taName}</Link> · <Link href={`/rahu-kaal/${city.slug}`}>Rahu Kaal this week</Link> · <Link href={`/panchang/${city.slug}`}>Full panchang</Link></p>
      </section>
    </ContentShell>
  );
}
