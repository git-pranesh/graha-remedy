export interface ToolMeta {
  slug: string;
  name: string;       // short nav name
  title: string;      // <title>
  description: string;
}

export const TOOLS: ToolMeta[] = [
  {
    slug: "nakshatra-calculator",
    name: "Nakshatra Calculator",
    title: "Nakshatra Calculator — Find Your Birth Star & Pada by Date of Birth",
    description:
      "Find your Janma Nakshatra, pada, nakshatra lord, deity and Nadi from your date, time and place of birth. Free, Lahiri ayanamsa, Swiss Ephemeris precision.",
  },
  {
    slug: "rashi-calculator",
    name: "Rashi (Moon Sign) Calculator",
    title: "Rashi Calculator — Find Your Moon Sign (Janma Rashi) by Date of Birth",
    description:
      "Find your Vedic Moon sign (Janma Rashi) from your date of birth, even without a birth time. Shows rashi lord, nakshatra and the Sanskrit and Hindi rashi name.",
  },
  {
    slug: "lagna-calculator",
    name: "Lagna (Ascendant) Calculator",
    title: "Lagna Calculator — Vedic Ascendant & Lagna Chart by Birth Time",
    description:
      "Calculate your Vedic ascendant (Lagna) with degree, lagna lord and nakshatra, plus every planet's sign and house. Sidereal, Lahiri ayanamsa, whole-sign houses.",
  },
  {
    slug: "mahadasha-calculator",
    name: "Mahadasha Calculator",
    title: "Mahadasha Calculator — Current Vimshottari Dasha & Antardasha Dates",
    description:
      "Find your running Vimshottari Mahadasha and Antardasha with exact start and end dates, your dasha balance at birth and a full 120-year timeline.",
  },
  {
    slug: "manglik-dosha-calculator",
    name: "Manglik Dosha Calculator",
    title: "Manglik Dosha Calculator — Check Mangal Dosha from Lagna and Moon",
    description:
      "Check Manglik (Mangal / Kuja) dosha: Mars in the 1st, 2nd, 4th, 7th, 8th or 12th house from your Lagna and Moon, with commonly cited mitigating factors.",
  },
  {
    slug: "sade-sati-calculator",
    name: "Sade Sati Calculator",
    title: "Sade Sati Calculator — Are You in Shani Sade Sati? Exact Dates",
    description:
      "Check whether Shani Sade Sati or Dhaiya is running for your Moon sign, with exact phase dates for your whole lifetime, calculated from Saturn's real transits.",
  },
  {
    slug: "kaal-sarp-dosh-calculator",
    name: "Kaal Sarp Dosh Calculator",
    title: "Kaal Sarp Dosh Calculator — Check Kaal Sarp Yoga & Its Type",
    description:
      "Check whether all seven planets are hemmed between Rahu and Ketu in your birth chart, and which of the 12 named Kaal Sarp types applies.",
  },
];

export function toolBySlug(slug: string): ToolMeta {
  const t = TOOLS.find((x) => x.slug === slug);
  if (!t) throw new Error(`Unknown tool ${slug}`);
  return t;
}
