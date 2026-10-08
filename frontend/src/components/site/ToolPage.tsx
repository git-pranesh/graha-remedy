import type { ReactNode } from "react";
import Link from "next/link";
import { Orbit, Sparkles } from "lucide-react";
import { TOOLS, toolBySlug } from "../../lib/tools";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.graharemedy.com";

export interface Faq {
  q: string;
  a: string;
}

interface Props {
  slug: string;
  h1: string;
  /** One- or two-sentence direct answer shown under the H1. */
  lead: ReactNode;
  calculator: ReactNode;
  children: ReactNode;
  faqs: Faq[];
  updated: string; // ISO date the methodology/content was last reviewed
}

/** Server-rendered shell for standalone calculator pages. */
export default function ToolPage({ slug, h1, lead, calculator, children, faqs, updated }: Props) {
  const tool = toolBySlug(slug);
  const url = `${SITE_URL}/${slug}`;
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": `${url}#app`,
        name: tool.name,
        url,
        description: tool.description,
        applicationCategory: "LifestyleApplication",
        operatingSystem: "Any (web browser)",
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Calculators", item: `${SITE_URL}/calculators` },
          { "@type": "ListItem", position: 3, name: tool.name, item: url },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  return (
    <div className="seo-page-wrapper">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <header className="seo-header-bar">
        <div className="seo-header-inner">
          <Link href="/" className="seo-brand">
            <Orbit size={24} strokeWidth={1.8} className="seo-brand-icon" />
            <span className="seo-brand-text">Graha Remedy</span>
          </Link>
          <nav className="seo-breadcrumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span className="crumb-sep">/</span>
            <Link href="/calculators">Calculators</Link>
            <span className="crumb-sep">/</span>
            <span className="crumb-current">{tool.name}</span>
          </nav>
          <Link href="/" className="btn btn-secondary btn-sm seo-nav-cta">
            <Sparkles size={14} /> Remedy Finder
          </Link>
        </div>
      </header>

      <main className="seo-page-main">
        <article className="seo-article tool-article">
          <h1 className="seo-article-title">{h1}</h1>
          <div className="tool-lead">{lead}</div>

          {calculator}

          <div className="seo-content">{children}</div>

          <section className="seo-content">
            <h2>Frequently asked questions</h2>
            {faqs.map((f) => (
              <details key={f.q} className="tool-faq">
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </section>

          <section className="tool-related">
            <h2>More free Vedic calculators</h2>
            <ul>
              {TOOLS.filter((t) => t.slug !== slug).map((t) => (
                <li key={t.slug}>
                  <Link href={`/${t.slug}`}>{t.name}</Link>
                </li>
              ))}
              <li>
                <Link href="/">Personalised remedy finder</Link>
              </li>
            </ul>
          </section>

          <footer className="seo-article-footer">
            <p className="seo-disclaimer">
              Method: sidereal zodiac with Lahiri (Chitrapaksha) ayanamsa, mean lunar node for Rahu and Ketu, whole-sign
              houses, Vimshottari years of 365.25 days. Planetary positions from the Swiss Ephemeris. Last reviewed{" "}
              {updated}. Astrology is a traditional belief system; results are not medical, legal or financial advice.
            </p>
            <div className="seo-footer-nav">
              <Link href="/">Home</Link>
              <span>•</span>
              <Link href="/calculators">Calculators</Link>
              <span>•</span>
              <Link href="/remedies">Remedies Library</Link>
              <span>•</span>
              <Link href="/about">About &amp; Methodology</Link>
              <span>•</span>
              <Link href="/contact">Contact &amp; Corrections</Link>
              <span>•</span>
              <Link href="/privacy-policy">Privacy Policy</Link>
            </div>
          </footer>
        </article>
      </main>
    </div>
  );
}
