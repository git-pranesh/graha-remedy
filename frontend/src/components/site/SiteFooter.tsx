import Link from "next/link";
import { Orbit } from "lucide-react";
import { LANGUAGES, LEGAL, NAV } from "../../lib/nav";

const SOURCE_URL = "https://github.com/git-pranesh/graha-remedy";

export default function SiteFooter() {
  return (
    <footer className="sf">
      <div className="sf-inner">
        <div className="sf-brand">
          <Link href="/" className="sf-logo">
            <Orbit size={22} strokeWidth={1.8} />
            <span>Graha Remedy</span>
          </Link>
          <p>
            Free Vedic astrology: daily panchang, festival dates, birth-chart calculators and classical remedies — calculated with the Swiss
            Ephemeris, no AI-written readings.
          </p>
          <div className="sf-langs" aria-label="Languages">
            {LANGUAGES.map((l) => (
              <Link key={l.href} href={l.href} lang={l.lang} hrefLang={l.lang}>{l.label}</Link>
            ))}
          </div>
        </div>

        {NAV.map((s) => (
          <nav key={s.id} className="sf-col" aria-label={s.label}>
            <h2 className="sf-heading"><Link href={s.href}>{s.label}</Link></h2>
            <ul>
              {s.columns.flatMap((c) => c.links).filter((l, i, a) => a.findIndex((x) => x.href === l.href) === i).slice(0, s.id === "panchang" ? 14 : 12).map((l) => (
                <li key={l.href}><Link href={l.href}>{l.label}</Link></li>
              ))}
              {s.viewAll && <li className="sf-all"><Link href={s.viewAll.href}>{s.viewAll.label}</Link></li>}
            </ul>
          </nav>
        ))}

        <nav className="sf-col" aria-label="About">
          <h2 className="sf-heading">About</h2>
          <ul>
            {LEGAL.map((l) => (
              <li key={l.href}><Link href={l.href}>{l.label}</Link></li>
            ))}
            <li><a href={SOURCE_URL} target="_blank" rel="noopener">Source code (GitHub)</a></li>
          </ul>
        </nav>
      </div>

      <div className="sf-bottom">
        <p>
          Vedic mantras and remedies are devotional practices for spiritual introspection. Astrology is a traditional belief system; nothing here is
          medical, legal or financial advice.
        </p>
        <p className="sf-license">
          Graha Remedy is free and open-source software licensed under the{" "}
          <a href="https://www.gnu.org/licenses/agpl-3.0.html" rel="license noopener" target="_blank">GNU AGPL-3.0</a>.{" "}
          <a href={SOURCE_URL} rel="noopener" target="_blank">Source code</a>. Astronomical calculations use the Swiss Ephemeris. Place data from{" "}
          <a href="https://www.geonames.org" rel="noopener" target="_blank">GeoNames</a> (
          <a href="https://creativecommons.org/licenses/by/4.0/" rel="license noopener" target="_blank">CC BY 4.0</a>).
        </p>
      </div>
    </footer>
  );
}
