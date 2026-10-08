import type { Metadata } from "next";
import Link from "next/link";
import ToolPage from "@/src/components/site/ToolPage";
import ToolCalculator from "@/src/components/tools/ToolCalculator";
import { toolBySlug } from "@/src/lib/tools";
import { RASHIS } from "@/src/lib/jyotish-data";
import { sadeSatiReport, saturnSignSpans, todayJd, jdToIsoDate } from "@/src/services/transits";

const SLUG = "sade-sati-calculator";
const tool = toolBySlug(SLUG);

export const revalidate = 86400;

// oxlint-disable-next-line react/only-export-components -- App Router metadata belongs with the route.
export const metadata: Metadata = {
  title: { absolute: tool.title },
  description: tool.description,
  alternates: { canonical: `/${SLUG}` },
  openGraph: { title: tool.title, description: tool.description, url: `/${SLUG}`, type: "website" },
};

const TZ = "Asia/Kolkata";

function fmt(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

const PHASE: Record<string, string> = {
  rising: "Sade Sati — rising phase",
  peak: "Sade Sati — peak phase",
  setting: "Sade Sati — setting phase",
  kantaka: "Kantaka Shani (Dhaiya)",
  ashtama: "Ashtama Shani (Dhaiya)",
};

export default function Page() {
  const now = todayJd();
  const today = jdToIsoDate(now, TZ);

  const byRashi = RASHIS.map((r) => {
    const rep = sadeSatiReport(r.start + 15, now - 365.25 * 10, now + 365.25 * 35, TZ);
    const running = rep.cycles.find((c) => c.start <= today && today <= c.end);
    const next = rep.cycles.find((c) => c.start > today);
    return { r, rep, running, next };
  });

  const ingresses = saturnSignSpans(now - 365.25 * 2, now + 365.25 * 8).slice(1);
  const currentSign = byRashi[0].rep.transitSaturnSign;
  const PHASE_ORDER = ["setting", "peak", "rising"];
  const inSadeSati = byRashi
    .filter((x) => x.rep.current && PHASE_ORDER.includes(x.rep.current))
    .sort((a, b) => PHASE_ORDER.indexOf(a.rep.current!) - PHASE_ORDER.indexOf(b.rep.current!))
    .map((x) => `${x.r.sanskrit} (${x.rep.current} phase)`);
  const inDhaiya = byRashi.filter((x) => x.rep.current === "kantaka" || x.rep.current === "ashtama").map((x) => `${x.r.sanskrit} (${x.r.english})`);

  return (
    <ToolPage
      slug={SLUG}
      h1="Sade Sati Calculator: Check Shani Sade Sati and Dhaiya Dates"
      updated="8 October 2026"
      lead={
        <p>
          Sade Sati is the roughly seven-and-a-half-year period when transiting Saturn passes through the sign before
          your Moon sign, your Moon sign itself, and the sign after it. Saturn is in sidereal <strong>{currentSign}</strong>{" "}
          today, so Sade Sati is running for <strong>{inSadeSati.join(", ")}</strong> Moon signs. Enter your birth details
          for your own dates.
        </p>
      }
      calculator={<ToolCalculator tool="sadesati" allowUnknownTime submitLabel="Check my Sade Sati" />}
      faqs={[
        {
          q: "Is Sade Sati based on my Moon sign or Sun sign?",
          a: "Your Moon sign (janma rashi). Sade Sati is measured from the sign the Moon occupied at birth, so two people born on the same day can have different Sade Sati dates if the Moon changed sign that day.",
        },
        {
          q: "How long does Sade Sati last and how often does it come?",
          a: "About 7.5 years, in three phases of roughly 2.5 years each. Saturn takes about 29.5 years to circle the zodiac, so Sade Sati returns about every 30 years — two or three times in a typical lifetime.",
        },
        {
          q: "Why are there several rows for the same phase?",
          a: "Saturn regularly appears to move backwards (retrograde). When this takes it back across a sign boundary, it leaves and re-enters a sign, so one phase can appear as two or three separate periods.",
        },
        {
          q: "What is Shani Dhaiya?",
          a: "A shorter, roughly two-and-a-half-year period when Saturn transits the 4th sign (Kantaka Shani) or the 8th sign (Ashtama Shani) from your Moon sign. The calculator lists these too.",
        },
        {
          q: "Can I check Sade Sati without a birth time?",
          a: "Yes in most cases, because only the Moon sign is needed and the Moon spends about 2.5 days in each sign. If the Moon changed sign on your birth date, the calculator warns you and you should enter your birth time.",
        },
      ]}
    >
      <h2>Sade Sati status for every Moon sign today</h2>
      <p>
        Calculated from Saturn&apos;s actual sidereal (Lahiri) position, with dates in Indian Standard Time. Updated
        daily.
      </p>
      <div className="tool-table-scroll">
        <table className="tool-table tool-table-wide">
          <thead>
            <tr><th>Moon sign</th><th>Status today</th><th>Current or next Sade Sati</th></tr>
          </thead>
          <tbody>
            {byRashi.map(({ r, rep, running, next }) => (
              <tr key={r.english} className={running ? "current" : undefined}>
                <td>{r.sanskrit} ({r.english})</td>
                <td>{rep.current ? PHASE[rep.current] : "No Sade Sati or Dhaiya"}</td>
                <td>
                  {running
                    ? `${fmt(running.start)} – ${fmt(running.end)}`
                    : next
                      ? `${fmt(next.start)} – ${fmt(next.end)}`
                      : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {inDhaiya.length > 0 && <p>Shani Dhaiya is currently running for {inDhaiya.join(" and ")} Moon signs.</p>}

      <h2>Saturn&apos;s sign changes</h2>
      <div className="tool-table-scroll">
        <table className="tool-table">
          <thead>
            <tr><th>Saturn enters</th><th>Date (IST)</th></tr>
          </thead>
          <tbody>
            {ingresses.map((s) => (
              <tr key={s.startJd}>
                <td>{RASHIS[s.sign].sanskrit} ({RASHIS[s.sign].english})</td>
                <td>{fmt(jdToIsoDate(s.startJd, TZ))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        Every Sade Sati begins and ends on one of these dates. Dates where Saturn re-enters a sign it has just left are
        caused by retrograde motion.
      </p>

      <h2>How the calculator works</h2>
      <p>
        It finds your Moon sign from your birth details, then steps through Saturn&apos;s sidereal positions from your
        birth for 100 years, locating each sign change to within about a minute. Periods when Saturn is in the 12th, 1st
        or 2nd sign from your Moon are grouped into Sade Sati cycles; the 4th and 8th give Dhaiya. Not sure of your Moon
        sign? Use the <Link href="/rashi-calculator">rashi calculator</Link>. Traditional Saturn remedies are on the{" "}
        <Link href="/remedies/shani-mantra">Shani mantra</Link> page.
      </p>
    </ToolPage>
  );
}
