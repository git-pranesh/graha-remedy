import type { Metadata } from "next";
import { hreflang } from "@/src/lib/alternates";
import { notFound } from "next/navigation";
import { CalendarYearPage } from "@/src/components/calendar/CalendarPages";
import { CAL_YEARS } from "@/src/lib/calendar-pages";

export const revalidate = 86400;
export const dynamicParams = false;

// oxlint-disable-next-line react/only-export-components -- App Router build-time export.
export function generateStaticParams() {
  return CAL_YEARS.map((y) => ({ year: String(y) }));
}

interface Props { params: Promise<{ year: string }> }

// oxlint-disable-next-line react/only-export-components -- App Router metadata belongs with the route.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { year } = await params;
  return {
    title: { absolute: `Ekadashi ${year} Dates – Full List with Tithi Timings` },
    description: `All Ekadashi dates in ${year} with tithi begin and end times for New Delhi, plus dates for any city worldwide.`,
    alternates: hreflang(`/ekadashi/${year}`, `/hi/ekadashi/${year}`, "en"),
  };
}

export default async function Page({ params }: Props) {
  const year = Number((await params).year);
  if (!CAL_YEARS.includes(year)) notFound();
  return <CalendarYearPage kind="ekadashi" year={year} />;
}
