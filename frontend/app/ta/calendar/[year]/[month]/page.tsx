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
  const m = gregMonths("ta")![Number(month) - 1];
  return { title: { absolute: `தமிழ் காலண்டர் ${m} ${year} – தமிழ் தேதி, திதி, நட்சத்திரம், ராகு காலம்` }, description: `தமிழ் காலண்டர் ${m} ${year}: ஒவ்வொரு நாளும் தமிழ் தேதி, திதி, நட்சத்திரம், சூரிய உதயம், ராகு காலம், ஏகாதசி, அமாவாசை, பௌர்ணமி.`, alternates: { canonical: `/ta/calendar/${year}/${month}` } };
}

export default async function Page({ params }: Props) {
  const { year, month } = await params;
  const y = Number(year), m = Number(month);
  if (!CAL_YEARS_REGIONAL.includes(y) || !(m >= 1 && m <= 12)) notFound();
  return <RegionalCalendar lang="ta" year={y} month={m} />;
}
