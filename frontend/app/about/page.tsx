import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Compass, Orbit, Sparkles } from "lucide-react";

// oxlint-disable-next-line react/only-export-components -- App Router metadata
export const metadata: Metadata = {
  title: "About Us & Editorial Methodology | Graha Remedy",
  description: "Learn about the Graha Remedy mission: free, deterministic Vedic astrology remedies grounded in classical Jyotish Shastra with zero AI hallucination.",
};

export default function AboutPage() {
  return (
    <div className="seo-page-wrapper">
      <header className="seo-header-bar">
        <div className="seo-header-inner">
          <Link href="/" className="seo-brand">
            <Orbit size={24} strokeWidth={1.8} className="seo-brand-icon" />
            <span className="seo-brand-text">Graha Remedy</span>
          </Link>
          <nav className="seo-breadcrumbs">
            <Link href="/">Home</Link>
            <span className="crumb-sep">/</span>
            <span className="crumb-current">About Us</span>
          </nav>
          <Link href="/" className="btn btn-primary btn-sm seo-nav-cta">
            Calculator
          </Link>
        </div>
      </header>

      <main className="seo-page-main">
        <article className="seo-article">
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--turquoise-dark)", fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase", marginBottom: 12 }}>
            <BookOpen size={16} /> Our Mission &amp; Methodology
          </div>
          <h1 className="seo-article-title">About Graha Remedy</h1>
          <p style={{ color: "var(--grey-mid)", fontSize: "1.05rem", lineHeight: 1.6, marginBottom: 32 }}>
            A transparent, free-forever Vedic astrology application dedicated to delivering authentic spiritual remedies based on classical Jyotish texts—with zero AI in the output logic.
          </p>

          <div className="seo-content">
            <h2>The Problem with Modern Astrology Platforms</h2>
            <p>
              In recent years, the online astrology landscape has become saturated with predatory monetization models: fear-based warnings, hidden paywalls, aggressive upsells for expensive gemstones, and generative AI chatbots that fabricate non-existent mantras and ritual procedures.
            </p>
            <p>
              Graha Remedy was built on a counter-principle: <strong>authentic spiritual wisdom should be accessible, free, and grounded in verifiable classical scholarship.</strong>
            </p>

            <h2>Our Three Core Pillars</h2>
            <ul style={{ listStyle: "none", padding: 0 }}>
              <li style={{ marginBottom: 16 }}>
                <strong>1. Zero AI in Astrological Logic:</strong> We do not use Large Language Models (LLMs) to invent astrological calculations or hallucinate remedial advice. Every planetary calculation uses high-precision astronomical Swiss Ephemeris data, and every remedy is mapped deterministically from classical Sanskrit texts.
              </li>
              <li style={{ marginBottom: 16 }}>
                <strong>2. Free Forever:</strong> No premium tiers, no subscription paywalls, no locking readings behind pay gates. The tool is free for anyone worldwide seeking spiritual guidance.
              </li>
              <li style={{ marginBottom: 16 }}>
                <strong>3. Culturally Authentic:</strong> All recommended mantras, fasting rules (Vrat), charitable offerings (Daan), and temple worship rituals adhere strictly to Vedic tradition.
              </li>
            </ul>

            <h2>Our Classical Editorial Sources</h2>
            <p>
              Our planetary definitions, dosha rules, and remedy catalogs are compiled and verified against classical Jyotish and Puranic literature, including:
            </p>
            <ul>
              <li><strong>Brihat Parashara Hora Shastra (BPHS):</strong> The foundational treatise of Vedic astrology by Sage Parashara, governing planetary significations, houses, and Vimshottari Dasha cycles.</li>
              <li><strong>Phaladeepika:</strong> Classical work by Mantreswara detailing planetary combinations, yogas, and remedial pacifications.</li>
              <li><strong>Valmiki Ramayana (Yuddha Kanda 6.105):</strong> The definitive scriptural source for the Aditya Hridayam Stotram recited for solar vitality and courage.</li>
              <li><strong>Markandeya Purana:</strong> Scriptural source for the Durga Saptashati and Durga Kavach used to pacify malefic Rahu influences.</li>
              <li><strong>Atharva Veda:</strong> Source of the Ganesha Atharvashirsha used for Ketu pacification and removal of spiritual obstacles.</li>
            </ul>

            <h2>How the Calculation Works</h2>
            <p>
              When you enter your birth date, time, and coordinates:
            </p>
            <ol style={{ paddingLeft: 24, marginBottom: 24, lineHeight: 1.8 }}>
              <li>The engine computes your exact Ascendant (Lagna), Moon sign, and planetary longitudes using sidereal Lahiri Ayanamsha.</li>
              <li>It checks planetary dignity (exaltation and debilitation) and which planets are functional malefics for your Lagna.</li>
              <li>It computes your current Vimshottari Mahadasha and Antardasha periods.</li>
              <li>It identifies key doshas deterministically: Manglik (Mars from Lagna and Moon), Kaal Sarp (all planets on one side of the Rahu–Ketu axis by longitude) and Sade Sati (transiting Saturn relative to your natal Moon).</li>
              <li>It cross-references your selected life problems with classical remedy rules to output targeted mantras, fasting schedules, and charity recommendations.</li>
            </ol>

            <h2>Calculation Conventions</h2>
            <ul>
              <li><strong>Ephemeris:</strong> Swiss Ephemeris (apparent positions).</li>
              <li><strong>Zodiac:</strong> sidereal, Lahiri (Chitrapaksha) ayanamsa; Rahu and Ketu from the mean lunar node.</li>
              <li><strong>Houses:</strong> whole-sign houses from the Lagna.</li>
              <li><strong>Time zones:</strong> the UTC offset in force on the birth date (including daylight saving and India&apos;s 1942–45 war time) from the IANA time-zone database; places from GeoNames.</li>
              <li><strong>Dasha:</strong> Vimshottari, 365.25-day years.</li>
              <li><strong>Panchang:</strong> the day runs from sunrise to the next sunrise; sunrise and sunset at the Sun&apos;s upper limb with standard refraction; moonrise and moonset at the centre of the Moon&apos;s disc; amanta months named by the solar sign entered, with Adhika months detected.</li>
            </ul>

            <h2>How We Check Accuracy</h2>
            <p>
              We compare our output with independently published panchang data. For New Delhi on 8 October 2026 and Chennai on 15 January
              2027, sunrise, sunset, moonrise, moonset, nakshatra and yoga end times, Moon-sign change, Rahu Kalam, Yamaganda, Gulika, Abhijit
              and Brahma Muhurta matched to the minute; tithi and karana end times differed by one to two minutes. Our choghadiya for Dallas
              matched in 15 of 16 periods, the sixteenth by one minute. Saturn&apos;s sign changes from 2020 to 2028 match published transit
              dates, and the 2026 Adhika Jyeshtha month is detected correctly. Times are rounded to the nearest minute.
            </p>
            <p>
              Found a result that looks wrong? Please <Link href="/contact">tell us</Link> with the date, time and place — we check every report.
              Our code is open source, so the calculations can be inspected by anyone.
            </p>

            <div style={{ background: "var(--fill)", border: "1px solid var(--border)", borderRadius: 14, padding: "24px 28px", marginTop: 36, textAlign: "center" }}>
              <div style={{ color: "var(--turquoise-dark)", marginBottom: 8 }}>
                <Sparkles size={28} style={{ margin: "0 auto" }} />
              </div>
              <h3 style={{ margin: "0 0 8px 0", color: "var(--ink)", fontSize: "1.2rem" }}>Try the Free Calculator</h3>
              <p style={{ margin: "0 0 16px 0", fontSize: "0.92rem", color: "var(--grey-mid)" }}>
                Discover your lagna, active dasha, and specific planetary remedies in under 60 seconds.
              </p>
              <Link href="/" className="btn btn-primary btn-sm">
                <Compass size={14} /> Launch Birth Chart Tool
              </Link>
            </div>
          </div>
        </article>
      </main>
    </div>
  );
}
