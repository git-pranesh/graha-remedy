import fs from "node:fs/promises";
import path from "node:path";
import type { MetadataRoute } from "next";
import { TOOLS } from "../src/lib/tools";
import { CITIES } from "../src/lib/cities";
import { REGIONAL_CITIES } from "../src/components/regional/RegionalPanchang";
import { FESTIVALS } from "../src/services/festivals";
import { MAHADASHA_PLANETS } from "../src/lib/mahadasha";
import { CAL_KINDS, CAL_YEARS } from "../src/lib/calendar-pages";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.graharemedy.com";
const SEO_PAGES_DIR = path.resolve(process.cwd(), "../data/seo_pages");

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/remedies`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/calculators`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...TOOLS.map((t) => ({
      url: `${SITE_URL}/${t.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
    ...["panchang", "rahu-kaal", "choghadiya"].flatMap((section) => [
      { url: `${SITE_URL}/${section}`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.9 },
      ...CITIES.map((c) => ({
        url: `${SITE_URL}/${section}/${c.slug}`,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 0.8,
      })),
    ]),
    ...CAL_KINDS.flatMap((k) => [
      { url: `${SITE_URL}/${k}`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.9 },
      ...CAL_YEARS.map((y) => ({ url: `${SITE_URL}/${k}/${y}`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 })),
    ]),
    ...MAHADASHA_PLANETS.map((pl) => ({ url: `${SITE_URL}/mahadasha/${pl.slug}`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 })),
    { url: `${SITE_URL}/festivals`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.9 },
    ...[2026, 2027].map((y) => ({ url: `${SITE_URL}/festivals/${y}`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.9 })),
    ...FESTIVALS.map((f) => ({ url: `${SITE_URL}/festivals/${f.slug}`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.9 })),
    { url: `${SITE_URL}/sankranti`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.8 },
    { url: `${SITE_URL}/makar-sankranti`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.9 },
    ...[2026, 2027].map((y) => ({ url: `${SITE_URL}/sankranti/${y}`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 })),
    ...(["te", "ta"] as const).flatMap((l) => [
      { url: `${SITE_URL}/${l}/panchangam`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.9 },
      ...REGIONAL_CITIES[l].map((c) => ({ url: `${SITE_URL}/${l}/panchangam/${c}`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.8 })),
      ...[2026, 2027].flatMap((y) => [
        { url: `${SITE_URL}/${l}/calendar/${y}`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 },
        ...Array.from({ length: 12 }, (_, i) => ({ url: `${SITE_URL}/${l}/calendar/${y}/${i + 1}`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.7 })),
      ]),
    ]),
    { url: `${SITE_URL}/hi`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 },
    ...["panchang", "choghadiya"].flatMap((section) => [
      { url: `${SITE_URL}/hi/${section}`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.8 },
      ...CITIES.map((c) => ({ url: `${SITE_URL}/hi/${section}/${c.slug}`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.7 })),
    ]),
    ...CAL_KINDS.flatMap((k) => [
      { url: `${SITE_URL}/hi/${k}`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.8 },
      ...CAL_YEARS.map((y) => ({ url: `${SITE_URL}/hi/${k}/${y}`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.7 })),
    ]),
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  try {
    const filenames = await fs.readdir(SEO_PAGES_DIR);
    const slugs = new Set<string>();
    for (const f of filenames) {
      if (f.endsWith(".json")) {
        const base = f.slice(0, -".json".length);
        slugs.add(base.replace(/_/g, "-"));
      }
    }

    const remedyPages: MetadataRoute.Sitemap = [...slugs].map((slug) => ({
      url: `${SITE_URL}/remedies/${slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    return [...staticPages, ...remedyPages];
  } catch {
    return staticPages;
  }
}
