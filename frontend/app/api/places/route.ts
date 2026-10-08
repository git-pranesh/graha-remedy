import { NextResponse } from "next/server";
import { searchPlaces } from "@/src/services/places";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q") ?? "";
  if (q.length > 80) return NextResponse.json({ places: [] }, { status: 400 });
  const places = searchPlaces(q, 8).map((p) => ({
    label: p.label,
    latitude: p.latitude,
    longitude: p.longitude,
    timezone: p.timezone,
  }));
  return NextResponse.json(
    { places },
    { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" } },
  );
}
