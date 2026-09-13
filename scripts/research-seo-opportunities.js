const fs = require("node:fs/promises");
const path = require("node:path");

const ROOT_DIR = path.resolve(__dirname, "..");
process.loadEnvFile(path.join(ROOT_DIR, ".env"));

const API_ROOT = "https://api.dataforseo.com/v3";
const OUTPUT_DIR = path.join(ROOT_DIR, "data/seo_research/focused");
const MAX_BUDGET_USD = 1;
let totalCost = 0;

const SEED_BATCHES = [
  [
    "career astrology",
    "job astrology",
    "career astrology calculator",
    "job astrology calculator",
    "career delay astrology",
    "job delay astrology",
    "astrology remedies for career",
    "promotion astrology",
    "business astrology",
    "business failure astrology",
    "career prediction birth chart",
    "rahu mahadasha remedies",
    "shani mahadasha remedies",
    "ketu mahadasha remedies",
    "moon mahadasha remedies",
    "venus mahadasha remedies",
    "jupiter mahadasha remedies",
    "mercury mahadasha remedies",
    "mars mahadasha remedies",
    "sun mahadasha remedies",
  ],
  [
    "ketu 8th house remedies",
    "moon 8th house remedies",
    "jupiter 8th house remedies",
    "rahu 7th house remedies",
    "ketu 7th house remedies",
    "saturn 7th house remedies",
    "venus 7th house remedies",
    "rahu 8th house remedies",
    "saturn 8th house remedies",
    "moon rahu conjunction remedies",
    "sun saturn conjunction remedies",
    "sun rahu conjunction remedies",
    "mars rahu conjunction remedies",
    "venus rahu conjunction remedies",
    "jupiter rahu conjunction remedies",
    "moon saturn conjunction remedies",
    "venus saturn conjunction remedies",
    "mars saturn conjunction remedies",
    "ketu venus conjunction remedies",
    "rahu ketu conjunction remedies",
  ],
  [
    "foreign settlement astrology",
    "foreign travel astrology",
    "foreign settlement calculator",
    "foreign travel calculator astrology",
    "videsh yoga calculator",
    "abroad settlement astrology",
    "rahu beej mantra",
    "rahu gayatri mantra",
    "rahu mantra jaap",
    "shani beej mantra",
    "surya beej mantra",
    "shukra beej mantra",
    "budh beej mantra",
    "brihaspati beej mantra",
    "chandra beej mantra",
    "ketu beej mantra",
    "mangal beej mantra",
    "navagraha mantra",
    "graha mantra",
    "planetary mantra",
  ],
];

const SERP_TARGETS = [
  "career astrology",
  "job astrology",
  "career astrology calculator",
  "job astrology calculator",
  "astrology remedies for career",
  "career delay astrology",
  "rahu mahadasha remedies",
  "shani mahadasha remedies",
  "ketu mahadasha remedies",
  "moon mahadasha remedies",
  "jupiter mahadasha remedies",
  "ketu 8th house remedies",
  "moon in 8th house remedies",
  "jupiter in 8th house remedies",
  "ketu in 7th house remedies",
  "rahu in 7th house remedies",
  "moon rahu conjunction remedies",
  "sun saturn conjunction remedies",
  "sun rahu conjunction remedies",
  "mars rahu conjunction remedies",
  "venus rahu conjunction remedies",
  "foreign settlement astrology",
  "foreign travel astrology calculator",
  "videsh yoga calculator",
  "abroad settlement astrology",
  "rahu mantra",
  "rahu beej mantra",
  "rahu gayatri mantra",
  "rahu mantra jaap",
  "shani mantra",
  "shani beej mantra",
  "surya mantra",
  "surya beej mantra",
  "mantra for shukra",
  "shukra beej mantra",
  "budh mantra",
  "budh beej mantra",
];

const OVERLAP_PAIRS = [
  ["career astrology", "job astrology"],
  ["career astrology", "career astrology calculator"],
  ["career astrology calculator", "job astrology calculator"],
  ["career astrology", "astrology remedies for career"],
  ["career astrology", "career delay astrology"],
  ["foreign settlement astrology", "foreign travel astrology calculator"],
  ["foreign settlement astrology", "abroad settlement astrology"],
  ["foreign travel astrology calculator", "videsh yoga calculator"],
  ["rahu mantra", "rahu beej mantra"],
  ["rahu mantra", "rahu gayatri mantra"],
  ["rahu mantra", "rahu mantra jaap"],
  ["shani mantra", "shani beej mantra"],
  ["surya mantra", "surya beej mantra"],
  ["mantra for shukra", "shukra beej mantra"],
  ["budh mantra", "budh beej mantra"],
];

const PLANET = /\b(sun|surya|moon|chandra|mars|mangal|mercury|budh|jupiter|brihaspati|guru|venus|shukra|saturn|shani|rahu|ketu)\b/i;

function authHeader() {
  const login = process.env.DATAFORSEO_LOGIN;
  const password = process.env.DATAFORSEO_PASSWORD;
  if (!login || !password) throw new Error("DataForSEO credentials are required");
  return `Basic ${Buffer.from(`${login}:${password}`).toString("base64")}`;
}

