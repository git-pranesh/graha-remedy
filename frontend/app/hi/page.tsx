import type { Metadata } from "next";
import Link from "next/link";
import ContentShell from "@/src/components/site/ContentShell";
import { HI_METHOD_NOTE } from "@/src/components/site/hi-notes";
import { hreflang } from "@/src/lib/alternates";
import { HI_KIND } from "@/src/components/calendar/HiCalendarPages";
import { CAL_KINDS } from "@/src/lib/calendar-pages";

const TITLE = "ग्रह रेमेडी – आज का पंचांग, चौघड़िया, एकादशी, अमावस्या और पूर्णिमा";
const DESC = "आज का पंचांग, चौघड़िया, राहु काल, एकादशी, अमावस्या और पूर्णिमा की तारीखें — Swiss Ephemeris से आपके शहर के सटीक समय के अनुसार।";

// oxlint-disable-next-line react/only-export-components -- App Router metadata belongs with the route.
export const metadata: Metadata = {
  title: { absolute: TITLE }, description: DESC,
  alternates: hreflang("/", "/hi", "hi"),
  openGraph: { title: TITLE, description: DESC, url: "/hi", type: "website", locale: "hi_IN" },
};

export default function Page() {
  return (
    <ContentShell lang="hi" switchTo={{ href: "/", label: "English" }} crumbs={[{ name: "हिन्दी", path: "/hi" }]} footerNote={HI_METHOD_NOTE}>
      <h1 className="seo-article-title">ग्रह रेमेडी – हिन्दी</h1>
      <p className="tool-lead">आपके शहर के सटीक समय के अनुसार आज का पंचांग, चौघड़िया और व्रत-तिथियाँ। सभी गणनाएँ Swiss Ephemeris और लाहिरी अयनांश से की गई हैं।</p>
      <ul className="tool-hub">
        <li><Link href="/hi/panchang" className="tool-hub-card"><strong>आज का पंचांग</strong><span>तिथि, नक्षत्र, योग, करण, राहु काल और शुभ मुहूर्त — 80+ शहरों के लिए।</span></Link></li>
        <li><Link href="/hi/choghadiya" className="tool-hub-card"><strong>आज का चौघड़िया</strong><span>दिन और रात के चौघड़िया का सटीक समय और अभी चल रहा चौघड़िया।</span></Link></li>
        {CAL_KINDS.map((k) => (
          <li key={k}><Link href={`/hi/${k}`} className="tool-hub-card"><strong>{HI_KIND[k].label} कब है?</strong><span>अगली {HI_KIND[k].label} की तारीख और 2026–2027 की पूरी सूची।</span></Link></li>
        ))}
      </ul>
    </ContentShell>
  );
}
