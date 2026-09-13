const fs = require("node:fs/promises");
const path = require("node:path");

const ROOT_DIR = path.resolve(__dirname, "..");
process.loadEnvFile(path.join(ROOT_DIR, ".env"));

const API_ROOT = "https://api.dataforseo.com/v3";
const OUTPUT_DIR = path.join(ROOT_DIR, "data/seo_research");
const PROBLEMS_PATH = path.join(
  ROOT_DIR,
  "data/remedies_by_problem/remedies_by_problem.json",
);
const PLANETS_PATH = path.join(ROOT_DIR, "data/planets/planets.json");
const MAX_BUDGET_USD = 10;

function title(id) {
  return id
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
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

function authHeader() {
  const login = process.env.DATAFORSEO_LOGIN;
  const password = process.env.DATAFORSEO_PASSWORD;
  if (!login || !password) {
    throw new Error("DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD are required");
  }
  return `Basic ${Buffer.from(`${login}:${password}`).toString("base64")}`;
}

async function request(endpoint, payload) {
  const response = await fetch(`${API_ROOT}${endpoint}`, {
    method: payload ? "POST" : "GET",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
    },
    body: payload ? JSON.stringify([payload]) : undefined,
  });
  const body = await response.json();

  if (!response.ok || body.status_code !== 20000) {
    throw new Error(
      `DataForSEO ${body.status_code || response.status}: ${body.status_message || "request failed"}`,
    );
  }

  const failedTask = body.tasks?.find((task) => task.status_code !== 20000);
  if (failedTask) {
    throw new Error(`DataForSEO task ${failedTask.status_code}: ${failedTask.status_message}`);
  }
  return body;
}

async function balance() {
  const body = await request("/appendix/user_data");
  return body.tasks?.[0]?.result?.[0]?.money?.balance;
}

async function buildSeeds() {
  const [problems, planets] = await Promise.all([
    fs.readFile(PROBLEMS_PATH, "utf8").then(JSON.parse),
    fs.readFile(PLANETS_PATH, "utf8").then(JSON.parse),
  ]);
  const seeds = new Set([
    "vedic astrology remedies",
    "graha remedies",
    "astrology remedies for life problems",
    "which planet causes problems",
  ]);

  for (const [problemId, relatedPlanets] of Object.entries(problems)) {
    const problem = title(problemId).toLowerCase();
    seeds.add(`${problem} astrology remedies`);
    for (const planetId of relatedPlanets) {
      seeds.add(`${title(planetId)} remedies for ${problem}`);
    }
  }

  for (const [planetId, planet] of Object.entries(planets)) {
    seeds.add(`${title(planetId)} remedies`);
    seeds.add(`${planet.name} remedies`);
    seeds.add(`${planet.name} mantra`);
  }

  if (seeds.size > 200) throw new Error(`Seed count ${seeds.size} exceeds API limit 200`);
  return [...seeds];
}

function normalizeItem(item) {
  const data = item.keyword_data || item;
  const info = data.keyword_info || {};
  const properties = data.keyword_properties || {};
  const intent = data.search_intent_info || {};
  const monthly = info.monthly_searches || [];

  return {
    keyword: data.keyword,
    search_volume: info.search_volume,
    keyword_difficulty: properties.keyword_difficulty,
    competition_level: info.competition_level,
    competition: info.competition,
    cpc: info.cpc,
    main_intent: intent.main_intent,
    last_month_volume: monthly[0]?.search_volume,
    twelve_month_peak: monthly.length
      ? Math.max(...monthly.map((month) => month.search_volume || 0))
      : null,
  };
}

function normalizePlannerItem(item) {
  const monthly = item.monthly_searches || [];
  return {
    keyword: item.keyword,
    search_volume: item.search_volume,
    keyword_difficulty: null,
    competition_level: item.competition,
    competition: item.competition_index,
    cpc: item.cpc,
    main_intent: null,
    last_month_volume: monthly[0]?.search_volume,
    twelve_month_peak: monthly.length
      ? Math.max(...monthly.slice(0, 12).map((month) => month.search_volume || 0))
      : null,
  };
}

