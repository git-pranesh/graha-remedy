import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HiCalendarYear, HI_KIND } from "@/src/components/calendar/HiCalendarPages";
import { CAL_YEARS } from "@/src/lib/calendar-pages";
import { hreflang } from "@/src/lib/alternates";

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
  const l = HI_KIND.amavasya.label;
  return {
    title: { absolute: `${l} ${year} की तारीखें – पूरी सूची, तिथि के समय सहित` },
    description: `${year} की सभी ${l} तिथियाँ तिथि के प्रारंभ और समाप्ति समय के साथ (नई दिल्ली)।`,
    alternates: hreflang(`/amavasya/${year}`, `/hi/amavasya/${year}`, "hi"),
    openGraph: { locale: "hi_IN", url: `/hi/amavasya/${year}`, type: "website" },
  };
}

export default async function Page({ params }: Props) {
  const year = Number((await params).year);
  if (!CAL_YEARS.includes(year)) notFound();
  return <HiCalendarYear kind="amavasya" year={year} />;
}
