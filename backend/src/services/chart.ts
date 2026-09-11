/**
 * Chart Service — orchestrates geocoding, Swiss Ephemeris calculation,
 * dosha analysis, Vimshottari Dasha, and caching into a single call.
 */

import { geocodePlace, timezoneToOffset, type GeoResult } from "./geocoder.js";
import {
  calculateBirthChart,
  computeVimshottariDasha,
  cleanup,
  type AstroChart,
  type VimshottariDasha,
} from "./astro-engine.js";
import { computeDoshas, type DoshaFlags } from "./dosha.js";
import { getCachedChart, setCachedChart, getCacheStats } from "./chart-cache.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BirthInput {
  dateOfBirth: string;    // "YYYY-MM-DD"
  timeOfBirth: string;    // "HH:MM" (24-hour local time)
  placeOfBirth: string;   // e.g. "Chennai, India"
  currentCity?: string;   // e.g. "Mumbai" or "Singapore" — optional
  kulDevta?: string;      // e.g. "shiva", "vishnu" — optional family deity tradition
}

export interface ChartResult {
  input: BirthInput;
  geo: GeoResult;
  chart: AstroChart;
  dasha: VimshottariDasha;
  doshas: DoshaFlags;
  computedAt: string;
  cached: boolean;
  currentCity?: string;
  currentLat?: number;
  currentLon?: number;
}

// ---------------------------------------------------------------------------
// Main service
// ---------------------------------------------------------------------------

export async function computeChart(input: BirthInput): Promise<ChartResult> {
  // Parse date components
  const [year, month, day] = input.dateOfBirth.split("-").map(Number);
  const [hours, minutes] = input.timeOfBirth.split(":").map(Number);

  // Geocode the place
  const geo = await geocodePlace(input.placeOfBirth);

  // Convert local time to UTC
  const offset = timezoneToOffset(geo.timezone);
  const localDecimalHours = hours + minutes / 60;
  const utcDecimalHours = localDecimalHours - offset;

  // --- Check cache (using UTC-adjusted coordinates) ---
  const cached = getCachedChart<ChartResult>(
    year, month, day,
    Math.floor(utcDecimalHours),
    Math.round((utcDecimalHours % 1) * 60),
    geo.latitude,
    geo.longitude,
  );

  if (cached) {
    return { ...cached, cached: true };
  }

  // --- Compute chart ---
  const chart = calculateBirthChart(
    year, month, day,
    utcDecimalHours,
    geo.latitude,
    geo.longitude,
  );

  // --- Vimshottari Dasha ---
  const dasha = computeVimshottariDasha(chart, year, month, day, utcDecimalHours);

  // --- Doshas ---
  const doshas = computeDoshas(chart);

  // Geocode current city if provided
  let currentLat: number | undefined;
  let currentLon: number | undefined;
  let currentCityName: string | undefined;
  if (input.currentCity && input.currentCity.trim()) {
    try {
      const currentGeo = await geocodePlace(input.currentCity.trim());
      currentLat = currentGeo.latitude;
      currentLon = currentGeo.longitude;
      currentCityName = currentGeo.placeName;
    } catch {
      // If geocoding fails, just skip current city
    }
  }

  const result: ChartResult = {
    input,
    geo,
    chart,
    dasha,
    doshas,
    computedAt: new Date().toISOString(),
    cached: false,
    currentCity: currentCityName,
    currentLat,
    currentLon,
  };

  // --- Cache it ---
  setCachedChart(
    year, month, day,
    Math.floor(utcDecimalHours),
    Math.round((utcDecimalHours % 1) * 60),
    geo.latitude,
    geo.longitude,
    result,
  );

  return result;
}

export { getCacheStats };
