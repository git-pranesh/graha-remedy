import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SANKRANTI_YEARS, SankrantiYear } from "@/src/components/calendar/SankrantiViews";

export const revalidate = 86400;
export const dynamicParams = false;

// oxlint-disable-next-line react/only-export-components -- App Router build-time export.
export function generateStaticParams() {
  return SANKRANTI_YEARS.map((y) => ({ year: String(y) }));
}

interface Props { params: Promise<{ year: string }> }

// oxlint-disable-next-line react/only-export-components -- App Router metadata belongs with the route.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { year } = await params;
  return {
    title: { absolute: `Sankranti ${year} Dates and Timings – All 12 Sankrantis` },
    description: `All 12 Sankranti dates in ${year} with the exact moment the Sun enters each rashi, including Makar Sankranti (New Delhi, IST).`,
    alternates: { canonical: `/sankranti/${year}` },
  };
}

export default async function Page({ params }: Props) {
  const year = Number((await params).year);
  if (!SANKRANTI_YEARS.includes(year)) notFound();
  return <SankrantiYear year={year} />;
}
