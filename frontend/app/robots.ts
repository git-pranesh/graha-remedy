import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.graharemedy.com";

export const dynamic = "force-static";

/**
 * `?_rsc=` URLs are Next.js client-navigation payloads fetched when <Link>s prefetch. Pages are fully
 * server-rendered, so crawlers never need them; in Search Console they were ~80% of Googlebot's requests.
 * A bot obeys only its most specific group, so the disallow must be repeated in every group.
 */
const disallow = ["/*?_rsc=", "/*&_rsc="];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow,
      },
      {
        userAgent: ["Googlebot", "Bingbot", "GPTBot", "ClaudeBot", "PerplexityBot", "Applebot"],
        allow: "/",
        disallow,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
