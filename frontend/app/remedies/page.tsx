import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Compass,
  Orbit,
  Sparkles,
} from "lucide-react";

// oxlint-disable-next-line react/only-export-components -- App Router metadata belongs with the page.
export const metadata: Metadata = {
  title: "Vedic Mantra & Planetary Remedy Library | Graha Remedy",
  description:
    "Explore authentic Vedic mantras, 108 chanting jaap vidhi, Saturday/weekday fasting rules, and daan recommendations for all nine grahas.",
};

interface GuideItem {
  slug: string;
  title: string;
  planet: string;
  sanskrit: string;
  day: string;
  deity: string;
  coreMantra?: string;
  summary: string;
  badge?: string;
}

const MANTRAS: GuideItem[] = [
  {
    slug: "surya-mantra",
    title: "Surya Mantra: Beej Mantra, Chanting Vidhi & Sun Remedies",
    planet: "Sun",
    sanskrit: "सूर्य",
    day: "Sunday",
    deity: "Lord Surya",
    coreMantra: "Om Suryaya Namaha",
    summary: "Invoking vitality, clarity, professional authority, and healthy self-confidence.",
  },
  {
    slug: "chandra-mantra",
    title: "Chandra Mantra: Beej Mantra, Chanting Vidhi & Moon Remedies",
    planet: "Moon",
    sanskrit: "चन्द्र",
    day: "Monday",
    deity: "Lord Shiva",
    coreMantra: "Om Chandraya Namaha",
    summary: "Stabilizing the mind, calming anxiety, emotional healing, and maternal harmony.",
  },
  {
    slug: "mangal-mantra",
    title: "Mangal Mantra: Beej Mantra, Chanting Vidhi & Mars Remedies",
    planet: "Mars",
    sanskrit: "मंगल",
    day: "Tuesday",
    deity: "Lord Hanuman",
    coreMantra: "Om Mangalaya Namaha",
    summary: "Cultivating courage, vitality, overcoming inertia, and mitigating Mangal Dosha.",
  },
  {
    slug: "budh-mantra",
    title: "Budh Mantra: Beej Mantra, Chanting Vidhi & Mercury Remedies",
    planet: "Mercury",
    sanskrit: "बुध",
    day: "Wednesday",
    deity: "Lord Vishnu",
    coreMantra: "Om Budhaya Namaha",
    summary: "Enhancing intellect, analytical clarity, articulate speech, business, and study.",
  },
  {
    slug: "brihaspati-mantra",
    title: "Brihaspati Mantra: Beej Mantra, Chanting Vidhi & Jupiter Remedies",
    planet: "Jupiter",
    sanskrit: "बृहस्पति",
    day: "Thursday",
    deity: "Lord Vishnu / Brihaspati",
    coreMantra: "Om Brihaspataye Namaha",
    summary: "Expanding wisdom, spiritual fortune, marital harmony, and scholarly success.",
  },
  {
    slug: "shukra-mantra",
    title: "Shukra Mantra: Beej Mantra, Chanting Vidhi & Venus Remedies",
    planet: "Venus",
    sanskrit: "शुक्र",
    day: "Friday",
    deity: "Goddess Lakshmi",
    coreMantra: "Om Shukraya Namaha",
    summary: "Fostering love, creative fulfillment, aesthetic grace, and material abundance.",
  },
  {
    slug: "shani-mantra",
    title: "Shani Mantra: Beej Mantra, Chanting Vidhi & Saturn Remedies",
    planet: "Saturn",
    sanskrit: "शनि",
    day: "Saturday",
    deity: "Lord Shiva / Shani",
    coreMantra: "Om Shanaishcharaya Namaha",
    summary: "Pacifying karmic delays, building endurance, discipline, and balancing Sade Sati.",
  },
  {
    slug: "rahu-mantra",
    title: "Rahu Mantra: Beej Mantra, Chanting Vidhi & Remedies",
    planet: "Rahu",
    sanskrit: "राहु",
    day: "Saturday / Rahu Kalam",
    deity: "Goddess Durga",
    coreMantra: "Om Rahave Namaha",
    summary: "Clearing mental illusions, obsessive desires, phobias, and grounding foreign transits.",
  },
  {
    slug: "ketu-mantra",
    title: "Ketu Mantra: Beej Mantra, Chanting Vidhi & Remedies",
    planet: "Ketu",
    sanskrit: "केतु",
    day: "Tuesday",
    deity: "Lord Ganesha",
    coreMantra: "Om Ketave Namaha",
    summary: "Spiritual liberation, releasing past-life attachments, intuition, and mental peace.",
  },
];

