import Link from "next/link";
import ContentShell from "../site/ContentShell";
import EventTable from "./EventTable";
import StaleGuard from "../panchang/StaleGuard";
import { calendarEvents, type EventKind } from "../../services/calendar";
import { CAL_KINDS, CAL_YEARS, DELHI } from "../../lib/calendar-pages";
import { fmtDateLong, fmtTime } from "../../lib/panchang-format";
import { todayInTimezone } from "../../services/panchang";
import { tr } from "../../lib/hi";

export const HI_KIND: Record<EventKind, { label: string; hubTitle: string; intro: string }> = {
  ekadashi: {
    label: "एकादशी",
    hubTitle: "एकादशी कब है? अगली एकादशी की तारीख और तिथि का समय",
    intro: "एकादशी हर चंद्र पक्ष की 11वीं तिथि है, इसलिए यह महीने में लगभग दो बार आती है। विष्णु भक्त इस दिन व्रत रखते हैं और अगले दिन सूर्योदय के बाद पारण करते हैं।",
  },
  amavasya: {
    label: "अमावस्या",
    hubTitle: "अमावस्या कब है? अगली अमावस्या की तारीख और तिथि का समय",
    intro: "अमावस्या अमावस की तिथि है, चंद्र मास की 30वीं तिथि। इस दिन पितृ तर्पण और श्राद्ध किए जाते हैं; सोमवार को पड़ने वाली अमावस्या सोमवती और शनिवार को पड़ने वाली शनि अमावस्या कहलाती है।",
  },
  purnima: {
    label: "पूर्णिमा",
    hubTitle: "पूर्णिमा कब है? अगली पूर्णिमा की तारीख और तिथि का समय",
    intro: "पूर्णिमा शुक्ल पक्ष की 15वीं तिथि है। पूर्णिमा व्रत और सत्यनारायण पूजा उस दिन की जाती है जब तिथि अपराह्न में रहती है; पवित्र स्नान-दान उस दिन जब तिथि सूर्योदय के समय हो।",
  },
};

function Rules({ kind }: { kind: EventKind }) {
  if (kind === "ekadashi")
    return (
      <>
        <h2>एकादशी व्रत की तारीख कैसे तय होती है</h2>
        <p>
          व्रत उस दिन रखा जाता है जिसका सूर्योदय एकादशी तिथि में पड़ता है। जब एकादशी दो सूर्योदयों को छूती है, तो स्मार्त पहले दिन और वैष्णव (तथा गौण एकादशी मानने वाले) दूसरे दिन व्रत रखते हैं —
          सिवाय उस स्थिति के जब दशमी पहले सूर्योदय से पहले की अंतिम पाँच घटियों (लगभग दो घंटे) में फैली हो; तब सभी दूसरे दिन व्रत रखते हैं। जब एकादशी किसी सूर्योदय को नहीं छूती, तो व्रत उसी दिन होता है जिस दिन तिथि शुरू होती है।
          इसीलिए व्रत कभी-कभी उस तारीख पर नहीं पड़ता जिसकी आप अपेक्षा करते हैं।
        </p>
      </>
    );
  return (
    <>
      <h2>कभी-कभी दो तारीखें क्यों दिखती हैं</h2>
      <p>
        तिथि शायद ही कभी कैलेंडर के दिन से मेल खाती है। {kind === "amavasya" ? "दर्श अमावस्या (श्राद्ध, तर्पण)" : "पूर्णिमा व्रत (और सत्यनारायण पूजा)"} उस दिन की जाती है जब तिथि अपराह्न में रहती है,
        जबकि स्नान-दान उस दिन जब तिथि सूर्योदय के समय हो। जब ये दोनों अलग-अलग दिन पड़ें, तो दोनों तारीखें दी गई हैं।
      </p>
    </>
  );
}

const NOTE = `तारीखें नई दिल्ली के लिए Swiss Ephemeris (लाहिरी अयनांश) से निकाली गई हैं और अधिकांश उत्तर भारतीय पंचांगों में प्रचलित स्मार्त नियमों पर आधारित हैं। 2026–2027 की एकादशी, अमावस्या और पूर्णिमा की तारीखें स्वतंत्र रूप से प्रकाशित पंचांग की तारीखों से मेल खाती हैं; तिथि के समय में एक-दो मिनट का अंतर हो सकता है। दूसरे स्थानों पर तारीख एक दिन भिन्न हो सकती है।`;

