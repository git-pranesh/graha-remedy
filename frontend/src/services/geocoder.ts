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
 * Convert a timezone name to a UTC offset in hours.
 * Used for Swiss Ephemeris calculations which need a numeric offset.
 */
export function timezoneToOffset(timezone: string): number {
  // Common Indian timezones
  const offsets: Record<string, number> = {
    "Asia/Kolkata": 5.5,
    "Asia/Calcutta": 5.5,
    "Asia/Mumbai": 5.5,
    "Asia/Dubai": 4,
    "Asia/Kathmandu": 5.75,
    "Asia/Colombo": 5.5,
    "Asia/Dhaka": 6,
    "Asia/Karachi": 5,
    "Asia/Kabul": 4.5,
    "Asia/Tehran": 3.5,
    UTC: 0,
    GMT: 0,
  };

  if (offsets[timezone] !== undefined) {
    return offsets[timezone];
  }

  // For unknown timezones, try to parse from the name
  // Fallback: use Intl for a rough estimate (not DST-aware for historical dates)
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      timeZoneName: "shortOffset",
    });
    const parts = formatter.formatToParts(now);
    const tzPart = parts.find((p) => p.type === "timeZoneName");
    if (tzPart) {
      const match = tzPart.value.match(/GMT([+-]?\d+)?/);
      if (match) {
        return match[1] ? parseInt(match[1]) : 0;
      }
    }
  } catch {
    // ignore
  }

  // Default to IST if nothing else works
  return 5.5;
}
