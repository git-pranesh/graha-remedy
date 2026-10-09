import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ContentShell from "@/src/components/site/ContentShell";
import ToolCalculator from "@/src/components/tools/ToolCalculator";
import { DASHA_ORDER, DASHA_YEARS } from "@/src/lib/jyotish-data";
import { MAHADASHA_PLANETS, ageWindows, antardashas, fmtSpan, loadPlanetData, nakshatrasOf, planetBySlug } from "@/src/lib/mahadasha";

export const dynamicParams = false;

// oxlint-disable-next-line react/only-export-components -- App Router build-time export.
export function generateStaticParams() {
  return MAHADASHA_PLANETS.map((p) => ({ planet: p.slug }));
}

interface Props { params: Promise<{ planet: string }> }

// oxlint-disable-next-line react/only-export-components -- App Router metadata belongs with the route.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = planetBySlug((await params).planet);
  if (!p) return {};
  const y = DASHA_YEARS[p.lord];
  const title = `${p.title} Mahadasha: ${y} Years, Antardasha Dates, Age Windows & Remedies`;
  const description = `${p.title} mahadasha lasts ${y} years in the Vimshottari system. See its antardashas with exact durations, the ages at which it runs for each birth nakshatra, and traditional remedies.`;
  return { title: { absolute: title }, description, alternates: { canonical: `/mahadasha/${p.slug}` }, openGraph: { title, description, url: `/mahadasha/${p.slug}`, type: "article" } };
}

