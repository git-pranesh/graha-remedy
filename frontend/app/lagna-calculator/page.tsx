import type { Metadata } from "next";
import Link from "next/link";
import ToolPage from "@/src/components/site/ToolPage";
import ToolCalculator from "@/src/components/tools/ToolCalculator";
import { toolBySlug } from "@/src/lib/tools";
import { RASHIS, dms, rashiByEnglish } from "@/src/lib/jyotish-data";
import { EXAMPLE_BIRTH, exampleReport } from "@/src/lib/examples";

const SLUG = "lagna-calculator";
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
  const asc = ex.ascendant!;
  const r = rashiByEnglish(asc.sign)!;

  return (
    <ToolPage
      slug={SLUG}
      h1="Lagna Calculator: Your Vedic Ascendant and Lagna Chart"
      updated="8 October 2026"
      lead={
        <p>
          Your Lagna (ascendant) is the sidereal zodiac sign rising on the eastern horizon at the moment and place of
          your birth. It becomes the first house of your birth chart. Enter your exact birth time and place to calculate
          it.
        </p>
      }
      calculator={<ToolCalculator tool="lagna" submitLabel="Calculate my Lagna" />}
      faqs={[
        {
          q: "Why does the Lagna need an exact birth time?",
          a: "The whole zodiac rises over the horizon in about 24 hours, so a new sign rises roughly every two hours. Near the start or end of a sign, a difference of a few minutes can change your Lagna.",
        },
        {
          q: "Is the Lagna the same as the rising sign in Western astrology?",
          a: "It is the same astronomical point, but Vedic astrology measures it in the sidereal zodiac. Your Vedic Lagna is therefore usually one sign earlier than your Western rising sign.",
        },
        {
          q: "What is the Lagna lord?",
          a: "The planet that rules your ascendant sign. For example, Mars rules Mesha and Vrishchika lagna and Saturn rules Makara and Kumbha lagna. Its strength and placement are read as central to the whole chart.",
        },
        {
          q: "Which house system does this calculator use?",
          a: "Whole-sign houses, the traditional Vedic method: the entire Lagna sign is the 1st house, the next sign is the 2nd, and so on. Bhava chalit charts that split houses by degree can place a planet near a sign boundary in a different house.",
        },
      ]}
    >
      <h2>How the Lagna is calculated</h2>
      <p>
        The calculator converts your local birth time to Universal Time (applying the time zone and daylight-saving
        rules in force on that date), finds the ecliptic degree rising on the eastern horizon at your birth
        latitude and longitude, and subtracts the Lahiri ayanamsa to convert it to the sidereal zodiac. The sign
        containing that degree is your Lagna; each following sign becomes the next house.
      </p>
      <p>
        Signs do not all rise in the same time: depending on latitude, some signs take well under two hours to rise and
        others well over two. That is why the place of birth matters as much as the time.
      </p>

      <h2>Worked example</h2>
      <p>
        For {EXAMPLE_BIRTH.label}, the rising degree is {dms(asc.longitude, true)} of sidereal {asc.sign}, so the Lagna is{" "}
        <strong>{r.sanskrit} ({r.english})</strong> with {r.lord} as Lagna lord. The ascendant degree falls in{" "}
        {asc.nakshatra} nakshatra, pada {asc.pada}. In this chart the Moon is in {ex.moon.sign}, house{" "}
        {ex.planets.find((p) => p.planet === "Moon")!.house} from the Lagna.
      </p>

      <h2>The 12 Lagnas and their lords</h2>
      <div className="tool-table-scroll">
        <table className="tool-table tool-table-wide">
          <thead>
            <tr><th>Lagna</th><th>Sign</th><th>Lagna lord</th><th>7th house (partnership) sign</th></tr>
          </thead>
          <tbody>
            {RASHIS.map((x) => (
              <tr key={x.english}>
                <td>{x.sanskrit} Lagna</td>
                <td>{x.english}</td>
                <td>{x.lord}</td>
                <td>{RASHIS[(x.index + 6) % 12].english}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        Your Lagna also decides which planets act as functional benefics or malefics for you, which our{" "}
        <Link href="/">remedy finder</Link> uses when it chooses remedies. To check Mars placement from your Lagna, use the{" "}
        <Link href="/manglik-dosha-calculator">Manglik dosha calculator</Link>.
      </p>
    </ToolPage>
  );
}
