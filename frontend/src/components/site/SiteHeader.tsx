"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Globe, Menu, Orbit, Sparkles, X } from "lucide-react";
import { LANGUAGES, NAV } from "../../lib/nav";

function isActive(pathname: string, section: (typeof NAV)[number]): boolean {
  const hrefs = [section.href, ...section.columns.flatMap((c) => c.links.map((l) => l.href))].filter((h) => h !== "/");
  return hrefs.some((h) => pathname === h || pathname.startsWith(h + "/"));
}

export default function SiteHeader() {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState<string | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [accordion, setAccordion] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close menus on navigation.
  useEffect(() => {
    setOpen(null);
    setDrawer(false);
  }, [pathname]);

  // Outside click and Escape.
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpen(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(null);
        setDrawer(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // Lock page scroll while the mobile drawer is open.
  useEffect(() => {
    document.body.style.overflow = drawer ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawer]);

  const hoverOk = useCallback(() => typeof window !== "undefined" && window.matchMedia("(hover: hover) and (min-width: 1024px)").matches, []);
  const enter = (id: string) => {
    if (!hoverOk()) return;
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(id);
  };
  const leave = () => {
    if (!hoverOk()) return;
    closeTimer.current = setTimeout(() => setOpen(null), 120);
  };

  return (
    <header className="sh">
      <a href="#content" className="sh-skip">Skip to content</a>
      <div className="sh-inner">
        <Link href="/" className="sh-brand" aria-label="Graha Remedy home">
          <Orbit size={26} strokeWidth={1.8} className="sh-brand-icon" />
          <span>Graha Remedy</span>
        </Link>

        <nav className="sh-nav" aria-label="Main" ref={navRef}>
          {NAV.map((s) => {
            const expanded = open === s.id;
            return (
              <div key={s.id} className="sh-item" onMouseEnter={() => enter(s.id)} onMouseLeave={leave}>
                <button
                  type="button"
                  className={`sh-trigger${isActive(pathname, s) ? " active" : ""}${expanded ? " open" : ""}`}
                  aria-expanded={expanded}
                  aria-controls={`menu-${s.id}`}
                  onClick={() => setOpen(expanded ? null : s.id)}
                >
                  {s.label}
                  <ChevronDown size={14} className="sh-chev" aria-hidden />
                </button>
                {expanded && (
                  <div className="sh-panel" id={`menu-${s.id}`}>
                    <div className="sh-cols">
                      {s.columns.map((c) => (
                        <div key={c.title} className="sh-col">
                          <div className="sh-col-title">{c.title}</div>
                          <ul>
                            {c.links.map((l) => (
                              <li key={l.href + l.label}>
                                <Link href={l.href}>{l.label}</Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                    {s.viewAll && (
                      <div className="sh-panel-foot">
                        <Link href={s.viewAll.href}>{s.viewAll.label}</Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="sh-right">
          <div className="sh-item sh-lang" onMouseEnter={() => enter("lang")} onMouseLeave={leave}>
            <button
              type="button"
              className={`sh-trigger sh-lang-btn${open === "lang" ? " open" : ""}`}
              aria-expanded={open === "lang"}
              aria-label="Language"
              onClick={() => setOpen(open === "lang" ? null : "lang")}
            >
              <Globe size={16} aria-hidden />
              <span className="sh-lang-text">Language</span>
              <ChevronDown size={14} className="sh-chev" aria-hidden />
            </button>
            {open === "lang" && (
              <div className="sh-panel sh-panel-lang">
                <ul>
                  {LANGUAGES.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} lang={l.lang} hrefLang={l.lang}>{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <Link href="/" className="btn btn-primary btn-sm sh-cta">
            <Sparkles size={14} /> Find My Remedies
          </Link>
          <button type="button" className="sh-burger" aria-label={drawer ? "Close menu" : "Open menu"} aria-expanded={drawer} onClick={() => setDrawer(!drawer)}>
            {drawer ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {drawer && (
        <div className="sh-drawer" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="sh-drawer-body">
            <Link href="/" className="btn btn-primary sh-drawer-cta">
              <Sparkles size={16} /> Find My Remedies
            </Link>
            {NAV.map((s) => {
              const exp = accordion === s.id;
              return (
                <div key={s.id} className="sh-acc">
                  <button type="button" className={`sh-acc-btn${isActive(pathname, s) ? " active" : ""}`} aria-expanded={exp} onClick={() => setAccordion(exp ? null : s.id)}>
                    {s.label}
                    <ChevronDown size={18} className={`sh-chev${exp ? " flip" : ""}`} aria-hidden />
                  </button>
                  {exp && (
                    <div className="sh-acc-panel">
                      {s.columns.map((c) => (
                        <div key={c.title}>
                          <div className="sh-col-title">{c.title}</div>
                          <ul>
                            {c.links.map((l) => (
                              <li key={l.href + l.label}><Link href={l.href}>{l.label}</Link></li>
                            ))}
                          </ul>
                        </div>
                      ))}
                      {s.viewAll && <Link href={s.viewAll.href} className="sh-viewall">{s.viewAll.label}</Link>}
                    </div>
                  )}
                </div>
              );
            })}
            <div className="sh-drawer-lang">
              <div className="sh-col-title">Language</div>
              <div className="sh-lang-row">
                {LANGUAGES.map((l) => (
                  <Link key={l.href} href={l.href} lang={l.lang} hrefLang={l.lang} className="sh-lang-chip">{l.label}</Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
