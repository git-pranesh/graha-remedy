import type { ReactNode } from "react";
import Link from "next/link";
import { Orbit, Sparkles } from "lucide-react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.graharemedy.com";

export interface Crumb {
  name: string;
  path: string; // "/panchang"
}

interface Props {
  lang?: "en" | "hi";
  /** Link to the same page in the other language. */
  switchTo?: { href: string; label: string };
  /** Path prefix for breadcrumb/footer links (e.g. "/hi"). */
  crumbs: Crumb[]; // excluding Home; last item is the current page
  schema?: Record<string, unknown>[];
  children: ReactNode;
  footerNote?: ReactNode;
}

/** Header with breadcrumbs, article container and footer for content pages. */
export default function ContentShell({ lang = "en", switchTo, crumbs, schema = [], children, footerNote }: Props) {
  const hi = lang === "hi";
  const links: [string, string][] = hi
    ? [["/", "होम"], ["/hi/panchang", "पंचांग"], ["/hi/choghadiya", "चौघड़िया"], ["/hi/ekadashi", "एकादशी"], ["/hi/amavasya", "अमावस्या"], ["/hi/purnima", "पूर्णिमा"], ["/about", "About (English)"], ["/contact", "संपर्क / सुधार"]]
    : [["/", "Home"], ["/panchang", "Panchang"], ["/rahu-kaal", "Rahu Kaal"], ["/choghadiya", "Choghadiya"], ["/ekadashi", "Ekadashi"], ["/calculators", "Calculators"], ["/about", "About & Methodology"], ["/contact", "Contact & Corrections"]];
  const breadcrumb = {
    "@type": "BreadcrumbList",
    itemListElement: [{ name: hi ? "होम" : "Home", path: hi ? "/hi" : "" }, ...crumbs].map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: `${SITE_URL}${c.path}`,
    })),
  };
  const graph = { "@context": "https://schema.org", "@graph": [breadcrumb, ...schema] };
  const current = crumbs[crumbs.length - 1];

  return (
    <div className="seo-page-wrapper" lang={lang}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }} />
      <header className="seo-header-bar">
        <div className="seo-header-inner">
          <Link href="/" className="seo-brand">
            <Orbit size={24} strokeWidth={1.8} className="seo-brand-icon" />
            <span className="seo-brand-text">Graha Remedy</span>
          </Link>
          <nav className="seo-breadcrumbs" aria-label="Breadcrumb">
            <Link href={hi ? "/hi" : "/"}>{hi ? "होम" : "Home"}</Link>
            {crumbs.slice(0, -1).map((c) => (
              <span key={c.path}>
                <span className="crumb-sep">/</span>
                <Link href={c.path}>{c.name}</Link>
              </span>
            ))}
            <span className="crumb-sep">/</span>
            <span className="crumb-current">{current.name}</span>
          </nav>
          {switchTo && (
            <Link href={switchTo.href} className="nav-link" hrefLang={lang === "hi" ? "en" : "hi"} lang={lang === "hi" ? "en" : "hi"}>
              {switchTo.label}
            </Link>
          )}
          <Link href="/" className="btn btn-secondary btn-sm seo-nav-cta">
            <Sparkles size={14} /> {hi ? "उपाय खोजें" : "Remedy Finder"}
          </Link>
        </div>
      </header>
      <main className="seo-page-main">
        <article className="seo-article tool-article">
          {children}
          <footer className="seo-article-footer">
            {footerNote && <p className="seo-disclaimer">{footerNote}</p>}
            <div className="seo-footer-nav">
              {links.map(([href, label], i) => (
                <span key={href}>
                  {i > 0 && <span> • </span>}
                  <Link href={href}>{label}</Link>
                </span>
              ))}
            </div>
          </footer>
        </article>
      </main>
    </div>
  );
}

export const PANCHANG_METHOD_NOTE =
  "Calculated with the Swiss Ephemeris for the city's coordinates: sidereal positions with Lahiri ayanamsa; sunrise and sunset at the Sun's upper limb with standard refraction; the panchang day runs from sunrise to the next sunrise. Times are local, include daylight saving where it applies, and are rounded to the nearest minute — other panchangs may differ by about a minute because of rounding and conventions.";
