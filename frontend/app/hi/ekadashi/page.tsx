import type { Metadata } from "next";
import { HiCalendarHub, HI_KIND } from "@/src/components/calendar/HiCalendarPages";
import { hreflang } from "@/src/lib/alternates";

export const revalidate = 3600;

// oxlint-disable-next-line react/only-export-components -- App Router metadata belongs with the route.
export const metadata: Metadata = {
  title: { absolute: HI_KIND.ekadashi.hubTitle },
  description: "अगली एकादशी की तारीख तिथि के सटीक प्रारंभ और समाप्ति समय सहित, आगामी तारीखें और व्रत का दिन कैसे तय होता है।",
  alternates: hreflang("/ekadashi", "/hi/ekadashi", "hi"),
  openGraph: { locale: "hi_IN", url: "/hi/ekadashi", type: "website" },
};

export default function Page() {
  return <HiCalendarHub kind="ekadashi" />;
}
