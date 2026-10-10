import type { Metadata } from "next";
import { notFound } from "next/navigation";
import RegionalPanchang from "@/src/components/regional/RegionalPanchang";
import { REGIONAL_CITIES, regionalCity } from "@/src/lib/regional";
import { TA_CITY } from "@/src/lib/i18n-south";

export const revalidate = 300;
export const dynamicParams = false;

// oxlint-disable-next-line react/only-export-components -- App Router build-time export.
export function generateStaticParams() {
  return REGIONAL_CITIES.ta.map((city) => ({ city }));
}

interface Props { params: Promise<{ city: string }> }

// oxlint-disable-next-line react/only-export-components -- App Router metadata belongs with the route.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params;
  const n = TA_CITY[city] ?? city;
  const title = `இன்றைய பஞ்சாங்கம் ${n} – திதி, நட்சத்திரம், ராகு காலம், எமகண்டம்`;
  const description = `${n} இன்றைய பஞ்சாங்கம்: தமிழ் தேதி, திதி, நட்சத்திரம், யோகம், கரணம், சூரிய உதயம், ராகு காலம், எமகண்டம், குளிகை — ${n} உள்ளூர் நேரத்தில்.`;
  return { title: { absolute: title }, description, alternates: { canonical: `/ta/panchangam/${city}` }, openGraph: { title, description, url: `/ta/panchangam/${city}`, type: "website", locale: "ta_IN" } };
}

export default async function Page({ params }: Props) {
  const c = regionalCity("ta", (await params).city);
  if (!c) notFound();
  return <RegionalPanchang lang="ta" city={c} />;
}
