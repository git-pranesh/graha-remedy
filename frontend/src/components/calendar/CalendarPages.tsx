import Link from "next/link";
import ContentShell from "../site/ContentShell";
import EventTable from "./EventTable";
import CityDates from "./CityDates";
import StaleGuard from "../panchang/StaleGuard";
import { calendarEvents, type EventKind } from "../../services/calendar";
import { CAL_KINDS, CAL_YEARS, DELHI, KIND_META } from "../../lib/calendar-pages";
import { fmtDateLong, fmtTime } from "../../lib/panchang-format";
import { todayInTimezone } from "../../services/panchang";

const NOTE =
  "Dates are calculated for New Delhi with the Swiss Ephemeris (Lahiri ayanamsa) and follow the Smarta rules used by most North Indian panchangs. Our 2026–2027 Ekadashi, Amavasya and Purnima dates match independently published panchang dates; tithi times can differ by a minute or two. Dates can differ by a day in other places — use the city lookup.";

function RulesSection({ kind }: { kind: EventKind }) {
  if (kind === "ekadashi")
    return (
      <>
        <h2>How the Ekadashi fasting day is decided</h2>
        <p>
          The fast is kept on the day whose sunrise falls within Ekadashi tithi. When Ekadashi spans two sunrises, Smartas fast on the first
          day and Vaishnavas (and those observing Gauna Ekadashi) on the second — unless Dashami runs into the last five ghatis (about two
          hours) before the first sunrise, in which case everyone fasts on the second day. When Ekadashi touches no sunrise, the fast is kept
          on the day it begins. These rules are why the fast is sometimes not on the calendar date you might expect.
        </p>
      </>
    );
  return (
    <>
      <h2>Why two dates are sometimes shown</h2>
      <p>
        A tithi rarely matches a calendar day. The {kind === "amavasya" ? "Darsha Amavasya (shraddha, tarpan)" : "Purnima vrat (and Satyanarayan puja)"}{" "}
        is kept on the day the tithi prevails in the afternoon, while snan-daan is done on the day it prevails at sunrise. When these fall on
        different days, both are listed.
      </p>
    </>
  );
}

export function CalendarYearPage({ kind, year }: { kind: EventKind; year: number }) {
  const m = KIND_META[kind];
  const events = calendarEvents(year, DELHI, [kind]);
  const today = todayInTimezone(DELHI.timezone);
  const others = CAL_YEARS.filter((y) => y !== year);
  return (
    <ContentShell switchTo={{ href: `/hi/${kind}/${year}`, label: "हिन्दी" }} crumbs={[{ name: m.label, path: `/${kind}` }, { name: String(year), path: `/${kind}/${year}` }]} footerNote={NOTE}>
      <h1 className="seo-article-title">{m.label} {year} Dates ({m.hindi} {year})</h1>
      <StaleGuard date={today} timezone={DELHI.timezone} />
      <p className="tool-lead">
        All {events.length} {m.label} dates in {year} with tithi start and end times (New Delhi, IST). {m.intro}
      </p>
      <section className="seo-content">
        <EventTable events={events} today={today} />
        <h2>{m.label} {year} dates for your city</h2>
        <CityDates kind={kind} year={year} />
        <RulesSection kind={kind} />
        <p>
          Other years: {others.map((y) => <Link key={y} href={`/${kind}/${y}`}>{m.label} {y}</Link>)} · Also:{" "}
          {CAL_KINDS.filter((k) => k !== kind).map((k, i) => (
            <span key={k}>{i > 0 && " · "}<Link href={`/${k}/${year}`}>{KIND_META[k].label} {year}</Link></span>
          ))}{" "}
          · <Link href="/panchang">Today&apos;s panchang</Link>
        </p>
      </section>
    </ContentShell>
  );
}

export function CalendarHub({ kind }: { kind: EventKind }) {
  const m = KIND_META[kind];
  const today = todayInTimezone(DELHI.timezone);
  const y = Number(today.slice(0, 4));
  const all = [...calendarEvents(y, DELHI, [kind]), ...calendarEvents(y + 1, DELHI, [kind])];
  const upcoming = all.filter((e) => e.date >= today).slice(0, 6);
  const next = upcoming[0];
  return (
    <ContentShell switchTo={{ href: `/hi/${kind}`, label: "हिन्दी" }} crumbs={[{ name: m.label, path: `/${kind}` }]} footerNote={NOTE}>
      <h1 className="seo-article-title">Next {m.label}: When Is {m.label}? ({m.hindi} कब है)</h1>
      <StaleGuard date={today} timezone={DELHI.timezone} />
      {next && (
        <div className="pc-hero">
          <span className="pc-hero-label">Next {m.label}{next.name ? ` — ${next.name}` : ""}</span>
          <span className="pc-hero-time">{fmtDateLong(next.date)}</span>
          <span className="pc-hero-status">
            Tithi {fmtTime(next.begins)} {next.begins.slice(0, 10) !== next.date ? `(${next.begins.slice(8, 10)}/${next.begins.slice(5, 7)})` : ""} to{" "}
            {fmtTime(next.ends)} {next.ends.slice(0, 10) !== next.date ? `(${next.ends.slice(8, 10)}/${next.ends.slice(5, 7)})` : ""}, New Delhi
          </span>
          {next.vratDate && next.vratDate !== next.date && (
            <span className="pc-hero-status">
              {kind === "amavasya" ? "Darsha Amavasya (shraddha)" : "Purnima vrat"}: {fmtDateLong(next.vratDate)} · snan-daan: {fmtDateLong(next.date)}
            </span>
          )}
        </div>
      )}
      <p className="tool-lead">{m.intro}</p>
      <section className="seo-content">
        <h2>Upcoming {m.label} dates</h2>
        <EventTable events={upcoming} />
        <p>
          Full lists: {CAL_YEARS.map((yy, i) => <span key={yy}>{i > 0 && " · "}<Link href={`/${kind}/${yy}`}>{m.label} {yy}</Link></span>)}
        </p>
        <RulesSection kind={kind} />
      </section>
    </ContentShell>
  );
}