export default async function Page({ params }: Props) {
  const p = planetBySlug((await params).planet);
  if (!p) notFound();
  const { planet, remedy } = loadPlanetData(p.key);
  const Y = DASHA_YEARS[p.lord];
  const idx = DASHA_ORDER.indexOf(p.lord);
  const prev = DASHA_ORDER[(idx + 8) % 9], next = DASHA_ORDER[(idx + 1) % 9];
  const ads = antardashas(p.lord);
  const windows = ageWindows(p.lord);
  const naks = nakshatrasOf(p.lord);
  const prevP = MAHADASHA_PLANETS.find((x) => x.lord === prev)!, nextP = MAHADASHA_PLANETS.find((x) => x.lord === next)!;
  const faqs = [
    { q: `How long is ${p.title} mahadasha?`, a: `${p.title} mahadasha lasts ${Y} years in the Vimshottari dasha system, which totals 120 years. It follows ${prev} mahadasha and is followed by ${next} mahadasha.` },
    { q: `Which birth nakshatras start with ${p.lord} mahadasha?`, a: `${naks.join(", ")} are ruled by ${p.lord}. If your Moon was in one of them at birth, your life began in ${p.lord} mahadasha, with part of its ${Y} years already elapsed.` },
    { q: `What is the first antardasha of ${p.lord} mahadasha?`, a: `${p.lord}–${p.lord}: every mahadasha begins with the antardasha of its own lord (${fmtSpan(ads[0].years)} here), followed by the other eight planets in Vimshottari order.` },
    { q: `Is ${p.lord} mahadasha good or bad?`, a: `There is no single answer. Classical texts read a mahadasha from the planet's sign, house, aspects and the houses it rules in your own chart, and from the running antardasha. This page gives the timing; the planet's general significations are listed above.` },
    { q: `How do I find out when my ${p.lord} mahadasha starts and ends?`, a: `Enter your birth date, time and place in the calculator on this page. It gives your exact mahadasha and antardasha dates from the Moon's position at birth.` },
  ];
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://www.graharemedy.com";
  const schema = [
    { "@type": "Article", headline: `${p.title} Mahadasha`, mainEntityOfPage: `${base}/mahadasha/${p.slug}`, publisher: { "@id": `${base}/#organization` } },
    { "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
  ];

  return (
    <ContentShell
      crumbs={[{ name: "Calculators", path: "/calculators" }, { name: `${p.title} Mahadasha`, path: `/mahadasha/${p.slug}` }]}
      schema={schema}
      footerNote="Dasha lengths follow the Vimshottari system (years of 365.25 days). Planet significations and remedies come from this site's classical-source catalogue; astrology is a traditional belief system and nothing here is medical, legal or financial advice."
    >
      <h1 className="seo-article-title">{p.title} Mahadasha: Duration, Antardashas and Remedies</h1>
      <p className="tool-lead">
        {p.title} ({planet.sanskrit}) mahadasha lasts <strong>{Y} years</strong> and is the {idx + 1}{["st", "nd", "rd"][idx] ?? "th"} period in the
        120-year Vimshottari cycle, after <Link href={`/mahadasha/${prevP.slug}`}>{prev}</Link> and before{" "}
        <Link href={`/mahadasha/${nextP.slug}`}>{next}</Link>. Find the exact dates of yours below.
      </p>
      <ToolCalculator tool="dasha" submitLabel="Show my mahadasha dates" />

      <section className="seo-content">
        <h2>{p.lord} mahadasha at a glance</h2>
        <table className="tool-table">
          <tbody>
            <tr><th>Length</th><td>{Y} years</td></tr>
            <tr><th>Nakshatras ruled</th><td>{naks.join(", ")}</td></tr>
            <tr><th>Nature</th><td>{planet.nature}</td></tr>
            <tr><th>Element</th><td>{planet.element}</td></tr>
            <tr><th>Governs</th><td>{planet.governs.join(", ")}</td></tr>
            <tr><th>Body parts</th><td>{planet.bodyParts.join(", ")}</td></tr>
            <tr><th>Day · colour · gemstone</th><td>{planet.day} · {planet.color} · {planet.gemstone}</td></tr>
            <tr><th>Deity</th><td>{remedy.deity}</td></tr>
          </tbody>
        </table>

        <h2>Antardashas inside {p.lord} mahadasha</h2>
        <p>
          Each antardasha lasts (mahadasha years × antardasha lord&apos;s years) ÷ 120. The sub-periods begin with {p.lord} itself and follow the
          Vimshottari order.
        </p>
        <div className="tool-table-scroll">
          <table className="tool-table">
            <thead><tr><th>Antardasha</th><th>Length</th><th>Cumulative</th></tr></thead>
            <tbody>
              {ads.map((a, i) => {
                const cum = ads.slice(0, i + 1).reduce((s, x) => s + x.years, 0);
                return <tr key={a.lord}><td>{p.lord}–{a.lord}</td><td>{fmtSpan(a.years)}</td><td>{fmtSpan(cum)}</td></tr>;
              })}
            </tbody>
          </table>
        </div>

        <h2>At what age does {p.lord} mahadasha run?</h2>
        <p>
          It depends on the dasha you were born into, which is set by your birth nakshatra&apos;s lord. Because the Moon&apos;s exact position
          decides how much of that first dasha was left at birth, the start is a range:
        </p>
        <div className="tool-table-scroll">
          <table className="tool-table tool-table-wide">
            <thead><tr><th>Born in a nakshatra ruled by</th><th>{p.lord} mahadasha starts at age</th><th>Ends at age</th></tr></thead>
            <tbody>
              {windows.filter((w) => w.startMin < 100).map((w) => (
                <tr key={w.first}>
                  <td>{w.first}</td>
                  <td>{w.first_is_this ? "From birth" : `${w.startMin}–${Math.min(w.startMax, 120)}`}</td>
                  <td>{w.first_is_this ? `0–${Y}` : `${w.endMin}–${Math.min(w.endMax, 120)}`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="tool-note">Ages are approximate ranges; the calculator above gives your exact dates. Windows starting after about age 100 are omitted.</p>

        <h2>Traditional remedies for {p.lord} mahadasha</h2>
        <p>
          The remedies below are the practices recorded for {p.title} in this site&apos;s classical-source catalogue. They are devotional disciplines,
          not guarantees.
        </p>
        <h3>Mantras</h3>
        <ul>
          {remedy.mantras.map((m) => <li key={m.name}><strong>{m.name}</strong> — {m.practice}{m.reference ? ` (${m.reference})` : ""}</li>)}
        </ul>
        <h3>Fasting</h3>
        <ul>{remedy.fasting.map((f) => <li key={f}>{f}</li>)}</ul>
        <h3>Donations</h3>
        <ul>{remedy.donations.map((d) => <li key={d}>{d}</li>)}</ul>
        <p>
          Full vidhi, mantra text and step-by-step puja: <Link href={`/remedies/${p.remedy}`}>{p.title} remedies and mantra guide</Link>. For
          remedies matched to your own chart and life concerns, use the <Link href="/">remedy finder</Link>.
        </p>

        <h2>Frequently asked questions</h2>
        {faqs.map((f) => (
          <details key={f.q} className="tool-faq"><summary>{f.q}</summary><p>{f.a}</p></details>
        ))}

        <h2>Other mahadashas</h2>
        <ul className="pc-city-links">
          {MAHADASHA_PLANETS.filter((x) => x.slug !== p.slug).map((x) => <li key={x.slug}><Link href={`/mahadasha/${x.slug}`}>{x.lord} mahadasha</Link></li>)}
          <li><Link href="/mahadasha-calculator">Mahadasha calculator</Link></li>
        </ul>
      </section>
    </ContentShell>
  );
}
