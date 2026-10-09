import Link from "next/link";
import ContentShell from "../site/ContentShell";
import StaleGuard from "../panchang/StaleGuard";
import { HoraTable, Muhurtas, PanchangCore, SunMoon, tamilYearName } from "../panchang/PanchangViews";
import { cityBySlug, type City } from "../../lib/cities";
import { cityPanchang, cityToday } from "../../lib/panchang-data";
import { fmtDateLong, fmtRange, fmtTime } from "../../lib/panchang-format";
import { tr, trTithi } from "../../lib/hi";
import { TA_CITY, TE_CITY } from "../../lib/i18n-south";

export type South = "te" | "ta";

export const REGIONAL_CITIES: Record<South, string[]> = {
  te: ["hyderabad", "visakhapatnam", "vijayawada", "bengaluru", "chennai", "mumbai", "pune", "delhi", "dallas", "san-jose", "edison", "chicago", "atlanta", "seattle", "houston", "austin", "fremont", "new-york", "toronto", "london", "sydney", "melbourne", "singapore", "dubai"],
  ta: ["chennai", "coimbatore", "madurai", "bengaluru", "kochi", "thiruvananthapuram", "hyderabad", "mumbai", "delhi", "singapore", "london", "toronto", "sydney", "melbourne", "dubai", "new-york", "edison", "san-jose", "dallas", "houston", "chicago", "atlanta"],
};
export const DEFAULT_CITY: Record<South, string> = { te: "hyderabad", ta: "chennai" };
const CITY_NAME: Record<South, Record<string, string>> = { te: TE_CITY, ta: TA_CITY };
const BASE: Record<South, string> = { te: "/te/panchangam", ta: "/ta/panchangam" };

