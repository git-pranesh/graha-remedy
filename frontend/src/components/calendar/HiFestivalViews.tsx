import Link from "next/link";
import ContentShell from "../site/ContentShell";
import StaleGuard from "../panchang/StaleGuard";
import { FESTIVALS, festivalDates, kalaWindow, type FestivalDef } from "../../services/festivals";
import { DELHI } from "../../lib/calendar-pages";
import { cityBySlug } from "../../lib/cities";
import { fmtDateLong, fmtDateShort, fmtRange, fmtTime } from "../../lib/panchang-format";
import { todayInTimezone, TITHI_NAMES, LUNAR_MONTHS, jdToLocalIso } from "../../services/panchang";
import { tr, HI_CITY } from "../../lib/hi";
import { FEST_NOTE_HI, FESTIVAL_HI_DESC, KALA_HI, RULE_HI, WINDOW_HI } from "../../lib/festivals-hi";
import { FEST_YEARS } from "./FestivalViews";

const all = (y: number) => festivalDates(y, DELHI);
const COMPARE = ["delhi", "mumbai", "chennai", "kolkata", "hyderabad", "edison", "dallas", "toronto", "london", "sydney"];

function tithiHi(f: FestivalDef): string {
  const paksha = tr("hi", "paksha", f.tithi < 15 ? "Shukla" : "Krishna");
  const t = tr("hi", "tithi", TITHI_NAMES[f.tithi]);
  const amanta = tr("hi", "month", LUNAR_MONTHS[f.month]);
  if (f.tithi === 14) return `${amanta} ${t}`;
  const purn = tr("hi", "month", LUNAR_MONTHS[f.tithi >= 15 ? (f.month + 1) % 12 : f.month]);
  return f.tithi >= 15 && purn !== amanta ? `${purn} ${paksha} ${t} (अमांत में ${amanta})` : `${amanta} ${paksha} ${t}`;
}

const isoToJd = (iso: string) => Date.parse(iso) / 86400000 + 2440587.5;
function pujaWindow(def: FestivalDef, r: { date: string; begins: string; ends: string }, place: { latitude: number; longitude: number; timezone: string }) {
  if (!WINDOW_HI[def.kala] || def.offset) return null;
  const [a, b] = kalaWindow(r.date, def.kala, place);
  const s = Math.max(a, isoToJd(r.begins)), e = Math.min(b, isoToJd(r.ends));
  if (e <= s) return null;
  return { start: jdToLocalIso(s, place.timezone), end: jdToLocalIso(e, place.timezone) };
}

