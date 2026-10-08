import fs from "node:fs";
import path from "node:path";

/**
 * Remedy pages exist as both `foo_bar.json` and `foo-bar.json` in data/seo_pages.
 * The hyphenated URL is canonical; permanently redirect underscore variants to it.
 */
function remedySlugRedirects() {
  const candidates = [path.resolve("../data/seo_pages"), path.resolve("data/seo_pages")];
  const dir = candidates.find((d) => fs.existsSync(d));
  if (!dir) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json") && f.includes("_"))
    .map((f) => f.slice(0, -".json".length))
    .map((slug) => ({
      source: `/remedies/${slug}`,
      destination: `/remedies/${slug.replace(/_/g, "-")}`,
      permanent: true,
    }));
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["@swisseph/node"],
  async redirects() {
    return remedySlugRedirects();
  },
};

export default nextConfig;
