import type { Metadata } from "next";
import { HiFestivalsHub } from "@/src/components/calendar/HiFestivalViews";
import { hreflang } from "@/src/lib/alternates";

export const revalidate = 3600;

// oxlint-disable-next-line react/only-export-components -- App Router metadata belongs with the route.
export const metadata: Metadata = {
  title: { absolute: "आगामी हिंदू त्योहार – तारीख और तिथि का समय (दिवाली, होली, नवरात्रि)" },
  description: "आगामी हिंदू त्योहारों की तारीख और तिथि का सटीक समय: दिवाली, होली, नवरात्रि, दशहरा, जन्माष्टमी, रक्षा बंधन, करवा चौथ और अन्य।",
  alternates: hreflang("/festivals", "/hi/festivals", "hi"),
  openGraph: { locale: "hi_IN", url: "/hi/festivals", type: "website" },
};

export default function Page() {
  return <HiFestivalsHub />;
}
