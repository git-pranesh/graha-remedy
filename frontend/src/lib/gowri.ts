/**
 * Gowri Panchangam (Tamil): daytime (sunrise to sunset) and night (sunset to next sunrise) are each divided into
 * eight equal parts named by fixed traditional weekday tables. Good periods (Amirdha, Uthi, Laabam, Dhanam, Sugam)
 * are the "Gowri Nalla Neram". Tables match the widely published Tamil Gowri Panchangam (verified Oct 2026).
 */
export const GOWRI_DAY: string[][] = [["Uthi", "Amirdha", "Rogam", "Laabam", "Dhanam", "Sugam", "Soram", "Visham"], ["Amirdha", "Visham", "Rogam", "Laabam", "Dhanam", "Sugam", "Soram", "Uthi"], ["Rogam", "Laabam", "Dhanam", "Sugam", "Soram", "Uthi", "Visham", "Amirdha"], ["Laabam", "Dhanam", "Sugam", "Soram", "Visham", "Uthi", "Amirdha", "Rogam"], ["Dhanam", "Sugam", "Soram", "Uthi", "Amirdha", "Visham", "Rogam", "Laabam"], ["Sugam", "Soram", "Uthi", "Visham", "Amirdha", "Rogam", "Laabam", "Dhanam"], ["Soram", "Uthi", "Visham", "Amirdha", "Rogam", "Laabam", "Dhanam", "Sugam"]];
export const GOWRI_NIGHT: string[][] = [["Dhanam", "Sugam", "Soram", "Visham", "Uthi", "Amirdha", "Rogam", "Laabam"], ["Sugam", "Soram", "Uthi", "Amirdha", "Visham", "Rogam", "Laabam", "Dhanam"], ["Soram", "Uthi", "Visham", "Amirdha", "Rogam", "Laabam", "Dhanam", "Sugam"], ["Uthi", "Amirdha", "Rogam", "Laabam", "Dhanam", "Sugam", "Soram", "Visham"], ["Amirdha", "Visham", "Rogam", "Laabam", "Dhanam", "Sugam", "Soram", "Uthi"], ["Rogam", "Laabam", "Dhanam", "Sugam", "Soram", "Uthi", "Visham", "Amirdha"], ["Laabam", "Dhanam", "Sugam", "Soram", "Uthi", "Visham", "Amirdha", "Soram"]];

export const GOWRI_INFO: Record<string, { ta: string; meaning: string; good: boolean }> = {
  Amirdha: { ta: "அமிர்தம்", meaning: "Best", good: true },
  Uthi: { ta: "உத்தி", meaning: "Good", good: true },
  Laabam: { ta: "லாபம்", meaning: "Gain", good: true },
  Dhanam: { ta: "தனம்", meaning: "Wealth", good: true },
  Sugam: { ta: "சுகம்", meaning: "Good", good: true },
  Rogam: { ta: "ரோகம்", meaning: "Evil", good: false },
  Soram: { ta: "சோரம்", meaning: "Bad", good: false },
  Visham: { ta: "விஷம்", meaning: "Bad", good: false },
};
