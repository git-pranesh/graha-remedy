/**
 * Chart Service — orchestrates geocoding, Swiss Ephemeris calculation,
 * dosha analysis and Vimshottari Dasha into a single call. Not cached: results
 * include time-dependent values (running dasha, current Sade Sati).
 */

import { geocodePlace, utcOffsetForLocalTime, type GeoResult } from "./geocoder";
import {
  calculateBirthChart,
  computeVimshottariDasha,
  type AstroChart,
  type VimshottariDasha,
} from "./astro-engine";
import { computeDoshas, type DoshaFlags } from "./dosha";
import { findPlace } from "./places";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BirthInput {
  dateOfBirth: string;    // "YYYY-MM-DD"
  timeOfBirth: string;    // "HH:MM" (24-hour local time)
  placeOfBirth: string;   // e.g. "Chennai, India"
  currentCity?: string;   // e.g. "Mumbai" or "Singapore" — optional
  kulDevta?: string;      // e.g. "shiva", "vishnu" — optional family deity tradition
  /** Optional resolved coordinates (from /api/places). Skips geocoding when present. */
  latitude?: number;
  longitude?: number;
  timezone?: string;
}

function isValidTimezone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/**
 * Resolve birth place to coordinates + IANA timezone:
 * 1. coordinates supplied by the client (selected from place search)
 * 2. offline GeoNames lookup
 * 3. Nominatim (network) as a last resort
 */
async function resolvePlace(input: BirthInput): Promise<GeoResult> {
  const { latitude, longitude, timezone } = input;
  if (
    typeof latitude === "number" && typeof longitude === "number" &&
    Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180 &&
    timezone && isValidTimezone(timezone)
  ) {
    return { placeName: input.placeOfBirth, latitude, longitude, timezone };
  }
  const local = findPlace(input.placeOfBirth);
  if (local) {
    return { placeName: local.label, latitude: local.latitude, longitude: local.longitude, timezone: local.timezone };
  }
  return geocodePlace(input.placeOfBirth);
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

  // Resolve the place (coordinates + timezone)
  const geo = await resolvePlace(input);

  // Convert local time to UTC
  const offset = utcOffsetForLocalTime(geo.timezone, year, month, day, hours, minutes);
  const localDecimalHours = hours + minutes / 60;
  const utcDecimalHours = localDecimalHours - offset;

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
      const local = findPlace(input.currentCity.trim());
      const currentGeo = local
        ? { latitude: local.latitude, longitude: local.longitude, placeName: local.label }
        : await geocodePlace(input.currentCity.trim());
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

  return result;
}

