"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { searchPlaces } from "../api/client";
import type { PlaceSuggestion } from "../types";

interface Props {
  id: string;
  value: string;
  /** Called on every keystroke (selected = null) and on selection. */
  onChange: (text: string, selected: PlaceSuggestion | null) => void;
  placeholder?: string;
  required?: boolean;
}

/**
 * Place autocomplete backed by /api/places (offline GeoNames index).
 * Selecting a suggestion passes its coordinates and IANA timezone upward.
 */
export default function PlaceInput({ id, value, onChange, placeholder, required }: Props) {
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleInput = useCallback(
    (text: string) => {
      onChange(text, null);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        const results = text.trim().length >= 2 ? await searchPlaces(text) : [];
        setSuggestions(results);
        setActive(-1);
        setOpen(results.length > 0);
      }, 200);
    },
    [onChange],
  );

  const select = (s: PlaceSuggestion) => {
    onChange(s.label, s);
    setOpen(false);
    setSuggestions([]);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && active >= 0) {
      e.preventDefault();
      select(suggestions[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className="place-input" ref={wrapperRef}>
      <input
        id={id}
        type="text"
        className="field-input"
        placeholder={placeholder ?? "e.g. Chennai, India"}
        value={value}
        onChange={(e) => handleInput(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        onKeyDown={onKeyDown}
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-autocomplete="list"
        required={required}
      />
      {open && suggestions.length > 0 && (
        <ul className="suggestions" id={`${id}-list`} role="listbox">
          {suggestions.map((s, i) => (
            <li key={`${s.label}-${s.latitude}`} role="option" aria-selected={i === active}>
              <button
                type="button"
                className={`suggestion-item${i === active ? " active" : ""}`}
                onClick={() => select(s)}
              >
                <MapPin size={13} className="sug-ic" /> {s.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
