import { cityBySlug, type City } from "./cities";

export type South = "te" | "ta";

export const REGIONAL_CITIES: Record<South, string[]> = {
  te: ["hyderabad", "visakhapatnam", "vijayawada", "bengaluru", "chennai", "mumbai", "pune", "delhi", "dallas", "san-jose", "edison", "chicago", "atlanta", "seattle", "houston", "austin", "fremont", "new-york", "toronto", "london", "sydney", "melbourne", "singapore", "dubai"],
  ta: ["chennai", "coimbatore", "madurai", "bengaluru", "kochi", "thiruvananthapuram", "hyderabad", "mumbai", "delhi", "singapore", "london", "toronto", "sydney", "melbourne", "dubai", "new-york", "edison", "san-jose", "dallas", "houston", "chicago", "atlanta"],
};
export const DEFAULT_CITY: Record<South, string> = { te: "hyderabad", ta: "chennai" };
export function regionalCity(lang: South, slug: string): City | undefined {
  return REGIONAL_CITIES[lang].includes(slug) ? cityBySlug(slug) : undefined;
}


export const CAL_YEARS_REGIONAL = [2026, 2027];
