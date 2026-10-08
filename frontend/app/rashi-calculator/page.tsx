import type { Metadata } from "next";
import Link from "next/link";
import ToolPage from "@/src/components/site/ToolPage";
import ToolCalculator from "@/src/components/tools/ToolCalculator";
import { toolBySlug } from "@/src/lib/tools";
import { RASHIS, dms, rashiByEnglish } from "@/src/lib/jyotish-data";
import { EXAMPLE_BIRTH, exampleReport, nakshatrasInRashi } from "@/src/lib/examples";

const SLUG = "rashi-calculator";
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
  const exR = rashiByEnglish(ex.moon.sign)!;
  const exSun = ex.planets.find((p) => p.planet === "Sun")!;

  return (
    <ToolPage
      slug={SLUG}
      h1="Rashi Calculator: Find Your Moon Sign (Janma Rashi)"
      updated="8 October 2026"
      lead={
        <p>
          In Vedic astrology your rashi is the sidereal zodiac sign the Moon occupied at your birth. Enter your date and
          place of birth — the birth time is optional, because the Moon stays in one sign for about two and a half days.
        </p>
      }
      calculator={<ToolCalculator tool="rashi" allowUnknownTime submitLabel="Find my rashi" />}
      faqs={[
        {
          q: "Can I find my rashi by date of birth only?",
          a: "Usually yes. The Moon spends about 2.5 days in each sign, so on most dates it stays in one rashi all day. If it changed sign on your birth date, the calculator tells you both possible rashis and asks for your birth time to decide.",
        },
        {
          q: "Why is my Vedic rashi different from my zodiac sign?",
          a: "Western “star signs” use the Sun in the tropical zodiac. Vedic astrology uses the Moon in the sidereal zodiac, which is currently about 24° behind the tropical one. Both the planet and the zodiac are different, so the signs usually differ.",
        },
        {
          q: "What is the difference between rashi by birth and rashi by name?",
          a: "Rashi by name (nama rashi) is assigned from the first syllable of a person's name. Janma rashi, which this calculator gives, is computed from the Moon's actual position at birth and is the one used for horoscopes, Sade Sati and matching.",
        },
        {
          q: "Which rashi is used for Sade Sati and daily horoscopes?",
          a: "Your Moon sign (janma rashi). Sade Sati, Shani Dhaiya and most Indian rashifal predictions are read from the Moon sign, not the Sun sign or the ascendant.",
        },
      ]}
    >
      <h2>How your rashi is calculated</h2>
      <p>
        The calculator converts your birth time to Universal Time using the time zone rules on your birth date, computes
        the Moon&apos;s longitude in the sidereal zodiac (Lahiri ayanamsa), and takes the 30° sign it falls in. Sidereal
        Aries (Mesha) begins at 0°, Taurus (Vrishabha) at 30°, and so on.
      </p>

      <h2>Worked example</h2>
      <p>
        For {EXAMPLE_BIRTH.label}, the Moon is at {dms(ex.moon.longitude, true)} in sidereal {ex.moon.sign}, so the janma
        rashi is <strong>{exR.sanskrit} ({exR.english})</strong>, ruled by {exR.lord}. The same person&apos;s Sun is in
        sidereal {exSun.sign} — a reminder that the Moon sign and Sun sign are different things.
      </p>

      <h2>The 12 rashis</h2>
      <div className="tool-table-scroll">
        <table className="tool-table tool-table-wide">
          <thead>
            <tr>
              <th>Rashi</th>
              <th>Hindi</th>
              <th>Sign</th>
              <th>Sidereal range</th>
              <th>Lord</th>
              <th>Nakshatra padas</th>
            </tr>
          </thead>
          <tbody>
            {RASHIS.map((r) => (
              <tr key={r.english}>
                <td>{r.sanskrit}</td>
                <td lang="hi">{r.hindi}</td>
                <td>{r.english}</td>
                <td>{r.start}°–{r.start + 30}°</td>
                <td>{r.lord}</td>
                <td>{nakshatrasInRashi(r.index)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        Each rashi holds nine nakshatra padas. Find your exact nakshatra and pada with the{" "}
        <Link href="/nakshatra-calculator">nakshatra calculator</Link>, or check whether Saturn is currently transiting
        near your Moon sign with the <Link href="/sade-sati-calculator">Sade Sati calculator</Link>.
      </p>
    </ToolPage>
  );
}