function Table({ rows, today }: { rows: ReturnType<typeof all>; today?: string }) {
  const next = today ? rows.findIndex((r) => r.date >= today) : -1;
  return (
    <div className="tool-table-scroll">
      <table className="tool-table tool-table-wide">
        <thead><tr><th>तारीख</th><th>पर्व</th><th>तिथि</th><th>तिथि का समय (IST)</th></tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.def.slug + r.date} className={i === next ? "current" : undefined}>
              <td><strong>{fmtDateLong(r.date, "hi")}</strong></td>
              <td><Link href={`/hi/festivals/${r.def.slug}`}>{r.def.hindi}</Link></td>
              <td>{tithiHi(r.def)}</td>
              <td>{fmtTime(r.begins, undefined, "hi")}, {fmtDateShort(r.begins.slice(0, 10), "hi")} – {fmtTime(r.ends, undefined, "hi")}, {fmtDateShort(r.ends.slice(0, 10), "hi")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function HiFestivalsHub() {
  const today = todayInTimezone(DELHI.timezone);
  const y = Number(today.slice(0, 4));
  const up = [...all(y), ...all(y + 1)].filter((r) => r.date >= today).slice(0, 12);
  return (
    <ContentShell lang="hi" switchTo={{ href: "/festivals", label: "English" }} crumbs={[{ name: "त्योहार", path: "/hi/festivals" }]} footerNote={FEST_NOTE_HI}>
      <h1 className="seo-article-title">आगामी हिंदू त्योहार और तारीखें</h1>
      <StaleGuard date={today} timezone={DELHI.timezone} />
      {up[0] && (
        <div className="pc-hero">
          <span className="pc-hero-label">अगला त्योहार</span>
          <span className="pc-hero-time">{up[0].def.hindi}</span>
          <span className="pc-hero-status">{fmtDateLong(up[0].date, "hi")}</span>
        </div>
      )}
      <p className="tool-lead">अगले बारह प्रमुख हिंदू त्योहार, तारीख और तिथि के समय सहित — नई दिल्ली के लिए।</p>
      <section className="seo-content">
        <Table rows={up} />
        <p>पूरी सूची: {FEST_YEARS.map((yy, i) => <span key={yy}>{i > 0 && " · "}<Link href={`/hi/festivals/${yy}`}>हिंदू त्योहार {yy}</Link></span>)} · <Link href="/hi/ekadashi">एकादशी</Link> · <Link href="/hi/amavasya">अमावस्या</Link> · <Link href="/hi/purnima">पूर्णिमा</Link></p>
        <h2>सभी त्योहार</h2>
        <ul className="pc-city-links">{FESTIVALS.map((f) => <li key={f.slug}><Link href={`/hi/festivals/${f.slug}`}>{f.hindi}</Link></li>)}</ul>
      </section>
    </ContentShell>
  );
}

export function HiFestivalsYear({ year }: { year: number }) {
  const rows = all(year);
  const today = todayInTimezone(DELHI.timezone);
  return (
    <ContentShell lang="hi" switchTo={{ href: `/festivals/${year}`, label: "English" }} crumbs={[{ name: "त्योहार", path: "/hi/festivals" }, { name: String(year), path: `/hi/festivals/${year}` }]} footerNote={FEST_NOTE_HI}>
      <h1 className="seo-article-title">हिंदू त्योहार {year}: पूरी सूची और तारीखें</h1>
      <StaleGuard date={today} timezone={DELHI.timezone} />
      <p className="tool-lead">{year} के {rows.length} प्रमुख हिंदू त्योहार, तिथि के प्रारंभ और समाप्ति समय सहित (नई दिल्ली, IST)। एकादशी की तारीखें <Link href={`/hi/ekadashi/${year}`}>एकादशी {year}</Link> पर देखें।</p>
      <section className="seo-content">
        <Table rows={rows} today={today} />
        <p>{FEST_YEARS.filter((y) => y !== year).map((y) => <Link key={y} href={`/hi/festivals/${y}`}>हिंदू त्योहार {y}</Link>)} · <Link href="/hi/festivals">आगामी त्योहार</Link></p>
      </section>
    </ContentShell>
  );
}

export function HiFestivalPage({ def }: { def: FestivalDef }) {
  const today = todayInTimezone(DELHI.timezone);
  const rows = FEST_YEARS.map((y) => festivalDates(y, DELHI, [def])[0]).filter(Boolean);
  const next = rows.find((r) => r.date >= today) ?? rows[rows.length - 1];
  const yr = next.date.slice(0, 4);
  const hasWin = Boolean(WINDOW_HI[def.kala]) && !def.offset;
  return (
    <ContentShell lang="hi" switchTo={{ href: `/festivals/${def.slug}`, label: "English" }} crumbs={[{ name: "त्योहार", path: "/hi/festivals" }, { name: def.hindi, path: `/hi/festivals/${def.slug}` }]} footerNote={FEST_NOTE_HI}>
      <h1 className="seo-article-title">{def.hindi} {yr}: तारीख और तिथि का समय</h1>
      <StaleGuard date={today} timezone={DELHI.timezone} />
      <div className="pc-hero">
        <span className="pc-hero-label">{def.hindi} {yr}</span>
        <span className="pc-hero-time">{fmtDateLong(next.date, "hi")}</span>
        <span className="pc-hero-status">तिथि {fmtTime(next.begins, undefined, "hi")}, {fmtDateShort(next.begins.slice(0, 10), "hi")} से {fmtTime(next.ends, undefined, "hi")}, {fmtDateShort(next.ends.slice(0, 10), "hi")} तक (IST, नई दिल्ली)</span>
      </div>
      <p className="tool-lead">{def.hindi} {yr} <strong>{fmtDateLong(next.date, "hi")}</strong> को है। {FESTIVAL_HI_DESC[def.slug]}</p>
      <section className="seo-content">
        <h2>{def.hindi} की तारीखें</h2>
        <table className="tool-table">
          <thead><tr><th>वर्ष</th><th>तारीख</th><th>तिथि का समय (IST)</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.date}><td>{r.date.slice(0, 4)}</td><td><strong>{fmtDateLong(r.date, "hi")}</strong></td><td>{fmtTime(r.begins, undefined, "hi")}, {fmtDateShort(r.begins.slice(0, 10), "hi")} – {fmtTime(r.ends, undefined, "hi")}, {fmtDateShort(r.ends.slice(0, 10), "hi")}</td></tr>
            ))}
          </tbody>
        </table>
        {rows.map((r) => {
          const w = pujaWindow(def, r, DELHI);
          return w ? <p key={"w" + r.date}><strong>{WINDOW_HI[def.kala]}, {r.date.slice(0, 4)} (नई दिल्ली):</strong> {fmtRange(w, r.date, "hi")}, {fmtDateShort(r.date, "hi")}।</p> : null;
        })}

        <h2>अन्य शहरों में {def.hindi} की तारीख</h2>
        <p>हर शहर के अपने सूर्योदय, सूर्यास्त और समय क्षेत्र के अनुसार। भारत के बाहर पर्व कभी-कभी दूसरी तारीख को पड़ता है।</p>
        <div className="tool-table-scroll">
          <table className="tool-table tool-table-wide">
            <thead><tr><th>शहर</th>{FEST_YEARS.map((y) => <th key={y}>{y}</th>)}{hasWin && <th>{WINDOW_HI[def.kala]} ({FEST_YEARS[0]}, स्थानीय समय)</th>}</tr></thead>
            <tbody>
              {COMPARE.map((slug) => {
                const c = cityBySlug(slug)!;
                const place = { latitude: c.latitude, longitude: c.longitude, timezone: c.timezone };
                const ds = FEST_YEARS.map((y) => festivalDates(y, place, [def])[0]);
                const w = ds[0] ? pujaWindow(def, ds[0], place) : null;
                const differs = ds.some((d, i) => d && rows[i] && d.date !== rows[i].date);
                return (
                  <tr key={slug} className={differs ? "current" : undefined}>
                    <td><Link href={`/hi/panchang/${slug}`}>{HI_CITY[slug] ?? c.name}</Link></td>
                    {ds.map((d, i) => <td key={i}>{d ? fmtDateShort(d.date, "hi") : "—"}</td>)}
                    {hasWin && <td>{w ? fmtRange(w, ds[0]!.date, "hi") : "—"}</td>}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="tool-note">रंगीन पंक्तियाँ उन शहरों की हैं जहाँ किसी वर्ष तारीख नई दिल्ली से भिन्न है।</p>

        <h2>तारीख कैसे तय होती है</h2>
        <p>
          {def.hindi} की तिथि: {tithiHi(def)}। तिथि शायद ही कभी कैलेंडर के दिन से मेल खाती है, इसलिए पर्व उस दिन मनाया जाता है जिस दिन तिथि {KALA_HI[def.kala]} रहती है।
          {def.rule && RULE_HI[def.rule]}
          {def.offset === 1 && " यहाँ दी गई तारीख होलिका दहन के अगले दिन की है।"}
        </p>
        <p>तारीखें नई दिल्ली के लिए हैं। अपने शहर का <Link href="/hi/panchang">आज का पंचांग</Link> देखें।</p>

        <h2>अन्य त्योहार</h2>
        <ul className="pc-city-links">
          {FESTIVALS.filter((f) => f.slug !== def.slug).map((f) => <li key={f.slug}><Link href={`/hi/festivals/${f.slug}`}>{f.hindi}</Link></li>)}
          {FEST_YEARS.map((y) => <li key={y}><Link href={`/hi/festivals/${y}`}>त्योहार {y}</Link></li>)}
        </ul>
      </section>
    </ContentShell>
  );
}