const T = {
  te: {
    crumb: "తెలుగు పంచాంగం",
    h1: (c: string) => `ఈ రోజు పంచాంగం – ${c}`,
    h1Hub: "ఈ రోజు తెలుగు పంచాంగం",
    sec: { limbs: "పంచాంగ వివరాలు", sun: "సూర్యోదయం, సూర్యాస్తమయం, చంద్రుడు", times: "శుభ, అశుభ సమయాలు", hora: "హోరలు", read: "ఈ పంచాంగం ఎలా చదవాలి", others: "ఇతర నగరాల పంచాంగం", dayHora: "పగటి హోరలు", nightHora: "రాత్రి హోరలు" },
    local: (c: string, tz: string) => `అన్ని సమయాలు ${c} స్థానిక సమయం (${tz}) లో, డేలైట్ సేవింగ్‌తో సహా ఇవ్వబడ్డాయి. భారత కాలమానం (IST)లో ముద్రించిన పంచాంగం ${c}కు సరైన సమయాలు ఇవ్వదు.`,
    read: "పంచాంగ దినం సూర్యోదయంతో మొదలవుతుంది. అందుకే మొదట ఇచ్చిన తిథి, నక్షత్రం, యోగం, కరణం సూర్యోదయ సమయానికి ఉన్నవి; రోజులో మారితే తదుపరిది ముగింపు సమయంతో ఇవ్వబడింది. అర్ధరాత్రి తర్వాతి సమయాలకు తేదీ కూడా ఇవ్వబడింది. రాహుకాలం, యమగండం, గుళిక కాలం సూర్యోదయం నుండి సూర్యాస్తమయం వరకు ఉన్న సమయాన్ని ఎనిమిది సమాన భాగాలుగా విభజించి లెక్కిస్తారు, కాబట్టి ఇవి ప్రతి రోజు, ప్రతి నగరంలో మారుతాయి. దుర్ముహూర్తం పగటి సమయంలోని 15 ముహూర్తాల ఆధారంగా, వర్జ్యం మరియు అమృత కాలం నక్షత్ర సమయం ఆధారంగా లెక్కించబడ్డాయి.",
    method: "Swiss Ephemeris ఆధారంగా నగరం యొక్క ఖచ్చిత అక్షాంశ, రేఖాంశాలకు లెక్కించబడింది: లాహిరి అయనాంశం; సూర్యోదయం సూర్యుని పై అంచు ఆధారంగా; పంచాంగ దినం సూర్యోదయం నుండి మరుసటి సూర్యోదయం వరకు. సమయాలు నిమిషానికి సరిదిద్దబడ్డాయి; ఇతర పంచాంగాలతో ఒక నిమిషం తేడా ఉండవచ్చు. పండుగలు ఇక్కడ ఇవ్వలేదు.",
  },
  ta: {
    crumb: "தமிழ் பஞ்சாங்கம்",
    h1: (c: string) => `இன்றைய பஞ்சாங்கம் – ${c}`,
    h1Hub: "இன்றைய தமிழ் பஞ்சாங்கம்",
    sec: { limbs: "பஞ்சாங்க விவரங்கள்", sun: "சூரிய உதயம், அஸ்தமனம், சந்திரன்", times: "நல்ல மற்றும் தவிர்க்க வேண்டிய நேரங்கள்", hora: "ஹோரைகள்", read: "இந்த பஞ்சாங்கத்தை எப்படிப் படிப்பது", others: "பிற நகரங்களின் பஞ்சாங்கம்", dayHora: "பகல் ஹோரைகள்", nightHora: "இரவு ஹோரைகள்" },
    local: (c: string, tz: string) => `அனைத்து நேரங்களும் ${c} உள்ளூர் நேரத்தில் (${tz}), பகல் சேமிப்பு நேரம் உட்பட, தரப்பட்டுள்ளன. இந்திய நேரத்தில் (IST) அச்சிடப்பட்ட பஞ்சாங்கம் ${c}க்குச் சரியான நேரங்களைத் தராது.`,
    read: "பஞ்சாங்க நாள் சூரிய உதயத்துடன் தொடங்குகிறது. எனவே முதலில் தரப்பட்ட திதி, நட்சத்திரம், யோகம், கரணம் ஆகியவை சூரிய உதய நேரத்தில் உள்ளவை; நாளின் நடுவில் மாறினால் அடுத்தது முடிவு நேரத்துடன் தரப்பட்டுள்ளது. நள்ளிரவுக்குப் பிந்தைய நேரங்களுடன் தேதியும் தரப்பட்டுள்ளது. ராகு காலம், எமகண்டம், குளிகை ஆகியவை சூரிய உதயம் முதல் அஸ்தமனம் வரையிலான நேரத்தை எட்டு சம பாகங்களாகப் பிரித்துக் கணக்கிடப்படுகின்றன; எனவே அவை ஒவ்வொரு நாளும் ஒவ்வொரு நகரத்திலும் மாறும். தமிழ் தேதி சூரியன் ராசி மாறும் நேரத்தைக் கொண்டு கணக்கிடப்படுகிறது: சங்கராந்தி சூரிய அஸ்தமனத்திற்கு முன் நிகழ்ந்தால் அன்றே மாதத்தின் முதல் நாள்.",
    method: "Swiss Ephemeris மூலம் நகரத்தின் துல்லியமான அட்ச, தீர்க்க ரேகைகளுக்குக் கணக்கிடப்பட்டது: லாஹிரி அயனாம்சம்; சூரிய உதயம் சூரியனின் மேல் விளிம்பு அடிப்படையில்; பஞ்சாங்க நாள் சூரிய உதயம் முதல் அடுத்த சூரிய உதயம் வரை. நேரங்கள் நிமிடத்திற்குச் சரிசெய்யப்பட்டவை; பிற பஞ்சாங்கங்களுடன் ஒரு நிமிட வேறுபாடு இருக்கலாம். நல்ல நேரம் மற்றும் கௌரி பஞ்சாங்கம் இங்கு இல்லை.",
  },
};

export function regionalCity(lang: South, slug: string): City | undefined {
  return REGIONAL_CITIES[lang].includes(slug) ? cityBySlug(slug) : undefined;
}

