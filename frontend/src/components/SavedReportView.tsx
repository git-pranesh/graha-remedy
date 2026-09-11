import { useEffect, useState } from "react";
import { Orbit, Sparkles, TriangleAlert } from "lucide-react";
import type { SharedReport, UniversalRemedies } from "../types";
import { fetchReport, fetchUniversalRemedies } from "../api/client";
import Step3Results from "./Step3Results";

export default function SavedReportView({
  id,
  onHome,
}: {
  id: string;
  onHome: () => void;
}) {
  const [report, setReport] = useState<SharedReport | null>(null);
  const [universal, setUniversal] = useState<UniversalRemedies | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rep = await fetchReport(id);
        if (cancelled) return;
        setReport(rep);
        fetchUniversalRemedies()
          .then((u) => {
            if (!cancelled) setUniversal(u);
          })
          .catch(() => {
            /* universal remedies optional */
          });
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message ?? "This reading could not be found.");
          setReport(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div className="wizard">
      <header className="wizard-header">
        <div className="wizard-logo"><Orbit size={44} strokeWidth={1.4} /></div>
        <h1 className="wizard-title">Graha Remedy</h1>
        <p className="wizard-subtitle">
          {report ? "Saved reading" : "Shared reading"}
        </p>
      </header>

      <main className="wizard-content">
        {loading && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
            Loading your reading…
          </div>
        )}

        {!loading && error && (
          <div className="wizard-error">
            <span>
            <TriangleAlert size={15} className="fe-ic" /> {error}
          </span>
          </div>
        )}

        {!loading && report && (
          <Step3Results
            chartResult={report.chartResult}
            personalizedResult={report.personalizedResult}
            universalRemedies={universal}
            onBack={onHome}
            onRestart={onHome}
            readOnly
          />
        )}

        {!loading && !report && !error && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
            This reading is no longer available.
          </div>
        )}

        {!loading && (error || !report) && (
          <div className="step-nav results-actions">
            <button type="button" className="btn btn-primary" onClick={onHome}>
              <Sparkles size={16} /> Create your own reading
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
