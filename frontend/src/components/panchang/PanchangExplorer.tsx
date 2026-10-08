"use client";

import { useCallback, useState } from "react";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import PlaceInput from "../PlaceInput";
import type { PlaceSuggestion } from "../../types";
import type { Panchang } from "../../services/panchang";
import { fmtDateLong } from "../../lib/panchang-format";
import { ChoghadiyaTable, Muhurtas, PanchangCore, SunMoon } from "./PanchangViews";

interface Props {
  defaultPlace: PlaceSuggestion;
  defaultDate: string;
  /** Which sections to show for the looked-up day. */
  mode?: "panchang" | "rahu" | "choghadiya";
}

/** Look up the panchang for any date and place. Results are not indexable (client-side). */
export default function PanchangExplorer({ defaultPlace, defaultDate, mode = "panchang" }: Props) {
  const [date, setDate] = useState(defaultDate);
  const [placeText, setPlaceText] = useState(defaultPlace.label);
  const [place, setPlace] = useState<PlaceSuggestion | null>(defaultPlace);
  const [result, setResult] = useState<{ p: Panchang; label: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onPlace = useCallback((text: string, sel: PlaceSuggestion | null) => {
    setPlaceText(text);
    setPlace(sel);
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!place) return setError("Pick a place from the suggestions.");
    if (!date) return setError("Choose a date.");
    setLoading(true);
    try {
      const qs = new URLSearchParams({ date, lat: String(place.latitude), lon: String(place.longitude), tz: place.timezone });
      const res = await fetch(`/api/panchang?${qs}`);
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Failed");
      setResult({ p: body as Panchang, label: place.label });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="tool-card">
      <form onSubmit={submit} className="tool-form">
        <div className="tool-form-grid">
          <div className="field">
            <label className="field-label" htmlFor="pc-date">
              <CalendarDays size={16} className="lbl-ic" /> Date
            </label>
            <input id="pc-date" type="date" className="field-input" value={date} min="1900-01-01" max="2100-12-31" onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="pc-place">
              <MapPin size={16} className="lbl-ic" /> Place
            </label>
            <PlaceInput id="pc-place" value={placeText} onChange={onPlace} placeholder="Any town or city" />
          </div>
        </div>
        {error && <div className="field-error" role="alert">{error}</div>}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Calculating…" : <>Show {mode === "rahu" ? "Rahu Kalam" : mode === "choghadiya" ? "Choghadiya" : "Panchang"} <ArrowRight size={16} /></>}
        </button>
      </form>
      {result && (
        <div className="tool-result" aria-live="polite">
          <p className="tool-kicker">{result.label}</p>
          <h3 className="tool-headline">{fmtDateLong(result.p.date)}</h3>
          {mode === "panchang" && (
            <>
              <PanchangCore p={result.p} />
              <SunMoon p={result.p} />
            </>
          )}
          {mode !== "choghadiya" && <Muhurtas t={result.p} />}
          {mode === "choghadiya" && (
            <>
              <ChoghadiyaTable slots={result.p.choghadiya.day} base={result.p.date} label="Day choghadiya (sunrise to sunset)" />
              <ChoghadiyaTable slots={result.p.choghadiya.night} base={result.p.date} label="Night choghadiya (sunset to next sunrise)" />
            </>
          )}
          <p className="tool-note">Times shown in {result.p.timezone}, including daylight saving where it applies.</p>
        </div>
      )}
    </div>
  );
}
