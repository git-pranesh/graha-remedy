import type { Metadata } from "next";
import Link from "next/link";
import ContentShell, { PANCHANG_METHOD_NOTE } from "@/src/components/site/ContentShell";
import { Muhurtas, PanchangCore, SunMoon } from "@/src/components/panchang/PanchangViews";
import PanchangExplorer from "@/src/components/panchang/PanchangExplorer";
import CityIndex from "@/src/components/panchang/CityIndex";
import { cityBySlug } from "@/src/lib/cities";
import { cityPanchang, cityToday } from "@/src/lib/panchang-data";
import { fmtDateLong, fmtTime } from "@/src/lib/panchang-format";

export const dynamic = "force-dynamic";

const TITLE = "Today's Panchang – Tithi, Nakshatra, Yoga, Karana, Rahu Kaal for Your City";
const DESCRIPTION =
  "Today's Hindu panchang with tithi, nakshatra, yoga and karana end times, sunrise, moonrise, Rahu Kalam, Abhijit and Brahma Muhurta — for New Delhi or any city in the world.";

// oxlint-disable-next-line react/only-export-components -- App Router metadata belongs with the route.
export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/panchang" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/panchang", type: "website" },
};

export default function PanchangHub() {
  const delhi = cityBySlug("delhi")!;
  const date = cityToday(delhi);
  const p = cityPanchang(delhi, date);
  return (
    <ContentShell crumbs={[{ name: "Panchang", path: "/panchang" }]} footerNote={PANCHANG_METHOD_NOTE}>
      <h1 className="seo-article-title">Today&apos;s Panchang</h1>
      <p className="tool-kicker">{fmtDateLong(date)} · shown for New Delhi</p>
      <p className="tool-lead">
        The tithi at sunrise today is <strong>{p.tithi[0].name}</strong>
        {p.tithi[0].end ? ` until ${fmtTime(p.tithi[0].end, date)}` : ""} and the nakshatra is <strong>{p.nakshatra[0].name}</strong>
        {p.nakshatra[0].end ? ` until ${fmtTime(p.nakshatra[0].end, date)}` : ""} (New Delhi times). Panchang timings depend on sunrise, so pick
        your city below for exact local times.
      </p>
      <section className="seo-content">
        <h2>Panchang for New Delhi</h2>
        <PanchangCore p={p} />
        <SunMoon p={p} />
        <Muhurtas t={p} nowMs={Date.now()} />
        <p>
          More for Delhi: <Link href="/rahu-kaal/delhi">Rahu Kaal this week</Link> · <Link href="/choghadiya/delhi">Choghadiya</Link> ·{" "}
          <Link href="/panchang/delhi">full Delhi panchang with hora</Link>.
        </p>

        <h2>Panchang for any date and place</h2>
        <PanchangExplorer
          defaultDate={date}
          defaultPlace={{ label: "Delhi, India", latitude: delhi.latitude, longitude: delhi.longitude, timezone: delhi.timezone }}
        />

        <CityIndex base="/panchang" label="Today's panchang" />

        <h2>The five limbs of the panchang</h2>
        <p>
          <strong>Tithi</strong> is the lunar day: each 12° the Moon gains on the Sun, 30 in a lunar month. <strong>Nakshatra</strong> is the
          Moon&apos;s lunar mansion (27 of 13°20′). <strong>Yoga</strong> comes from the sum of the Sun&apos;s and Moon&apos;s sidereal longitudes
          (27 of 13°20′). <strong>Karana</strong> is half a tithi. <strong>Vara</strong> is the weekday, counted from sunrise. Together they
          are used to choose muhurtas and to fix fasts and festivals.
        </p>
      </section>
    </ContentShell>
  );
}