async function saveStage({ name, response, rows, before, after }) {
  const charged = (response.tasks || []).reduce((sum, task) => sum + (task.cost || 0), 0);
  if (charged > MAX_BUDGET_USD) {
    throw new Error(`Reported charge $${charged} exceeded budget cap $${MAX_BUDGET_USD}`);
  }

  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await Promise.all([
    fs.writeFile(
      path.join(OUTPUT_DIR, `${name}-raw.json`),
      `${JSON.stringify(response, null, 2)}\n`,
    ),
    fs.writeFile(
      path.join(OUTPUT_DIR, `${name}.csv`),
      `${toCsv(rows, [
        "keyword",
        "search_volume",
        "keyword_difficulty",
        "competition_level",
        "competition",
        "cpc",
        "main_intent",
        "last_month_volume",
        "twelve_month_peak",
      ])}\n`,
    ),
    fs.writeFile(
      path.join(OUTPUT_DIR, `${name}-costs.json`),
      `${JSON.stringify(
        {
          budget_cap_usd: MAX_BUDGET_USD,
          reported_api_cost_usd: charged,
          balance_before_usd: before,
          balance_after_usd: after,
          observed_balance_change_usd:
            typeof before === "number" && typeof after === "number" ? before - after : null,
        },
        null,
        2,
      )}\n`,
    ),
  ]);
  return charged;
}

