import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HiFestivalPage, HiFestivalsYear } from "@/src/components/calendar/HiFestivalViews";
import { FEST_YEARS } from "@/src/components/calendar/FestivalViews";
import { FESTIVALS, festivalDates } from "@/src/services/festivals";
import { DELHI } from "@/src/lib/calendar-pages";
import { fmtDateLong } from "@/src/lib/panchang-format";
import { hreflang } from "@/src/lib/alternates";

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
    return { title: { absolute: `हिंदू त्योहार ${slug} – पूरी सूची और तारीखें` }, description: `${slug} के सभी प्रमुख हिंदू त्योहार तारीख और तिथि के समय सहित: होली, नवरात्रि, दशहरा, दिवाली, जन्माष्टमी और अन्य।`, alternates: hreflang(`/festivals/${slug}`, `/hi/festivals/${slug}`, "hi"), openGraph: { locale: "hi_IN" } };
  }
  const def = FESTIVALS.find((f) => f.slug === slug);
  if (!def) return {};
  const d = FEST_YEARS.map((y) => festivalDates(y, DELHI, [def])[0]).filter(Boolean);
  return {
    title: { absolute: `${def.hindi} ${d.map((x) => x.date.slice(0, 4)).join(" और ")} – तारीख और तिथि का समय` },
    description: `${def.hindi} ${d[0]?.date.slice(0, 4)}: ${d[0] ? fmtDateLong(d[0].date, "hi") : ""}। तिथि का सटीक समय, पूजा मुहूर्त और तारीख कैसे तय होती है।`,
    alternates: hreflang(`/festivals/${def.slug}`, `/hi/festivals/${def.slug}`, "hi"),
    openGraph: { locale: "hi_IN" },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  if (/^\d{4}$/.test(slug)) {
    const y = Number(slug);
    if (!FEST_YEARS.includes(y)) notFound();
    return <HiFestivalsYear year={y} />;
  }
  const def = FESTIVALS.find((f) => f.slug === slug);
  if (!def) notFound();
  return <HiFestivalPage def={def} />;
}
