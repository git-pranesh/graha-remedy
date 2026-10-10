import type { Metadata } from "next";
import NallaNeramPage from "@/src/components/regional/NallaNeramPage";
import { cityBySlug } from "@/src/lib/cities";

export const revalidate = 300;

// oxlint-disable-next-line react/only-export-components -- App Router metadata belongs with the route.
export const metadata: Metadata = {
  title: { absolute: "Nalla Neram Today – Gowri Panchangam, Rahu Kalam & Yamagandam (Chennai)" },
  description: "Today's Gowri Nalla Neram for Chennai: Amirdha, Uthi, Laabam, Dhanam and Sugam timings, day and night Gowri Panchangam, Rahu Kalam, Yamagandam, Kuligai and a 7-day table.",
  alternates: { canonical: "/nalla-neram" },
};

export default function Page() {
  return <NallaNeramPage city={cityBySlug("chennai")!} hub />;
}
