import type { Metadata } from "next";
import { hreflang } from "@/src/lib/alternates";
import { CalendarHub } from "@/src/components/calendar/CalendarPages";

export const revalidate = 3600;

// oxlint-disable-next-line react/only-export-components -- App Router metadata belongs with the route.
export const metadata: Metadata = {
  title: { absolute: "Next Ekadashi Date – When Is Ekadashi? Tithi Timings" },
  description: "Date of the next Ekadashi with exact tithi start and end times, upcoming Ekadashi dates and how the observance day is decided.",
  alternates: hreflang("/ekadashi", "/hi/ekadashi", "en"),
};

export default function Page() {
  return <CalendarHub kind="ekadashi" />;
}
