import type { Metadata } from "next";
import Breadcrumbs from "@/src/components/site/Breadcrumbs";
import Link from "next/link";
import { ArrowRight, Orbit, Sparkles } from "lucide-react";
import { TOOLS } from "@/src/lib/tools";

const TITLE = "Free Vedic Astrology Calculators — Nakshatra, Rashi, Lagna, Dasha & Doshas";
const DESCRIPTION =
  "Free Vedic astrology calculators: nakshatra, rashi (Moon sign), lagna, Vimshottari mahadasha, Manglik dosha, Sade Sati and Kaal Sarp. Lahiri ayanamsa, Swiss Ephemeris.";

// oxlint-disable-next-line react/only-export-components -- App Router metadata belongs with the route.
export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/calculators" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/calculators", type: "website" },
};

export default function CalculatorsPage() {
  return (
    <div className="seo-page-wrapper">
      <main className="seo-page-main">
        <div className="crumbs-bar"><Breadcrumbs items={[{ name: "Calculators", path: "/calculators" }]} /></div>
        <article className="seo-article">
          <h1 className="seo-article-title">Free Vedic Astrology Calculators</h1>
          <p className="tool-lead">
            Every calculator uses the same engine: planetary positions from the Swiss Ephemeris, the sidereal zodiac with
            Lahiri ayanamsa, and time-zone rules applied for your actual birth date. No sign-up, no AI-generated
            readings.
          </p>
          <ul className="tool-hub">
            {TOOLS.map((t) => (
              <li key={t.slug}>
                <Link href={`/${t.slug}`} className="tool-hub-card">
                  <strong>{t.name}</strong>
                  <span>{t.description}</span>
                  <span className="tool-hub-go">
                    Open calculator <ArrowRight size={14} />
                  </span>
                </Link>
              </li>
            ))}
            <li>
              <Link href="/" className="tool-hub-card">
                <strong>Personalised Remedy Finder</strong>
                <span>
                  Combines your chart, running dasha and doshas with the life areas you choose, and returns mantras,
                  fasting days, donations and temples from classical sources.
                </span>
                <span className="tool-hub-go">
                  Find remedies <ArrowRight size={14} />
                </span>
              </Link>
            </li>
          </ul>
        </article>
      </main>
    </div>
  );
}
