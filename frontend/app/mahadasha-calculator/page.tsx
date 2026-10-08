import type { Metadata } from "next";
import Link from "next/link";
import ToolPage from "@/src/components/site/ToolPage";
import ToolCalculator from "@/src/components/tools/ToolCalculator";
import { toolBySlug } from "@/src/lib/tools";
import { DASHA_ORDER, DASHA_YEARS, NAKSHATRAS, NAKSHATRA_SPAN, dms } from "@/src/lib/jyotish-data";
import { EXAMPLE_BIRTH, exampleReport } from "@/src/lib/examples";

const SLUG = "mahadasha-calculator";
const tool = toolBySlug(SLUG);

export const revalidate = 86400;

// oxlint-disable-next-line react/only-export-components -- App Router metadata belongs with the route.
export const metadata: Metadata = {
  title: { absolute: tool.title },
  description: tool.description,
  alternates: { canonical: `/${SLUG}` },
  openGraph: { title: tool.title, description: tool.description, url: `/${SLUG}`, type: "website" },
};

function fmt(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

export default async function Page() {
  const ex = await exampleReport();
  const nak = NAKSHATRAS.find((n) => n.name === ex.moon.nakshatra)!;
  const into = ex.moon.longitude - nak.start;
  const fraction = into / NAKSHATRA_SPAN;
  const d = ex.dasha!;
  const first = d.sequence[0];

  return (
    <ToolPage
      slug={SLUG}
      h1="Mahadasha Calculator: Current Mahadasha and Antardasha Dates"
      updated="8 October 2026"
      lead={
        <p>
          The Vimshottari dasha system divides life into planetary periods (mahadashas) totalling 120 years, each split
          into nine sub-periods (antardashas). Enter your birth details to see which mahadasha and antardasha are running
          now, with exact dates.
        </p>
      }
      calculator={<ToolCalculator tool="dasha" submitLabel="Show my dasha" />}
      faqs={[
        {
          q: "How is the first mahadasha decided?",
          a: "By the nakshatra the Moon occupied at birth. Each nakshatra is ruled by one of the nine dasha lords, and your life starts in that lord's mahadasha. How far the Moon had travelled through the nakshatra decides how much of that first mahadasha had already elapsed.",
        },
        {
          q: "How long is each antardasha?",
          a: "An antardasha lasts (mahadasha years × antardasha lord's years) ÷ 120. For example, Venus antardasha within Saturn mahadasha lasts 19 × 20 ÷ 120 = 3.17 years. The first antardasha of every mahadasha belongs to the mahadasha lord itself.",
        },
        {
          q: "Why do different calculators give slightly different dasha dates?",
          a: "Dasha dates depend on the exact Moon degree, so a small difference in ayanamsa or birth time shifts them. Software also differs in year length: we use 365.25 days per dasha year; some programs use 360 or 365.2422 days, which moves dates by days to months over decades.",
        },
        {
          q: "Does the calculator work without a birth time?",
          a: "No. The Moon moves about 13° a day, so even a few hours change the dasha balance at birth by months or years. Enter your best known birth time.",
        },
      ]}
    >
      <h2>The nine Vimshottari periods</h2>
      <div className="tool-table-scroll">
        <table className="tool-table tool-table-wide">
          <thead>
            <tr><th>Order</th><th>Mahadasha lord</th><th>Length</th><th>Nakshatras ruled</th></tr>
          </thead>
          <tbody>
            {DASHA_ORDER.map((lord, i) => (
              <tr key={lord}>
                <td>{i + 1}</td>
                <td>{lord}</td>
                <td>{DASHA_YEARS[lord]} years</td>
                <td>{NAKSHATRAS.filter((n) => n.lord === lord).map((n) => n.name).join(", ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>The periods always follow this order and add up to 120 years.</p>

      <h2>Worked example</h2>
      <p>
        For {EXAMPLE_BIRTH.label}, the Moon is at {dms(ex.moon.longitude)}, which is {dms(into)} into{" "}
        {ex.moon.nakshatra} ({(fraction * 100).toFixed(1)}% of the way through). {ex.moon.nakshatra} is ruled by{" "}
        {nak.lord}, whose mahadasha lasts {DASHA_YEARS[nak.lord]} years. Since {(fraction * 100).toFixed(1)}% of it had
        already elapsed, the balance at birth was {DASHA_YEARS[nak.lord]} × {(1 - fraction).toFixed(4)} ={" "}
        <strong>{d.balanceAtBirth.years.toFixed(2)} years</strong> of {nak.lord} mahadasha, ending on {fmt(first.end)}.
      </p>
      <p>
        The following mahadashas run in order from there. For this person the current period is{" "}
        <strong>
          {d.current.lord} mahadasha ({fmt(d.current.start)} – {fmt(d.current.end)})
        </strong>
        , with {d.currentAntardasha.lord} antardasha running from {fmt(d.currentAntardasha.start)} to{" "}
        {fmt(d.currentAntardasha.end)}.
      </p>

      <h2>Remedies for the running dasha</h2>
      <p>
        Traditional remedies are usually chosen for the lords of the running mahadasha and antardasha. After calculating
        your dasha, follow the remedy links in your result, or see the <Link href="/remedies">remedy library</Link>. Your
        birth nakshatra details are on the <Link href="/nakshatra-calculator">nakshatra calculator</Link>.
      </p>
    </ToolPage>
  );
}
