import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ContentShell from "@/src/components/site/ContentShell";
import { HI_METHOD_NOTE } from "@/src/components/site/hi-notes";
import StaleGuard from "@/src/components/panchang/StaleGuard";
import { ChoghadiyaTable } from "@/src/components/panchang/PanchangViews";
import { CITIES, cityBySlug, relatedCities } from "@/src/lib/cities";
import { cityDayTimes, cityToday } from "@/src/lib/panchang-data";
import { fmtDateLong, fmtRange, fmtTime, isNow } from "@/src/lib/panchang-format";
import { HI_CITY, tr } from "@/src/lib/hi";
import { hreflang } from "@/src/lib/alternates";
import type { ChoghadiyaSlot, TimeSpan } from "@/src/services/panchang";

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
  const title = `आज का चौघड़िया ${n} – दिन और रात के शुभ मुहूर्त`;
  const description = `${n} का आज का दिन और रात का चौघड़िया: अमृत, शुभ, लाभ और चर के सटीक समय, अभी कौन सा चौघड़िया चल रहा है, और राहु काल से बचने वाले शुभ समय।`;
  return { title: { absolute: title }, description, alternates: hreflang(`/choghadiya/${city.slug}`, `/hi/choghadiya/${city.slug}`, "hi"), openGraph: { title, description, url: `/hi/choghadiya/${city.slug}`, type: "website", locale: "hi_IN" } };
}

const overlaps = (a: TimeSpan, b: TimeSpan) => Date.parse(a.start) < Date.parse(b.end) && Date.parse(b.start) < Date.parse(a.end);

export default async function Page({ params }: Props) {
  const city = cityBySlug((await params).city);
  if (!city) notFound();
  const n = HI_CITY[city.slug];
  const date = cityToday(city);
  const t = cityDayTimes(city, date);
  const now = Date.now();
  const all: ChoghadiyaSlot[] = [...t.choghadiya.day, ...t.choghadiya.night];
  const current = all.find((c) => isNow(c, now));
  const goodClear = t.choghadiya.day.filter((c) => c.nature === "good" && !overlaps(c, t.rahuKalam));
  return (
    <ContentShell
      switchTo={{ href: `/choghadiya/${city.slug}`, label: "English" }}
      lang="hi"
      crumbs={[{ name: "चौघड़िया", path: "/hi/choghadiya" }, { name: n, path: `/hi/choghadiya/${city.slug}` }]}
      footerNote={HI_METHOD_NOTE}
    >
      <h1 className="seo-article-title">आज का चौघड़िया – {n}</h1>
      <StaleGuard date={date} timezone={city.timezone} />
      <p className="tool-kicker">{fmtDateLong(date, "hi")}</p>
      {current && (
        <div className="pc-hero">
          <span className="pc-hero-label">अभी चल रहा है</span>
          <span className="pc-hero-time">{tr("hi", "chog", current.name)} ({tr("hi", "chogMeaning", current.meaning)})</span>
          <span className="pc-hero-status">{fmtRange(current, date, "hi")}</span>
        </div>
      )}
      <p className="tool-lead">
        {n} में दिन का चौघड़िया सूर्योदय {fmtTime(t.sunrise, date, "hi")} से सूर्यास्त {fmtTime(t.sunset, date, "hi")} तक और रात का चौघड़िया सूर्यास्त से अगले
        सूर्योदय {fmtTime(t.nextSunrise, date, "hi")} तक चलता है।
        {goodClear.length > 0 && (
          <> आज दिन के जो शुभ चौघड़िया राहु काल से नहीं टकराते: {goodClear.map((c, i) => <span key={c.start}><strong>{tr("hi", "chog", c.name)}</strong> ({fmtRange(c, date, "hi")}){i < goodClear.length - 1 ? ", " : "।"}</span>)}</>
        )}
      </p>
      <section className="seo-content">
        <h2>दिन का चौघड़िया</h2>
        <ChoghadiyaTable slots={t.choghadiya.day} base={date} nowMs={now} label={`सूर्योदय से सूर्यास्त, ${n}`} lang="hi" />
        <p className="tool-note">आज का राहु काल: {fmtRange(t.rahuKalam, date, "hi")}।</p>
        <h2>रात का चौघड़िया</h2>
        <ChoghadiyaTable slots={t.choghadiya.night} base={date} nowMs={now} label={`सूर्यास्त से अगला सूर्योदय, ${n}`} lang="hi" />
        <h2>चौघड़िया की गणना कैसे होती है</h2>
        <p>
          दिन (सूर्योदय से सूर्यास्त) और रात (सूर्यास्त से अगले सूर्योदय) को आठ-आठ बराबर भागों में बाँटा जाता है; हर भाग एक चौघड़िया है और उसका स्वामी एक ग्रह होता है।
          अमृत (चंद्र), शुभ (गुरु), लाभ (बुध) और चर (शुक्र) शुभ माने जाते हैं — चर विशेषकर यात्रा के लिए — जबकि उद्वेग (सूर्य), काल (शनि) और रोग (मंगल) नए कार्य के लिए टाले जाते हैं।
          दिन का पहला चौघड़िया उस वार के स्वामी ग्रह का होता है, इसीलिए क्रम हर वार को बदलता है और समय सूर्योदय के साथ खिसकता है।
        </p>
        <p>{n} का <Link href={`/hi/panchang/${city.slug}`}>आज का पंचांग</Link> · <Link href={`/choghadiya/${city.slug}`}>Choghadiya in {city.name} (English, with date lookup)</Link></p>
        <h2>अन्य शहरों का चौघड़िया</h2>
        <ul className="pc-city-links">
          {relatedCities(city, 16).map((c) => <li key={c.slug}><Link href={`/hi/choghadiya/${c.slug}`}>{HI_CITY[c.slug]}</Link></li>)}
          <li><Link href="/hi/choghadiya">सभी शहर</Link></li>
        </ul>
      </section>
    </ContentShell>
  );
}
