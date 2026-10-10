import type { ReactNode } from "react";
import Link from "next/link";
import Breadcrumbs from "./Breadcrumbs";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.graharemedy.com";

export interface Crumb {
  name: string;
  path: string; // "/panchang"
}

interface Props {
  lang?: "en" | "hi" | "te" | "ta";
  /** Link to the same page in the other language. */
  switchTo?: { href: string; label: string };
  crumbs: Crumb[]; // excluding Home; last item is the current page
  schema?: Record<string, unknown>[];
  children: ReactNode;
  footerNote?: ReactNode;
}

const HOME = {
  en: { label: "Home", path: "/" },
  hi: { label: "होम", path: "/hi" },
  te: { label: "హోమ్", path: "/te/panchangam" },
  ta: { label: "முகப்பு", path: "/ta/panchangam" },
};

/** Breadcrumbs, article container and method note for content pages. Site header/footer come from the root layout. */
export default function ContentShell({ lang = "en", switchTo, crumbs, schema = [], children, footerNote }: Props) {
  const home = HOME[lang];
  const breadcrumb = {
    "@type": "BreadcrumbList",
    itemListElement: [{ name: home.label, path: home.path === "/" ? "" : home.path }, ...crumbs].map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: `${SITE_URL}${c.path}`,
    })),
  };
  const graph = { "@context": "https://schema.org", "@graph": [breadcrumb, ...schema] };

  return (
    <div className="seo-page-wrapper" lang={lang}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }} />
      <main className="seo-page-main">
        <div className="crumbs-bar">
          <Breadcrumbs items={crumbs} homeLabel={home.label} homeHref={home.path} />
          {switchTo && (
            <Link href={switchTo.href} className="crumbs-switch" hrefLang={lang === "en" ? undefined : "en"}>
              {switchTo.label}
            </Link>
          )}
        </div>
        <article className="seo-article tool-article">
          {children}
          {footerNote && (
            <footer className="seo-article-footer">
              <p className="seo-disclaimer">{footerNote}</p>
            </footer>
          )}
        </article>
      </main>
    </div>
  );
}

export const PANCHANG_METHOD_NOTE =
  "Calculated with the Swiss Ephemeris for the city's coordinates: sidereal positions with Lahiri ayanamsa; sunrise and sunset at the Sun's upper limb with standard refraction; the panchang day runs from sunrise to the next sunrise. Times are local, include daylight saving where it applies, and are rounded to the nearest minute — other panchangs may differ by about a minute because of rounding and conventions.";
