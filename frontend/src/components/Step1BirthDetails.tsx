"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  Clock,
  MapPin,
  TriangleAlert,
} from "lucide-react";
import { fetchChart, searchPlaces } from "../api/client";
import type { BirthInput, ChartResult } from "../types";
import { OmMark } from "./icons";

interface Props {
  onSubmit: (input: BirthInput, result: ChartResult) => void;
  initial: BirthInput | null;
}

export default function Step1BirthDetails({ onSubmit, initial }: Props) {
  const [date, setDate] = useState(initial?.dateOfBirth ?? "");
  const [time, setTime] = useState(initial?.timeOfBirth ?? "06:00");
  const [place, setPlace] = useState(initial?.placeOfBirth ?? "");
  const [currentCity, setCurrentCity] = useState("");
  const [kulDevta, setKulDevta] = useState(initial?.kulDevta ?? "");
  const [currentSuggestions, setCurrentSuggestions] = useState<Array<{ displayName: string; lat: number; lon: number }>>([]);
  const [showCurrentSuggestions, setShowCurrentSuggestions] = useState(false);
  const currentWrapperRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Array<{
    displayName: string;
    lat: number;
    lon: number;
  }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close suggestions on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
      if (currentWrapperRef.current && !currentWrapperRef.current.contains(e.target as Node)) {
        setShowCurrentSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handlePlaceChange = useCallback((value: string) => {
    setPlace(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (value.length >= 3) {
        const results = await searchPlaces(value);
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 400);
  }, []);

  const handleCurrentCityChange = useCallback((value: string) => {
    setCurrentCity(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (value.length >= 3) {
        const results = await searchPlaces(value);
        setCurrentSuggestions(results);
        setShowCurrentSuggestions(results.length > 0);
      } else {
        setCurrentSuggestions([]);
        setShowCurrentSuggestions(false);
      }
    }, 400);
  }, []);

  const selectSuggestion = useCallback((displayName: string) => {
    setPlace(displayName);
    setShowSuggestions(false);
    setSuggestions([]);
  }, []);

  const selectCurrentSuggestion = useCallback((displayName: string) => {
    setCurrentCity(displayName);
    setShowCurrentSuggestions(false);
    setCurrentSuggestions([]);
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
        We use Swiss Ephemeris calculations — 100% accurate, zero AI.
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
      <div className="field" ref={wrapperRef}>
        <label className="field-label" htmlFor="pob">
          <MapPin size={16} className="lbl-ic" /> Place of Birth
        </label>
        <input
          id="pob"
          type="text"
          className="field-input"
          placeholder="e.g. Chennai, India"
          value={place}
          onChange={(e) => handlePlaceChange(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          autoComplete="off"
          required
        />
        {showSuggestions && suggestions.length > 0 && (
          <ul className="suggestions">
            {suggestions.map((s, i) => (
              <li key={i}>
                <button
                  type="button"
                  className="suggestion-item"
                  onClick={() => selectSuggestion(s.displayName)}
                >
                  <MapPin size={13} className="sug-ic" /> {s.displayName}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Current City (optional) */}
      <div className="field" ref={currentWrapperRef}>
        <label className="field-label" htmlFor="currentCity">
          <Building2 size={16} className="lbl-ic" /> Current City{" "}
          <span className="field-optional">(optional)</span>
        </label>
        <input
          id="currentCity"
          type="text"
          className="field-input"
          placeholder="e.g. Mumbai, Singapore, Chicago"
          value={currentCity}
          onChange={(e) => handleCurrentCityChange(e.target.value)}
          onFocus={() => currentSuggestions.length > 0 && setShowCurrentSuggestions(true)}
          autoComplete="off"
        />
        <span className="field-hint">For location-specific temple recommendations</span>
        {showCurrentSuggestions && currentSuggestions.length > 0 && (
          <ul className="suggestions">
            {currentSuggestions.map((s, i) => (
              <li key={i}>
                <button
                  type="button"
                  className="suggestion-item"
                  onClick={() => selectCurrentSuggestion(s.displayName)}
                >
                  <MapPin size={13} className="sug-ic" /> {s.displayName}
                </button>
              </li>
            ))}
          </ul>
        )}
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
