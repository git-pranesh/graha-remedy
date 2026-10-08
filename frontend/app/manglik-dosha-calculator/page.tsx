import type { Metadata } from "next";
import Link from "next/link";
import ToolPage from "@/src/components/site/ToolPage";
import ToolCalculator from "@/src/components/tools/ToolCalculator";
import { toolBySlug } from "@/src/lib/tools";
import { EXAMPLE_BIRTH, exampleReport } from "@/src/lib/examples";
import { calculateBirthChart } from "@/src/services/astro-engine";
import { analyzeManglik } from "@/src/services/dosha";

const SLUG = "manglik-dosha-calculator";
const tool = toolBySlug(SLUG);

export const revalidate = 86400;

// oxlint-disable-next-line react/only-export-components -- App Router metadata belongs with the route.
export const metadata: Metadata = {
  title: { absolute: tool.title },
  description: tool.description,
  alternates: { canonical: `/${SLUG}` },
  openGraph: { title: tool.title, description: tool.description, url: `/${SLUG}`, type: "website" },
};

/** How common is Manglik dosha? One chart every 37 days (06:00 UTC, Delhi) from 1960 to 2009. */
function prevalence() {
  let n = 0, lagna = 0, moon = 0, either = 0;
  const start = Date.UTC(1960, 0, 1);
  const end = Date.UTC(2010, 0, 1);
  for (let t = start; t < end; t += 37 * 86400000) {
    const d = new Date(t);
    const c = calculateBirthChart(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), 6, 28.61, 77.21);
    const m = analyzeManglik(c);
    n++;
    if (m.fromLagna) lagna++;
    if (m.fromMoon) moon++;
    if (m.present) either++;
  }
  const pct = (x: number) => Math.round((100 * x) / n);
  return { n, lagna: pct(lagna), moon: pct(moon), either: pct(either) };
}

export default async function Page() {
  const ex = await exampleReport();
  const m = ex.manglik!;
  const stats = prevalence();

  return (
    <ToolPage
      slug={SLUG}
      h1="Manglik Dosha Calculator: Check Mangal Dosha in Your Chart"
      updated="8 October 2026"
      lead={
        <p>
          Manglik (Mangal or Kuja) dosha is traditionally said to exist when Mars occupies the 1st, 2nd, 4th, 7th, 8th or
          12th house of the birth chart. This calculator checks Mars from both your Lagna and your Moon, and lists the
          mitigating factors astrologers commonly cite.
        </p>
      }
      calculator={<ToolCalculator tool="manglik" submitLabel="Check Manglik dosha" />}
      faqs={[
        {
          q: "Which houses cause Manglik dosha?",
          a: "Mars in the 1st, 2nd, 4th, 7th, 8th or 12th house. Many North Indian astrologers leave out the 2nd house; South Indian practice includes it and also counts from Venus. This calculator uses all six houses from the Lagna and the Moon, and shows the Venus position separately.",
        },
        {
          q: "How common is Manglik dosha?",
          a: `Very common. In a sample of ${stats.n} charts spread across 1960–2009, our engine found Mars in a Manglik house from the Lagna in ${stats.lagna}%, from the Moon in ${stats.moon}%, and from either in ${stats.either}% of charts. Six of the twelve houses qualify, so roughly half of all charts are Manglik from any single reference point.`,
        },
        {
          q: "Is Manglik dosha cancelled if both partners are Manglik?",
          a: "In traditional matching, yes — when both charts have Manglik dosha it is generally considered balanced. Traditions differ on other cancellation rules, which is why the calculator lists mitigating factors instead of declaring the dosha cancelled.",
        },
        {
          q: "Does Manglik dosha need a birth time?",
          a: "Yes for the Lagna check, because the Lagna changes about every two hours. The Moon-based check is less sensitive, but the Moon also moves about 13° a day, so give your best known time.",
        },
      ]}
    >
      <h2>How the check works</h2>
      <p>
        The calculator computes the sidereal positions of Mars, the Moon, Venus and the Lagna (Lahiri ayanamsa) and counts
        houses using whole signs: the sign of the reference point is house 1, the next sign house 2, and so on. If Mars
        lands in house 1, 2, 4, 7, 8 or 12 counted from the Lagna or from the Moon, the chart is reported as Manglik.
      </p>
      <p>
        It also checks three mitigating factors that are widely cited: Mars in its own sign (Mesha or Vrishchika), Mars
        exalted (Makara), and Jupiter in the same sign as Mars. These are reported, not applied automatically, because
        schools disagree on which ones cancel the dosha.
      </p>

      <h2>Worked example</h2>
      <p>
        For {EXAMPLE_BIRTH.label}, Mars is in {m.marsSign}: house {m.houseFromLagna} from the Lagna ({ex.ascendant!.sign})
        and house {m.houseFromMoon} from the Moon ({ex.moon.sign}). Result:{" "}
        <strong>{m.present ? "Manglik" : "not Manglik"}</strong>
        {m.present ? ` (${[m.fromLagna && "from Lagna", m.fromMoon && "from Moon"].filter(Boolean).join(" and ")})` : ""}.
        {m.mitigations.length > 0 ? ` Mitigating factors: ${m.mitigations.join("; ")}.` : ""}
      </p>

      <h2>How common it is</h2>
      <div className="tool-table-scroll">
        <table className="tool-table">
          <tbody>
            <tr><th>Charts sampled (1960–2009)</th><td>{stats.n}</td></tr>
            <tr><th>Manglik from Lagna</th><td>{stats.lagna}%</td></tr>
            <tr><th>Manglik from Moon</th><td>{stats.moon}%</td></tr>
            <tr><th>Manglik from Lagna or Moon</th><td>{stats.either}%</td></tr>
          </tbody>
        </table>
      </div>
      <p>
        Because the condition is so common, a Manglik result on its own is not unusual. Remedies traditionally associated
        with Mars are on the <Link href="/remedies/mangal-mantra">Mangal mantra and remedies</Link> page. Your Lagna and
        planet houses are on the <Link href="/lagna-calculator">Lagna calculator</Link>.
      </p>
    </ToolPage>
  );
}
