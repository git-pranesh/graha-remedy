import type { Metadata } from "next";
import Link from "next/link";
import ToolPage from "@/src/components/site/ToolPage";
import ToolCalculator from "@/src/components/tools/ToolCalculator";
import { toolBySlug } from "@/src/lib/tools";
import { NAKSHATRAS, NAKSHATRA_SPAN, dms, ordinal } from "@/src/lib/jyotish-data";
import { EXAMPLE_BIRTH, exampleReport, zodiacRange } from "@/src/lib/examples";

const SLUG = "nakshatra-calculator";
const tool = toolBySlug(SLUG);

export const revalidate = 86400;

// oxlint-disable-next-line react/only-export-components -- App Router metadata belongs with the route.
export const metadata: Metadata = {
  title: { absolute: tool.title },
  description: tool.description,
  alternates: { canonical: `/${SLUG}` },
  openGraph: { title: tool.title, description: tool.description, url: `/${SLUG}`, type: "website" },
};

export default async function Page() {
  const ex = await exampleReport();
  const exNak = NAKSHATRAS.find((n) => n.name === ex.moon.nakshatra)!;
  const exInto = ex.moon.longitude - exNak.start;

  return (
    <ToolPage
      slug={SLUG}
      h1="Nakshatra Calculator: Find Your Birth Star and Pada"
      updated="8 October 2026"
      lead={
        <p>
          Your birth nakshatra (Janma Nakshatra) is the lunar mansion the Moon occupied when you were born. Enter your
          date, time and place of birth to get your nakshatra, its pada (quarter), lord, deity and Nadi.
        </p>
      }
      calculator={<ToolCalculator tool="nakshatra" allowUnknownTime submitLabel="Find my nakshatra" />}
      faqs={[
        {
          q: "Can I find my nakshatra without my birth time?",
          a: "Often, yes. The Moon spends about one day in each nakshatra. Tick “I don't know my birth time” and the calculator checks the Moon at the start and end of your birth date: if it stayed in one nakshatra all day, the result is certain; if not, it shows both possibilities.",
        },
        {
          q: "What is a nakshatra pada?",
          a: "Each nakshatra spans 13°20′ of the zodiac and is divided into four padas (quarters) of 3°20′ each. The 27 nakshatras therefore contain 108 padas, nine in each zodiac sign.",
        },
        {
          q: "Why does another website show a different nakshatra?",
          a: "Differences almost always come from the ayanamsa (we use Lahiri, the Indian government standard), the time zone or daylight saving applied to the birth time, or a birth time close to the boundary between two nakshatras.",
        },
        {
          q: "Is the nakshatra the same as the rashi?",
          a: "No. The rashi (Moon sign) is the 30° sign the Moon occupies; the nakshatra is the smaller 13°20′ lunar mansion within it. Each rashi contains two and a quarter nakshatras.",
        },
        {
          q: "How is the nakshatra used in Vedic astrology?",
          a: "The Moon's nakshatra fixes the starting point of the Vimshottari dasha system, is one of the main factors in Ashtakoota marriage matching (through Nadi, Gana and Yoni), and is used to choose auspicious times (Tarabala).",
        },
      ]}
    >
      <h2>How your nakshatra is calculated</h2>
      <p>
        The zodiac is divided into 27 equal nakshatras of 13°20′ ({NAKSHATRA_SPAN.toFixed(4)}°) each, starting with
        Ashwini at 0° sidereal Aries. The calculator converts your local birth time to Universal Time using the time zone
        rules in force on your birth date, computes the Moon&apos;s sidereal longitude with the Lahiri ayanamsa, and
        divides it by 13°20′. The whole-number part gives the nakshatra; the remainder divided by 3°20′ gives the pada.
      </p>
      <p>
        Because the Moon moves about 13° a day, it changes nakshatra roughly once every 24 hours. A birth time that is off
        by an hour can therefore change the result if the Moon was near a boundary.
      </p>

      <h2>Worked example</h2>
      <p>
        For a birth on {EXAMPLE_BIRTH.label} (IST, UTC+5:30), the Moon&apos;s sidereal longitude is{" "}
        <strong>{dms(ex.moon.longitude)}</strong> ({dms(ex.moon.longitude, true)} {ex.moon.sign}). Dividing by 13°20′
        places it {dms(exInto)} into the {ordinal(exNak.index + 1)} nakshatra, <strong>{ex.moon.nakshatra}</strong>, which is{" "}
        <strong>pada {ex.moon.pada}</strong>. {ex.moon.nakshatra} is ruled by {exNak.lord}, so this person&apos;s first
        Vimshottari mahadasha is that of {exNak.lord}.
      </p>

      <h2>All 27 nakshatras</h2>
      <div className="tool-table-scroll">
        <table className="tool-table tool-table-wide">
          <thead>
            <tr>
              <th>#</th>
              <th>Nakshatra</th>
              <th>Zodiac range (sidereal)</th>
              <th>Lord</th>
              <th>Deity</th>
              <th>Nadi</th>
            </tr>
          </thead>
          <tbody>
            {NAKSHATRAS.map((n) => (
              <tr key={n.name}>
                <td>{n.index + 1}</td>
                <td>{n.name}</td>
                <td>{zodiacRange(n.start, NAKSHATRA_SPAN)}</td>
                <td>{n.lord}</td>
                <td>{n.deity}</td>
                <td>{n.nadi}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        The nakshatra lords repeat in the fixed Vimshottari order — Ketu, Venus, Sun, Moon, Mars, Rahu, Jupiter, Saturn,
        Mercury — three times around the zodiac. See the <Link href="/mahadasha-calculator">mahadasha calculator</Link>{" "}
        for how this sets your dasha periods, or the <Link href="/rashi-calculator">rashi calculator</Link> for your Moon
        sign.
      </p>
    </ToolPage>
  );
}
