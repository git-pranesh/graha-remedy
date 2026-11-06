// One-time setup: turn a short-lived Graph API Explorer token into a non-expiring Page token and store
// it, with the Page and Instagram IDs, as GitHub Actions secrets. Secrets are typed here, never printed.
//
// Usage: node social/meta-setup.mjs
import { execFileSync } from "node:child_process";
import readline from "node:readline";

const GRAPH = `https://graph.facebook.com/${process.env.GRAPH_VERSION || "v27.0"}`;
const REPO = "git-pranesh/graha-remedy";
const PAGE_NAME = "Graha Remedy";
const REQUIRED = ["pages_manage_posts", "pages_read_engagement", "instagram_basic", "instagram_content_publish"];

// Reads a line without echoing it to the terminal.
function askHidden(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write("\n");
      resolve(answer.trim());
    });
    rl._writeToOutput = (s) => {
      if (s.startsWith(question)) rl.output.write(question);
    };
  });
}

async function graph(endpoint, params) {
  const url = new URL(`${GRAPH}/${endpoint}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok || json.error) throw new Error(`${endpoint}: ${json.error?.message || res.status}`);
  return json;
}

function setSecret(name, value) {
  execFileSync("gh", ["secret", "set", name, "--repo", REPO], { input: value, stdio: ["pipe", "ignore", "inherit"] });
  console.log(`  saved ${name}`);
}

async function main() {
  const appId = await askHidden("App ID: ");
  const appSecret = await askHidden("App secret: ");
  const shortToken = await askHidden("Token from Graph API Explorer: ");

  const { access_token: userToken } = await graph("oauth/access_token", {
    grant_type: "fb_exchange_token", client_id: appId, client_secret: appSecret, fb_exchange_token: shortToken,
  });
  const { data: pages } = await graph("me/accounts", {
    fields: "id,name,access_token,instagram_business_account{id,username}", access_token: userToken,
  });
  console.log(`Pages this token can reach: ${pages.map((p) => p.name).join(", ") || "none"}`);

  const page = pages.find((p) => p.name === PAGE_NAME);
  if (!page) throw new Error(`"${PAGE_NAME}" is not among them. Generate the token again and tick that Page.`);
  const ig = page.instagram_business_account;

  const { data: debug } = await graph("debug_token", { input_token: page.access_token, access_token: `${appId}|${appSecret}` });
  console.log(`Page: ${page.name} (${page.id})`);
  console.log(`Instagram: ${ig ? `@${ig.username} (${ig.id})` : "not found"}`);
  console.log(`Token expires: ${debug.expires_at === 0 ? "never" : new Date(debug.expires_at * 1000).toISOString()}`);
  console.log(`Permissions: ${debug.scopes.join(", ")}`);

  const missing = REQUIRED.filter((p) => !debug.scopes.includes(p));
  if (missing.length) throw new Error(`Nothing saved: the token is missing ${missing.join(", ")}. Add it in the Explorer and generate the token again.`);

  setSecret("META_PAGE_ID", page.id);
  setSecret("META_PAGE_TOKEN", page.access_token);
  if (ig) setSecret("META_IG_USER_ID", ig.id);
  console.log("Done. You can close this tab.");
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
