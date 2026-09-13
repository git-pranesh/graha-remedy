const fs = require("node:fs/promises");
const path = require("node:path");

const ROOT_DIR = path.resolve(__dirname, "..");
const INPUT_PATH = path.join(ROOT_DIR, "data/seo_research/focused/serps-raw.json");
const OUTPUT_PATH = path.join(ROOT_DIR, "data/seo_research/focused/people-also-ask.csv");

function csvCell(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

async function main() {
  const responses = JSON.parse(await fs.readFile(INPUT_PATH, "utf8"));
  const rows = [];

  for (const [keyword, response] of Object.entries(responses)) {
    const items = response.tasks?.[0]?.result?.[0]?.items || [];
    for (const block of items.filter((item) => item.type === "people_also_ask")) {
      for (const question of block.items || []) {
        if (question.title) rows.push({ keyword, question: question.title });
      }
    }
  }

  const unique = rows.filter(
    (row, index) =>
      rows.findIndex(
        (candidate) => candidate.keyword === row.keyword && candidate.question === row.question,
      ) === index,
  );
  const csv = [
    "keyword,question",
    ...unique.map((row) => `${csvCell(row.keyword)},${csvCell(row.question)}`),
  ].join("\n");
  await fs.writeFile(OUTPUT_PATH, `${csv}\n`);
  console.log(`Extracted ${unique.length} People Also Ask questions`);
}

main().catch((error) => {
  console.error(`Question extraction failed: ${error.message}`);
  process.exitCode = 1;
});
