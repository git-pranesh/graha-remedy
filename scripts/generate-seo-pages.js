const fs = require("node:fs/promises");
const path = require("node:path");

const ROOT_DIR = path.resolve(__dirname, "..");

try {
  process.loadEnvFile(path.join(ROOT_DIR, ".env"));
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

const PLANETS_PATH = path.join(ROOT_DIR, "data/planets/planets.json");
const PROBLEMS_PATH = path.join(
  ROOT_DIR,
  "data/remedies_by_problem/remedies_by_problem.json",
);
const REMEDIES_PATH = path.join(ROOT_DIR, "data/remedies/remedies.json");
const OUTPUT_DIR = path.join(ROOT_DIR, "data/seo_pages");
const ALL_KEYWORDS_PATH = path.join(ROOT_DIR, "data/koala_keywords_all.txt");
const MAPPED_KEYWORDS_PATH = path.join(ROOT_DIR, "data/koala_keywords_mapped.txt");

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = process.env.OPENROUTER_MODEL || "openai/gpt-5.6-sol";
const MAX_ATTEMPTS = 3;

function displayName(id) {
  return id
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function safeFilePart(id) {
  return id.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

function stripHtml(html) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function wordCount(html) {
  const text = stripHtml(html);
  return text ? text.split(" ").length : 0;
}

function validatePage(page) {
  if (!page || typeof page !== "object" || Array.isArray(page)) {
    throw new Error("Response is not a JSON object");
  }

  const keys = ["seo_title", "meta_desc", "content_html"];
  for (const key of keys) {
    if (typeof page[key] !== "string" || !page[key].trim()) {
      throw new Error(`Missing or empty ${key}`);
    }
  }

  if (page.seo_title.length > 60) {
    throw new Error(`seo_title is ${page.seo_title.length} characters; maximum is 60`);
  }
  if (page.meta_desc.length > 155) {
    throw new Error(`meta_desc is ${page.meta_desc.length} characters; maximum is 155`);
  }

  const words = wordCount(page.content_html);
  if (words < 550 || words > 650) {
    throw new Error(`content_html is ${words} words; expected approximately 600`);
  }

  for (const tag of ["h2", "p", "ul", "li"]) {
    if (!new RegExp(`<${tag}(?:\\s|>)`, "i").test(page.content_html)) {
      throw new Error(`content_html must contain a <${tag}> element`);
    }
  }

  return {
    seo_title: page.seo_title.trim(),
    meta_desc: page.meta_desc.trim(),
    content_html: page.content_html.trim(),
  };
}

function parseJsonContent(content) {
  if (typeof content !== "string") {
    throw new Error("OpenRouter returned no text content");
  }

  const cleaned = content
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");
  return JSON.parse(cleaned);
}

function buildPrompt({ planetId, planet, problemId, relatedPlanets, remedies }) {
  const problemName = displayName(problemId);
  const westernPlanetName = displayName(planetId);

  return `Create one search-optimized article about Vedic remedies for ${problemName} in relation to ${westernPlanetName} (${planet.name}).

Planet data:
${JSON.stringify(planet, null, 2)}

The remedy mapping associates ${problemName} with these planets: ${relatedPlanets.join(", ")}.
This page intentionally covers the ${westernPlanetName} + ${problemName} combination even when ${westernPlanetName} is not in that associated list.

Approved remedies for ${westernPlanetName}:
${JSON.stringify(remedies, null, 2)}

Return only a JSON object with exactly these string fields:
- "seo_title": Catchy and natural, no more than 60 characters. Include the problem and planet when possible.
- "meta_desc": Compelling Google description, no more than 155 characters.
- "content_html": Target 625-650 words and never return fewer than 600 words. Use only <h2>, <p>, <ul>, and <li> markup. Explain the karmic and astrological interpretation, then list practical remedies using only the approved remedy data above. Include mantra practice, fasting, donations, puja, and temple guidance where provided.

Do not invent scriptures, mantras, timings, gemstones, medical claims, or guarantees. Present karmic causes as traditional Vedic interpretations rather than proven facts. Do not include <html>, <body>, Markdown, a title heading, citations, or JSON fields inside content_html.`;
}

async function callOpenRouter(input, apiKey) {
  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.OPENROUTER_SITE_URL || "http://localhost:3000",
      "X-Title": process.env.OPENROUTER_APP_NAME || "Graha Remedy SEO Generator",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are an accurate Vedic astrology content editor. Follow supplied source data exactly and return valid JSON only.",
        },
        { role: "user", content: buildPrompt(input) },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "seo_page",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              seo_title: { type: "string", maxLength: 60 },
              meta_desc: { type: "string", maxLength: 155 },
              content_html: { type: "string" },
            },
            required: ["seo_title", "meta_desc", "content_html"],
          },
        },
      },
      max_tokens: 5_000,
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`OpenRouter ${response.status}: ${details.slice(0, 500)}`);
  }

  const result = await response.json();
  const content = result.choices?.[0]?.message?.content;
  return validatePage(parseJsonContent(content));
}

