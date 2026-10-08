import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import StaleGuard from "@/src/components/panchang/StaleGuard";
import ContentShell, { PANCHANG_METHOD_NOTE } from "@/src/components/site/ContentShell";
import { ChoghadiyaTable } from "@/src/components/panchang/PanchangViews";
import PanchangExplorer from "@/src/components/panchang/PanchangExplorer";
import { CITIES, cityBySlug, relatedCities } from "@/src/lib/cities";
import { cityDayTimes, cityToday } from "@/src/lib/panchang-data";
import { fmtDateLong, fmtRange, fmtTime, isNow } from "@/src/lib/panchang-format";
import type { ChoghadiyaSlot, TimeSpan } from "@/src/services/panchang";

export const revalidate = 300;
export const dynamicParams = false;

// oxlint-disable-next-line react/only-export-components -- App Router build-time export.
export function generateStaticParams() {
  return CITIES.map((c) => ({ city: c.slug }));
}

interface Props {
  params: Promise<{ city: string }>;
}

// oxlint-disable-next-line react/only-export-components -- App Router metadata belongs with the route.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const city = cityBySlug((await params).city);
  if (!city) return {};
  const title = `Choghadiya Today in ${city.name} – Day & Night Shubh Muhurat Timings`;
  const description = `Today's day and night choghadiya for ${city.name} — Amrit, Shubh, Labh and Char periods with exact times, the choghadiya running now, and good periods that avoid Rahu Kalam.`;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `/choghadiya/${city.slug}` },
    openGraph: { title, description, url: `/choghadiya/${city.slug}`, type: "website" },
  };
}

function overlaps(a: TimeSpan, b: TimeSpan): boolean {
  return Date.parse(a.start) < Date.parse(b.end) && Date.parse(b.start) < Date.parse(a.end);
}

export default async function ChoghadiyaCityPage({ params }: Props) {
  const city = cityBySlug((await params).city);
  if (!city) notFound();
  const date = cityToday(city);
  const t = cityDayTimes(city, date);
  const now = Date.now();
  const all: ChoghadiyaSlot[] = [...t.choghadiya.day, ...t.choghadiya.night];
  const current = all.find((c) => isNow(c, now));
  const goodClear = t.choghadiya.day.filter((c) => c.nature === "good" && !overlaps(c, t.rahuKalam));

  return (
    <ContentShell
      crumbs={[
        { name: "Choghadiya", path: "/choghadiya" },
        { name: city.name, path: `/choghadiya/${city.slug}` },
      ]}
      footerNote={PANCHANG_METHOD_NOTE}
    >
      <h1 className="seo-article-title">Choghadiya Today in {city.name}</h1>
      <StaleGuard date={date} timezone={city.timezone} />
      <p className="tool-kicker">{fmtDateLong(date)} · {t.weekday.english}</p>
      {current && (
        <div className="pc-hero">
          <span className="pc-hero-label">Running now</span>
          <span className="pc-hero-time">
            {current.name} ({current.meaning})
          </span>
          <span className="pc-hero-status">{fmtRange(current, date)}</span>
        </div>
      )}
      <p className="tool-lead">
        Day choghadiya in {city.name} runs from sunrise at {fmtTime(t.sunrise, date)} to sunset at {fmtTime(t.sunset, date)}; night choghadiya
        from sunset to the next sunrise at {fmtTime(t.nextSunrise, date)}.
        {goodClear.length > 0 && (
          <>
            {" "}Auspicious daytime choghadiyas today that do not overlap Rahu Kalam:{" "}
            {goodClear.map((c, i) => (
              <span key={c.start}>
                <strong>{c.name}</strong> ({fmtRange(c, date)}){i < goodClear.length - 1 ? ", " : "."}
              </span>
            ))}
          </>
        )}
      </p>

      <section className="seo-content">
        <h2>Day choghadiya</h2>
        <ChoghadiyaTable slots={t.choghadiya.day} base={date} nowMs={now} label={`Sunrise to sunset, ${city.name}`} />
        <p className="tool-note">Rahu Kalam today: {fmtRange(t.rahuKalam, date)}.</p>

        <h2>Night choghadiya</h2>
        <ChoghadiyaTable slots={t.choghadiya.night} base={date} nowMs={now} label={`Sunset to next sunrise, ${city.name}`} />

        <h2>How choghadiya is calculated</h2>
        <p>
          Daytime (sunrise to sunset) and night-time (sunset to next sunrise) are each divided into eight equal choghadiyas. Each is ruled by a
          planet: Amrit (Moon), Shubh (Jupiter), Labh (Mercury) and Char (Venus) are considered favourable — Char especially for travel — while
          Udveg (Sun), Kaal (Saturn) and Rog (Mars) are avoided for new work. The first daytime choghadiya belongs to the weekday&apos;s lord
          and the sequence follows the planetary hour order, which is why the pattern changes each weekday and the times change with the sunrise.
        </p>

        <h2>Choghadiya for another date or place</h2>
        <PanchangExplorer
          mode="choghadiya"
          defaultDate={date}
          defaultPlace={{ label: `${city.name}, ${city.region ? `${city.region}, ` : ""}${city.country}`, latitude: city.latitude, longitude: city.longitude, timezone: city.timezone }}
        />

        <p>
          Also for {city.name}: <Link href={`/panchang/${city.slug}`}>today&apos;s panchang</Link> ·{" "}
          <Link href={`/rahu-kaal/${city.slug}`}>Rahu Kaal this week</Link>.
        </p>

        <h2>Choghadiya in other cities</h2>
        <ul className="pc-city-links">
          {relatedCities(city, 16).map((c) => (
            <li key={c.slug}><Link href={`/choghadiya/${c.slug}`}>{c.name}</Link></li>
          ))}
          <li><Link href="/choghadiya">All cities</Link></li>
        </ul>
      </section>
    </ContentShell>
  );
}
