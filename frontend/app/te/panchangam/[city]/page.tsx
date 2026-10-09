import type { Metadata } from "next";
import { notFound } from "next/navigation";
import RegionalPanchang, { REGIONAL_CITIES, regionalCity } from "@/src/components/regional/RegionalPanchang";
import { TE_CITY } from "@/src/lib/i18n-south";

export const revalidate = 300;
export const dynamicParams = false;

// oxlint-disable-next-line react/only-export-components -- App Router build-time export.
export function generateStaticParams() {
  return REGIONAL_CITIES.te.map((city) => ({ city }));
}

interface Props { params: Promise<{ city: string }> }

// oxlint-disable-next-line react/only-export-components -- App Router metadata belongs with the route.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params;
  const n = TE_CITY[city] ?? city;
  const title = `ఈ రోజు పంచాంగం ${n} – తిథి, నక్షత్రం, రాహుకాలం, దుర్ముహూర్తం`;
  const description = `${n} ఈ రోజు పంచాంగం: తిథి, నక్షత్రం, యోగం, కరణం, సూర్యోదయం, రాహుకాలం, యమగండం, దుర్ముహూర్తం, వర్జ్యం, అమృత కాలం — ${n} స్థానిక సమయంలో.`;
  return { title: { absolute: title }, description, alternates: { canonical: `/te/panchangam/${city}` }, openGraph: { title, description, url: `/te/panchangam/${city}`, type: "website", locale: "te_IN" } };
}

export default async function Page({ params }: Props) {
  const c = regionalCity("te", (await params).city);
  if (!c) notFound();
  return <RegionalPanchang lang="te" city={c} />;
}
