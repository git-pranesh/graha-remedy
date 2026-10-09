import type { Metadata } from "next";
import { CalendarHub } from "@/src/components/calendar/CalendarPages";

export const revalidate = 3600;

// oxlint-disable-next-line react/only-export-components -- App Router metadata belongs with the route.
export const metadata: Metadata = {
  title: { absolute: "Next Amavasya Date – When Is Amavasya? Tithi Timings" },
  description: "Date of the next Amavasya with exact tithi start and end times, upcoming Amavasya dates and how the observance day is decided.",
  alternates: { canonical: "/amavasya" },
};

export default function Page() {
  return <CalendarHub kind="amavasya" />;
}
