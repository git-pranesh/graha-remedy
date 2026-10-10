import Link from "next/link";
import { ArrowRight, BookOpen, Calculator, CalendarDays, Sun } from "lucide-react";
import { cityBySlug } from "../../lib/cities";
import { cityPanchang, cityToday } from "../../lib/panchang-data";
import { fmtDateLong, fmtDateShort, fmtRange, fmtTime } from "../../lib/panchang-format";
import { FESTIVALS, festivalDates } from "../../services/festivals";
import { calendarEvents } from "../../services/calendar";
import { DELHI } from "../../lib/calendar-pages";
import { TOOLS } from "../../lib/tools";

/** Server-rendered discovery section for the homepage: today's panchang strip + links into every section. */
export default function ExploreGrid() {
  const delhi = cityBySlug("delhi")!;
  const date = cityToday(delhi);
  const p = cityPanchang(delhi, date);
  const y = Number(date.slice(0, 4));
  const fest = [...festivalDates(y, DELHI), ...festivalDates(y + 1, DELHI)].find((f) => f.date >= date);
  const ek = [...calendarEvents(y, DELHI, ["ekadashi"]), ...calendarEvents(y + 1, DELHI, ["ekadashi"])].find((e) => e.date >= date);
  void FESTIVALS;

  return (
    <>
      <section className="ex-today" aria-label="Today at a glance">
        <div className="ex-today-head">
          <span className="ex-badge"><Sun size={13} /> Today at a glance</span>
          <h2>{fmtDateLong(date)} · New Delhi</h2>
        </div>
        <div className="ex-today-grid">
          <div><span>Tithi</span><strong>{p.tithi[0].name}</strong><em>{p.tithi[0].end ? `until ${fmtTime(p.tithi[0].end, date)}` : "all day"}</em></div>
          <div><span>Nakshatra</span><strong>{p.nakshatra[0].name}</strong><em>{p.nakshatra[0].end ? `until ${fmtTime(p.nakshatra[0].end, date)}` : "all day"}</em></div>
          <div><span>Sunrise / Sunset</span><strong>{fmtTime(p.sunrise, date)}</strong><em>{fmtTime(p.sunset, date)}</em></div>
          <div><span>Rahu Kalam</span><strong>{fmtRange(p.rahuKalam, date)}</strong><em><Link href="/rahu-kaal">your city →</Link></em></div>
        </div>
        <div className="ex-today-links">
          <Link href="/panchang">Full panchang <ArrowRight size={13} /></Link>
          {fest && <Link href={`/festivals/${fest.def.slug}`}>Next festival: {fest.def.name.split(" (")[0]} · {fmtDateShort(fest.date).replace(/ \d{4}$/, "")} <ArrowRight size={13} /></Link>}
          {ek && <Link href="/ekadashi">Next Ekadashi: {fmtDateShort(ek.date).replace(/ \d{4}$/, "")} <ArrowRight size={13} /></Link>}
        </div>
      </section>

      <section className="ex-grid-section" aria-label="Explore">
        <h2 className="ex-title">Explore Graha Remedy</h2>
        <div className="ex-grid">
          <Link href="/panchang" className="ex-card">
            <Sun size={22} /><strong>Panchang, Rahu Kaal &amp; Choghadiya</strong>
            <span>Daily timings for 82 cities in India and abroad. Also in <span lang="hi">हिन्दी</span>, <span lang="te">తెలుగు</span>, <span lang="ta">தமிழ்</span>.</span>
          </Link>
          <Link href="/festivals" className="ex-card">
            <CalendarDays size={22} /><strong>Festivals &amp; Vrat Dates</strong>
            <span>Diwali, Holi, Navratri, Ekadashi, Amavasya, Purnima, Sankranti for 2026–2027.</span>
          </Link>
          <Link href="/calculators" className="ex-card">
            <Calculator size={22} /><strong>Birth-Chart Calculators</strong>
            <span>{TOOLS.map((t) => t.name.replace(" Calculator", "")).slice(0, 5).join(", ")} and more.</span>
          </Link>
          <Link href="/remedies" className="ex-card">
            <BookOpen size={22} /><strong>Mantra &amp; Remedy Library</strong>
            <span>Navagraha mantras, fasting rules and classical remedies from Vedic sources.</span>
          </Link>
        </div>
      </section>
    </>
  );
}
