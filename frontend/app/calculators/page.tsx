import type { Metadata } from "next";
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
      <header className="seo-header-bar">
        <div className="seo-header-inner">
          <Link href="/" className="seo-brand">
            <Orbit size={24} strokeWidth={1.8} className="seo-brand-icon" />
            <span className="seo-brand-text">Graha Remedy</span>
          </Link>
          <nav className="seo-breadcrumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span className="crumb-sep">/</span>
            <span className="crumb-current">Calculators</span>
          </nav>
          <Link href="/" className="btn btn-secondary btn-sm seo-nav-cta">
            <Sparkles size={14} /> Remedy Finder
          </Link>
        </div>
      </header>
      <main className="seo-page-main">
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
