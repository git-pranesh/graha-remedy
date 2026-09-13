const fs = require("node:fs/promises");
const path = require("node:path");

const ROOT_DIR = path.resolve(__dirname, "..");
const RESEARCH_DIR = path.join(ROOT_DIR, "data/seo_research");
const INPUT_PATH = path.join(RESEARCH_DIR, "planner-ideas-raw.json");

const PLANETS = [
  ["sun", ["sun", "surya"]],
  ["moon", ["moon", "chandra"]],
  ["mars", ["mars", "mangal"]],
  ["mercury", ["mercury", "budh"]],
  ["jupiter", ["jupiter", "brihaspati", "guru"]],
  ["venus", ["venus", "shukra"]],
  ["saturn", ["saturn", "shani"]],
  ["rahu", ["rahu"]],
  ["ketu", ["ketu"]],
];

const TOPICS = [
  ["career", /\b(career|job|employment|promotion|profession|business)\b/],
  ["relationships", /\b(marriage|married|relationship|love|divorce|family|child|conception)\b/],
  ["health", /\b(health|illness|mental|anxiety|depression|insomnia|sleep|headache|migraine|bone|joint|eye)\b/],
  ["finance_property", /\b(money|wealth|financial|finance|debt|poverty|property|legal|court)\b/],
  ["education", /\b(education|exam|study|studies|student|learning)\b/],
  ["travel", /\b(foreign|travel|abroad|settlement|overseas)\b/],
  ["spiritual_protection", /\b(spiritual|meditation|negative energy|evil eye|vastu)\b/],
];

const EXCLUDE = /\b(horoscope|zodiac|prediction|predict|consultation|consultant|astrologer|psychic|healer|today|tomorrow|weekly|monthly|yearly|202[0-9]|yantra|homeopath|home remedy|medicine|treatment|therapy|pdf|download|price|near me|course|certification|meaning in hindi)\b/i;
const NICHE = /\b(astrology|astrological|vedic|jyotish|graha|navagraha|remedy|remedies|mantra|mantras|vastu|evil eye)\b/i;

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

function findPlanet(keyword) {
  for (const [planet, aliases] of PLANETS) {
    if (aliases.some((alias) => new RegExp(`\\b${alias}\\b`, "i").test(keyword))) return planet;
  }
  return null;
}

function findTopic(keyword) {
  for (const [topic, pattern] of TOPICS) {
    if (pattern.test(keyword)) return topic;
  }
  return null;
}

function classify(keyword) {
  const planet = findPlanet(keyword);
  const topic = findTopic(keyword);
  if (planet && topic) return { cluster: `${planet}_${topic}`, page_type: "combination" };
  if (planet) return { cluster: `planet_${planet}`, page_type: "planet" };
  if (topic) return { cluster: `problem_${topic}`, page_type: "problem" };
  return { cluster: "core_remedies", page_type: "hub" };
}

function isRelevant(keyword) {
  if (!NICHE.test(keyword) || EXCLUDE.test(keyword)) return false;
  const planet = findPlanet(keyword);
  const topic = findTopic(keyword);
  const remedyIntent = /\b(remedy|remedies|mantra|mantras)\b/i.test(keyword);
  const astrologyIntent = /\b(astrology|astrological|vedic|jyotish|graha|navagraha)\b/i.test(keyword);

  return (
    (planet && remedyIntent) ||
    (topic && (remedyIntent || astrologyIntent)) ||
    /\b(vedic astrology remedies|graha remedies|navagraha remedies|planet mantras)\b/i.test(keyword)
  );
}

function score(row) {
  const volume = row.search_volume || 0;
  const competition = row.competition_index ?? 50;
  const cpc = row.cpc || 0;
  const phraseBonus = /\b(remedy|remedies|mantra|mantras)\b/i.test(row.keyword) ? 15 : 0;
  return Math.round((Math.log10(volume + 1) * 25 + (100 - competition) * 0.2 + cpc * 2 + phraseBonus) * 10) / 10;
}

async function main() {
  const response = JSON.parse(await fs.readFile(INPUT_PATH, "utf8"));
  const result = response.tasks?.[0]?.result || [];
  const items = result[0]?.items || result;
  const seen = new Set();
  const rows = [];

  for (const item of items) {
    const keyword = item.keyword?.trim().toLowerCase();
    if (!keyword || seen.has(keyword) || !isRelevant(keyword)) continue;
    seen.add(keyword);
    const classification = classify(keyword);
    rows.push({
      keyword,
      cluster: classification.cluster,
      page_type: classification.page_type,
      search_volume: item.search_volume || 0,
      competition_index: item.competition_index,
      competition: item.competition,
      cpc: item.cpc,
      score: score(item),
    });
  }

  rows.sort((a, b) => b.score - a.score || b.search_volume - a.search_volume);
  const selected = [];
  const perCluster = new Map();
  for (const row of rows) {
    const count = perCluster.get(row.cluster) || 0;
    if (count >= 8 || selected.length >= 300) continue;
    selected.push(row);
    perCluster.set(row.cluster, count + 1);
  }

  const columns = [
    "keyword",
    "cluster",
    "page_type",
    "search_volume",
    "competition_index",
    "competition",
    "cpc",
    "score",
  ];
  await Promise.all([
    fs.writeFile(
      path.join(RESEARCH_DIR, "prequalified-keywords.csv"),
      `${toCsv(rows, columns)}\n`,
    ),
    fs.writeFile(
      path.join(RESEARCH_DIR, "prequalified-keywords.txt"),
      `${selected.map((row) => row.keyword).join("\n")}\n`,
    ),
    fs.writeFile(
      path.join(RESEARCH_DIR, "prequalified-summary.json"),
      `${JSON.stringify(
        {
          planner_suggestions: items.length,
          relevant_suggestions: rows.length,
          selected_for_metrics: selected.length,
          clusters: Object.fromEntries(
            [...perCluster.entries()].sort((a, b) => a[0].localeCompare(b[0])),
          ),
        },
        null,
        2,
      )}\n`,
    ),
  ]);

  console.log(`Filtered ${items.length} suggestions to ${rows.length} relevant keywords`);
  console.log(`Selected ${selected.length} across ${perCluster.size} clusters for final metrics`);
}

main().catch((error) => {
  console.error(`Keyword analysis failed: ${error.message}`);
  process.exitCode = 1;
});