export default function RegionalPanchang({ lang, city, hub = false }: { lang: South; city: City; hub?: boolean }) {
  const t = T[lang];
  const name = CITY_NAME[lang][city.slug] ?? city.name;
  const date = cityToday(city);
  const p = cityPanchang(city, date);
  const now = Date.now();
  const t0 = p.tithi[0], n0 = p.nakshatra[0];
  const year = tr(lang, "samvatsara", lang === "ta" ? tamilYearName(p) : p.samvatsara);
  const ta = lang === "ta";
  const until = (iso: string | null) => (iso ? ` ${fmtTime(iso, date, lang)} ${ta ? "வரை" : "వరకు"}` : "");

  return (
    <ContentShell
      lang={lang}
      switchTo={{ href: `/panchang/${city.slug}`, label: "English" }}
      crumbs={hub ? [{ name: t.crumb, path: BASE[lang] }] : [{ name: t.crumb, path: BASE[lang] }, { name, path: `${BASE[lang]}/${city.slug}` }]}
      footerNote={t.method}
    >
      <h1 className="seo-article-title">{hub ? t.h1Hub : t.h1(name)}</h1>
      <StaleGuard date={date} timezone={city.timezone} />
      <p className="tool-kicker">
        {fmtDateLong(date, lang)}
        {ta
          ? ` · ${tr("ta", "tamilMonth", p.tamilDate.month)} ${p.tamilDate.day} · ${year} ஆண்டு`
          : ` · ${year} నామ సంవత్సరం · ${tr("te", "month", p.lunarMonth.amanta)} మాసం`}
        {hub ? ` · ${name}` : ""}
      </p>
      <p className="tool-lead">
        {ta ? (
          <>
            இன்று {name}இல் சூரிய உதயத்தின்போது திதி <strong>{trTithi("ta", t0.name)}</strong>{until(t0.end)}, நட்சத்திரம்{" "}
            <strong>{tr("ta", "nakshatra", n0.name)}</strong>{until(n0.end)}. சூரிய உதயம் {fmtTime(p.sunrise, date, "ta")}, ராகு காலம்{" "}
            {fmtRange(p.rahuKalam, date, "ta")}, எமகண்டம் {fmtRange(p.yamaganda, date, "ta")}.
          </>
        ) : (
          <>
            ఈ రోజు {name}లో సూర్యోదయ సమయానికి తిథి <strong>{trTithi("te", t0.name)}</strong>{until(t0.end)}, నక్షత్రం{" "}
            <strong>{tr("te", "nakshatra", n0.name)}</strong>{until(n0.end)}. సూర్యోదయం {fmtTime(p.sunrise, date, "te")}, రాహుకాలం{" "}
            {fmtRange(p.rahuKalam, date, "te")}
            {p.durMuhurtham.length > 0 && <>, దుర్ముహూర్తం {p.durMuhurtham.map((d) => fmtRange(d, date, "te")).join(", ")}</>}.
          </>
        )}
      </p>
      <section className="seo-content">
        <h2>{t.sec.limbs}</h2>
        <PanchangCore p={p} lang={lang} />
        <h2>{t.sec.sun}</h2>
        <SunMoon p={p} lang={lang} />
        {city.countryCode !== "IN" && <p className="tool-note">{t.local(name, p.timezone)}</p>}
        <h2>{t.sec.times}</h2>
        <Muhurtas t={p} nowMs={now} lang={lang} />
        <h2>{t.sec.hora}</h2>
        <HoraTable slots={p.hora.day} base={date} nowMs={now} label={t.sec.dayHora} lang={lang} />
        <HoraTable slots={p.hora.night} base={date} nowMs={now} label={t.sec.nightHora} lang={lang} />
        <h2>{t.sec.read}</h2>
        <p>{t.read}</p>
        <h2>{t.sec.others}</h2>
        <ul className="pc-city-links">
          {REGIONAL_CITIES[lang].filter((s) => s !== city.slug || hub).map((s) => (
            <li key={s}><Link href={`${BASE[lang]}/${s}`}>{CITY_NAME[lang][s]}</Link></li>
          ))}
        </ul>
        <p>
          {lang === "te" ? <Link href="/ta/panchangam">தமிழ் பஞ்சாங்கம்</Link> : <Link href="/te/panchangam">తెలుగు పంచాంగం</Link>} ·{" "}
          <Link href={`/${lang}/calendar/${date.slice(0, 4)}/${Number(date.slice(5, 7))}`}>{lang === "te" ? "తెలుగు క్యాలెండర్" : "தமிழ் காலண்டர்"} {date.slice(0, 4)}</Link> ·{" "}
          <Link href={`/panchang/${city.slug}`}>Panchang in English (any date or place)</Link> · <Link href="/hi/panchang">हिन्दी पंचांग</Link>
        </p>
      </section>
    </ContentShell>
  );
}
