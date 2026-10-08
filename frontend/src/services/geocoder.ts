/**
 * Geocoder — converts place names to latitude/longitude/timezone
 * using OpenStreetMap Nominatim (free, no API key).
 * Respects fair-use policy: 1 request/second.
 */

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";
const USER_AGENT = "graha-remedy-app/0.1.0";

// Simple rate limiter: queue requests with 1-second spacing
let lastRequestTime = 0;

async function rateLimitedFetch(url: string): Promise<Response> {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < 1100) {
    await new Promise((r) => setTimeout(r, 1100 - elapsed));
  }
  lastRequestTime = Date.now();
  return fetch(url, { headers: { "User-Agent": USER_AGENT } });
}

export interface GeoResult {
  placeName: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

/**
 * Geocode a place name (e.g. "Chennai, India") to lat/lng and timezone.
 */
export async function geocodePlace(placeName: string): Promise<GeoResult> {
  const params = new URLSearchParams({
    q: placeName,
    format: "json",
    limit: "1",
    addressdetails: "1",
  });

  const url = `${NOMINATIM_BASE}/search?${params}`;
  const res = await rateLimitedFetch(url);

  if (!res.ok) {
    throw new Error(`Nominatim geocoding failed: ${res.status} ${res.statusText}`);
  }

  const results = (await res.json()) as Array<{
    lat: string;
    lon: string;
    display_name: string;
    address?: Record<string, string>;
  }>;

  if (!results || results.length === 0) {
    throw new Error(`Could not geocode place: "${placeName}"`);
  }

  const hit = results[0];
  const lat = parseFloat(hit.lat);
  const lon = parseFloat(hit.lon);

  // Nominatim doesn't return timezone directly. We use the Open-Meteo
  // timezone lookup (free, no key) as a companion.
  const timezone = await getTimezone(lat, lon);

  return {
    placeName: hit.display_name.split(",").slice(0, 2).join(",").trim(),
    latitude: lat,
    longitude: lon,
    timezone,
  };
}

/**
 * Look up IANA timezone for coordinates using Open-Meteo (free, no key).
 */
async function getTimezone(lat: number, lon: number): Promise<string> {
  const url = `https://api.open-meteo.com/v1/timezone?latitude=${lat}&longitude=${lon}&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) {
    // Fallback: infer UTC offset from IST for Indian places
    return "Asia/Kolkata";
  }
  const data = (await res.json()) as { timezone?: string };
  return data.timezone ?? "Asia/Kolkata";
}

/**
 * UTC offset (hours) of an IANA timezone at a given UTC instant.
 * Uses the runtime's tz database, so DST and historical offsets
 * (e.g. India's 1942-45 war time) are applied correctly.
 */
function offsetAtInstant(timezone: string, utcMs: number): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    timeZoneName: "longOffset",
  }).formatToParts(new Date(utcMs));
  const value = parts.find((p) => p.type === "timeZoneName")?.value ?? "GMT";
  const m = value.match(/GMT([+-])(\d{2}):(\d{2})(?::(\d{2}))?/);
  if (!m) return 0; // "GMT" means +00:00
  const sign = m[1] === "-" ? -1 : 1;
  return sign * (Number(m[2]) + Number(m[3]) / 60 + Number(m[4] ?? 0) / 3600);
}

/**
 * UTC offset (hours) in effect at a given *local* wall-clock time in a timezone.
 * This is what birth-chart calculations need: the offset on the birth date,
 * not today's offset.
 */
export function utcOffsetForLocalTime(
  timezone: string,
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
): number {
  const localAsUtc = Date.UTC(year, month - 1, day, hour, minute);
  // Two passes resolve the offset even across a DST boundary.
  let offset = offsetAtInstant(timezone, localAsUtc);
  offset = offsetAtInstant(timezone, localAsUtc - offset * 3600_000);
  return offset;
}

/**
 * Current UTC offset (hours) of a timezone.
 * @deprecated Use utcOffsetForLocalTime for birth charts.
 */
export function timezoneToOffset(timezone: string): number {
  try {
    return offsetAtInstant(timezone, Date.now());
  } catch {
    return 5.5;
  }
}