async function requestOnce(endpoint, payload) {
  const response = await fetch(`${API_ROOT}${endpoint}`, {
    method: payload ? "POST" : "GET",
    headers: { Authorization: authHeader(), "Content-Type": "application/json" },
    body: payload ? JSON.stringify([payload]) : undefined,
  });
  const body = await response.json();
  if (!response.ok || body.status_code !== 20000) {
    throw new Error(`DataForSEO ${body.status_code || response.status}: ${body.status_message}`);
  }
  const failed = body.tasks?.find((task) => task.status_code !== 20000);
  if (failed) throw new Error(`DataForSEO task ${failed.status_code}: ${failed.status_message}`);
  const cost = (body.tasks || []).reduce((sum, task) => sum + (task.cost || 0), 0);
  totalCost += cost;
  if (totalCost > MAX_BUDGET_USD) {
    throw new Error(`Running cost $${totalCost} exceeded $${MAX_BUDGET_USD} cap`);
  }
  return body;
}

async function request(endpoint, payload) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      return await requestOnce(endpoint, payload);
    } catch (error) {
      lastError = error;
      const retryable = /40101|internal se server error|\b5\d\d\b/i.test(error.message);
      if (!retryable || attempt === 3) throw error;
      console.warn(`Transient API failure; retrying ${attempt}/3`);
      await new Promise((resolve) => setTimeout(resolve, attempt * 1_000));
    }
  }
  throw lastError;
}

async function balance() {
  const body = await request("/appendix/user_data");
  return body.tasks?.[0]?.result?.[0]?.money?.balance;
}

function classify(keyword) {
  if (/\b(career|job|profession|promotion|business)\b/i.test(keyword)) return "career_job";
  if (/\b(dasha|mahadasha|antardasha)\b/i.test(keyword) && PLANET.test(keyword)) return "dasha";
  if (/\bhouse\b/i.test(keyword) && PLANET.test(keyword)) return "house_placement";
  if (/\bconjunction\b/i.test(keyword) && PLANET.test(keyword)) return "conjunction";
  if (/\b(foreign|abroad|overseas|videsh)\b/i.test(keyword)) return "foreign_settlement";
  if (/\bmantra\b/i.test(keyword) && (PLANET.test(keyword) || /\b(navagraha|graha|planetary)\b/i.test(keyword))) {
    return "mantra_variant";
  }
  return null;
}

function isUsable(keyword) {
  if (!classify(keyword)) return false;
  if (/\b(horoscope|today|tomorrow|202[0-9]|consultation|astrologer|course|pdf|download|song|mp3|lyrics)\b/i.test(keyword)) {
    return false;
  }
  return keyword.split(/\s+/).length <= 10 && keyword.length <= 80;
}

function normalizeOverview(item) {
  const data = item.keyword_data || item;
  const info = data.keyword_info || {};
  return {
    family: classify(data.keyword),
    keyword: data.keyword,
    search_volume: info.search_volume,
    keyword_difficulty: data.keyword_properties?.keyword_difficulty,
    intent: data.search_intent_info?.main_intent,
    competition: info.competition,
    competition_level: info.competition_level,
    cpc: info.cpc,
    last_month_volume: info.monthly_searches?.[0]?.search_volume,
  };
}

