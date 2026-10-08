"use client";

import { useState, useCallback } from "react";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  Clock,
  MapPin,
  TriangleAlert,
} from "lucide-react";
import { fetchChart } from "../api/client";
import type { BirthInput, ChartResult, PlaceSuggestion } from "../types";
import PlaceInput from "./PlaceInput";
import { OmMark } from "./icons";

interface Props {
  onSubmit: (input: BirthInput, result: ChartResult) => void;
  initial: BirthInput | null;
}

export default function Step1BirthDetails({ onSubmit, initial }: Props) {
  const [date, setDate] = useState(initial?.dateOfBirth ?? "");
  const [time, setTime] = useState(initial?.timeOfBirth ?? "06:00");
  const [place, setPlace] = useState(initial?.placeOfBirth ?? "");
  const [placeSel, setPlaceSel] = useState<PlaceSuggestion | null>(
    initial?.latitude !== undefined && initial?.longitude !== undefined && initial?.timezone
      ? {
          label: initial.placeOfBirth,
          latitude: initial.latitude,
          longitude: initial.longitude,
          timezone: initial.timezone,
        }
      : null,
  );
  const [currentCity, setCurrentCity] = useState("");
  const [kulDevta, setKulDevta] = useState(initial?.kulDevta ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onPlaceChange = useCallback((text: string, selected: PlaceSuggestion | null) => {
    setPlace(text);
    setPlaceSel(selected);
  }, []);

  const onCurrentCityChange = useCallback((text: string) => {
    setCurrentCity(text);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!date) {
      setError("Please select your date of birth");
      return;
    }
    if (!time) {
      setError("Please select your time of birth");
      return;
    }
    if (!place.trim()) {
      setError("Please enter your place of birth");
      return;
    }

    setLoading(true);
    try {
      const input: BirthInput = {
        dateOfBirth: date,
        timeOfBirth: time,
        placeOfBirth: place.trim(),
        kulDevta: kulDevta || undefined,
        ...(placeSel && placeSel.label === place
          ? { latitude: placeSel.latitude, longitude: placeSel.longitude, timezone: placeSel.timezone }
          : {}),
      };
      const result = await fetchChart(input, currentCity.trim() || undefined);
      onSubmit(input, result);
    } catch (err: any) {
      setError(err.message || "Failed to compute chart");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="step-form" onSubmit={handleSubmit}>
      <h2 className="step-title">Enter Birth Details</h2>
      <p className="step-desc">
        High-precision Swiss Ephemeris calculations, Lahiri ayanamsa. No AI.
      </p>

      {/* Date of Birth */}
      <div className="field">
        <label className="field-label" htmlFor="dob">
          <CalendarDays size={16} className="lbl-ic" /> Date of Birth
        </label>
        <input
          id="dob"
          type="date"
          className="field-input"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>

      {/* Time of Birth */}
      <div className="field">
        <label className="field-label" htmlFor="tob">
          <Clock size={16} className="lbl-ic" /> Time of Birth
        </label>
        <input
          id="tob"
          type="time"
          className="field-input"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          required
        />
        <span className="field-hint">Local time at place of birth</span>
      </div>

      {/* Place of Birth (autocomplete) */}
      <div className="field">
        <label className="field-label" htmlFor="pob">
          <MapPin size={16} className="lbl-ic" /> Place of Birth
        </label>
        <PlaceInput id="pob" value={place} onChange={onPlaceChange} required />
        <span className="field-hint">Choose from the list so the correct time zone is used</span>
      </div>

      {/* Current City (optional) */}
      <div className="field">
        <label className="field-label" htmlFor="currentCity">
          <Building2 size={16} className="lbl-ic" /> Current City{" "}
          <span className="field-optional">(optional)</span>
        </label>
        <PlaceInput
          id="currentCity"
          value={currentCity}
          onChange={onCurrentCityChange}
          placeholder="e.g. Mumbai, Singapore, Chicago"
        />
        <span className="field-hint">For location-specific temple recommendations</span>
      </div>

      {/* Family Deity Tradition (optional) */}
      <div className="field">
        <label className="field-label" htmlFor="kulDevta">
          <OmMark size={13} /> Family Deity Tradition{" "}
          <span className="field-optional">(optional)</span>
        </label>
        <select
          id="kulDevta"
          className="field-input"
          value={kulDevta}
          onChange={(e) => setKulDevta(e.target.value)}
        >
          <option value="">Don't know / Prefer not to say</option>
          <option value="shiva">Shiva / Shankar / Mahadev</option>
          <option value="vishnu">Vishnu / Narayana / Krishna / Rama</option>
          <option value="devi">Devi / Durga / Lakshmi / Parvati</option>
          <option value="ganesha">Ganesha / Ganpati / Vinayak</option>
          <option value="hanuman">Hanuman</option>
        </select>
        <span className="field-hint">If known, this helps personalise your remedies further</span>
      </div>

      {/* Error */}
      {error && <div className="field-error">
          <TriangleAlert size={15} className="fe-ic" /> {error}
        </div>}

      {/* Submit */}
      <button
        type="submit"
        className="btn btn-primary"
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="spinner" /> Computing Chart…
          </>
        ) : (
          <>Compute Birth Chart <ArrowRight size={16} /></>
        )}
      </button>
    </form>
  );
}