async function generateWithRetry(input, apiKey) {
  let lastError;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      return await callOpenRouter(input, apiKey);
    } catch (error) {
      lastError = error;
      if (attempt < MAX_ATTEMPTS) {
        const delayMs = 1_000 * 2 ** (attempt - 1);
        console.warn(`Attempt ${attempt}/${MAX_ATTEMPTS} failed: ${error.message}`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError;
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

async function hasValidExistingPage(filePath) {
  try {
    validatePage(await readJson(filePath));
    return true;
  } catch {
    return false;
  }
}

function requestedLimit() {
  const inline = process.argv.find((arg) => arg.startsWith("--limit="));
  const separateIndex = process.argv.indexOf("--limit");
  const separate = separateIndex === -1 ? undefined : process.argv[separateIndex + 1];
  const raw = inline?.slice("--limit=".length) ?? separate;

  if (raw === undefined) return null;

  const limit = Number.parseInt(raw, 10);
  if (!Number.isInteger(limit) || limit < 1) {
    throw new Error("--limit must be a positive integer");
  }
  return limit;
}

async function main() {
  const planets = await readJson(PLANETS_PATH);
  const problems = await readJson(PROBLEMS_PATH);
  const remediesByPlanet = await readJson(REMEDIES_PATH);
  const allCombinations = Object.entries(planets).flatMap(([planetId, planet]) =>
    Object.entries(problems).map(([problemId, relatedPlanets]) => ({
      planetId,
      planet,
      problemId,
      relatedPlanets,
      remedies: remediesByPlanet[planetId],
    })),
  );
  const limit = requestedLimit();
  const combinations = limit ? allCombinations.slice(0, limit) : allCombinations;

  const missingRemedies = combinations.find((item) => !item.remedies);
  if (missingRemedies) {
    throw new Error(`No remedy data found for planet: ${missingRemedies.planetId}`);
  }

  if (process.argv.includes("--export-keywords")) {
    const toKeyword = ({ planetId, problemId }) =>
      `vedic remedies for ${displayName(problemId).toLowerCase()} caused by ${displayName(planetId)}`;
    const allKeywords = allCombinations.map(toKeyword);
    const mappedKeywords = allCombinations
      .filter(({ planetId, relatedPlanets }) => relatedPlanets.includes(planetId))
      .map(toKeyword);

    await fs.writeFile(ALL_KEYWORDS_PATH, `${allKeywords.join("\n")}\n`, "utf8");
    await fs.writeFile(MAPPED_KEYWORDS_PATH, `${mappedKeywords.join("\n")}\n`, "utf8");
    console.log(`Exported ${allKeywords.length} keywords to ${ALL_KEYWORDS_PATH}`);
    console.log(`Exported ${mappedKeywords.length} mapped keywords to ${MAPPED_KEYWORDS_PATH}`);
    return;
  }

  if (process.argv.includes("--dry-run")) {
    console.log(
      `Dry run: ${Object.keys(planets).length} planets x ${Object.keys(problems).length} problems = ${allCombinations.length} available pages${limit ? `; ${combinations.length} selected` : ""}`,
    );
    return;
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is required");
  }

  const force = process.argv.includes("--force");
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  for (let index = 0; index < combinations.length; index += 1) {
    const combination = combinations[index];
    const fileName = `${safeFilePart(combination.planetId)}_${safeFilePart(combination.problemId)}.json`;
    const outputPath = path.join(OUTPUT_DIR, fileName);

    if (!force && (await hasValidExistingPage(outputPath))) {
      console.log(`Generated ${index + 1}/${combinations.length} (existing: ${fileName})`);
      continue;
    }

    const page = await generateWithRetry(combination, apiKey);
    await fs.writeFile(outputPath, `${JSON.stringify(page, null, 2)}\n`, "utf8");
    console.log(`Generated ${index + 1}/${combinations.length}: ${fileName}`);
  }
}

main().catch((error) => {
  console.error(`SEO generation failed: ${error.message}`);
  process.exitCode = 1;
});
