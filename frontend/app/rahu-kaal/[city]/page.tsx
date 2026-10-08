import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ContentShell, { PANCHANG_METHOD_NOTE } from "@/src/components/site/ContentShell";
import { Muhurtas } from "@/src/components/panchang/PanchangViews";
import PanchangExplorer from "@/src/components/panchang/PanchangExplorer";
import { cityBySlug, relatedCities } from "@/src/lib/cities";
import { cityDayTimes, cityToday } from "@/src/lib/panchang-data";
import { addDays, fmtDateLong, fmtDateShort, fmtRange, fmtTime, isNow } from "@/src/lib/panchang-format";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ city: string }>;
}

// oxlint-disable-next-line react/only-export-components -- App Router metadata belongs with the route.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const city = cityBySlug((await params).city);
  if (!city) return {};
  const title = `Rahu Kaal Today in ${city.name} – Rahu Kalam Timings for This Week`;
  const description = `Rahu Kalam today in ${city.name}, plus Yamaganda and Gulika Kalam, and Rahu Kaal timings for the next 7 days — calculated from ${city.name}'s sunrise and sunset.`;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `/rahu-kaal/${city.slug}` },
    openGraph: { title, description, url: `/rahu-kaal/${city.slug}`, type: "website" },
  };
}

const RAHU_RULE = [
  ["Monday", "2nd"], ["Tuesday", "7th"], ["Wednesday", "5th"], ["Thursday", "6th"], ["Friday", "4th"], ["Saturday", "3rd"], ["Sunday", "8th"],
];

export default async function RahuKaalCityPage({ params }: Props) {
  const city = cityBySlug((await params).city);
  if (!city) notFound();
  const date = cityToday(city);
  const t = cityDayTimes(city, date);
  const now = Date.now();
  const week = Array.from({ length: 7 }, (_, i) => cityDayTimes(city, addDays(date, i)));
  const status = isNow(t.rahuKalam, now)
    ? "Rahu Kalam is running now."
    : Date.parse(t.rahuKalam.end) <= now
      ? "Today's Rahu Kalam is over."
      : null;

  return (
    <ContentShell
      crumbs={[
        { name: "Rahu Kaal", path: "/rahu-kaal" },
        { name: city.name, path: `/rahu-kaal/${city.slug}` },
      ]}
      footerNote={PANCHANG_METHOD_NOTE}
    >
      <h1 className="seo-article-title">Rahu Kaal Today in {city.name}</h1>
      <p className="tool-kicker">{fmtDateLong(date)}</p>
      <div className="pc-hero">
        <span className="pc-hero-label">Rahu Kalam</span>
        <span className="pc-hero-time">{fmtRange(t.rahuKalam, date)}</span>
        {status && <span className="pc-hero-status">{status}</span>}
      </div>
      <p className="tool-lead">
        Sunrise in {city.name} is at {fmtTime(t.sunrise, date)} and sunset at {fmtTime(t.sunset, date)}. On {t.weekday.english}s Rahu Kalam is
        the {RAHU_RULE.find((r) => r[0] === t.weekday.english)![1]} of the eight equal parts of daytime.
      </p>

      <section className="seo-content">
        <h2>Today&apos;s inauspicious and auspicious periods</h2>
        <Muhurtas t={t} nowMs={now} />

        <h2>Rahu Kaal in {city.name} for the next 7 days</h2>
        <div className="tool-table-scroll">
          <table className="tool-table">
            <thead>
              <tr><th>Date</th><th>Rahu Kalam</th><th>Yamaganda</th><th>Gulika</th></tr>
            </thead>
            <tbody>
              {week.map((d) => (
                <tr key={d.date} className={d.date === date ? "current" : undefined}>
                  <td>{d.weekday.english.slice(0, 3)}, {fmtDateShort(d.date)}</td>
                  <td>{fmtRange(d.rahuKalam, d.date)}</td>
                  <td>{fmtRange(d.yamaganda, d.date)}</td>
                  <td>{fmtRange(d.gulikaKalam, d.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2>How Rahu Kaal is calculated</h2>
        <p>
          The time from local sunrise to sunset is divided into eight equal parts. Rahu Kalam is one of these parts, fixed by the weekday:
        </p>
        <div className="tool-table-scroll">
          <table className="tool-table">
            <thead><tr><th>Weekday</th><th>Part of daytime</th></tr></thead>
            <tbody>
              {RAHU_RULE.map(([d, part]) => (
                <tr key={d} className={d === t.weekday.english ? "current" : undefined}><td>{d}</td><td>{part} of 8</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Because sunrise and sunset change daily and differ between cities, Rahu Kalam must be calculated for your own location — a fixed
          &ldquo;7:30 to 9:00&rdquo; table is only approximate. Traditionally new ventures, travel and ceremonies are not started during Rahu
          Kalam; the practice is strongest in South India.
        </p>

        <h2>Rahu Kalam for another date or place</h2>
        <PanchangExplorer
          mode="rahu"
          defaultDate={date}
          defaultPlace={{ label: `${city.name}, ${city.region ? `${city.region}, ` : ""}${city.country}`, latitude: city.latitude, longitude: city.longitude, timezone: city.timezone }}
        />

        <p>
          Full daily panchang for {city.name}: <Link href={`/panchang/${city.slug}`}>tithi, nakshatra and muhurat</Link> ·{" "}
          <Link href={`/choghadiya/${city.slug}`}>choghadiya</Link>.
        </p>

        <h2>Rahu Kaal in other cities</h2>
        <ul className="pc-city-links">
          {relatedCities(city, 16).map((c) => (
            <li key={c.slug}><Link href={`/rahu-kaal/${c.slug}`}>{c.name}</Link></li>
          ))}
          <li><Link href="/rahu-kaal">All cities</Link></li>
        </ul>
      </section>
    </ContentShell>
  );
}
