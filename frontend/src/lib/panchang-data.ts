/** Server-side helpers: memoised panchang per city and local date. */
import { computeDayTimes, computePanchang, todayInTimezone, type DayTimes, type Panchang } from "../services/panchang";
import type { City } from "./cities";

const panchangCache = new Map<string, Panchang>();
const dayCache = new Map<string, DayTimes>();
const MAX = 2000;

function remember<T>(map: Map<string, T>, key: string, make: () => T): T {
  const hit = map.get(key);
  if (hit) return hit;
  const v = make();
  if (map.size >= MAX) map.delete(map.keys().next().value!);
  map.set(key, v);
  return v;
}

export function cityToday(city: City): string {
  return todayInTimezone(city.timezone);
}

export function cityPanchang(city: City, date = cityToday(city)): Panchang {
  return remember(panchangCache, `${city.slug}|${date}`, () =>
    computePanchang(date, city.latitude, city.longitude, city.timezone),
  );
}

export function cityDayTimes(city: City, date = cityToday(city)): DayTimes {
  return remember(dayCache, `${city.slug}|${date}`, () =>
    computeDayTimes(date, city.latitude, city.longitude, city.timezone),
  );
}

/** Minutes between two ISO instants (b - a). */
export function minutesBetween(a: string | null, b: string | null): number | null {
  if (!a || !b) return null;
  return Math.round((Date.parse(b) - Date.parse(a)) / 60000);
}
