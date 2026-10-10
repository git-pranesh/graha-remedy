import type { Metadata } from "next";
import RegionalPanchang from "@/src/components/regional/RegionalPanchang";
import { DEFAULT_CITY } from "@/src/lib/regional";
import { cityBySlug } from "@/src/lib/cities";

export const revalidate = 300;

const TITLE = "இன்றைய பஞ்சாங்கம் – தமிழ் பஞ்சாங்கம்: திதி, நட்சத்திரம், ராகு காலம், எமகண்டம்";
const DESC = "இன்றைய தமிழ் பஞ்சாங்கம்: தமிழ் தேதி, திதி, நட்சத்திரம், யோகம், கரணம் முடிவு நேரங்களுடன், சூரிய உதயம், ராகு காலம், எமகண்டம், குளிகை — உங்கள் நகரத்திற்குத் துல்லியமாக.";

// oxlint-disable-next-line react/only-export-components -- App Router metadata belongs with the route.
export const metadata: Metadata = {
  title: { absolute: TITLE }, description: DESC,
  alternates: { canonical: "/ta/panchangam" },
  openGraph: { title: TITLE, description: DESC, url: "/ta/panchangam", type: "website", locale: "ta_IN" },
};

export default function Page() {
  return <RegionalPanchang lang="ta" city={cityBySlug(DEFAULT_CITY["ta"])!} hub />;
}
