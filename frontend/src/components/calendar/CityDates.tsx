"use client";

import { useCallback, useState } from "react";
import PlaceInput from "../PlaceInput";
import type { PlaceSuggestion } from "../../types";
import type { CalendarEvent, EventKind } from "../../services/calendar";
import EventTable from "./EventTable";

/** Recompute the year's dates for another place (client-side; not indexed). */
export default function CityDates({ kind, year }: { kind: EventKind; year: number }) {
  const [text, setText] = useState("");
  const [events, setEvents] = useState<CalendarEvent[] | null>(null);
  const [label, setLabel] = useState("");
  const [loading, setLoading] = useState(false);
  const onChange = useCallback(async (t: string, sel: PlaceSuggestion | null) => {
    setText(t);
    if (!sel) return;
    setLoading(true);
    const qs = new URLSearchParams({ kind, year: String(year), lat: String(sel.latitude), lon: String(sel.longitude), tz: sel.timezone });
    const res = await fetch(`/api/calendar?${qs}`);
    if (res.ok) { setEvents((await res.json()).events); setLabel(sel.label); }
    setLoading(false);
  }, [kind, year]);
  return (
    <div className="tool-card">
      <label className="field-label" htmlFor="cal-place">Show dates for your city (outside India dates can differ by a day)</label>
      <PlaceInput id="cal-place" value={text} onChange={onChange} placeholder="e.g. New Jersey, London, Toronto" />
      {loading && <p className="tool-note">Calculating…</p>}
      {events && !loading && (
        <div className="tool-result">
          <p className="tool-kicker">{label} — local time</p>
          <EventTable events={events} />
        </div>
      )}
    </div>
  );
}
