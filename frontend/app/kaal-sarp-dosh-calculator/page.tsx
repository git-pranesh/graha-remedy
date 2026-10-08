import type { Metadata } from "next";
import Link from "next/link";
import ToolPage from "@/src/components/site/ToolPage";
import ToolCalculator from "@/src/components/tools/ToolCalculator";
import { toolBySlug } from "@/src/lib/tools";
import { KAAL_SARP_TYPES, ordinal } from "@/src/lib/jyotish-data";
import { EXAMPLE_BIRTH, exampleReport } from "@/src/lib/examples";
import { calculateBirthChart } from "@/src/services/astro-engine";
import { analyzeKaalSarp } from "@/src/services/dosha";

const SLUG = "kaal-sarp-dosh-calculator";
const tool = toolBySlug(SLUG);

export const revalidate = 86400;

// oxlint-disable-next-line react/only-export-components -- App Router metadata belongs with the route.
export const metadata: Metadata = {
  title: { absolute: tool.title },
  description: tool.description,
  alternates: { canonical: `/${SLUG}` },
  openGraph: { title: tool.title, description: tool.description, url: `/${SLUG}`, type: "website" },
};

/** How common is Kaal Sarp? One chart every 37 days (06:00 UTC, Delhi) from 1960 to 2009. */
function prevalence() {
  let n = 0, full = 0, partial = 0;
  for (let t = Date.UTC(1960, 0, 1); t < Date.UTC(2010, 0, 1); t += 37 * 86400000) {
    const d = new Date(t);
    const k = analyzeKaalSarp(calculateBirthChart(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), 6, 28.61, 77.21));
    n++;
    if (k.present) full++;
    if (k.partial) partial++;
  }
  return { n, full: ((100 * full) / n).toFixed(1), partial: ((100 * partial) / n).toFixed(1) };
}

export default async function Page() {
  const ex = await exampleReport();
  const k = ex.kaalSarp;
  const stats = prevalence();

  return (
    <ToolPage
      slug={SLUG}
      h1="Kaal Sarp Dosh Calculator: Check Kaal Sarp Yoga in Your Chart"
      updated="8 October 2026"
      lead={
        <p>
          Kaal Sarp dosh (Kaal Sarp yoga) is said to exist when all seven planets from the Sun to Saturn lie on one side
          of the axis formed by Rahu and Ketu. Enter your birth details to check your chart and see which of the 12 named
          types applies.
        </p>
      }
      calculator={<ToolCalculator tool="kaalsarp" submitLabel="Check Kaal Sarp dosh" />}
      faqs={[
        {
          q: "How is Kaal Sarp dosh calculated?",
          a: "Rahu and Ketu are always exactly opposite each other, splitting the zodiac into two halves. If the Sun, Moon, Mercury, Venus, Mars, Jupiter and Saturn all fall in the same half, the chart has Kaal Sarp. This calculator compares exact longitudes, not just signs.",
        },
        {
          q: "What are the 12 types of Kaal Sarp dosh?",
          a: "They are named by the house Rahu occupies from the Lagna: Anant (1st), Kulik (2nd), Vasuki (3rd), Shankhpal (4th), Padma (5th), Mahapadma (6th), Takshak (7th), Karkotak (8th), Shankhachud (9th), Ghatak (10th), Vishdhar (11th) and Sheshnag (12th).",
        },
        {
          q: "How common is Kaal Sarp dosh?",
          a: `In a sample of ${stats.n} charts from 1960–2009, our engine found full Kaal Sarp in ${stats.full}% of charts. Another ${stats.partial}% had exactly one planet outside the axis, which some astrologers call partial Kaal Sarp.`,
        },
        {
          q: "Is Kaal Sarp dosh mentioned in classical texts?",
          a: "Kaal Sarp yoga is not described in Brihat Parashara Hora Shastra or the other principal classical texts. It became widespread in twentieth-century Indian astrology, and astrologers disagree about its effects.",
        },
        {
          q: "Do I need my birth time?",
          a: "Yes. Rahu, Ketu and the slow planets barely move in a day, but the Moon moves about 13° and can cross the Rahu–Ketu axis, which decides the result. The named type also depends on Rahu's house from the Lagna, which changes every two hours or so.",
        },
      ]}
    >
      <h2>The 12 named types</h2>
      <div className="tool-table-scroll">
        <table className="tool-table">
          <thead>
            <tr><th>Rahu in house</th><th>Kaal Sarp type</th></tr>
          </thead>
          <tbody>
            {KAAL_SARP_TYPES.map((name, i) => (
              <tr key={name}>
                <td>{ordinal(i + 1)}</td>
                <td>{name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Worked example</h2>
      <p>
        For {EXAMPLE_BIRTH.label}, Rahu is in {k.rahuSign} (house {k.rahuHouse} from the Lagna) and Ketu in {k.ketuSign}.{" "}
        {k.present
          ? `All seven planets lie on one side of the axis, so the chart has ${k.name} Kaal Sarp.`
          : `${k.outside.join(", ")} ${k.outside.length === 1 ? "lies" : "lie"} on the other side of the axis from the remaining planets, so this chart does not have Kaal Sarp dosh.`}
      </p>

      <h2>How common it is</h2>
      <div className="tool-table-scroll">
        <table className="tool-table">
          <tbody>
            <tr><th>Charts sampled (1960–2009)</th><td>{stats.n}</td></tr>
            <tr><th>Full Kaal Sarp</th><td>{stats.full}%</td></tr>
            <tr><th>One planet outside (&ldquo;partial&rdquo;)</th><td>{stats.partial}%</td></tr>
          </tbody>
        </table>
      </div>
      <p>
        Because Rahu and Ketu move slowly, Kaal Sarp charts come in runs: when the slow planets cluster on one side of the
        axis, everyone born over days or weeks shares the yoga, differing only in whether the Moon is inside. Traditional
        remedies are on the <Link href="/remedies/rahu-remedies">Rahu remedies</Link> and{" "}
        <Link href="/remedies/ketu-remedy">Ketu remedies</Link> pages.
      </p>
    </ToolPage>
  );
}
