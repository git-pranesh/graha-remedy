import type { Metadata } from "next";
import RegionalPanchang, { DEFAULT_CITY } from "@/src/components/regional/RegionalPanchang";
import { cityBySlug } from "@/src/lib/cities";

export const revalidate = 300;

const TITLE = "ఈ రోజు పంచాంగం – తెలుగు పంచాంగం: తిథి, నక్షత్రం, రాహుకాలం, దుర్ముహూర్తం";
const DESC = "ఈ రోజు తెలుగు పంచాంగం: తిథి, నక్షత్రం, యోగం, కరణం ముగింపు సమయాలతో, సూర్యోదయం, రాహుకాలం, యమగండం, దుర్ముహూర్తం, వర్జ్యం, అమృత కాలం — మీ నగరానికి ఖచ్చితంగా.";

// oxlint-disable-next-line react/only-export-components -- App Router metadata belongs with the route.
export const metadata: Metadata = {
  title: { absolute: TITLE }, description: DESC,
  alternates: { canonical: "/te/panchangam" },
  openGraph: { title: TITLE, description: DESC, url: "/te/panchangam", type: "website", locale: "te_IN" },
};

export default function Page() {
  return <RegionalPanchang lang="te" city={cityBySlug(DEFAULT_CITY["te"])!} hub />;
}
