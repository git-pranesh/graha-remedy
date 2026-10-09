import type { Metadata } from "next";
import { hreflang } from "@/src/lib/alternates";
import Link from "next/link";
import { notFound } from "next/navigation";
import StaleGuard from "@/src/components/panchang/StaleGuard";
import ContentShell, { PANCHANG_METHOD_NOTE } from "@/src/components/site/ContentShell";
import { HoraTable, Muhurtas, PanchangCore, SunMoon } from "@/src/components/panchang/PanchangViews";
import PanchangExplorer from "@/src/components/panchang/PanchangExplorer";
import { CITIES, cityBySlug, relatedCities } from "@/src/lib/cities";
import { cityPanchang, cityToday } from "@/src/lib/panchang-data";
import { fmtDateLong, fmtTime, isNow } from "@/src/lib/panchang-format";

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
  const title = `Today's Panchang in ${city.name} – Tithi, Nakshatra, Rahu Kaal & Muhurat`;
  const description = `Panchang for ${city.name} today: tithi, nakshatra, yoga and karana with end times, sunrise, sunset, moonrise, Rahu Kalam, Abhijit Muhurta and hora — calculated for ${city.name}'s exact location.`;
  return {
    title: { absolute: title },
    description,
    alternates: hreflang(`/panchang/${city.slug}`, `/hi/panchang/${city.slug}`, "en"),
    openGraph: { title, description, url: `/panchang/${city.slug}`, type: "website" },
  };
}

function minutesOfDay(iso: string | null): number | null {
  return iso ? Number(iso.slice(11, 13)) * 60 + Number(iso.slice(14, 16)) : null;
}

export default async function CityPanchangPage({ params }: Props) {
  const city = cityBySlug((await params).city);
  if (!city) notFound();

  const date = cityToday(city);
  const p = cityPanchang(city, date);
  const now = Date.now();
  const tithiNow = p.tithi[0];
  const nakNow = p.nakshatra[0];

  // Location-specific comparison: sunrise vs New Delhi (same time zone for Indian cities).
  const delhi = CITIES.find((c) => c.slug === "delhi")!;
  let comparison: string | null = null;
  if (city.countryCode === "IN" && city.slug !== "delhi") {
    const d = cityPanchang(delhi, date);
    const diff = (minutesOfDay(p.sunrise) ?? 0) - (minutesOfDay(d.sunrise) ?? 0);
    comparison =
      diff === 0
        ? `Sunrise in ${city.name} today is at the same clock time as in New Delhi.`
        : `Sunrise in ${city.name} today is ${Math.abs(diff)} minutes ${diff > 0 ? "later" : "earlier"} than in New Delhi (${fmtTime(d.sunrise)}), so Rahu Kalam, choghadiya and muhurta times here differ from a Delhi panchang.`;
  } else if (city.countryCode !== "IN") {
    comparison = `All times are in local ${city.name} time (${p.timezone}), including daylight saving when it applies. Panchangs printed in Indian Standard Time do not give correct timings for ${city.name}.`;
  }

  const currentHoraDay = p.hora.day.find((h) => isNow(h, now));
  const currentHora = currentHoraDay ?? p.hora.night.find((h) => isNow(h, now));

  return (
    <ContentShell
      switchTo={{ href: `/hi/panchang/${city.slug}`, label: "हिन्दी" }}
      crumbs={[
        { name: "Panchang", path: "/panchang" },
        { name: city.name, path: `/panchang/${city.slug}` },
      ]}
      schema={[
        {
          "@type": "WebPage",
          name: `Today's Panchang in ${city.name}`,
          url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.graharemedy.com"}/panchang/${city.slug}`,
          dateModified: new Date().toISOString(),
          about: { "@type": "Place", name: `${city.name}, ${city.country}`, geo: { "@type": "GeoCoordinates", latitude: city.latitude, longitude: city.longitude } },
        },
      ]}
      footerNote={PANCHANG_METHOD_NOTE}
    >
      <h1 className="seo-article-title">Panchang Today in {city.name}</h1>
      <StaleGuard date={date} timezone={city.timezone} />
      <p className="tool-kicker">{fmtDateLong(date)} · {city.region ? `${city.region}, ` : ""}{city.country}</p>
      <p className="tool-lead">
        Today in {city.name} the tithi at sunrise is <strong>{tithiNow.name}</strong>
        {tithiNow.end ? ` until ${fmtTime(tithiNow.end, date)}` : ""} and the nakshatra is <strong>{nakNow.name}</strong>
        {nakNow.end ? ` until ${fmtTime(nakNow.end, date)}` : ""}. Sunrise is at {fmtTime(p.sunrise, date)} and Rahu Kalam runs from{" "}
        {fmtTime(p.rahuKalam.start, date)} to {fmtTime(p.rahuKalam.end, date)}.
      </p>

      <section className="seo-content">
        <h2>Panchang elements</h2>
        <PanchangCore p={p} />

        <h2>Sunrise, sunset and moon</h2>
        <SunMoon p={p} />
        {comparison && <p className="tool-note">{comparison}</p>}

        <h2>Auspicious and inauspicious times</h2>
        <Muhurtas t={p} nowMs={now} />
        <p>
          Full Rahu Kalam timings for the week: <Link href={`/rahu-kaal/${city.slug}`}>Rahu Kaal in {city.name}</Link>. Day and night
          choghadiya: <Link href={`/choghadiya/${city.slug}`}>Choghadiya in {city.name}</Link>.
        </p>

        <h2>Hora (planetary hours)</h2>
        {currentHora && (
          <p>
            The hora running now is <strong>{currentHora.planet}</strong> ({fmtTime(currentHora.start, date)} – {fmtTime(currentHora.end, date)}).
          </p>
        )}
        <HoraTable slots={p.hora.day} base={date} nowMs={now} label="Day horas (sunrise to sunset)" />
        <HoraTable slots={p.hora.night} base={date} nowMs={now} label="Night horas (sunset to next sunrise)" />

        <h2>Panchang for another date or place</h2>
        <PanchangExplorer
          defaultDate={date}
          defaultPlace={{ label: `${city.name}, ${city.region ? `${city.region}, ` : ""}${city.country}`, latitude: city.latitude, longitude: city.longitude, timezone: city.timezone }}
        />

        <h2>How to read this panchang</h2>
        <p>
          A panchang day starts at sunrise, so the tithi, nakshatra, yoga and karana listed first are the ones prevailing at sunrise; where one
          ends during the day, the next one is shown with its end time. Times after midnight carry the next date. Rahu Kalam, Yamaganda and
          Gulika divide the time from sunrise to sunset into eight equal parts, so they shift every day with the sunrise.
        </p>

        <h2>Panchang in other cities</h2>
        <ul className="pc-city-links">
          {relatedCities(city, 16).map((c) => (
            <li key={c.slug}><Link href={`/panchang/${c.slug}`}>{c.name}</Link></li>
          ))}
          <li><Link href="/panchang">All cities</Link></li>
        </ul>
      </section>
    </ContentShell>
  );
}
