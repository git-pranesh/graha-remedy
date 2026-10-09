import type { Metadata } from "next";
import { hreflang } from "@/src/lib/alternates";
import Link from "next/link";
import StaleGuard from "@/src/components/panchang/StaleGuard";
import ContentShell, { PANCHANG_METHOD_NOTE } from "@/src/components/site/ContentShell";
import { ChoghadiyaTable } from "@/src/components/panchang/PanchangViews";
import CityIndex from "@/src/components/panchang/CityIndex";
import { cityBySlug } from "@/src/lib/cities";
import { cityDayTimes, cityToday } from "@/src/lib/panchang-data";
import { fmtDateLong } from "@/src/lib/panchang-format";

export const revalidate = 300;

const TITLE = "Choghadiya Today – Day and Night Choghadiya Timings for Your City";
const DESCRIPTION =
  "Today's choghadiya (Amrit, Shubh, Labh, Char, Rog, Kaal, Udveg) with exact day and night timings for Ahmedabad, Mumbai, Delhi and 80+ cities, calculated from local sunrise.";

// oxlint-disable-next-line react/only-export-components -- App Router metadata belongs with the route.
export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: hreflang("/choghadiya", "/hi/choghadiya", "en"),
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/choghadiya", type: "website" },
};

export default function ChoghadiyaHub() {
  const city = cityBySlug("ahmedabad")!;
  const date = cityToday(city);
  const t = cityDayTimes(city, date);
  const now = Date.now();
  return (
    <ContentShell switchTo={{ href: "/hi/choghadiya", label: "हिन्दी" }} crumbs={[{ name: "Choghadiya", path: "/choghadiya" }]} footerNote={PANCHANG_METHOD_NOTE}>
      <h1 className="seo-article-title">Choghadiya Today</h1>
      <StaleGuard date={date} timezone={city.timezone} />
      <p className="tool-kicker">{fmtDateLong(date)} · shown for Ahmedabad</p>
      <p className="tool-lead">
        Choghadiya times depend on local sunrise and sunset, so they differ between cities by up to an hour or more. Below is today&apos;s
        choghadiya for Ahmedabad; choose your city for exact local timings.
      </p>
      <section className="seo-content">
        <ChoghadiyaTable slots={t.choghadiya.day} base={date} nowMs={now} label="Day choghadiya, Ahmedabad" />
        <ChoghadiyaTable slots={t.choghadiya.night} base={date} nowMs={now} label="Night choghadiya, Ahmedabad" />
        <p>
          <Link href="/choghadiya/ahmedabad">Ahmedabad choghadiya with Rahu Kalam overlap</Link>
        </p>
        <CityIndex base="/choghadiya" label="Today's choghadiya" />
      </section>
    </ContentShell>
  );
}
