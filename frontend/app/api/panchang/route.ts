import { NextResponse } from "next/server";
import { computePanchang } from "@/src/services/panchang";
import { cityBySlug } from "@/src/lib/cities";

const DATE = /^\d{4}-\d{2}-\d{2}$/;

function validTz(tz: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/** GET /api/panchang?date=YYYY-MM-DD&city=slug  or  &lat=..&lon=..&tz=.. */
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const date = q.get("date") ?? "";
  if (!DATE.test(date) || Number(date.slice(0, 4)) < 1900 || Number(date.slice(0, 4)) > 2100) {
    return NextResponse.json({ error: "date must be YYYY-MM-DD between 1900 and 2100" }, { status: 400 });
  }
  let lat: number, lon: number, tz: string;
  const city = q.get("city") ? cityBySlug(q.get("city")!) : undefined;
  if (city) {
    ({ latitude: lat, longitude: lon, timezone: tz } = city);
  } else {
    lat = Number(q.get("lat"));
    lon = Number(q.get("lon"));
    tz = q.get("tz") ?? "";
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180 || !validTz(tz)) {
      return NextResponse.json({ error: "Provide a known city or valid lat, lon and tz" }, { status: 400 });
    }
  }
  const p = computePanchang(date, lat, lon, tz);
  return NextResponse.json(p, {
    headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" },
  });
}
