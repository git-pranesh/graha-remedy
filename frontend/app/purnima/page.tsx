import type { Metadata } from "next";
import { CalendarHub } from "@/src/components/calendar/CalendarPages";

export const revalidate = 3600;

// oxlint-disable-next-line react/only-export-components -- App Router metadata belongs with the route.
export const metadata: Metadata = {
  title: { absolute: "Next Purnima Date – When Is Purnima? Tithi Timings" },
  description: "Date of the next Purnima with exact tithi start and end times, upcoming Purnima dates and how the observance day is decided.",
  alternates: { canonical: "/purnima" },
};

export default function Page() {
  return <CalendarHub kind="purnima" />;
}