async function main() {
  if (!process.argv.includes("--confirm-paid")) {
    throw new Error("Pass --confirm-paid to authorize the capped DataForSEO request");
  }

  const before = await balance();
  const seeds = await buildSeeds();
  const stageArg = process.argv.find((arg) => arg.startsWith("--stage="));
  const stage = stageArg?.slice("--stage=".length) || "ideas";

  if (stage === "overview") {
    console.log(`Measuring ${seeds.length} intended seed keywords; budget cap $${MAX_BUDGET_USD}`);
    const response = await request("/dataforseo_labs/google/keyword_overview/live", {
      keywords: seeds,
      location_name: "India",
      language_code: "en",
    });
    const items = response.tasks?.[0]?.result?.[0]?.items || [];
    const rows = items.map(normalizeItem).filter((row) => row.keyword);
    const after = await balance();
    const charged = await saveStage({
      name: "seed-overview",
      response,
      rows,
      before,
      after,
    });
    console.log(`Measured ${rows.length} seed keywords`);
    console.log(`DataForSEO reported cost: $${charged}`);
    console.log(`Balance: $${before} -> $${after}`);
    return;
  }

  if (stage === "planner") {
    const plannerSeeds = [
      "vedic astrology remedies",
      "graha remedies",
      "planet remedies astrology",
      "astrology remedies for career",
      "career astrology",
      "job astrology",
      "marriage astrology remedies",
      "relationship astrology remedies",
      "money astrology remedies",
      "health astrology remedies",
      "education astrology remedies",
      "foreign travel astrology",
      "property astrology remedies",
      "legal problems astrology",
      "spiritual astrology",
      "negative energy remedies",
      "evil eye remedies",
      "vastu remedies",
      "planet mantras",
      "navagraha remedies",
    ];
    console.log(`Expanding ${plannerSeeds.length} natural query seeds; budget cap $${MAX_BUDGET_USD}`);
    const response = await request("/keywords_data/google_ads/keywords_for_keywords/live", {
      keywords: plannerSeeds,
      location_name: "India",
      language_code: "en",
      include_adult_keywords: false,
    });
    const result = response.tasks?.[0]?.result || [];
    const items = result[0]?.items || result;
    const rows = items.map(normalizePlannerItem).filter((row) => row.keyword);
    const after = await balance();
    const charged = await saveStage({
      name: "planner-ideas",
      response,
      rows,
      before,
      after,
    });
    console.log(`Received ${rows.length} Google Ads keyword suggestions`);
    console.log(`DataForSEO reported cost: $${charged}`);
    console.log(`Balance: $${before} -> $${after}`);
    return;
  }

  if (stage === "candidates") {
    const candidatePath = path.join(OUTPUT_DIR, "prequalified-keywords.txt");
    const candidates = (await fs.readFile(candidatePath, "utf8"))
      .split("\n")
      .map((keyword) => keyword.trim())
      .filter(Boolean);
    console.log(`Measuring ${candidates.length} prequalified keywords; budget cap $${MAX_BUDGET_USD}`);
    const response = await request("/dataforseo_labs/google/keyword_overview/live", {
      keywords: candidates,
      location_name: "India",
      language_code: "en",
    });
    const items = response.tasks?.[0]?.result?.[0]?.items || [];
    const rows = items.map(normalizeItem).filter((row) => row.keyword);
    const after = await balance();
    const charged = await saveStage({
      name: "candidate-overview",
      response,
      rows,
      before,
      after,
    });
    console.log(`Measured ${rows.length} candidate keywords`);
    console.log(`DataForSEO reported cost: $${charged}`);
    console.log(`Balance: $${before} -> $${after}`);
    return;
  }

  if (stage === "serps") {
    const targetPath = path.join(OUTPUT_DIR, "serp-targets.txt");
    const targets = (await fs.readFile(targetPath, "utf8"))
      .split("\n")
      .map((keyword) => keyword.trim())
      .filter(Boolean);
    console.log(`Fetching ${targets.length} live top-10 India SERPs; budget cap $${MAX_BUDGET_USD}`);
    const responses = [];
    const rows = [];

    for (let index = 0; index < targets.length; index += 1) {
      const keyword = targets[index];
      const response = await request("/serp/google/organic/live/advanced", {
        keyword,
        location_name: "India",
        language_code: "en",
        device: "desktop",
        os: "windows",
        depth: 10,
      });
      responses.push({ keyword, response });
      const result = response.tasks?.[0]?.result?.[0];
      const itemTypes = (result?.item_types || []).join("|");
      const organic = (result?.items || []).filter((item) => item.type === "organic");
      for (const item of organic) {
        rows.push({
          keyword,
          rank: item.rank_group,
          domain: item.domain,
          title: item.title,
          url: item.url,
          item_types: itemTypes,
        });
      }
      console.log(`SERP ${index + 1}/${targets.length}: ${keyword}`);
    }

    const charged = responses.reduce(
      (sum, entry) =>
        sum + (entry.response.tasks || []).reduce((taskSum, task) => taskSum + (task.cost || 0), 0),
      0,
    );
    if (charged > MAX_BUDGET_USD) {
      throw new Error(`Reported charge $${charged} exceeded budget cap $${MAX_BUDGET_USD}`);
    }
    const after = await balance();
    await Promise.all([
      fs.writeFile(
        path.join(OUTPUT_DIR, "serp-analysis-raw.json"),
        `${JSON.stringify(responses, null, 2)}\n`,
      ),
      fs.writeFile(
        path.join(OUTPUT_DIR, "serp-analysis.csv"),
        `${toCsv(rows, ["keyword", "rank", "domain", "title", "url", "item_types"])}\n`,
      ),
      fs.writeFile(
        path.join(OUTPUT_DIR, "serp-analysis-costs.json"),
        `${JSON.stringify(
          {
            reported_api_cost_usd: charged,
            balance_before_usd: before,
            balance_after_usd: after,
            observed_balance_change_usd: before - after,
          },
          null,
          2,
        )}\n`,
      ),
    ]);
    console.log(`DataForSEO reported cost: $${charged}`);
    console.log(`Balance: $${before} -> $${after}`);
    return;
  }

  if (stage !== "ideas") throw new Error(`Unknown stage: ${stage}`);
  console.log(`Submitting ${seeds.length} seeds; result limit 1,000; budget cap $${MAX_BUDGET_USD}`);

  const response = await request("/dataforseo_labs/google/keyword_ideas/live", {
    keywords: seeds,
    location_name: "India",
    language_code: "en",
    include_seed_keyword: true,
    limit: 1_000,
    order_by: ["keyword_info.search_volume,desc"],
    filters: [["keyword_info.search_volume", ">", 0]],
  });

  const items = response.tasks?.[0]?.result?.[0]?.items || [];
  const rows = items.map(normalizeItem).filter((row) => row.keyword);
  const after = await balance();
  const charged = await saveStage({
    name: "keyword-ideas",
    response,
    rows,
    before,
    after,
  });
  await Promise.all([
    fs.writeFile(path.join(OUTPUT_DIR, "seeds.txt"), `${seeds.join("\n")}\n`),
    fs.writeFile(
      path.join(OUTPUT_DIR, "costs.json"),
      `${JSON.stringify(
        {
          budget_cap_usd: MAX_BUDGET_USD,
          reported_api_cost_usd: charged,
          balance_before_usd: before,
          balance_after_usd: after,
          observed_balance_change_usd:
            typeof before === "number" && typeof after === "number" ? before - after : null,
        },
        null,
        2,
      )}\n`,
    ),
  ]);

  console.log(`Received ${rows.length} keyword ideas`);
  console.log(`DataForSEO reported cost: $${charged}`);
  console.log(`Balance: $${before} -> $${after}`);
}

main().catch((error) => {
  console.error(`Keyword research failed: ${error.message}`);
  process.exitCode = 1;
});
