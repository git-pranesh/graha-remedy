import type { Metadata } from "next";
import Link from "next/link";
import ContentShell, { PANCHANG_METHOD_NOTE } from "@/src/components/site/ContentShell";
import { CITIES } from "@/src/lib/cities";
import { cityDayTimes, cityToday } from "@/src/lib/panchang-data";
import { fmtDateLong, fmtRange } from "@/src/lib/panchang-format";

export const dynamic = "force-dynamic";

const TITLE = "Rahu Kaal Today – Rahu Kalam Timings for Indian and World Cities";
const DESCRIPTION =
  "Rahu Kalam today for Delhi, Mumbai, Bengaluru, Chennai, Hyderabad and 80+ cities in India and abroad, calculated from each city's own sunrise and sunset.";

// oxlint-disable-next-line react/only-export-components -- App Router metadata belongs with the route.
export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/rahu-kaal" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/rahu-kaal", type: "website" },
};

export default function RahuKaalHub() {
  const rows = CITIES.map((c) => ({ c, t: cityDayTimes(c, cityToday(c)) }));
  const istDate = rows.find((r) => r.c.slug === "delhi")!.t.date;
  return (
    <ContentShell crumbs={[{ name: "Rahu Kaal", path: "/rahu-kaal" }]} footerNote={PANCHANG_METHOD_NOTE}>
      <h1 className="seo-article-title">Rahu Kaal Today</h1>
      <p className="tool-kicker">{fmtDateLong(istDate)} (India)</p>
      <p className="tool-lead">
        Rahu Kalam is one of the eight equal parts of daytime, chosen by the weekday, so it starts at a different time in every city. The
        table gives today&apos;s Rahu Kalam for each city in its own local time; open a city for Yamaganda, Gulika and the next seven days.
      </p>
      <section className="seo-content">
        <div className="tool-table-scroll">
          <table className="tool-table">
            <thead><tr><th>City</th><th>Rahu Kalam today</th><th>Yamaganda</th></tr></thead>
            <tbody>
              {rows.map(({ c, t }) => (
                <tr key={c.slug}>
                  <td><Link href={`/rahu-kaal/${c.slug}`}>{c.name}</Link>{c.countryCode !== "IN" ? ` (${t.date.slice(8)}/${t.date.slice(5, 7)})` : ""}</td>
                  <td>{fmtRange(t.rahuKalam, t.date)}</td>
                  <td>{fmtRange(t.yamaganda, t.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="tool-note">Cities outside India show their own local date and time. Your town not listed? Use the date-and-place lookup on any city page.</p>
      </section>
    </ContentShell>
  );
}
