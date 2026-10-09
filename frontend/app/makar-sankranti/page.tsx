import type { Metadata } from "next";
import { MakarSankranti } from "@/src/components/calendar/SankrantiViews";

export const revalidate = 3600;

// oxlint-disable-next-line react/only-export-components -- App Router metadata belongs with the route.
export const metadata: Metadata = {
  title: { absolute: "Makar Sankranti Date and Sankranti Moment – 2026, 2027" },
  description: "Makar Sankranti date and the exact moment the Sun enters Makara, why the date moves between 14 and 15 January, and dates by year.",
  alternates: { canonical: "/makar-sankranti" },
};

export default function Page() {
  return <MakarSankranti />;
}
