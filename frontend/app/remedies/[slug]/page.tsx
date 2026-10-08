import fs from "node:fs/promises";
import path from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  Calendar,
  Check,
  Compass,
  Orbit,
  RotateCcw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

interface SeoPage {
  seo_title: string;
  meta_desc: string;
  content_html: string;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

const SEO_PAGES_DIR = path.resolve(process.cwd(), "../data/seo_pages");
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.graharemedy.com";
const SAFE_SLUG = /^[a-z0-9_-]+$/;

export const dynamicParams = false;

// oxlint-disable-next-line react/only-export-components -- App Router uses this build-time export.
export async function generateStaticParams() {
  try {
    const filenames = await fs.readdir(SEO_PAGES_DIR);
    const jsonFiles = filenames.filter((f) => f.endsWith(".json"));
    const slugs = new Set<string>();
    // Only canonical (hyphenated) slugs are pages; underscore variants redirect (next.config.js).
    for (const f of jsonFiles) {
      slugs.add(f.slice(0, -".json".length).replace(/_/g, "-"));
    }
    return [...slugs].map((slug) => ({ slug }));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

async function readSeoPage(slug: string): Promise<SeoPage> {
  if (!SAFE_SLUG.test(slug)) notFound();

  const candidates = [slug, slug.replace(/-/g, "_"), slug.replace(/_/g, "-")];
  for (const name of candidates) {
    try {
      const content = await fs.readFile(path.join(SEO_PAGES_DIR, `${name}.json`), "utf8");
      return JSON.parse(content) as SeoPage;
    } catch {
      // try next candidate
    }
  }
  notFound();
}

// oxlint-disable-next-line react/only-export-components -- App Router metadata belongs with the route.
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await readSeoPage(slug);
  const canonicalUrl = `${SITE_URL}/remedies/${slug.replace(/_/g, "-")}`;

  return {
    title: page.seo_title,
    description: page.meta_desc,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: page.seo_title,
      description: page.meta_desc,
      url: canonicalUrl,
      type: "article",
      siteName: "Graha Remedy",
    },
    twitter: {
      card: "summary_large_image",
      title: page.seo_title,
      description: page.meta_desc,
    },
  };
}

function partitionContent(html: string): { part1: string; part2: string; part3: string } {
  const sections = html.split(/(?=<h2>)/i);
  if (sections.length <= 4) {
    return { part1: html, part2: "", part3: "" };
  }

  const cut1 = Math.min(3, Math.max(2, Math.floor(sections.length * 0.4)));
  const cut2 = Math.min(sections.length - 1, Math.max(cut1 + 2, Math.floor(sections.length * 0.75)));

  return {
    part1: sections.slice(0, cut1).join(""),
    part2: sections.slice(cut1, cut2).join(""),
    part3: sections.slice(cut2).join(""),
  };
}

export default async function RemedyPage({ params }: PageProps) {
  const { slug } = await params;
  const canonicalSlug = slug.replace(/_/g, "-");
  const canonicalUrl = `${SITE_URL}/remedies/${canonicalSlug}`;
  const page = await readSeoPage(slug);
  const titleDisplay = page.seo_title.split(":")[0];
  const { part1, part2, part3 } = partitionContent(page.content_html);

  // Schema.org structured data (Article & Breadcrumbs)
  const schemaBreadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Remedies Library",
        item: `${SITE_URL}/remedies`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: page.seo_title,
        item: canonicalUrl,
      },
    ],
  };

  const schemaArticle = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: page.seo_title,
    description: page.meta_desc,
    author: {
      "@type": "Organization",
      name: "Graha Remedy Vedic Editorial Team",
      url: `${SITE_URL}/about`,
    },
    publisher: {
      "@type": "Organization",
      name: "Graha Remedy",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/favicon.svg`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
  };

  return (
    <div className="seo-page-wrapper">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaBreadcrumbs) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaArticle) }}
      />

      {/* Top Navigation & Breadcrumb (Touchpoint 1) */}
      <header className="seo-header-bar">
        <div className="seo-header-inner">
          <Link href="/" className="seo-brand">
            <Orbit size={24} strokeWidth={1.8} className="seo-brand-icon" />
            <span className="seo-brand-text">Graha Remedy</span>
          </Link>

          <nav className="seo-breadcrumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span className="crumb-sep">/</span>
            <Link href="/remedies">Remedies</Link>
            <span className="crumb-sep">/</span>
            <span className="crumb-current">{titleDisplay}</span>
          </nav>

          <Link href="/" className="btn btn-secondary btn-sm seo-nav-cta">
            <Sparkles size={14} /> Free Calculator
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="seo-page-main">
        <article className="seo-article">
          <h1 className="seo-article-title">{page.seo_title}</h1>

          {/* Quick-Action CTA (Touchpoint 2 - Above the Fold) */}
          <div className="seo-callout-card">
            <div className="seo-callout-icon-box">
              <Compass size={24} strokeWidth={1.8} />
            </div>
            <div className="seo-callout-body">
              <div className="seo-callout-badge">Free Planetary Diagnostic</div>
              <h3 className="seo-callout-title">Are Your Planetary Placements Supporting You?</h3>
              <p className="seo-callout-text">
                In Vedic astrology, remedies depend heavily on whether a planet is a functional benefic or malefic in your specific lagna (ascendant). Use our free birth chart engine to diagnose your exact planetary strengths and personalized remedies.
              </p>
            </div>
            <div className="seo-callout-action">
              <Link href="/" className="btn btn-primary btn-sm seo-callout-btn">
                Analyze My Kundali <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Part 1: Significance & Core Mantras */}
          <div
            className="seo-content"
            dangerouslySetInnerHTML={{ __html: part1 }}
          />

          {/* Inline CTA 1 (Touchpoint 3 - Post-Mantras / Dasha Diagnostic) */}
          {part2 && (
            <div className="seo-inline-cta seo-inline-cta-dasha">
              <div className="seo-inline-cta-icon">
                <RotateCcw size={22} strokeWidth={1.8} />
              </div>
              <div className="seo-inline-cta-body">
                <span className="seo-inline-badge">Dasha Alignment Check</span>
                <h4 className="seo-inline-title">Not Sure Which Mantra Matches Your Active Period?</h4>
                <p className="seo-inline-text">
                  Chanting intense seed mantras for an already dominant or benefic planet can create unexpected friction. Check your active Vimshottari Mahadasha and planetary balances first.
                </p>
              </div>
              <Link href="/" className="btn btn-secondary btn-sm seo-inline-btn">
                Check My Active Dasha <ArrowRight size={14} />
              </Link>
            </div>
          )}

          {/* Part 2: Jaap Vidhi, Deity & Complementary Remedies */}
          {part2 && (
            <div
              className="seo-content"
              dangerouslySetInnerHTML={{ __html: part2 }}
            />
          )}

          {/* Inline CTA 2 (Touchpoint 4 - Post-Remedies / Fasting & Daan Calendar) */}
          {part3 && (
            <div className="seo-inline-cta seo-inline-cta-schedule">
              <div className="seo-inline-cta-icon icon-gold">
                <Calendar size={22} strokeWidth={1.8} />
              </div>
              <div className="seo-inline-cta-body">
                <span className="seo-inline-badge badge-gold">Weekly Routine Plan</span>
                <h4 className="seo-inline-title">Get a Coordinated Fasting, Daan &amp; Puja Schedule</h4>
                <p className="seo-inline-text">
                  Our Jyotish engine cross-references your exact birth details with classical texts to generate an actionable spiritual routine tailored to your life challenges.
                </p>
              </div>
              <Link href="/" className="btn btn-primary btn-sm seo-inline-btn">
                Generate Routine Plan <ArrowRight size={14} />
              </Link>
            </div>
          )}

          {/* Part 3: Key Takeaways, FAQs & Closing Notes */}
          <div
            className="seo-content"
            dangerouslySetInnerHTML={{ __html: part3 || part1 }}
          />

          {/* Master CTA Box (Touchpoint 5 - Bottom High-Converting Engine) */}
          <section className="seo-master-cta">
            <div className="seo-master-cta-inner">
              <div className="seo-master-badge">
                <ShieldCheck size={16} /> 100% Deterministic Vedic Logic · Zero AI Hallucination
              </div>
              <h2 className="seo-master-title">Get Your Personalized Vedic Remedy Roadmap</h2>
              <p className="seo-master-desc">
                Classical Jyotish remedies work best when calibrated to your precise birth time, geographic coordinates, and active dasha periods.
              </p>

              <ul className="seo-master-features">
                <li>
                  <Check size={16} className="feature-check" />
                  <span><strong>Targeted Mantras:</strong> Specific daily chant recommendations &amp; counts for afflicted grahas</span>
                </li>
                <li>
                  <Check size={16} className="feature-check" />
                  <span><strong>Vrat (Fasting):</strong> Personalized day-of-week fasting schedules aligned with transit cycles</span>
                </li>
                <li>
                  <Check size={16} className="feature-check" />
                  <span><strong>Daan (Charity):</strong> Time-tested Vedic giving recommendations to balance negative karmic debt</span>
                </li>
                <li>
                  <Check size={16} className="feature-check" />
                  <span><strong>100% Free Forever:</strong> No paywalls, no upsells, and no data tracking</span>
                </li>
              </ul>

              <div className="seo-master-action">
                <Link href="/" className="btn btn-primary btn-lg seo-master-btn">
                  <Sparkles size={18} /> Start Free Remedy Analysis
                </Link>
                <span className="seo-master-subtext">Takes 60 seconds · Instant chart &amp; remedies</span>
              </div>
            </div>
          </section>

          {/* Footer Disclaimer & Links */}
          <footer className="seo-article-footer">
            <p className="seo-disclaimer">
              Spiritual Disclaimer: Vedic mantras and remedies are devotional and introspective disciplines rooted in classical Jyotish tradition. They are intended for self-cultivation and should never replace qualified professional medical, psychiatric, legal, or financial assistance.
            </p>
            <div className="seo-footer-nav">
              <Link href="/">Home</Link>
              <span>•</span>
              <Link href="/remedies">Remedies Library</Link>
              <span>•</span>
              <Link href="/about">About Us</Link>
              <span>•</span>
              <Link href="/privacy-policy">Privacy Policy</Link>
              <span>•</span>
              <Link href="/terms">Terms of Service</Link>
            </div>
          </footer>
        </article>
      </main>
    </div>
  );
}
