"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Calculator, Calendar, Clock, Compass, Orbit, Sparkles, Sun } from "lucide-react";
import { TOOLS } from "../src/lib/tools";
import SavedReportView from "../src/components/SavedReportView";
import Wizard from "../src/components/Wizard";
import { initAnalytics } from "../src/lib/analytics";

function reportIdFromHash(): string | null {
  const match = window.location.hash.match(/^#\/r\/([A-Za-z0-9_-]+)$/);
  return match ? match[1] : null;
}

const NAVAGRAHA_QUICK_LINKS = [
  { slug: "surya-mantra", name: "Surya", english: "Sun", day: "Sunday", color: "#B85D19" },
  { slug: "chandra-mantra", name: "Chandra", english: "Moon", day: "Monday", color: "#3B6E8C" },
  { slug: "mangal-mantra", name: "Mangal", english: "Mars", day: "Tuesday", color: "#B03A2E" },
  { slug: "budh-mantra", name: "Budh", english: "Mercury", day: "Wednesday", color: "#2E7D52" },
  { slug: "brihaspati-mantra", name: "Brihaspati", english: "Jupiter", day: "Thursday", color: "#B8860B" },
  { slug: "shukra-mantra", name: "Shukra", english: "Venus", day: "Friday", color: "#8E44AD" },
  { slug: "shani-mantra", name: "Shani", english: "Saturn", day: "Saturday", color: "#1E3A5F" },
  { slug: "rahu-mantra", name: "Rahu", english: "North Node", day: "Saturday", color: "#4A5568" },
  { slug: "ketu-mantra", name: "Ketu", english: "South Node", day: "Tuesday", color: "#718096" },
];

export default function Home() {
  const [reportId, setReportId] = useState<string | null>(null);

  useEffect(() => {
    const onChange = () => setReportId(reportIdFromHash());

    initAnalytics();
    onChange();
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  if (reportId) {
    return (
      <SavedReportView
        key={reportId}
        id={reportId}
        onHome={() => {
          window.location.hash = "#/";
        }}
      />
    );
  }

  return (
    <div className="home-wrapper">
      {/* Top Global Navigation Bar */}
      <header className="home-nav-bar">
        <div className="home-nav-inner">
          <Link href="/" className="home-brand">
            <Orbit size={24} strokeWidth={1.8} className="home-brand-icon" />
            <span className="home-brand-title">Graha Remedy</span>
          </Link>

          <nav className="home-nav-links">
            <Link href="/" className="nav-link active">
              <Compass size={15} /> Remedy Finder
            </Link>
            <Link href="/panchang" className="nav-link">
              <Sun size={15} /> Panchang
            </Link>
            <Link href="/rahu-kaal" className="nav-link">
              <Clock size={15} /> Rahu Kaal
            </Link>
            <Link href="/calculators" className="nav-link">
              <Calculator size={15} /> Calculators
            </Link>
            <Link href="/remedies" className="nav-link">
              <BookOpen size={15} /> Mantra &amp; Remedy Library <span className="nav-badge">18 Guides</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Calculator / Wizard */}
      <main className="home-main">
        <Wizard />

        {/* Standalone calculators */}
        <section className="home-library-section">
          <div className="home-library-header">
            <span className="home-library-badge">
              <Calculator size={13} /> Free Calculators
            </span>
            <h2 className="home-library-title">Vedic Astrology Calculators</h2>
            <p className="home-library-desc">
              Check a single factor of your birth chart — same Swiss Ephemeris engine, Lahiri ayanamsa.
            </p>
          </div>
          <div className="home-mantra-grid">
            {TOOLS.map((t) => (
              <Link key={t.slug} href={`/${t.slug}`} className="home-mantra-card">
                <div className="home-mantra-info">
                  <span className="home-mantra-name">{t.name}</span>
                </div>
                <ArrowRight size={14} className="home-mantra-arrow" />
              </Link>
            ))}
          </div>
        </section>

        {/* Content Discovery Section: The 9 Navagraha Mantras */}
        <section className="home-library-section">
          <div className="home-library-header">
            <span className="home-library-badge">
              <BookOpen size={13} /> Classical Vedic Library
            </span>
            <h2 className="home-library-title">Explore the 9 Planetary Mantras (Navagraha)</h2>
            <p className="home-library-desc">
              Looking for a specific planet's chant? Explore authentic Sanskrit text, 108 japa vidhi,
              fasting rules, and charitable giving guidelines for each celestial energy.
            </p>
          </div>

          <div className="home-mantra-grid">
            {NAVAGRAHA_QUICK_LINKS.map((planet) => (
              <Link
                key={planet.slug}
                href={`/remedies/${planet.slug}`}
                className="home-mantra-card"
              >
                <div className="home-mantra-dot" style={{ backgroundColor: planet.color }} />
                <div className="home-mantra-info">
                  <span className="home-mantra-name">{planet.name} ({planet.english})</span>
                  <span className="home-mantra-day">
                    <Calendar size={11} /> {planet.day}
                  </span>
                </div>
                <ArrowRight size={14} className="home-mantra-arrow" />
              </Link>
            ))}
          </div>

          <div className="home-library-footer">
            <Link href="/remedies" className="btn btn-secondary btn-sm">
              <Sparkles size={14} /> Browse All Guides in Remedy Library <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      </main>

      {/* Site Footer with Crawlable Links */}
      <footer className="home-footer">
        <div className="home-footer-inner">
          <div className="home-footer-brand">
            <div className="footer-logo">
              <Orbit size={20} strokeWidth={1.8} />
              <span>Graha Remedy</span>
            </div>
            <p className="footer-tagline">
              Deterministic, rule-based Vedic astrology remedies grounded in classical Jyotish Shastra.
            </p>
          </div>

          <div className="home-footer-group">
            <h4 className="footer-heading">Planetary Mantras</h4>
            <div className="footer-links-grid">
              {NAVAGRAHA_QUICK_LINKS.map((p) => (
                <Link key={p.slug} href={`/remedies/${p.slug}`}>
                  {p.name} Mantra
                </Link>
              ))}
            </div>
          </div>

          <div className="home-footer-group">
            <h4 className="footer-heading">Daily Panchang</h4>
            <div className="footer-links-col">
              <Link href="/panchang">Today&apos;s Panchang</Link>
              <Link href="/rahu-kaal">Rahu Kaal Today</Link>
              <Link href="/choghadiya">Choghadiya Today</Link>
              <Link href="/hi/panchang" lang="hi">आज का पंचांग (हिन्दी)</Link>
              <Link href="/te/panchangam" lang="te">తెలుగు పంచాంగం</Link>
              <Link href="/ta/panchangam" lang="ta">தமிழ் பஞ்சாங்கம்</Link>
              <Link href="/hi/ekadashi" lang="hi">एकादशी कब है?</Link>
              <Link href="/ekadashi">Next Ekadashi</Link>
              <Link href="/makar-sankranti">Makar Sankranti</Link>
              <Link href="/sankranti/2027">Sankranti 2027</Link>
              <Link href="/ekadashi/2026">Ekadashi 2026</Link>
              <Link href="/amavasya/2026">Amavasya 2026</Link>
              <Link href="/purnima/2026">Purnima 2026</Link>
              <Link href="/panchang/delhi">Delhi Panchang</Link>
              <Link href="/panchang/mumbai">Mumbai Panchang</Link>
              <Link href="/rahu-kaal/bengaluru">Bengaluru Rahu Kaal</Link>
              <Link href="/choghadiya/ahmedabad">Ahmedabad Choghadiya</Link>
            </div>
          </div>

          <div className="home-footer-group">
            <h4 className="footer-heading">Calculators</h4>
            <div className="footer-links-col">
              {TOOLS.map((t) => (
                <Link key={t.slug} href={`/${t.slug}`}>
                  {t.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="home-footer-group">
            <h4 className="footer-heading">Resources &amp; Legal</h4>
            <div className="footer-links-col">
              <Link href="/calculators">All Calculators</Link>
              <Link href="/remedies">Mantra &amp; Remedy Library</Link>
              <Link href="/about">About &amp; Methodology</Link>
              <Link href="/contact">Contact &amp; Corrections</Link>
              <Link href="/privacy-policy">Privacy Policy</Link>
              <Link href="/terms">Terms of Service</Link>
            </div>
          </div>
        </div>

        <div className="home-footer-bottom">
          <p>
            Disclaimer: Vedic mantras and remedies are devotional disciplines for spiritual introspection. They do not replace professional medical, legal, or financial advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
