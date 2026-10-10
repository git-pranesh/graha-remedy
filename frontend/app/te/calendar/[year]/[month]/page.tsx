import type { Metadata } from "next";
import { notFound } from "next/navigation";
import RegionalCalendar from "@/src/components/regional/RegionalCalendar";
import { CAL_YEARS_REGIONAL } from "@/src/lib/regional";
import { gregMonths } from "@/src/lib/hi";

export const revalidate = 86400;
export const dynamicParams = false;

// oxlint-disable-next-line react/only-export-components -- App Router build-time export.
export function generateStaticParams() {
  return CAL_YEARS_REGIONAL.flatMap((y) => Array.from({ length: 12 }, (_, i) => ({ year: String(y), month: String(i + 1) })));
}

interface Props { params: Promise<{ year: string; month: string }> }

// oxlint-disable-next-line react/only-export-components -- App Router metadata belongs with the route.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { year, month } = await params;
  const m = gregMonths("te")![Number(month) - 1];
  return { title: { absolute: `తెలుగు క్యాలెండర్ ${m} ${year} – తిథి, నక్షత్రం, రాహుకాలం` }, description: `తెలుగు క్యాలెండర్ ${m} ${year}: ప్రతి రోజు తిథి, నక్షత్రం, తెలుగు మాసం, సూర్యోదయం, రాహుకాలం, ఏకాదశి, అమావాస్య, పౌర్ణమి.`, alternates: { canonical: `/te/calendar/${year}/${month}` } };
}

export default async function Page({ params }: Props) {
  const { year, month } = await params;
  const y = Number(year), m = Number(month);
  if (!CAL_YEARS_REGIONAL.includes(y) || !(m >= 1 && m <= 12)) notFound();
  return <RegionalCalendar lang="te" year={y} month={m} />;
}
