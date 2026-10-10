import { TOOLS } from "./tools";

export interface NavLink { href: string; label: string; lang?: string }
export interface NavColumn { title: string; links: NavLink[] }
export interface NavSection { id: string; label: string; href: string; columns: NavColumn[]; viewAll?: NavLink }

const city = (slug: string, name: string, base = "/panchang"): NavLink => ({ href: `${base}/${slug}`, label: name });

export const NAV: NavSection[] = [
  {
    id: "panchang",
    label: "Panchang",
    href: "/panchang",
    columns: [
      {
        title: "Today",
        links: [
          { href: "/panchang", label: "Today's Panchang" },
          { href: "/rahu-kaal", label: "Rahu Kaal Today" },
          { href: "/choghadiya", label: "Choghadiya Today" },
          { href: "/nalla-neram", label: "Nalla Neram / Gowri" },
          { href: "/te/panchangam", label: "Telugu Panchangam", lang: "te" },
          { href: "/ta/panchangam", label: "Tamil Panchangam", lang: "ta" },
          { href: "/panchang/delhi", label: "Panchang with Hora (Delhi)" },
        ],
      },
      {
        title: "Indian cities",
        links: [
          city("delhi", "Delhi"), city("mumbai", "Mumbai"), city("bengaluru", "Bengaluru"), city("chennai", "Chennai"),
          city("hyderabad", "Hyderabad"), city("kolkata", "Kolkata"), city("pune", "Pune"), city("ahmedabad", "Ahmedabad"),
        ],
      },
      {
        title: "Outside India",
        links: [
          city("edison", "New Jersey"), city("dallas", "Dallas"), city("san-jose", "San Jose"), city("toronto", "Toronto"),
          city("london", "London"), city("sydney", "Sydney"), city("dubai", "Dubai"), city("singapore", "Singapore"),
        ],
      },
    ],
    viewAll: { href: "/panchang", label: "All 82 cities →" },
  },
  {
    id: "festivals",
    label: "Festivals & Vrat",
    href: "/festivals",
    columns: [
      {
        title: "Festivals",
        links: [
          { href: "/festivals", label: "Upcoming Festivals" },
          { href: "/festivals/2026", label: "Festivals 2026" },
          { href: "/festivals/2027", label: "Festivals 2027" },
          { href: "/festivals/diwali", label: "Diwali" },
          { href: "/festivals/holi", label: "Holi" },
          { href: "/festivals/navratri", label: "Navratri" },
          { href: "/festivals/dussehra", label: "Dussehra" },
          { href: "/festivals/krishna-janmashtami", label: "Janmashtami" },
        ],
      },
      {
        title: "Vrat & tithi dates",
        links: [
          { href: "/ekadashi", label: "Ekadashi" },
          { href: "/amavasya", label: "Amavasya" },
          { href: "/purnima", label: "Purnima" },
          { href: "/sankranti", label: "Sankranti" },
          { href: "/makar-sankranti", label: "Makar Sankranti" },
        ],
      },
      {
        title: "Dates by year",
        links: [
          { href: "/ekadashi/2026", label: "Ekadashi 2026" },
          { href: "/ekadashi/2027", label: "Ekadashi 2027" },
          { href: "/amavasya/2026", label: "Amavasya 2026" },
          { href: "/purnima/2026", label: "Purnima 2026" },
          { href: "/sankranti/2027", label: "Sankranti 2027" },
        ],
      },
    ],
  },
  {
    id: "calculators",
    label: "Calculators",
    href: "/calculators",
    columns: [
      {
        title: "Birth chart",
        links: TOOLS.filter((t) => ["nakshatra-calculator", "rashi-calculator", "lagna-calculator", "mahadasha-calculator"].includes(t.slug)).map((t) => ({ href: `/${t.slug}`, label: t.name })),
      },
      {
        title: "Doshas",
        links: TOOLS.filter((t) => ["manglik-dosha-calculator", "sade-sati-calculator", "kaal-sarp-dosh-calculator"].includes(t.slug)).map((t) => ({ href: `/${t.slug}`, label: t.name })),
      },
      {
        title: "Mahadasha guides",
        links: [
          { href: "/mahadasha/rahu", label: "Rahu Mahadasha" }, { href: "/mahadasha/ketu", label: "Ketu Mahadasha" },
          { href: "/mahadasha/shani", label: "Shani Mahadasha" }, { href: "/mahadasha/jupiter", label: "Jupiter Mahadasha" },
          { href: "/mahadasha/venus", label: "Venus Mahadasha" }, { href: "/mahadasha/mercury", label: "Mercury Mahadasha" },
        ],
      },
    ],
    viewAll: { href: "/calculators", label: "All calculators →" },
  },
  {
    id: "remedies",
    label: "Remedies",
    href: "/remedies",
    columns: [
      {
        title: "Get remedies",
        links: [
          { href: "/", label: "Personalised Remedy Finder" },
          { href: "/remedies", label: "Mantra & Remedy Library" },
          { href: "/remedies/vedic-astrology-remedies", label: "Vedic Remedies Guide" },
          { href: "/remedies/career-astrology", label: "Career Astrology" },
        ],
      },
      {
        title: "Navagraha mantras",
        links: [
          { href: "/remedies/surya-mantra", label: "Surya (Sun)" }, { href: "/remedies/chandra-mantra", label: "Chandra (Moon)" },
          { href: "/remedies/mangal-mantra", label: "Mangal (Mars)" }, { href: "/remedies/budh-mantra", label: "Budh (Mercury)" },
          { href: "/remedies/brihaspati-mantra", label: "Brihaspati (Jupiter)" },
        ],
      },
      {
        title: "More mantras",
        links: [
          { href: "/remedies/shukra-mantra", label: "Shukra (Venus)" }, { href: "/remedies/shani-mantra", label: "Shani (Saturn)" },
          { href: "/remedies/rahu-mantra", label: "Rahu" }, { href: "/remedies/ketu-mantra", label: "Ketu" },
        ],
      },
    ],
    viewAll: { href: "/remedies", label: "Full library →" },
  },
];

export const LANGUAGES: NavLink[] = [
  { href: "/", label: "English", lang: "en" },
  { href: "/hi", label: "हिन्दी", lang: "hi" },
  { href: "/te/panchangam", label: "తెలుగు", lang: "te" },
  { href: "/ta/panchangam", label: "தமிழ்", lang: "ta" },
];

export const LEGAL: NavLink[] = [
  { href: "/about", label: "About & Methodology" },
  { href: "/contact", label: "Contact & Corrections" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
];
