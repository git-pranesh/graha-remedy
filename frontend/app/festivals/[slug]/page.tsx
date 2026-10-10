import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hreflang } from "@/src/lib/alternates";
import { FEST_YEARS, FestivalPage, FestivalsYear } from "@/src/components/calendar/FestivalViews";
import { FESTIVALS, festivalDates } from "@/src/services/festivals";
import { DELHI } from "@/src/lib/calendar-pages";
import { fmtDateLong } from "@/src/lib/panchang-format";

export const revalidate = 86400;
export const dynamicParams = false;

// oxlint-disable-next-line react/only-export-components -- App Router build-time export.
export function generateStaticParams() {
  return [...FESTIVALS.map((f) => ({ slug: f.slug })), ...FEST_YEARS.map((y) => ({ slug: String(y) }))];
}

interface Props { params: Promise<{ slug: string }> }

// oxlint-disable-next-line react/only-export-components -- App Router metadata belongs with the route.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (/^\d{4}$/.test(slug)) {
    return { title: { absolute: `Hindu Festivals ${slug} – Complete List with Dates` }, description: `All major Hindu festivals in ${slug} with dates and tithi timings: Holi, Navratri, Dussehra, Diwali, Janmashtami and more (New Delhi).`, alternates: hreflang(`/festivals/${slug}`, `/hi/festivals/${slug}`, "en") };
  }
  const def = FESTIVALS.find((f) => f.slug === slug);
  if (!def) return {};
  const d = FEST_YEARS.map((y) => festivalDates(y, DELHI, [def])[0]).filter(Boolean);
  const years = d.map((x) => x.date.slice(0, 4)).join(" & ");
  return {
    title: { absolute: `${def.name} ${years} Date and Tithi Timings` },
    description: `${def.name} ${d[0]?.date.slice(0, 4)}: ${d[0] ? fmtDateLong(d[0].date) : ""}. Exact tithi timings and how the date is decided, with ${years} dates.`,
    alternates: hreflang(`/festivals/${def.slug}`, `/hi/festivals/${def.slug}`, "en"),
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  if (/^\d{4}$/.test(slug)) {
    const y = Number(slug);
    if (!FEST_YEARS.includes(y)) notFound();
    return <FestivalsYear year={y} />;
  }
  const def = FESTIVALS.find((f) => f.slug === slug);
  if (!def) notFound();
  return <FestivalPage def={def} />;
}
