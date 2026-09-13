"use client";

import { useState, useEffect, type ReactNode } from "react";
import {
  BookOpen,
  Calculator,
  Check,
  ChevronDown,
  ChevronRight,
  Compass,
  Gift,
  Globe,
  Home,
  Landmark,
  Lightbulb,
  MapPin,
  Orbit,
  Printer,
  RefreshCw,
  ScrollText,
  Sparkles,
  Sprout,
  TriangleAlert,
  Utensils,
} from "lucide-react";
import { PROBLEM_CATEGORIES } from "../types";
import { CategoryIcon, DiyaIcon, OmMark } from "./icons";
import type { ChartResult, PersonalizedResult, RemedyEntry, UniversalRemedies, UniversalMantra } from "../types";
import SaveReportBox from "./SaveReportBox";

interface Props {
  chartResult: ChartResult;
  personalizedResult: PersonalizedResult;
  universalRemedies?: UniversalRemedies | null;
  onBack: () => void;
  onRestart: () => void;
  /** Read-only mode (e.g. viewing a shared report) — hides nav/actions */
  readOnly?: boolean;
}

/* Severity labels removed — replaced by diagnostic factors checklist */

/* ─── Accordion Section ───────────────────────────────────────── */

function AccordionSection({
  title,
  icon,
  defaultOpen = false,
  forceOpen = false,
  children,
}: {
  title: string;
  icon?: ReactNode;
  defaultOpen?: boolean;
  forceOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const isOpen = forceOpen || open;
  return (
    <div className={`accordion ${isOpen ? "accordion-open" : ""}`}>
      <button
        type="button"
        className="accordion-header"
        onClick={() => setOpen(!open)}
      >
        <span className="accordion-icon">{icon ?? <ChevronRight size={16} />}</span>
        <span className="accordion-title">{title}</span>
        <span className="accordion-chevron">
          {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </span>
      </button>
      {isOpen && <div className="accordion-body">{children}</div>}
    </div>
  );
}

/* ─── Google Maps link helper ─────────────────────────────────── */

function mapsLink(deity: string): string {
  const q = encodeURIComponent(`${deity} temple near me`);
  return `https://www.google.com/maps/search/${q}`;
}

/* ─── Main Component ──────────────────────────────────────────── */

/* Vedic (English → Sanskrit) name lookup for the planet table */
const GRAHA_NAMES: Record<string, string> = {
  Sun: "Surya (Sun)",
  Moon: "Chandra (Moon)",
  Mercury: "Budh (Mercury)",
  Venus: "Shukra (Venus)",
  Mars: "Mangal (Mars)",
  Jupiter: "Brihaspati (Jupiter)",
  Saturn: "Shani (Saturn)",
  Rahu: "Rahu (North Node)",
  Ketu: "Ketu (South Node)",
};

export default function Step3Results({
  chartResult,
  personalizedResult,
  universalRemedies,
  onBack,
  onRestart,
  readOnly = false,
}: Props) {
  const { chart, doshas, dasha } = chartResult;
  const { categories } = personalizedResult;

  /* Print handling — temporarily force every accordion open */
  const [printing, setPrinting] = useState(false);
  useEffect(() => {
    if (!printing) return;
    const done = () => setPrinting(false);
    window.addEventListener("afterprint", done);
    return () => window.removeEventListener("afterprint", done);
  }, [printing]);

  const handlePrint = () => {
    setPrinting(true);
    window.setTimeout(() => window.print(), 60);
  };

  const catLabel = (id: string) =>
    PROBLEM_CATEGORIES.find((c) => c.id === id)?.label ?? id;
  const catIcon = (id: string) => {
    const cat = PROBLEM_CATEGORIES.find((c) => c.id === id);
    return cat ? <CategoryIcon id={cat.id} size={18} /> : null;
  };

  const activeDoshas = [
    { label: "Manglik", active: doshas.manglik },
    { label: "Kaal Sarp", active: doshas.kaalSarp },
    { label: "Sade Sati", active: doshas.sadeSati },
    { label: "Pitra", active: doshas.pitra },
    { label: "Nadi", active: doshas.nadi },
  ].filter((d) => d.active);

  const videshYoga = chart.videshYoga;

  const kulDevtaLabel: Record<string, string> = {
    shiva: "Shiva / Shankar / Mahadev",
    vishnu: "Vishnu / Narayana / Krishna / Rama",
    devi: "Devi / Durga / Lakshmi / Parvati",
    ganesha: "Ganesha / Ganpati / Vinayak",
    hanuman: "Hanuman",
  };

  const kulDevta = chartResult.input.kulDevta;

  return (
    <div className="results">
      {/* ═══ Chart Summary — accordion ═════════════════════════ */}
      <AccordionSection
        title="Your Birth Chart"
        icon={<Orbit size={18} />}
        defaultOpen={true}
        forceOpen={printing}
      >
        <div className="summary-row">
          <div className="summary-item">
            <span className="summary-label">Ascendant (Lagna)</span>
            <span className="summary-value">
              {chart.ascendant.sign} {chart.ascendant.signDegree}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Moon Nakshatra</span>
            <span className="summary-value">
              {dasha.moonNakshatra} Pada {dasha.moonNakshatraPada}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Current Mahadasha</span>
            <span className="summary-value">{dasha.mahadashaLord}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Current Antardasha</span>
            <span className="summary-value">{dasha.currentAntardasha}</span>
          </div>
        </div>

        {activeDoshas.length > 0 && (
          <div className="doshas-summary">
            <span className="doshas-summary-label">Active Doshas:</span>
            {activeDoshas.map((d) => (
              <span key={d.label} className="dosha-badge-active">
                <TriangleAlert size={13} /> {d.label}
              </span>
            ))}
          </div>
        )}
        {activeDoshas.length === 0 && (
          <div className="doshas-summary">
            <span className="doshas-summary-label">Doshas:</span>
            <span className="dosha-badge-clear">
              <Check size={13} strokeWidth={2.6} /> No active doshas
            </span>
          </div>
        )}

        {/* Kul Devta (Family Deity Tradition) */}
        {kulDevta && (
          <div className="kul-devta-display">
            <span className="kul-devta-label">
              <OmMark size={12} /> Family Deity Tradition:
            </span>
            <span className="kul-devta-value">{kulDevtaLabel[kulDevta] ?? kulDevta}</span>
          </div>
        )}
      </AccordionSection>

      {/* ═══ Full Birth Chart — credibility (collapsed) ═══════ */}
      <AccordionSection
        title="Full Birth Chart — Planetary Positions"
        icon={<Compass size={18} />}
        defaultOpen={false}
        forceOpen={printing}
      >
        <p className="chart-credibility">
          <Calculator size={15} /> Calculated locally with Swiss Ephemeris · Lahiri Ayanamsha ·
          Whole Sign houses · {chartResult.geo.placeName}
        </p>
        <div className="planet-table-wrap">
          <table className="planet-table">
            <thead>
              <tr>
                <th>Graha</th>
                <th>Rashi</th>
                <th>Position</th>
                <th>House</th>
                <th>Nakshatra</th>
              </tr>
            </thead>
            <tbody>
              {chart.planets.map((p) => (
                <tr key={p.planet}>
                  <td className="pt-planet">
                    {GRAHA_NAMES[p.planet] ?? p.planet}
                    {p.retrograde && <span className="pt-retro">R</span>}
                  </td>
                  <td>{p.sign}</td>
                  <td>{p.signDegree}</td>
                  <td>{p.house}</td>
                  <td>
                    {p.nakshatra
                      ? `${p.nakshatra} Pada ${p.nakshatraPada ?? 1}`
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AccordionSection>

      {/* ═══ Foreign Residence (Videsh Yoga) — accordion ══════ */}
      {videshYoga && videshYoga.indicators.length > 0 && (
        <AccordionSection
          title={`Foreign Residence Indicator (${videshYoga.strength})`}
          icon={<Globe size={18} />}
          defaultOpen={true}
          forceOpen={printing}
        >
          <div className="videsh-yoga-box">
            <p className="videsh-explanation">{videshYoga.explanation}</p>
            <ul className="videsh-indicators">
              {videshYoga.indicators.map((ind, i) => (
                <li key={i} className="videsh-indicator">{ind}</li>
              ))}
            </ul>
            <p className="videsh-note">
              <Lightbulb size={14} className="fe-ic" /> Your birth chart is calculated from your place of birth. The temple recommendations below use your current city for local results.
            </p>
          </div>
        </AccordionSection>
      )}

      {/* ═══ Foundation — Ganesha invocation (soft warm banner) ═══ */}
      {universalRemedies && (
        <FoundationBanner foundation={universalRemedies.foundation} forceOpen={printing} />
      )}

      {/* ═══ Each Category — its own accordion ════════════════ */}
      {categories.map((cat, idx) => (
        <AccordionSection
          key={cat.category}
          title={catLabel(cat.category)}
          icon={catIcon(cat.category)}
          defaultOpen={idx === 0}
          forceOpen={printing}
        >
          <div className="remedy-section-inner">
            {/* Universal remedy suggestion — gentle, compact */}
            {universalRemedies?.categories[cat.category] && (
              <UniversalSuggestion
                category={universalRemedies.categories[cat.category]!}
                forceOpen={printing}
              />
            )}

            {/* Health disclaimer — shown only for health category */}
            {cat.category === "health" && (
              <div className="health-disclaimer">
                <span className="health-disclaimer-icon"><TriangleAlert size={17} /></span>
                <p>
                  <strong>Important:</strong> The remedies below are spiritual
                  practices based on traditional Vedic astrology. They are{" "}
                  <strong>not medical advice</strong> and must not replace
                  diagnosis, treatment, medication, or consultation with
                  qualified healthcare professionals. Please seek proper medical
                  care for any health concern.
                </p>
              </div>
            )}

            {cat.usedFallback && (
              <span className="fallback-tag">
                No direct affliction found — showing house lord remedies
              </span>
            )}

            {cat.remedies.length === 0 ? (
              <p className="remedy-empty-msg">
                No specific remedies matched for this category.
              </p>
            ) : (
              cat.remedies.map((r) => (
                <RemedyCard key={r.graha} entry={r} />
              ))
            )}
          </div>
        </AccordionSection>
      ))}

      {/* ═══ Disclaimer ════════════════════════════════════════ */}
      <footer className="disclaimer">
        <p>
          <strong>Disclaimer:</strong> The remedies shown here are based on
          traditional Vedic astrology (Jyotish Shastra) principles and are
          provided for informational and spiritual guidance purposes only. They
          are <strong>not a substitute for professional medical, legal, or
          financial advice</strong>. Please consult qualified professionals for
          any health, legal, or financial concerns.
        </p>
      </footer>

      {/* ═══ Save & Share ══════════════════════════════════════ */}
      {!readOnly && (
        <SaveReportBox chartResult={chartResult} personalizedResult={personalizedResult} />
      )}

      {/* ═══ Actions ═══════════════════════════════════════════ */}
      {!readOnly ? (
        <div className="step-nav results-actions">
          <button type="button" className="btn btn-secondary" onClick={onBack}>
            ← Change Problems
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handlePrint}
          >
            <Printer size={16} /> Save as PDF
          </button>
          <button type="button" className="btn btn-primary" onClick={onRestart}>
            <RefreshCw size={16} /> Start Over
          </button>
        </div>
      ) : (
        <div className="step-nav results-actions">
          <button type="button" className="btn btn-secondary" onClick={onRestart}>
            <Sparkles size={16} /> Create your own reading
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── FoundationBanner — gentle Ganesha invocation ══════════ */

function FoundationBanner({
  foundation,
  forceOpen = false,
}: {
  foundation: UniversalRemedies["foundation"];
  forceOpen?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const isOpen = forceOpen || expanded;

  return (
    <div className={`foundation-banner ${isOpen ? "foundation-open" : ""}`}>
      <button
        type="button"
        className="foundation-toggle"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="foundation-icon"><DiyaIcon size={22} /></span>
        <span className="foundation-text">
          Begin with Ganesha — the Remover of Obstacles
          <span className="foundation-sub">
            Every spiritual practice starts here · tap to see the invocations
          </span>
        </span>
        <span className="foundation-chevron">
          {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
      </button>
      {isOpen && (
        <div className="foundation-detail">
          <p className="foundation-desc">{foundation.description}</p>
          <div className="foundation-mantras">
            {foundation.mantras.map((m, i) => (
              <CompactMantra key={i} mantra={m} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── UniversalSuggestion — compact per-category hint ═══════ */

function UniversalSuggestion({
  category,
  forceOpen = false,
}: {
  category: NonNullable<UniversalRemedies["categories"][string]>;
  forceOpen?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const isOpen = forceOpen || expanded;
  const mantraNames = category.mantras.map((m) => m.name).join(", ");

  return (
    <div className="universal-suggestion">
      <button
        type="button"
        className="us-toggle"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="us-icon"><DiyaIcon size={20} /></span>
        <span className="us-copy">
          <span className="us-heading">Universal remedy · for everyone facing this</span>
          <span className="us-text">
            {isOpen ? category.note : mantraNames}
          </span>
        </span>
        <span className="us-chevron">
          {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
      </button>
      {isOpen && (
        <div className="us-detail">
          <div className="us-mantras">
            {category.mantras.map((m, i) => (
              <CompactMantra key={i} mantra={m} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── CompactMantra — minimal, calm mantra display ═════════ */

function CompactMantra({ mantra }: { mantra: UniversalMantra }) {
  const typeIcon = (t?: string) => {
    if (t === "beej") return <Sprout size={13} />;
    if (t === "stotram") return <ScrollText size={13} />;
    return <OmMark size={13} />;
  };

  return (
    <div className="compact-mantra">
      <span className="cm-icon">{typeIcon(mantra.type)}</span>
      <span className="cm-name">{mantra.name}</span>
      {mantra.transliteration && (
        <span className="cm-translit">{mantra.transliteration}</span>
      )}
      <span className="cm-practice">{mantra.practice}</span>
      {mantra.source && (
        <span className="cm-source">
          <BookOpen size={11} className="sug-ic" /> {mantra.source}
        </span>
      )}
    </div>
  );
}

/* ─── RemedyCard ──────────────────────────────────────────────── */

function RemedyCard({ entry: r }: { entry: RemedyEntry }) {
  return (
    <div className="remedy-card-full">
      {/* Graha name + diagnostic factors */}
      <div className="rc-header">
        <span className="rc-graha">{r.grahaName}</span>
      </div>

      {/* Why this graha was selected — transparent checklist */}
      {r.reasons.length > 0 && (
        <div className="rc-factors">
          <span className="rc-factors-label">Why this graha was selected:</span>
          <ul className="rc-factors-list">
            {r.reasons.map((f, i) => (
              <li key={i} className="rc-factor-item">
              <Check size={13} /> {f}
            </li>
            ))}
          </ul>
        </div>
      )}

      {/* Category context */}
      {r.categoryContext && (
        <p className="rc-context">{r.categoryContext}</p>
      )}

      {/* Plain explanation */}
      <div className="rc-explanation">
        <span className="rc-expl-icon"><Lightbulb size={16} /></span>
        <p>{r.plainExplanation}</p>
      </div>

      {/* ── Mantras ──────────────────────────────────────────── */}
      <div className="rc-block">
        <h5 className="rc-block-title"><OmMark size={14} /> Recommended Mantras</h5>
        {r.remedies.mantras.map((m, i) => {
          // Handle both old (string) and new (object) formats
          if (typeof m === "string") {
            return <li key={i} className="rc-list-item">{m}</li>;
          }
          const mantra = m as { type?: string; name: string; transliteration?: string; practice?: string; level?: string; reference?: string };
          const typeBadge: Record<string, string> = {
            namaha: "Namaha",
            beej: "Beej",
            stotram: "Stotram",
            mantra: "Mantra",
          };
          const levelBadge: Record<string, string> = {
            beginner: "Beginner",
            intermediate: "Intermediate",
            advanced: "Advanced",
          };
          return (
            <div key={i} className="mantra-card">
              <div className="mantra-header">
                <span className="mantra-name">{mantra.name}</span>
                <div className="mantra-badges">
                  {mantra.type && <span className="mantra-type-badge">{typeBadge[mantra.type] ?? mantra.type}</span>}
                  {mantra.level && <span className="mantra-level-badge">{levelBadge[mantra.level] ?? mantra.level}</span>}
                </div>
              </div>
              {mantra.transliteration && (
                <div className="mantra-translit">{mantra.transliteration}</div>
              )}
              {mantra.practice && (
                <div className="mantra-practice">
                  <MapPin size={12} /> {mantra.practice}
                </div>
              )}
              {mantra.reference && (
                <div className="mantra-ref">
                  <BookOpen size={12} /> {mantra.reference}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Fasting ──────────────────────────────────────────── */}
      <div className="rc-block">
        <h5 className="rc-block-title"><Utensils size={14} /> Fasting (Vrat)</h5>
        <ul className="rc-list">
          {r.remedies.fasting.map((f, i) => (
            <li key={i} className="rc-list-item">{f}</li>
          ))}
        </ul>
      </div>

      {/* ── Donations ────────────────────────────────────────── */}
      <div className="rc-block">
        <h5 className="rc-block-title"><Gift size={14} /> Donations (Daan)</h5>
        <ul className="rc-list">
          {r.remedies.donations.map((d, i) => (
            <li key={i} className="rc-list-item">{d}</li>
          ))}
        </ul>
      </div>

      {/* ── Home Puja Steps ──────────────────────────────────── */}
      {r.remedies.pujaSteps.length > 0 && (
        <div className="rc-block">
          <h5 className="rc-block-title"><Home size={14} /> Home Puja Steps</h5>
          <ol className="rc-steps">
            {r.remedies.pujaSteps.map((step, i) => (
              <li key={i} className="rc-step">{step}</li>
            ))}
          </ol>
        </div>
      )}

      {/* ── Temple Visit ─────────────────────────────────────── */}
      {r.remedies.deity && (
        <div className="rc-block">
          <h5 className="rc-block-title">
            <Landmark size={14} /> Temple Visit
          </h5>
          <div className="rc-deity">
            <strong>{r.remedies.deity}</strong>
          </div>
          <a
            className="google-maps-link"
            href={mapsLink(r.remedies.deity)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MapPin size={15} /> Click here to find a {r.remedies.deity} temple near you
          </a>
        </div>
      )}
    </div>
  );
}
