// Submit every URL in the live sitemap to IndexNow (Bing, Yandex, Naver, Seznam, Yep — not Google).
// The key file is served from frontend/public/<key>.txt. Usage: node scripts/indexnow-submit.js
const SITE_URL = process.env.SITE_URL || "https://www.graharemedy.com";
const KEY = "1f618ed3e31d3ab2d3c2336f2c434e2c";
const ENDPOINT = "https://api.indexnow.org/indexnow";
const BATCH_SIZE = 10000; // IndexNow's per-request limit

async function sitemapUrls() {
  const res = await fetch(`${SITE_URL}/sitemap.xml`);
  if (!res.ok) throw new Error(`sitemap.xml returned HTTP ${res.status}`);
  const xml = await res.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}

async function main() {
  const urls = await sitemapUrls();
  if (urls.length === 0) throw new Error("sitemap.xml has no <loc> entries");
  const host = new URL(SITE_URL).host;

  for (let i = 0; i < urls.length; i += BATCH_SIZE) {
    const urlList = urls.slice(i, i + BATCH_SIZE);
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ host, key: KEY, keyLocation: `${SITE_URL}/${KEY}.txt`, urlList }),
    });
    // 200 = accepted, 202 = accepted and key validation pending; anything else is a failure.
    if (res.status !== 200 && res.status !== 202) {
      throw new Error(`IndexNow returned HTTP ${res.status}: ${await res.text()}`);
    }
    console.log(`IndexNow: submitted ${urlList.length} URLs (HTTP ${res.status})`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
