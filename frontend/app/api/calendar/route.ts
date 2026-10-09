import { NextResponse } from "next/server";
import { calendarEvents, type EventKind } from "@/src/services/calendar";

const KINDS = ["ekadashi", "amavasya", "purnima"];

/** GET /api/calendar?kind=ekadashi&year=2026&lat=..&lon=..&tz=.. */
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const kind = q.get("kind") ?? "";
  const year = Number(q.get("year"));
  const lat = Number(q.get("lat"));
  const lon = Number(q.get("lon"));
  const tz = q.get("tz") ?? "";
  let tzOk = true;
  try { new Intl.DateTimeFormat("en-US", { timeZone: tz }); } catch { tzOk = false; }
  if (!KINDS.includes(kind) || !(year >= 1950 && year <= 2100) || !(Math.abs(lat) <= 90) || !(Math.abs(lon) <= 180) || !tzOk) {
    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
  }
  const events = calendarEvents(year, { latitude: lat, longitude: lon, timezone: tz }, [kind as EventKind]);
  return NextResponse.json({ events }, { headers: { "Cache-Control": "public, s-maxage=604800" } });
}
