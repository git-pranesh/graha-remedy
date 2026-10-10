"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Calendar, Sparkles } from "lucide-react";
import SavedReportView from "../SavedReportView";
import Wizard from "../Wizard";
import { initAnalytics } from "../../lib/analytics";

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

export default function HomeClient({ children }: { children?: ReactNode }) {
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
      {/* Main Calculator / Wizard */}
      <main className="home-main">
        <Wizard />

        {children}

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

    </div>
  );
}
