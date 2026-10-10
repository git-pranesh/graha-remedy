import type { Metadata } from "next";
import Link from "next/link";
import ContentShell from "@/src/components/site/ContentShell";
import { HI_METHOD_NOTE } from "@/src/components/site/hi-notes";
import StaleGuard from "@/src/components/panchang/StaleGuard";
import { Muhurtas, PanchangCore, SunMoon } from "@/src/components/panchang/PanchangViews";
import { CITIES, INDIAN_CITIES, WORLD_CITIES, cityBySlug } from "@/src/lib/cities";
import { cityPanchang, cityToday } from "@/src/lib/panchang-data";
import { fmtDateLong, fmtTime, nowMs } from "@/src/lib/panchang-format";
import { HI_CITY, trTithi, tr } from "@/src/lib/hi";
import { hreflang } from "@/src/lib/alternates";

export const revalidate = 300;

const TITLE = "आज का पंचांग – तिथि, नक्षत्र, योग, करण, राहु काल, चौघड़िया";
const DESC = "आज का हिंदू पंचांग: तिथि, नक्षत्र, योग और करण के समाप्ति समय, सूर्योदय, चंद्रोदय, राहु काल, अभिजित और ब्रह्म मुहूर्त — नई दिल्ली या अपने शहर के लिए।";

// oxlint-disable-next-line react/only-export-components -- App Router metadata belongs with the route.
export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESC,
  alternates: hreflang("/panchang", "/hi/panchang", "hi"),
  openGraph: { title: TITLE, description: DESC, url: "/hi/panchang", type: "website", locale: "hi_IN" },
};

export default function Page() {
  const delhi = cityBySlug("delhi")!;
  const date = cityToday(delhi);
  const p = cityPanchang(delhi, date);
  void CITIES;
  return (
    <ContentShell switchTo={{ href: "/panchang", label: "English" }} lang="hi" crumbs={[{ name: "पंचांग", path: "/hi/panchang" }]} footerNote={HI_METHOD_NOTE}>
      <h1 className="seo-article-title">आज का पंचांग</h1>
      <StaleGuard date={date} timezone={delhi.timezone} />
      <p className="tool-kicker">{fmtDateLong(date, "hi")} · नई दिल्ली के अनुसार</p>
      <p className="tool-lead">
        आज सूर्योदय के समय तिथि <strong>{trTithi("hi", p.tithi[0].name)}</strong>
        {p.tithi[0].end ? ` ${fmtTime(p.tithi[0].end, date, "hi")} तक` : ""} और नक्षत्र <strong>{tr("hi", "nakshatra", p.nakshatra[0].name)}</strong>
        {p.nakshatra[0].end ? ` ${fmtTime(p.nakshatra[0].end, date, "hi")} तक` : ""} है (नई दिल्ली का समय)। पंचांग के समय सूर्योदय पर निर्भर होते हैं, इसलिए सटीक स्थानीय समय के लिए नीचे अपना शहर चुनें।
      </p>
      <section className="seo-content">
        <h2>नई दिल्ली का पंचांग</h2>
        <PanchangCore p={p} lang="hi" />
        <SunMoon p={p} lang="hi" />
        <Muhurtas t={p} nowMs={nowMs()} lang="hi" />
        <p><Link href="/hi/panchang/delhi">दिल्ली का पूरा पंचांग (होरा सहित)</Link> · <Link href="/hi/choghadiya/delhi">दिल्ली का चौघड़िया</Link></p>
        <h2>भारतीय शहरों का आज का पंचांग</h2>
        <ul className="pc-city-links">
          {INDIAN_CITIES.map((c) => <li key={c.slug}><Link href={`/hi/panchang/${c.slug}`}>{HI_CITY[c.slug]}</Link></li>)}
        </ul>
        <h2>विदेश में पंचांग (स्थानीय समय)</h2>
        <ul className="pc-city-links">
          {WORLD_CITIES.map((c) => <li key={c.slug}><Link href={`/hi/panchang/${c.slug}`}>{HI_CITY[c.slug]}</Link></li>)}
        </ul>
        <h2>पंचांग के पाँच अंग</h2>
        <p>
          <strong>तिथि</strong> चंद्रमा और सूर्य के बीच हर 12° की दूरी है; एक चंद्र मास में 30 तिथियाँ होती हैं। <strong>नक्षत्र</strong> चंद्रमा का 13°20′ का तारा-खंड है (कुल 27)।
          <strong> योग</strong> सूर्य और चंद्रमा के निरयण भोगांशों के योग से बनता है। <strong>करण</strong> आधी तिथि है। <strong>वार</strong> सूर्योदय से गिना जाने वाला सप्ताह का दिन है।
          इन्हीं से शुभ मुहूर्त, व्रत और त्योहार तय होते हैं।
        </p>
      </section>
    </ContentShell>
  );
}