function csvCell(value) {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function toCsv(rows, columns) {
  return [
    columns.join(","),
    ...rows.map((row) => columns.map((column) => csvCell(row[column])).join(",")),
  ].join("\n");
}

function domainsFor(response) {
  return new Set(
    (response.tasks?.[0]?.result?.[0]?.items || [])
      .filter((item) => item.type === "organic" && item.domain)
      .slice(0, 10)
      .map((item) => item.domain.replace(/^www\./, "")),
  );
}

function jaccard(left, right) {
  const intersection = [...left].filter((value) => right.has(value)).length;
  const union = new Set([...left, ...right]).size;
  return union ? intersection / union : 0;
}

async function main() {
  if (!process.argv.includes("--confirm-paid")) {
    throw new Error("Pass --confirm-paid to authorize this sub-$1 research run");
  }
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  const startingBalance = await balance();
  const plannerResponses = [];
  const plannerCandidates = new Map();

  for (let index = 0; index < SEED_BATCHES.length; index += 1) {
    const response = await request("/keywords_data/google_ads/keywords_for_keywords/live", {
      keywords: SEED_BATCHES[index],
      location_name: "India",
      language_code: "en",
      include_adult_keywords: false,
    });
    plannerResponses.push(response);
    const result = response.tasks?.[0]?.result || [];
    const items = result[0]?.items || result;
    for (const item of items) {
      const keyword = item.keyword?.trim().toLowerCase();
      if (!keyword || !isUsable(keyword)) continue;
      const previous = plannerCandidates.get(keyword);
      if (!previous || (item.search_volume || 0) > (previous.search_volume || 0)) {
        plannerCandidates.set(keyword, item);
      }
    }
    console.log(`Planner batch ${index + 1}/${SEED_BATCHES.length}: ${items.length} suggestions`);
  }
  await fs.writeFile(
    path.join(OUTPUT_DIR, "planner-raw.json"),
    `${JSON.stringify(plannerResponses, null, 2)}\n`,
  );

  const exactSeeds = SEED_BATCHES.flat().map((keyword) => keyword.toLowerCase());
  const rankedPlanner = [...plannerCandidates.values()].sort(
    (a, b) => (b.search_volume || 0) - (a.search_volume || 0),
  );
  const metricKeywords = [
    ...new Set([...exactSeeds, ...rankedPlanner.slice(0, 600).map((item) => item.keyword.toLowerCase())]),
  ].slice(0, 700);
  const overviewResponse = await request("/dataforseo_labs/google/keyword_overview/live", {
    keywords: metricKeywords,
    location_name: "India",
    language_code: "en",
  });
  const overviewItems = overviewResponse.tasks?.[0]?.result?.[0]?.items || [];
  const metrics = overviewItems
    .map(normalizeOverview)
    .filter((item) => item.family)
    .sort((a, b) => (b.search_volume || 0) - (a.search_volume || 0));
  await Promise.all([
    fs.writeFile(
      path.join(OUTPUT_DIR, "keyword-overview-raw.json"),
      `${JSON.stringify(overviewResponse, null, 2)}\n`,
    ),
    fs.writeFile(
      path.join(OUTPUT_DIR, "keyword-metrics.csv"),
      `${toCsv(metrics, [
        "family",
        "keyword",
        "search_volume",
        "keyword_difficulty",
        "intent",
        "competition",
        "competition_level",
        "cpc",
        "last_month_volume",
      ])}\n`,
    ),
  ]);
  console.log(`Exact metrics: ${metrics.length}/${metricKeywords.length} keywords`);

  const serpResponses = new Map();
  const serpRows = [];
  for (let index = 0; index < SERP_TARGETS.length; index += 1) {
    const keyword = SERP_TARGETS[index];
    const response = await request("/serp/google/organic/live/advanced", {
      keyword,
      location_name: "India",
      language_code: "en",
      device: "desktop",
      os: "windows",
      depth: 10,
    });
    serpResponses.set(keyword, response);
    const result = response.tasks?.[0]?.result?.[0];
    for (const item of (result?.items || []).filter((entry) => entry.type === "organic")) {
      serpRows.push({
        keyword,
        rank: item.rank_group,
        domain: item.domain,
        title: item.title,
        url: item.url,
        features: (result.item_types || []).join("|"),
      });
    }
    console.log(`SERP ${index + 1}/${SERP_TARGETS.length}: ${keyword}`);
    await Promise.all([
      fs.writeFile(
        path.join(OUTPUT_DIR, "serps-partial-raw.json"),
        `${JSON.stringify(Object.fromEntries(serpResponses), null, 2)}\n`,
      ),
      fs.writeFile(
        path.join(OUTPUT_DIR, "serps-partial.csv"),
        `${toCsv(serpRows, ["keyword", "rank", "domain", "title", "url", "features"])}\n`,
      ),
    ]);
  }

  const overlapRows = OVERLAP_PAIRS.map(([leftKeyword, rightKeyword]) => {
    const overlap = jaccard(
      domainsFor(serpResponses.get(leftKeyword)),
      domainsFor(serpResponses.get(rightKeyword)),
    );
    return {
      keyword_a: leftKeyword,
      keyword_b: rightKeyword,
      domain_jaccard: overlap.toFixed(3),
      shared_intent_signal:
        overlap >= 0.4 ? "strong_consolidate" : overlap >= 0.2 ? "moderate_review" : "low_separate_possible",
    };
  });
  const endingBalance = await balance();

  await Promise.all([
    fs.writeFile(
      path.join(OUTPUT_DIR, "serps-raw.json"),
      `${JSON.stringify(Object.fromEntries(serpResponses), null, 2)}\n`,
    ),
    fs.writeFile(
      path.join(OUTPUT_DIR, "serps.csv"),
      `${toCsv(serpRows, ["keyword", "rank", "domain", "title", "url", "features"])}\n`,
    ),
    fs.writeFile(
      path.join(OUTPUT_DIR, "serp-overlap.csv"),
      `${toCsv(overlapRows, ["keyword_a", "keyword_b", "domain_jaccard", "shared_intent_signal"])}\n`,
    ),
    fs.writeFile(
      path.join(OUTPUT_DIR, "costs.json"),
      `${JSON.stringify(
        {
          budget_cap_usd: MAX_BUDGET_USD,
          reported_api_cost_usd: totalCost,
          starting_balance_usd: startingBalance,
          ending_balance_usd: endingBalance,
          observed_balance_change_usd: startingBalance - endingBalance,
        },
        null,
        2,
      )}\n`,
    ),
  ]);

  console.log(`Focused research cost: $${totalCost}`);
  console.log(`Balance: $${startingBalance} -> $${endingBalance}`);
}

main().catch((error) => {
  console.error(`Focused SEO research failed: ${error.message}`);
  process.exitCode = 1;
});
