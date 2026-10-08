import Link from "next/link";
import { INDIAN_CITIES, WORLD_CITIES } from "../../lib/cities";

/** Links to every city page for a section ("/panchang", "/rahu-kaal", "/choghadiya"). */
export default function CityIndex({ base, label }: { base: string; label: string }) {
  return (
    <>
      <h2>{label} in Indian cities</h2>
      <ul className="pc-city-links">
        {INDIAN_CITIES.map((c) => (
          <li key={c.slug}><Link href={`${base}/${c.slug}`}>{c.name}</Link></li>
        ))}
      </ul>
      <h2>{label} outside India (local time)</h2>
      <ul className="pc-city-links">
        {WORLD_CITIES.map((c) => (
          <li key={c.slug}><Link href={`${base}/${c.slug}`}>{c.name}</Link></li>
        ))}
      </ul>
    </>
  );
}
