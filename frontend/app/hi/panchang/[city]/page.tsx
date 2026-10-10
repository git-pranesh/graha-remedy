import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ContentShell from "@/src/components/site/ContentShell";
import { HI_METHOD_NOTE } from "@/src/components/site/hi-notes";
import StaleGuard from "@/src/components/panchang/StaleGuard";
import { HoraTable, Muhurtas, PanchangCore, SunMoon } from "@/src/components/panchang/PanchangViews";
import { CITIES, cityBySlug, relatedCities } from "@/src/lib/cities";
import { cityPanchang, cityToday } from "@/src/lib/panchang-data";
import { fmtDateLong, fmtTime, isNow, nowMs } from "@/src/lib/panchang-format";
import { HI_CITY, HI_COUNTRY, trTithi, tr } from "@/src/lib/hi";
import { hreflang } from "@/src/lib/alternates";

export const revalidate = 300;
export const dynamicParams = false;

// oxlint-disable-next-line react/only-export-components -- App Router build-time export.
export function generateStaticParams() {
  return CITIES.map((c) => ({ city: c.slug }));
}

interface Props { params: Promise<{ city: string }> }

// oxlint-disable-next-line react/only-export-components -- App Router metadata belongs with the route.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const city = cityBySlug((await params).city);
  if (!city) return {};
  const n = HI_CITY[city.slug];
  const title = `आज का पंचांग ${n} – तिथि, नक्षत्र, योग, करण, राहु काल`;
  const description = `${n} का आज का पंचांग: तिथि, नक्षत्र, योग और करण के समाप्ति समय, सूर्योदय, सूर्यास्त, चंद्रोदय, राहु काल, अभिजित मुहूर्त और होरा — ${n} के सटीक स्थान के अनुसार।`;
  return { title: { absolute: title }, description, alternates: hreflang(`/panchang/${city.slug}`, `/hi/panchang/${city.slug}`, "hi"), openGraph: { title, description, url: `/hi/panchang/${city.slug}`, type: "website", locale: "hi_IN" } };
}

export default async function Page({ params }: Props) {
  const city = cityBySlug((await params).city);
  if (!city) notFound();
  const n = HI_CITY[city.slug];
  const date = cityToday(city);
  const p = cityPanchang(city, date);
  const now = nowMs();
  const t0 = p.tithi[0], k0 = p.nakshatra[0];
  const hora = p.hora.day.find((h) => isNow(h, now)) ?? p.hora.night.find((h) => isNow(h, now));

  return (
    <ContentShell
      switchTo={{ href: `/panchang/${city.slug}`, label: "English" }}
      lang="hi"
      crumbs={[{ name: "पंचांग", path: "/hi/panchang" }, { name: n, path: `/hi/panchang/${city.slug}` }]}
      footerNote={HI_METHOD_NOTE}
    >
      <h1 className="seo-article-title">आज का पंचांग – {n}</h1>
      <StaleGuard date={date} timezone={city.timezone} />
      <p className="tool-kicker">{fmtDateLong(date, "hi")} · {HI_COUNTRY[city.countryCode]}</p>
      <p className="tool-lead">
        आज {n} में सूर्योदय के समय तिथि <strong>{trTithi("hi", t0.name)}</strong>
        {t0.end ? ` ${fmtTime(t0.end, date, "hi")} तक` : ""} और नक्षत्र <strong>{tr("hi", "nakshatra", k0.name)}</strong>
        {k0.end ? ` ${fmtTime(k0.end, date, "hi")} तक` : ""} है। {n} में सूर्योदय {fmtTime(p.sunrise, date, "hi")} पर और राहु काल{" "}
        {fmtTime(p.rahuKalam.start, date, "hi")} से {fmtTime(p.rahuKalam.end, date, "hi")} तक रहेगा।
      </p>
      <section className="seo-content">
        <h2>पंचांग के पाँच अंग</h2>
        <PanchangCore p={p} lang="hi" />
        <h2>सूर्योदय, सूर्यास्त और चंद्रमा</h2>
        <SunMoon p={p} lang="hi" />
        {city.countryCode !== "IN" && (
          <p className="tool-note">सभी समय {n} के स्थानीय समय ({p.timezone}) में हैं, डेलाइट सेविंग सहित। भारतीय मानक समय (IST) में छपे पंचांग {n} के लिए सही नहीं होते।</p>
        )}
        <h2>शुभ और अशुभ समय</h2>
        <Muhurtas t={p} nowMs={now} lang="hi" />
        <p>
          {n} का <Link href={`/hi/choghadiya/${city.slug}`}>आज का चौघड़िया</Link> · राहु काल का साप्ताहिक समय:{" "}
          <Link href={`/rahu-kaal/${city.slug}`}>Rahu Kaal in {city.name} (English)</Link>
        </p>
        <h2>होरा (ग्रहों के घंटे)</h2>
        {hora && <p>अभी चल रही होरा <strong>{tr("hi", "planet", hora.planet)}</strong> की है ({fmtTime(hora.start, date, "hi")} – {fmtTime(hora.end, date, "hi")}).</p>}
        <HoraTable slots={p.hora.day} base={date} nowMs={now} label="दिन की होरा (सूर्योदय से सूर्यास्त)" lang="hi" />
        <HoraTable slots={p.hora.night} base={date} nowMs={now} label="रात की होरा (सूर्यास्त से अगले सूर्योदय)" lang="hi" />
        <h2>पंचांग कैसे पढ़ें</h2>
        <p>
          पंचांग का दिन सूर्योदय से शुरू होता है, इसलिए सबसे पहले लिखी तिथि, नक्षत्र, योग और करण सूर्योदय के समय की हैं; जो दिन के बीच बदलते हैं उनके आगे समाप्ति
          समय दिया गया है। आधी रात के बाद के समय के साथ अगली तारीख लिखी है। राहु काल, यमगण्ड और गुलिक सूर्योदय से सूर्यास्त के समय को आठ बराबर भागों में बाँटकर निकाले
          जाते हैं, इसलिए ये रोज़ और हर शहर में बदलते हैं।
        </p>
        <p>किसी अन्य तारीख या शहर का पंचांग देखने के लिए <Link href={`/panchang/${city.slug}`}>अंग्रेज़ी पेज</Link> पर तारीख और स्थान चुनें।</p>
        <h2>अन्य शहरों का पंचांग</h2>
        <ul className="pc-city-links">
          {relatedCities(city, 16).map((c) => (
            <li key={c.slug}><Link href={`/hi/panchang/${c.slug}`}>{HI_CITY[c.slug]}</Link></li>
          ))}
          <li><Link href="/hi/panchang">सभी शहर</Link></li>
        </ul>
      </section>
    </ContentShell>
  );
}