const BEEJ_MANTRAS: GuideItem[] = [
  {
    slug: "shani-beej-mantra",
    title: "Shani Beej Mantra: Om Praam Preem Praum Sah Jaap Vidhi",
    planet: "Saturn",
    sanskrit: "शनि बीज",
    day: "Saturday",
    deity: "Lord Shani Dev",
    coreMantra: "Om Praam Preem Praum Sah Shanaischaraya Namaha",
    summary: "Tantrik seed sound therapy designed specifically for severe Sade Sati, Kantaka Shani, and Mahadasha.",
    badge: "Tantrik Beej",
  },
  {
    slug: "shukra-beej-mantra",
    title: "Shukra Beej Mantra: Om Draam Dreem Draum Sah Vidhi",
    planet: "Venus",
    sanskrit: "शुक्र बीज",
    day: "Friday",
    deity: "Goddess Lakshmi / Shukracharya",
    coreMantra: "Om Draam Dreem Draum Sah Shukraya Namaha",
    summary: "Acoustic seed frequencies to vitalize Ojas, harmonize marital discord, and dissolve creative stagnation.",
    badge: "Tantrik Beej",
  },
];

const REMEDY_HUBS: GuideItem[] = [
  {
    slug: "vedic-astrology-remedies",
    title: "The Complete Guide to Vedic Astrology Remedies (Upayas)",
    planet: "Navagraha",
    sanskrit: "उपाय",
    day: "All Days",
    deity: "The 9 Celestial Deities",
    summary: "The definitive pillar guide explaining Mantra, Vrata, Daan, Yajna, and how Jyotish karmic mitigation works.",
    badge: "Pillar Guide",
  },
  {
    slug: "rahu-remedies",
    title: "Rahu Remedies: Complete Vedic Protocol for Mahadasha & Dosha",
    planet: "Rahu",
    sanskrit: "राहु उपाय",
    day: "Saturday",
    deity: "Goddess Durga",
    summary: "Comprehensive multi-tier protocol: fasting after dark, blue daan, addiction recovery, and Durga Kavach.",
    badge: "Remedy Hub",
  },
  {
    slug: "ketu-remedy",
    title: "Ketu Remedies: Vedic Pacification & Lord Ganesha Worship",
    planet: "Ketu",
    sanskrit: "केतु उपाय",
    day: "Tuesday",
    deity: "Lord Ganesha",
    summary: "Calming alienating detachment, unblocking spiritual progress, feeding street animals, and Ganesha sadhana.",
    badge: "Remedy Hub",
  },
  {
    slug: "moon-remedies",
    title: "Moon Remedies: Healing Anxiety, Depression & Mind Volatility",
    planet: "Moon",
    sanskrit: "चन्द्र उपाय",
    day: "Monday",
    deity: "Lord Shiva",
    summary: "Spiritual and behavioral remedies for an afflicted Manas: milk fasting, silver utensils, and Shiva Jal Abhishekam.",
    badge: "Remedy Hub",
  },
  {
    slug: "mercury-planet-remedies",
    title: "Mercury (Budh) Remedies: Speech, Intellect, Trade & Studies",
    planet: "Mercury",
    sanskrit: "बुध उपाय",
    day: "Wednesday",
    deity: "Lord Vishnu",
    summary: "Resolving stammering, nervous stress, business failures, and study blocks through green daan and Vishnu sahasranama.",
    badge: "Remedy Hub",
  },
];

const SPECIAL_SOLUTIONS: GuideItem[] = [
  {
    slug: "career-astrology",
    title: "Career Astrology: 10th House, Delays & Vedic Remedies",
    planet: "Career / Karma",
    sanskrit: "कर्म भाव",
    day: "All Days",
    deity: "Surya & Shani",
    summary: "Understanding professional stagnation, 10th house blockages, and how planetary remedies restore career momentum.",
    badge: "Interactive Tool",
  },
  {
    slug: "evil-eye-remedies",
    title: "Vedic Remedies for Evil Eye (Nazar Dosha Protection)",
    planet: "Protection",
    sanskrit: "दृष्टि दोष",
    day: "Tuesday / Saturday",
    deity: "Lord Hanuman",
    summary: "Traditional aura cleansing rituals: salt-mustard seed circling, twilight diya, and Hanuman Chalisa recitation.",
    badge: "Protection",
  },
  {
    slug: "sun-career-delay",
    title: "Sun Remedies for Career Delay in Vedic Astrology",
    planet: "Sun",
    sanskrit: "सूर्य",
    day: "Sunday",
    deity: "Lord Surya",
    summary: "Detailed Vedic guidance when professional recognition, status, or leadership is delayed.",
  },
  {
    slug: "sun-promotion-blocks",
    title: "Vedic Remedies for Promotion Blocks: Sun (Surya)",
    planet: "Sun",
    sanskrit: "सूर्य",
    day: "Sunday",
    deity: "Lord Surya",
    summary: "Spiritual remedies to navigate workplace hierarchy friction and earn fair advancement.",
  },
  {
    slug: "sun-authority-issues",
    title: "Vedic Remedies for Sun-Related Authority Issues",
    planet: "Sun",
    sanskrit: "सूर्य",
    day: "Sunday",
    deity: "Lord Surya",
    summary: "Balancing healthy self-respect with humility in interactions with superiors and elders.",
  },
  {
    slug: "sun-job-loss",
    title: "Vedic Remedies for Job Loss: Strengthen Sun (Surya)",
    planet: "Sun",
    sanskrit: "सूर्य",
    day: "Sunday",
    deity: "Lord Surya",
    summary: "Rebuilding inner dignity, professional confidence, and purpose after career setbacks.",
  },
  {
    slug: "sun-business-failure",
    title: "Vedic Remedies for Business Failure: Sun (Surya)",
    planet: "Sun",
    sanskrit: "सूर्य",
    day: "Sunday",
    deity: "Lord Surya",
    summary: "Vedic principles for restoring decisive leadership, executive willpower, and perseverance.",
  },
];

