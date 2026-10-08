"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, Clock, MapPin, TriangleAlert } from "lucide-react";
import PlaceInput from "../PlaceInput";
import type { PlaceSuggestion } from "../../types";
import type { ToolReport } from "../../services/tool-report";
import ToolResult, { type ToolKind } from "./ToolResult";

interface Props {
  tool: ToolKind;
  /** Moon-based tools can work without a birth time. */
  allowUnknownTime?: boolean;
  submitLabel: string;
}

function formatOffset(hours: number): string {
  const sign = hours < 0 ? "−" : "+";
  const total = Math.round(Math.abs(hours) * 60);
  return `UTC${sign}${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

export default function ToolCalculator({ tool, allowUnknownTime = false, submitLabel }: Props) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [timeUnknown, setTimeUnknown] = useState(false);
  const [place, setPlace] = useState("");
  const [placeSel, setPlaceSel] = useState<PlaceSuggestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<ToolReport | null>(null);

  const onPlaceChange = useCallback((text: string, selected: PlaceSuggestion | null) => {
    setPlace(text);
    setPlaceSel(selected);
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!date) return setError("Enter your date of birth.");
    if (!timeUnknown && !time) return setError("Enter your time of birth.");
    if (!place.trim()) return setError("Enter your place of birth.");

    setLoading(true);
    try {
      const res = await fetch("/api/tools/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dateOfBirth: date,
          timeOfBirth: timeUnknown ? undefined : time,
          timeUnknown,
          placeOfBirth: place.trim(),
          ...(placeSel && placeSel.label === place
            ? { latitude: placeSel.latitude, longitude: placeSel.longitude, timezone: placeSel.timezone }
            : {}),
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Calculation failed");
      setReport(body as ToolReport);
      requestAnimationFrame(() =>
        document.getElementById("tool-result")?.scrollIntoView({ behavior: "smooth", block: "start" }),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Calculation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="tool-card">
      <form className="tool-form" onSubmit={submit} noValidate>
        <div className="tool-form-grid">
          <div className="field">
            <label className="field-label" htmlFor={`${tool}-dob`}>
              <CalendarDays size={16} className="lbl-ic" /> Date of birth
            </label>
            <input
              id={`${tool}-dob`}
              type="date"
              className="field-input"
              value={date}
              min="1800-01-01"
              max="2100-12-31"
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label className="field-label" htmlFor={`${tool}-tob`}>
              <Clock size={16} className="lbl-ic" /> Time of birth
            </label>
            <input
              id={`${tool}-tob`}
              type="time"
              className="field-input"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              disabled={timeUnknown}
              required={!timeUnknown}
            />
            {allowUnknownTime && (
              <label className="tool-checkbox">
                <input type="checkbox" checked={timeUnknown} onChange={(e) => setTimeUnknown(e.target.checked)} />
                I don&apos;t know my birth time
              </label>
            )}
          </div>
        </div>
        <div className="field">
          <label className="field-label" htmlFor={`${tool}-pob`}>
            <MapPin size={16} className="lbl-ic" /> Place of birth
          </label>
          <PlaceInput id={`${tool}-pob`} value={place} onChange={onPlaceChange} required />
          <span className="field-hint">Pick from the list so the correct time zone (including daylight saving) is used.</span>
        </div>

        {error && (
          <div className="field-error" role="alert">
            <TriangleAlert size={15} className="fe-ic" /> {error}
          </div>
        )}

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner" /> Calculating…
            </>
          ) : (
            <>
              {submitLabel} <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      {report && (
        <div id="tool-result" className="tool-result" aria-live="polite">
          <ToolResult tool={tool} report={report} />
          <div className="tool-result-footer">
            <span>
              {report.input.place} · {report.input.date}
              {report.input.time ? ` ${report.input.time}` : " (time unknown)"} · {report.input.timezone} ({formatOffset(report.utcOffset)}) · Lahiri ayanamsa {report.ayanamsa.toFixed(4)}°
            </span>
            <Link href="/" className="btn btn-secondary btn-sm">
              Get personalised remedies <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
