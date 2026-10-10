import type { Metadata } from "next";
import { FestivalsHub } from "@/src/components/calendar/FestivalViews";

export const revalidate = 3600;

// oxlint-disable-next-line react/only-export-components -- App Router metadata belongs with the route.
export const metadata: Metadata = {
  title: { absolute: "Upcoming Hindu Festivals – Dates and Tithi Timings" },
  description: "Upcoming Hindu festivals with dates and tithi start and end times: Diwali, Holi, Navratri, Dussehra, Janmashtami, Raksha Bandhan, Karwa Chauth and more.",
  alternates: { canonical: "/festivals" },
};

export default function Page() {
  return <FestivalsHub />;
}