export default function RemediesDirectoryPage() {
  return (
    <div className="seo-page-wrapper">
      {/* Top Navigation */}
      <header className="seo-header-bar">
        <div className="seo-header-inner">
          <Link href="/" className="seo-brand">
            <Orbit size={24} strokeWidth={1.8} className="seo-brand-icon" />
            <span className="seo-brand-text">Graha Remedy</span>
          </Link>

          <nav className="seo-breadcrumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span className="crumb-sep">/</span>
            <span className="crumb-current">Remedies Library</span>
          </nav>

          <Link href="/" className="btn btn-primary btn-sm seo-nav-cta">
            <Compass size={14} /> Birth Chart Calculator
          </Link>
        </div>
      </header>

      {/* Hero Directory Header */}
      <main className="directory-main">
        <section className="directory-hero">
          <div className="directory-badge">
            <BookOpen size={15} /> Authentic Vedic Knowledge Base · 18 Comprehensive Guides
          </div>
          <h1 className="directory-title">Vedic Mantra &amp; Planetary Remedy Library</h1>
          <p className="directory-subtitle">
            Explore classical Sanskrit mantras, 108 jaap vidhi, Saturday/weekday fasting rules,
            and charitable daan recommendations grounded in authentic Jyotish tradition.
          </p>

          <div className="directory-calculator-strip">
            <div className="strip-text">
              <strong>Need a customized reading for your birth chart?</strong> Enter your birth date, time, and place to identify your exact weak grahas.
            </div>
            <Link href="/" className="btn btn-secondary btn-sm strip-btn">
              <Sparkles size={14} /> Open Free Calculator
            </Link>
          </div>
        </section>

        {/* Section 1: The 9 Navagraha Mantras */}
        <section className="directory-section">
          <div className="section-header">
            <h2 className="section-title">The 9 Planetary Mantras (Navagraha)</h2>
            <p className="section-desc">
              Comprehensive chanting guides with Devanagari text, English transliterations, pronunciation guides, and step-by-step japa procedures.
            </p>
          </div>

          <div className="directory-grid">
            {MANTRAS.map((item) => (
              <article key={item.slug} className="directory-card">
                <div className="card-top">
                  <div className="card-planet-glyph" aria-hidden="true">
                    {item.sanskrit}
                  </div>
                  <div className="card-meta">
                    <span className="card-planet-name">{item.planet}</span>
                    <span className="card-day">
                      <Calendar size={12} /> {item.day}
                    </span>
                  </div>
                </div>

                <h3 className="card-title">
                  <Link href={`/remedies/${item.slug}`}>{item.title}</Link>
                </h3>

                {item.coreMantra && (
                  <div className="card-mantra-box">
                    <span className="mantra-label">Core Chanting Syllable</span>
                    <code className="mantra-code">{item.coreMantra}</code>
                  </div>
                )}

                <p className="card-summary">{item.summary}</p>

                <div className="card-footer">
                  <span className="card-deity">Deity: {item.deity}</span>
                  <Link href={`/remedies/${item.slug}`} className="card-link">
                    Read Guide <ArrowRight size={14} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Section 2: Dedicated Tantrik Beej Mantras */}
        <section className="directory-section">
          <div className="section-header">
            <h2 className="section-title">Dedicated Tantrik Beej Mantras (Seed Sounds)</h2>
            <p className="section-desc">
              High-intensity acoustic bija sadhana designed for critical astrological transits (Sade Sati, Kantaka Shani, Mahadasha, relationship discord).
            </p>
          </div>

          <div className="directory-grid">
            {BEEJ_MANTRAS.map((item) => (
              <article key={item.slug} className="directory-card">
                <div className="card-top">
                  <div className="card-planet-glyph" aria-hidden="true">
                    {item.sanskrit}
                  </div>
                  <div className="card-meta">
                    <span className="card-badge-small">{item.badge}</span>
                    <span className="card-day">
                      <Calendar size={12} /> {item.day}
                    </span>
                  </div>
                </div>

                <h3 className="card-title">
                  <Link href={`/remedies/${item.slug}`}>{item.title}</Link>
                </h3>

                {item.coreMantra && (
                  <div className="card-mantra-box">
                    <span className="mantra-label">Tantrik Bija Syllables</span>
                    <code className="mantra-code">{item.coreMantra}</code>
                  </div>
                )}

                <p className="card-summary">{item.summary}</p>

                <div className="card-footer">
                  <span className="card-deity">Deity: {item.deity}</span>
                  <Link href={`/remedies/${item.slug}`} className="card-link">
                    Read Beej Guide <ArrowRight size={14} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Section 3: Complete Planetary Remedy & Upaya Hubs */}
        <section className="directory-section">
          <div className="section-header">
            <h2 className="section-title">Planetary Remedy &amp; Upaya Guides</h2>
            <p className="section-desc">
              Holistic remedial roadmaps combining psychological balance, charity (daan), fasting (vrata), and deity worship for afflicted grahas.
            </p>
          </div>

          <div className="directory-grid">
            {REMEDY_HUBS.map((item) => (
              <article key={item.slug} className="directory-card">
                <div className="card-top">
                  <div className="card-planet-glyph" aria-hidden="true">
                    {item.sanskrit}
                  </div>
                  <div className="card-meta">
                    <span className="card-badge-small">{item.badge}</span>
                    <span className="card-day">
                      <Calendar size={12} /> {item.day}
                    </span>
                  </div>
                </div>

                <h3 className="card-title">
                  <Link href={`/remedies/${item.slug}`}>{item.title}</Link>
                </h3>

                <p className="card-summary">{item.summary}</p>

                <div className="card-footer">
                  <span className="card-deity">Deity: {item.deity}</span>
                  <Link href={`/remedies/${item.slug}`} className="card-link">
                    Explore Upayas <ArrowRight size={14} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Section 4: Life Solutions & Specialized Guides */}
        <section className="directory-section">
          <div className="section-header">
            <h2 className="section-title">Life Challenges &amp; Specific Remedial Solutions</h2>
            <p className="section-desc">
              Dedicated remedies for career stagnation, psychic energy protection (Nazar Dosha), workplace friction, and business obstacles.
            </p>
          </div>

          <div className="directory-grid directory-grid-compact">
            {SPECIAL_SOLUTIONS.map((item) => (
              <article key={item.slug} className="directory-card directory-card-compact">
                <div className="card-top">
                  <span className="card-badge-small">{item.badge || item.planet}</span>
                  <span className="card-day">
                    <Calendar size={12} /> {item.day}
                  </span>
                </div>

                <h3 className="card-title">
                  <Link href={`/remedies/${item.slug}`}>{item.title}</Link>
                </h3>

                <p className="card-summary">{item.summary}</p>

                <div className="card-footer">
                  <Link href={`/remedies/${item.slug}`} className="card-link">
                    View Protocol <ArrowRight size={14} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Bottom Banner */}
        <section className="directory-bottom-cta">
          <div className="cta-icon-circle">
            <Compass size={32} />
          </div>
          <h2 className="cta-title">Looking for Personalized Remedies?</h2>
          <p className="cta-desc">
            Instead of guessing which planet is causing friction, calculate your full Vedic birth chart.
            Our 100% deterministic engine computes your lagna, active dasha, and specific afflicted grahas with zero AI hallucination.
          </p>
          <Link href="/" className="btn btn-primary btn-lg">
            <Sparkles size={18} /> Launch Free Birth Chart Analysis
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="seo-article-footer" style={{ maxWidth: 1080, margin: "0 auto", padding: "32px 20px" }}>
        <p className="seo-disclaimer">
          Disclaimer: Vedic mantras and astrology remedies are spiritual practices for personal self-discipline and meditation. They are not substitutes for medical, psychological, legal, or financial professional care.
        </p>
        <div className="seo-footer-nav">
          <Link href="/">Home</Link>
          <span>•</span>
          <Link href="/remedies">All Remedies</Link>
          <span>•</span>
          <Link href="/remedies/vedic-astrology-remedies">Vedic Remedies Guide</Link>
          <span>•</span>
          <Link href="/remedies/career-astrology">Career Astrology</Link>
          <span>•</span>
          <Link href="/remedies/shani-mantra">Shani Mantra</Link>
          <span>•</span>
          <Link href="/remedies/rahu-mantra">Rahu Mantra</Link>
        </div>
      </footer>
    </div>
  );
}
