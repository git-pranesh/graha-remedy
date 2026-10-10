import type { Metadata } from "next";
import { notFound } from "next/navigation";
import NallaNeramPage from "@/src/components/regional/NallaNeramPage";
import { REGIONAL_CITIES, regionalCity } from "@/src/lib/regional";

export const revalidate = 300;
export const dynamicParams = false;

// oxlint-disable-next-line react/only-export-components -- App Router build-time export.
export function generateStaticParams() {
  return REGIONAL_CITIES.ta.map((city) => ({ city }));
}

interface Props { params: Promise<{ city: string }> }

// oxlint-disable-next-line react/only-export-components -- App Router metadata belongs with the route.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = regionalCity("ta", (await params).city);
  if (!c) return {};
  return {
    title: { absolute: `Nalla Neram Today in ${c.name} – Gowri Panchangam & Rahu Kalam` },
    description: `Today's Gowri Nalla Neram for ${c.name}: good periods, day and night Gowri Panchangam, Rahu Kalam, Yamagandam and Kuligai in local time, plus a 7-day table.`,
    alternates: { canonical: `/nalla-neram/${c.slug}` },
  };
}

export default async function Page({ params }: Props) {
  const c = regionalCity("ta", (await params).city);
  if (!c) notFound();
  return <NallaNeramPage city={c} />;
}
