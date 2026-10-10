import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RegionalCalendarYear } from "@/src/components/regional/RegionalCalendar";
import { CAL_YEARS_REGIONAL } from "@/src/lib/regional";

export const revalidate = 86400;
export const dynamicParams = false;

// oxlint-disable-next-line react/only-export-components -- App Router build-time export.
export function generateStaticParams() {
  return CAL_YEARS_REGIONAL.map((y) => ({ year: String(y) }));
}

interface Props { params: Promise<{ year: string }> }

// oxlint-disable-next-line react/only-export-components -- App Router metadata belongs with the route.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { year } = await params;
  return { title: { absolute: `తెలుగు క్యాలెండర్ ${year} – నెలవారీ తిథి, నక్షత్రం, ఏకాదశి, అమావాస్య, పౌర్ణమి` }, description: `తెలుగు క్యాలెండర్ ${year}: ప్రతి నెల తిథులు, నక్షత్రాలు, ఏకాదశి, అమావాస్య, పౌర్ణమి తేదీలు (హైదరాబాద్).`, alternates: { canonical: `/te/calendar/${year}` } };
}

export default async function Page({ params }: Props) {
  const year = Number((await params).year);
  if (!CAL_YEARS_REGIONAL.includes(year)) notFound();
  return <RegionalCalendarYear lang="te" year={year} />;
}
