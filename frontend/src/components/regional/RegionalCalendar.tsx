import Link from "next/link";
import ContentShell from "../site/ContentShell";
import { cityBySlug } from "../../lib/cities";
import { cityPanchang } from "../../lib/panchang-data";
import { fmtRange, fmtTime } from "../../lib/panchang-format";
import { tr, trTithi, gregMonths } from "../../lib/hi";
import { calendarEvents } from "../../services/calendar";
import { sankrantis } from "../../services/sankranti";
import { tamilYearName } from "../panchang/PanchangViews";
import { DEFAULT_CITY, type South } from "./RegionalPanchang";
import { TA_CITY, TE_CITY } from "../../lib/i18n-south";

export const CAL_YEARS_REGIONAL = [2026, 2027];

const T = {
  te: {
    crumb: "తెలుగు క్యాలెండర్",
    h1: (m: string, y: number) => `తెలుగు క్యాలెండర్ ${m} ${y}`,
    cols: ["తేదీ", "తిథి (సూర్యోదయానికి)", "నక్షత్రం", "మాసం", "సూర్యోదయం", "రాహుకాలం"],
    ek: "ఏకాదశి", am: "అమావాస్య", pu: "పౌర్ణమి", sk: "సంక్రాంతి",
    lead: (m: string, y: number, c: string) => `${m} ${y} నెలలో ప్రతి రోజు తిథి (ముగింపు సమయంతో), నక్షత్రం, తెలుగు మాసం, సూర్యోదయం, రాహుకాలం — ${c} కోసం లెక్కించబడింది. ఏకాదశి, అమావాస్య, పౌర్ణమి, సంక్రాంతి రోజులు గుర్తించబడ్డాయి.`,
    note: "పండుగల జాబితా ఇంకా చేర్చలేదు; తిథులు, నక్షత్రాలు, ఏకాదశి, అమావాస్య, పౌర్ణమి, సంక్రాంతి తేదీలు ప్రచురిత పంచాంగాలతో సరిపోల్చి ధృవీకరించబడ్డాయి. ఇతర నగరాల్లో సమయాలు, కొన్నిసార్లు తేదీలు మారవచ్చు.",
    year: "సంవత్సరం", today: "ఈ రోజు పంచాంగం", months: "నెలలు",
  },
  ta: {
    crumb: "தமிழ் காலண்டர்",
    h1: (m: string, y: number) => `தமிழ் காலண்டர் ${m} ${y}`,
    cols: ["தேதி", "திதி (சூரிய உதயத்தில்)", "நட்சத்திரம்", "தமிழ் தேதி", "சூரிய உதயம்", "ராகு காலம்"],
    ek: "ஏகாதசி", am: "அமாவாசை", pu: "பௌர்ணமி", sk: "மாதப் பிறப்பு",
    lead: (m: string, y: number, c: string) => `${m} ${y} மாதத்தின் ஒவ்வொரு நாளுக்கும் தமிழ் தேதி, திதி (முடிவு நேரத்துடன்), நட்சத்திரம், சூரிய உதயம், ராகு காலம் — ${c}க்குக் கணக்கிடப்பட்டது. ஏகாதசி, அமாவாசை, பௌர்ணமி, தமிழ் மாதப் பிறப்பு நாட்கள் குறிக்கப்பட்டுள்ளன.`,
    note: "பண்டிகைகள் இன்னும் சேர்க்கப்படவில்லை; திதி, நட்சத்திரம், ஏகாதசி, அமாவாசை, பௌர்ணமி, சங்கராந்தி தேதிகள் வெளியிடப்பட்ட பஞ்சாங்கங்களுடன் ஒப்பிட்டுச் சரிபார்க்கப்பட்டவை. பிற நகரங்களில் நேரங்களும் சில சமயம் தேதிகளும் மாறலாம்.",
    year: "ஆண்டு", today: "இன்றைய பஞ்சாங்கம்", months: "மாதங்கள்",
  },
};

const WD_SHORT = { te: ["ఆది", "సోమ", "మంగళ", "బుధ", "గురు", "శుక్ర", "శని"], ta: ["ஞாயி", "திங்", "செவ்", "புத", "வியா", "வெள்", "சனி"] };

