import type { ReactNode } from "react";
import Link from "next/link";
import { Orbit, Sparkles } from "lucide-react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.graharemedy.com";

export interface Crumb {
  name: string;
  path: string; // "/panchang"
}

interface Props {
  crumbs: Crumb[]; // excluding Home; last item is the current page
  schema?: Record<string, unknown>[];
  children: ReactNode;
  footerNote?: ReactNode;
}

/** Header with breadcrumbs, article container and footer for content pages. */
export default function ContentShell({ crumbs, schema = [], children, footerNote }: Props) {
  const breadcrumb = {
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Home", path: "" }, ...crumbs].map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: `${SITE_URL}${c.path}`,
    })),
  };
  const graph = { "@context": "https://schema.org", "@graph": [breadcrumb, ...schema] };
  const current = crumbs[crumbs.length - 1];

  return (
    <div className="seo-page-wrapper">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }} />
      <header className="seo-header-bar">
        <div className="seo-header-inner">
          <Link href="/" className="seo-brand">
            <Orbit size={24} strokeWidth={1.8} className="seo-brand-icon" />
            <span className="seo-brand-text">Graha Remedy</span>
          </Link>
          <nav className="seo-breadcrumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            {crumbs.slice(0, -1).map((c) => (
              <span key={c.path}>
                <span className="crumb-sep">/</span>
                <Link href={c.path}>{c.name}</Link>
              </span>
            ))}
            <span className="crumb-sep">/</span>
            <span className="crumb-current">{current.name}</span>
          </nav>
          <Link href="/" className="btn btn-secondary btn-sm seo-nav-cta">
            <Sparkles size={14} /> Remedy Finder
          </Link>
        </div>
      </header>
      <main className="seo-page-main">
        <article className="seo-article tool-article">
          {children}
          <footer className="seo-article-footer">
            {footerNote && <p className="seo-disclaimer">{footerNote}</p>}
            <div className="seo-footer-nav">
              <Link href="/">Home</Link>
              <span>•</span>
              <Link href="/panchang">Panchang</Link>
              <span>•</span>
              <Link href="/rahu-kaal">Rahu Kaal</Link>
              <span>•</span>
              <Link href="/choghadiya">Choghadiya</Link>
              <span>•</span>
              <Link href="/ekadashi">Ekadashi</Link>
              <span>•</span>
              <Link href="/calculators">Calculators</Link>
              <span>•</span>
              <Link href="/about">About &amp; Methodology</Link>
              <span>•</span>
              <Link href="/contact">Contact &amp; Corrections</Link>
            </div>
          </footer>
        </article>
      </main>
    </div>
  );
}

export const PANCHANG_METHOD_NOTE =
  "Calculated with the Swiss Ephemeris for the city's coordinates: sidereal positions with Lahiri ayanamsa; sunrise and sunset at the Sun's upper limb with standard refraction; the panchang day runs from sunrise to the next sunrise. Times are local, include daylight saving where it applies, and are rounded to the nearest minute — other panchangs may differ by about a minute because of rounding and conventions.";
