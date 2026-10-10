import type { Metadata } from "next";
import Link from "next/link";
import ContentShell from "@/src/components/site/ContentShell";
import { HI_METHOD_NOTE } from "@/src/components/site/hi-notes";
import StaleGuard from "@/src/components/panchang/StaleGuard";
import { ChoghadiyaTable } from "@/src/components/panchang/PanchangViews";
import { INDIAN_CITIES, WORLD_CITIES, cityBySlug } from "@/src/lib/cities";
import { cityDayTimes, cityToday } from "@/src/lib/panchang-data";
import { fmtDateLong, nowMs } from "@/src/lib/panchang-format";
import { HI_CITY } from "@/src/lib/hi";
import { hreflang } from "@/src/lib/alternates";

export const revalidate = 300;

const TITLE = "आज का चौघड़िया – दिन और रात का चौघड़िया समय, अपने शहर के लिए";
const DESC = "आज का चौघड़िया (अमृत, शुभ, लाभ, चर, रोग, काल, उद्वेग) अहमदाबाद, मुंबई, दिल्ली और 80+ शहरों के लिए दिन-रात के सटीक समय के साथ।";

// oxlint-disable-next-line react/only-export-components -- App Router metadata belongs with the route.
export const metadata: Metadata = {
  title: { absolute: TITLE }, description: DESC,
  alternates: hreflang("/choghadiya", "/hi/choghadiya", "hi"),
  openGraph: { title: TITLE, description: DESC, url: "/hi/choghadiya", type: "website", locale: "hi_IN" },
};

export default function Page() {
  const city = cityBySlug("ahmedabad")!;
  const date = cityToday(city);
  const t = cityDayTimes(city, date);
  const now = nowMs();
  return (
    <ContentShell switchTo={{ href: "/choghadiya", label: "English" }} lang="hi" crumbs={[{ name: "चौघड़िया", path: "/hi/choghadiya" }]} footerNote={HI_METHOD_NOTE}>
      <h1 className="seo-article-title">आज का चौघड़िया</h1>
      <StaleGuard date={date} timezone={city.timezone} />
      <p className="tool-kicker">{fmtDateLong(date, "hi")} · अहमदाबाद के अनुसार</p>
      <p className="tool-lead">चौघड़िया का समय स्थानीय सूर्योदय और सूर्यास्त पर निर्भर है, इसलिए अलग-अलग शहरों में यह एक घंटे या उससे भी अधिक खिसक सकता है। नीचे अहमदाबाद का आज का चौघड़िया है; अपने शहर का सटीक समय देखने के लिए शहर चुनें।</p>
      <section className="seo-content">
        <ChoghadiyaTable slots={t.choghadiya.day} base={date} nowMs={now} label="दिन का चौघड़िया, अहमदाबाद" lang="hi" />
        <ChoghadiyaTable slots={t.choghadiya.night} base={date} nowMs={now} label="रात का चौघड़िया, अहमदाबाद" lang="hi" />
        <h2>भारतीय शहरों का चौघड़िया</h2>
        <ul className="pc-city-links">{INDIAN_CITIES.map((c) => <li key={c.slug}><Link href={`/hi/choghadiya/${c.slug}`}>{HI_CITY[c.slug]}</Link></li>)}</ul>
        <h2>विदेश में चौघड़िया (स्थानीय समय)</h2>
        <ul className="pc-city-links">{WORLD_CITIES.map((c) => <li key={c.slug}><Link href={`/hi/choghadiya/${c.slug}`}>{HI_CITY[c.slug]}</Link></li>)}</ul>
      </section>
    </ContentShell>
  );
}