export default function RegionalCalendar({ lang, year, month }: { lang: South; year: number; month: number }) {
  const t = T[lang];
  const city = cityBySlug(DEFAULT_CITY[lang])!;
  const cityName = (lang === "te" ? TE_CITY : TA_CITY)[city.slug];
  const mName = gregMonths(lang)![month - 1];
  const days = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const pad = (n: number) => String(n).padStart(2, "0");
  const ym = `${year}-${pad(month)}`;
  const place = { latitude: city.latitude, longitude: city.longitude, timezone: city.timezone };
  const events = calendarEvents(year, place);
  const marks: Record<string, string[]> = {};
  const add = (d: string, s: string) => { if (d.startsWith(ym)) (marks[d] ??= []).push(s); };
  for (const e of events) add(e.kind === "ekadashi" ? e.date : e.date, e.kind === "ekadashi" ? t.ek : e.kind === "amavasya" ? t.am : t.pu);
  for (const s of sankrantis(year, place)) add(s.observedDate, lang === "ta" ? `${tr("ta", "tamilMonth", ["Chithirai","Vaikasi","Aani","Aadi","Avani","Purattasi","Aippasi","Karthigai","Margazhi","Thai","Maasi","Panguni"][s.signIndex])} ${t.sk}` : `${tr("te", "sign", s.name)} ${t.sk}`);

  const rows = Array.from({ length: days }, (_, i) => {
    const date = `${ym}-${pad(i + 1)}`;
    return { date, p: cityPanchang(city, date) };
  });
  const first = rows[0].p;
  const yearName = tr(lang, "samvatsara", lang === "ta" ? tamilYearName(first) : first.samvatsara);
  const base = `/${lang}/calendar`;
  const prev = month === 1 ? [year - 1, 12] : [year, month - 1];
  const next = month === 12 ? [year + 1, 1] : [year, month + 1];
  const has = (y: number) => CAL_YEARS_REGIONAL.includes(y);

  return (
    <ContentShell
      lang={lang}
      crumbs={[{ name: t.crumb, path: `${base}/${year}` }, { name: `${mName} ${year}`, path: `${base}/${year}/${month}` }]}
      footerNote={t.note}
    >
      <h1 className="seo-article-title">{t.h1(mName, year)}</h1>
      <p className="tool-kicker">{yearName} · {cityName}</p>
      <p className="tool-lead">{t.lead(mName, year, cityName)}</p>
      <section className="seo-content">
        <div className="tool-table-scroll">
          <table className="tool-table tool-table-wide">
            <thead><tr>{t.cols.map((c) => <th key={c}>{c}</th>)}</tr></thead>
            <tbody>
              {rows.map(({ date, p }) => (
                <tr key={date} className={marks[date] ? "current" : undefined}>
                  <td>
                    <strong>{Number(date.slice(8))}</strong> {WD_SHORT[lang][new Date(date + "T00:00:00Z").getUTCDay()]}
                    {marks[date] && <div className="pc-note">{marks[date].join(", ")}</div>}
                  </td>
                  <td>{trTithi(lang, p.tithi[0].name)}{p.tithi[0].end ? ` ${fmtTime(p.tithi[0].end, date, lang)}` : ""}</td>
                  <td>{tr(lang, "nakshatra", p.nakshatra[0].name)}{p.nakshatra[0].end ? ` ${fmtTime(p.nakshatra[0].end, date, lang)}` : ""}</td>
                  <td>{lang === "ta" ? `${tr("ta", "tamilMonth", p.tamilDate.month)} ${p.tamilDate.day}` : `${p.lunarMonth.adhika ? "అధిక " : ""}${tr("te", "month", p.lunarMonth.amanta)}`}</td>
                  <td>{fmtTime(p.sunrise, date, lang)}</td>
                  <td>{fmtRange(p.rahuKalam, date, lang)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          {has(prev[0]) && <Link href={`${base}/${prev[0]}/${prev[1]}`}>← {gregMonths(lang)![prev[1] - 1]} {prev[0]}</Link>}
          {" · "}
          <Link href={`${base}/${year}`}>{t.crumb} {year}</Link>
          {" · "}
          {has(next[0]) && <Link href={`${base}/${next[0]}/${next[1]}`}>{gregMonths(lang)![next[1] - 1]} {next[0]} →</Link>}
          {" · "}
          <Link href={`/${lang}/panchangam`}>{t.today}</Link>
        </p>
      </section>
    </ContentShell>
  );
}

export function RegionalCalendarYear({ lang, year }: { lang: South; year: number }) {
  const t = T[lang];
  const base = `/${lang}/calendar`;
  const city = cityBySlug(DEFAULT_CITY[lang])!;
  const place = { latitude: city.latitude, longitude: city.longitude, timezone: city.timezone };
  const ev = calendarEvents(year, place);
  const list = (kind: string) => ev.filter((e) => e.kind === kind).map((e) => `${Number(e.date.slice(8))} ${gregMonths(lang)![Number(e.date.slice(5, 7)) - 1]}`).join(", ");
  return (
    <ContentShell lang={lang} crumbs={[{ name: `${t.crumb} ${year}`, path: `${base}/${year}` }]} footerNote={t.note}>
      <h1 className="seo-article-title">{t.crumb} {year}</h1>
      <p className="tool-lead">{t.lead(String(year), year, (lang === "te" ? TE_CITY : TA_CITY)[city.slug]).replace(`${year} ${year}`, String(year))}</p>
      <section className="seo-content">
        <h2>{t.months}</h2>
        <ul className="pc-city-links">
          {gregMonths(lang)!.map((m, i) => <li key={m}><Link href={`${base}/${year}/${i + 1}`}>{m} {year}</Link></li>)}
        </ul>
        <h2>{t.ek} {year}</h2><p>{list("ekadashi")}</p>
        <h2>{t.am} {year}</h2><p>{list("amavasya")}</p>
        <h2>{t.pu} {year}</h2><p>{list("purnima")}</p>
        <p>{CAL_YEARS_REGIONAL.filter((y) => y !== year).map((y) => <Link key={y} href={`${base}/${y}`}>{t.crumb} {y}</Link>)} · <Link href={`/${lang}/panchangam`}>{t.today}</Link></p>
      </section>
    </ContentShell>
  );
}
