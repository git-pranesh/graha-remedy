// Publish today's post (IST) to the Facebook Page, then the same card to the linked Instagram account.
// Runs daily from .github/workflows/social-post.yml. Without META_PAGE_TOKEN it only generates and prints
// the post (dry run), so it is safe to run locally.
//
// Env: META_PAGE_ID, META_PAGE_TOKEN (long-lived Page token), META_IG_USER_ID (optional: skips Instagram),
//      POST_DATE (optional YYYY-MM-DD, default today in IST), GRAPH_VERSION (optional).
// Usage: node social/publish.mjs
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const GRAPH = `https://graph.facebook.com/${process.env.GRAPH_VERSION || "v27.0"}`;
const { META_PAGE_ID, META_PAGE_TOKEN, META_IG_USER_ID } = process.env;
const date = process.env.POST_DATE || new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10);

async function graph(method, endpoint, params) {
  const url = new URL(`${GRAPH}/${endpoint}`);
  const init = { method };
  if (method === "GET") {
    for (const [k, v] of Object.entries({ ...params, access_token: META_PAGE_TOKEN })) url.searchParams.set(k, v);
  } else if (params instanceof FormData) {
    params.set("access_token", META_PAGE_TOKEN);
    init.body = params;
  } else {
    init.body = new URLSearchParams({ ...params, access_token: META_PAGE_TOKEN });
  }
  const res = await fetch(url, init);
  const json = await res.json();
  if (!res.ok || json.error) throw new Error(`${method} ${endpoint}: ${json.error?.message || res.status}`);
  return json;
}

async function postFacebook(card, caption) {
  const form = new FormData();
  form.set("source", new Blob([fs.readFileSync(card)], { type: "image/png" }), "card.png");
  form.set("message", caption);
  const photo = await graph("POST", `${META_PAGE_ID}/photos`, form);
  console.log(`Facebook: posted ${photo.post_id}`);
  // Facebook's copy of the image is a public JPEG, which is what Instagram needs to fetch.
  const { images } = await graph("GET", photo.id, { fields: "images" });
  return images.sort((a, b) => b.width - a.width)[0].source;
}

async function postInstagram(imageUrl, caption) {
  const { id } = await graph("POST", `${META_IG_USER_ID}/media`, { image_url: imageUrl, caption });
  for (let i = 0; i < 20; i++) {
    const { status_code } = await graph("GET", id, { fields: "status_code" });
    if (status_code === "FINISHED") break;
    if (status_code === "ERROR" || status_code === "EXPIRED") throw new Error(`Instagram container ${status_code}`);
    await new Promise((r) => setTimeout(r, 3000));
  }
  const media = await graph("POST", `${META_IG_USER_ID}/media_publish`, { creation_id: id });
  console.log(`Instagram: posted ${media.id}`);
}

async function main() {
  execFileSync("node", [path.join(HERE, "generate.mjs"), "--start", date, "--days", "1"], { stdio: "inherit" });
  const dir = path.join(HERE, "out", date);
  const read = (f) => fs.readFileSync(path.join(dir, f), "utf8");

  if (!META_PAGE_TOKEN || !META_PAGE_ID) {
    console.log(`Dry run (META_PAGE_ID / META_PAGE_TOKEN not set). Would post ${dir}/card.png with:\n\n${read("facebook.txt")}`);
    return;
  }
  const imageUrl = await postFacebook(path.join(dir, "card.png"), read("facebook.txt"));
  if (META_IG_USER_ID) await postInstagram(imageUrl, read("instagram.txt"));
  else console.log("Instagram: skipped (META_IG_USER_ID not set)");
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