export function HiCalendarYear({ kind, year }: { kind: EventKind; year: number }) {
  const m = HI_KIND[kind];
  const events = calendarEvents(year, DELHI, [kind]);
  const today = todayInTimezone(DELHI.timezone);
  return (
    <ContentShell lang="hi" switchTo={{ href: `/${kind}/${year}`, label: "English" }} crumbs={[{ name: m.label, path: `/hi/${kind}` }, { name: String(year), path: `/hi/${kind}/${year}` }]} footerNote={NOTE}>
      <h1 className="seo-article-title">{m.label} {year} की तारीखें</h1>
      <StaleGuard date={today} timezone={DELHI.timezone} />
      <p className="tool-lead">{year} में {events.length} {m.label} तिथियाँ — तिथि के प्रारंभ और समाप्ति के समय सहित (नई दिल्ली, IST)। {m.intro}</p>
      <section className="seo-content">
        <EventTable events={events} today={today} lang="hi" />
        <Rules kind={kind} />
        <p>
          अन्य वर्ष: {CAL_YEARS.filter((y) => y !== year).map((y) => <Link key={y} href={`/hi/${kind}/${y}`}>{m.label} {y}</Link>)} · अन्य:{" "}
          {CAL_KINDS.filter((k) => k !== kind).map((k, i) => <span key={k}>{i > 0 && " · "}<Link href={`/hi/${k}/${year}`}>{HI_KIND[k].label} {year}</Link></span>)} ·{" "}
          <Link href="/hi/panchang">आज का पंचांग</Link> · किसी अन्य शहर के लिए: <Link href={`/${kind}/${year}`}>English page with city lookup</Link>
        </p>
      </section>
    </ContentShell>
  );
}

export function HiCalendarHub({ kind }: { kind: EventKind }) {
  const m = HI_KIND[kind];
  const today = todayInTimezone(DELHI.timezone);
  const y = Number(today.slice(0, 4));
  const upcoming = [...calendarEvents(y, DELHI, [kind]), ...calendarEvents(y + 1, DELHI, [kind])].filter((e) => e.date >= today).slice(0, 6);
  const next = upcoming[0];
  const d = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
  return (
    <ContentShell lang="hi" switchTo={{ href: `/${kind}`, label: "English" }} crumbs={[{ name: m.label, path: `/hi/${kind}` }]} footerNote={NOTE}>
      <h1 className="seo-article-title">{m.hubTitle}</h1>
      <StaleGuard date={today} timezone={DELHI.timezone} />
      {next && (
        <div className="pc-hero">
          <span className="pc-hero-label">अगली {m.label}{next.name ? ` — ${tr("hi", "ekadashi", next.name)}` : ""}</span>
          <span className="pc-hero-time">{fmtDateLong(next.date, "hi")}</span>
          <span className="pc-hero-status">
            तिथि {fmtTime(next.begins, undefined, "hi")} {next.begins.slice(0, 10) !== next.date ? `(${d(next.begins)})` : ""} से {fmtTime(next.ends, undefined, "hi")} {next.ends.slice(0, 10) !== next.date ? `(${d(next.ends)})` : ""} तक, नई दिल्ली
          </span>
          {next.vratDate && next.vratDate !== next.date && (
            <span className="pc-hero-status">
              {kind === "amavasya" ? "दर्श अमावस्या (श्राद्ध)" : "पूर्णिमा व्रत"}: {fmtDateLong(next.vratDate, "hi")} · स्नान-दान: {fmtDateLong(next.date, "hi")}
            </span>
          )}
        </div>
      )}
      <p className="tool-lead">{m.intro}</p>
      <section className="seo-content">
        <h2>आगामी {m.label} की तारीखें</h2>
        <EventTable events={upcoming} lang="hi" />
        <p>पूरी सूची: {CAL_YEARS.map((yy, i) => <span key={yy}>{i > 0 && " · "}<Link href={`/hi/${kind}/${yy}`}>{m.label} {yy}</Link></span>)}</p>
        <Rules kind={kind} />
      </section>
    </ContentShell>
  );
}
