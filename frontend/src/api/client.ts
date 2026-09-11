import type {
  AuthUser,
  BirthInput,
  ChartResult,
  PersonalizedResult,
  SavedReportMeta,
  SharedReport,
  UniversalRemedies,
} from "../types";

const API_BASE = "http://localhost:3001";

/* Small wrapper: JSON + cookies (needed for the auth cookie). */
async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed (${res.status})`);
  }

  return res.json() as Promise<T>;
}

/**
 * Compute a birth chart from the backend.
 */
export async function fetchChart(input: BirthInput, currentCity?: string): Promise<ChartResult> {
  return api("/api/chart", {
    method: "POST",
    body: JSON.stringify({ ...input, currentCity }),
  });
}

/**
 * Get personalised remedies for a chart + selected problems.
 */
export async function fetchPersonalizedRemedies(
  chart: ChartResult,
  problems: string[],
): Promise<PersonalizedResult> {
  return api("/api/remedies/personalized", {
    method: "POST",
    body: JSON.stringify({
      chart: chart.chart,
      doshas: chart.doshas,
      dasha: chart.dasha,
      problems,
      latitude: chart.currentLat ?? chart.geo.latitude,
      longitude: chart.currentLon ?? chart.geo.longitude,
    }),
  });
}

/**
 * Fetch universal remedies data (foundation + category-specific).
 */
export async function fetchUniversalRemedies(): Promise<UniversalRemedies> {
  return api("/api/remedies/universal");
}

/* ─── Reports ─────────────────────────────────────────────────── */

/** Save a report. When a session cookie is present it is linked to the account. */
export async function saveReport(
  chartResult: ChartResult,
  personalizedResult: PersonalizedResult,
): Promise<{ id: string }> {
  return api("/api/reports", {
    method: "POST",
    body: JSON.stringify({ chartResult, personalizedResult }),
  });
}

/** Load a shared / guest report by id. */
export async function fetchReport(id: string): Promise<SharedReport> {
  return api(`/api/reports/${encodeURIComponent(id)}`);
}

/** List the current user's saved reports (requires login). */
export async function fetchMyReports(): Promise<SavedReportMeta[]> {
  const body = await api<{ reports: SavedReportMeta[] }>("/api/reports/mine");
  return body.reports ?? [];
}

/* ─── Auth ────────────────────────────────────────────────────── */

async function authCall(email: string, password: string, path: string): Promise<AuthUser> {
  const body = await api<{ user: AuthUser }>(path, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  return body.user;
}

export async function register(email: string, password: string): Promise<AuthUser> {
  return authCall(email, password, "/api/auth/register");
}

export async function login(email: string, password: string): Promise<AuthUser> {
  return authCall(email, password, "/api/auth/login");
}

export async function logout(): Promise<void> {
  await api("/api/auth/logout", { method: "POST" });
}

/** Returns the logged-in user, or null when not authenticated. */
export async function fetchMe(): Promise<AuthUser | null> {
  const res = await fetch(`${API_BASE}/api/auth/me`, { credentials: "include" });
  if (!res.ok) return null;
  const body = (await res.json()) as { user?: AuthUser };
  return body.user ?? null;
}

/**
 * Geocomplete: query Nominatim for place suggestions.
 * Returns up to 5 results.
 */
export async function searchPlaces(query: string): Promise<Array<{
  displayName: string;
  lat: number;
  lon: number;
}>> {
  if (query.length < 3) return [];

  const params = new URLSearchParams({
    q: query,
    format: "json",
    limit: "5",
    addressdetails: "1",
  });

  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?${params}`,
    { headers: { "User-Agent": "graha-remedy-app/0.1.0" } },
  );

  if (!res.ok) return [];

  const hits = (await res.json()) as Array<{
    display_name: string;
    lat: string;
    lon: string;
  }>;

  return hits.map((h) => ({
    displayName: h.display_name.split(",").slice(0, 3).join(",").trim(),
    lat: parseFloat(h.lat),
    lon: parseFloat(h.lon),
  }));
}
