import type { Metadata } from "next";
import { SankrantiHub } from "@/src/components/calendar/SankrantiViews";

export const revalidate = 3600;

// oxlint-disable-next-line react/only-export-components -- App Router metadata belongs with the route.
export const metadata: Metadata = {
  title: { absolute: "Next Sankranti – Date and Time of the Sun's Sign Change" },
  description: "Date and exact moment of the next Sankranti, upcoming Sankranti dates, and how the observance day is decided.",
  alternates: { canonical: "/sankranti" },
};

export default function Page() {
  return <SankrantiHub />;
}
