const fs = require("node:fs/promises");
const path = require("node:path");

const ROOT_DIR = path.resolve(__dirname, "..");
try {
  process.loadEnvFile(path.join(ROOT_DIR, ".env"));
} catch (e) {
  if (e.code !== "ENOENT") throw e;
}

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "google/gemini-3.8-flash";
const OUTPUT_DIR = path.join(ROOT_DIR, "data/seo_pages");

const CLUSTER_A_ITEMS = [
  {
    planetId: "saturn",
    primaryKeyword: "shani mantra",
    slug: "shani-mantra",
    secondaryKeywords: ["shani ka beej mantra", "shani beej mantra in english", "shani grah mantra", "shani dev mantra"],
    paaQuestions: [
      "What happens when Shani Mahadasha starts?",
      "Which god to pray during Shani Dasha?",
      "For whom is Shani Mahadasha good?",
      "How to remove negative effects of Shani?"
    ]
  },
  {
    planetId: "sun",
    primaryKeyword: "surya mantra",
    slug: "surya-mantra",
    secondaryKeywords: ["surya graha mantra", "surya navagraha mantra", "surya graha beej mantra", "sun mantra"],
    paaQuestions: [
      "What are the benefits of chanting Surya mantra?",
      "Which is the most powerful Surya mantra?",
      "What is the best time to chant Surya mantra?",
      "How many times should we chant Surya mantra?"
    ]
  },
  {
    planetId: "venus",
    primaryKeyword: "mantra for shukra",
    slug: "shukra-mantra",
    secondaryKeywords: ["shukra beej mantra", "shukra graha mantra", "mantra for venus", "shukra mantra jaap"],
    paaQuestions: [
      "Which day is best for Shukra mantra?",
      "What is the beej mantra for Shukra?",
      "How to please planet Venus (Shukra)?",
      "What happens when Venus is weak in Kundali?"
    ]
  },
  {
    planetId: "mercury",
    primaryKeyword: "budh mantra",
    slug: "budh-mantra",
    secondaryKeywords: ["budh beej mantra", "budh grah mantra", "budh mantra in english", "mercury mantra"],
    paaQuestions: [
      "What is the mantra for planet Mercury?",
      "What are the benefits of chanting Budh mantra?",
      "When should Budh mantra be chanted?",
      "Which deity is associated with Budh Graha?"
    ]
  },
  {
    planetId: "jupiter",
    primaryKeyword: "brihaspati mantra",
    slug: "brihaspati-mantra",
    secondaryKeywords: ["guru graha mantra", "jupiter mantra", "jupiter beej mantra", "guru mantra"],
    paaQuestions: [
      "What is the mantra for Devguru Brihaspati?",
      "What should I avoid during Jupiter Mahadasha?",
      "How to make Jupiter strong in astrology?",
      "What happens when Jupiter enters Mahadasha?"
    ]
  },
  {
    planetId: "moon",
    primaryKeyword: "chandra mantra",
    slug: "chandra-mantra",
    secondaryKeywords: ["moon beej mantra", "chandra graha mantra", "moon mantra", "chandra mantra jaap"],
    paaQuestions: [
      "How to remove bad effects of the Moon?",
      "What is the Beej mantra for Chandra?",
      "What is the best time to chant Chandra mantra?",
      "Is Moon Mahadasha good or bad?"
    ]
  },
  {
    planetId: "ketu",
    primaryKeyword: "ketu mantra",
    slug: "ketu-mantra",
    secondaryKeywords: ["ketu beej mantra", "ketu mantra in english", "ketu mantra jaap", "ketu dev mantra"],
    paaQuestions: [
      "Who is the presiding deity of Ketu?",
      "How can I make my Ketu positive?",
      "What is the Beej mantra for Ketu?",
      "How to remove bad effects of Ketu?"
    ]
  },
  {
    planetId: "mars",
    primaryKeyword: "mangal mantra",
    slug: "mangal-mantra",
    secondaryKeywords: ["mangal grah mantra", "mangal jaap mantra", "mangal dosha mantra", "mars mantra"],
    paaQuestions: [
      "What is the mantra to reduce Mangal Dosha?",
      "What are the benefits of chanting Mangal mantra?",
      "Which day is best for Mangal mantra jaap?",
      "What deity protects from afflictions of Mars?"
    ]
  }
];

function buildPrompt(item, planetData, remedyData) {
  return `
You are an authoritative, culturally authentic Vedic astrology (Jyotish) scholar and editor.
Write a comprehensive, in-depth guide targeting the primary keyword: "${item.primaryKeyword}".

Target Audience: Serious seekers and astrology readers in India and the global Vedic diaspora looking for authentic guidance on this planet's mantras, chanting procedure (jaap vidhi), and associated remedies.
Tone: Respectful, spiritually grounded, educational, practical, zero sensationalism or superstition, zero false guarantees.

Input Data to adhere to strictly:
- Planet: ${planetData.name} (Sanskrit: ${planetData.sanskrit}), Element: ${planetData.element}, Day: ${planetData.day}, Nature: ${planetData.nature}, Color: ${planetData.color}, Gemstone: ${planetData.gemstone}.
- Governs: ${planetData.governs.join(", ")}.
- Weakness Manifestations: ${planetData.weaknessCauses.join(", ")}.
- Approved Mantras from classical data:
${JSON.stringify(remedyData.mantras, null, 2)}
- Fasting guidelines:
${JSON.stringify(remedyData.fasting, null, 2)}
- Daan (charity) guidelines:
${JSON.stringify(remedyData.donations, null, 2)}
- Puja steps:
${JSON.stringify(remedyData.pujaSteps, null, 2)}
- Deity: ${remedyData.deity} (${remedyData.deityDescription})
- Temples: ${JSON.stringify(remedyData.temples, null, 2)}

Keywords to naturally incorporate (do not keyword-stuff; weave naturally into headings and sentences):
- Primary keyword: "${item.primaryKeyword}"
- Secondary keywords: ${item.secondaryKeywords.map(k => `"${k}"`).join(", ")}

Live Questions from Google People Also Ask to directly answer in the FAQ:
${item.paaQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")}

Structure & Content Requirements:
- Title: Clean, compelling, SEO-optimized title (45 to 60 characters). Include primary keyword.
- Meta Description: Enticing summary for Google Search (140 to 155 characters).
- Article Word Count: 1,150 to 1,350 words of rich, substantive text (avoid fluff, provide detailed spiritual & practical context).
- Format: HTML body only (using <h2>, <h3>, <p>, <ul>, <li>, <strong>, <blockquote>).
- Essential Sections:
  1. <h2>The Significance of ${planetData.name} in Vedic Astrology</h2> (explain cosmic role, psychological & physical qualities, why pacification or strengthening is needed).
  2. <h2>Core ${planetData.name} Mantras and Their Meanings</h2> (present the Namaha Mantra and the Beej Mantra with Sanskrit Devanagari, English transliteration, pronunciation guide, and spiritual meaning).
  3. <h2>How to Perform ${planetData.name} Mantra Jaap (Step-by-Step Vidhi)</h2> (timing, posture, facing direction, mala material, 108 count, 40-day discipline/sankalpa, mental state).
  4. <h2>Presiding Deity & Divine Alignments</h2> (explain why worship of ${remedyData.deity} harmonizes this planetary energy).
  5. <h2>Complementary Vedic Remedies: Fasting, Daan & Lifestyle</h2> (Saturday/weekday fast rules, charity items, simple home puja, behavioral ethics).
  6. <h2>Key Takeaways for Practicing ${item.primaryKeyword}</h2> (concise bulleted summary).
  7. <h2>Frequently Asked Questions About ${item.primaryKeyword}</h2> (Answer the 4 People Also Ask questions with thorough, expert paragraphs using <h3> for each question).
  8. Concluding note reminding the reader to consult their birth chart (Janam Kundali) to determine exact planetary dignity before undertaking intense austerities.

Strict Disclaimers:
- No medical or health treatment claims. Present remedies as devotional disciplines from classical Jyotish tradition.
- No guaranteed outcomes ("chant this and become rich overnight").

Output Format:
Return strictly a valid JSON object with these keys:
{
  "seo_title": "string",
  "meta_desc": "string",
  "content_html": "string"
}
`;
}

function wordCount(html) {
  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return text ? text.split(/\s+/).length : 0;
}

function validateArticle(data) {
  if (!data || typeof data !== "object") throw new Error("Not a JSON object");
  if (!data.seo_title || !data.meta_desc || !data.content_html) throw new Error("Missing required fields");

  const titleLen = data.seo_title.length;
  const metaLen = data.meta_desc.length;
  const words = wordCount(data.content_html);

  if (titleLen < 35 || titleLen > 65) {
    throw new Error(`seo_title length is ${titleLen} chars (expected 35-65)`);
  }
  if (metaLen < 130 || metaLen > 165) {
    throw new Error(`meta_desc length is ${metaLen} chars (expected 130-165)`);
  }
  if (words < 1000 || words > 1900) {
    throw new Error(`content_html word count is ${words} (expected 1000-1900)`);
  }

  for (const tag of ["h2", "blockquote", "p", "ul", "li"]) {
    if (!new RegExp(`<${tag}(?:\\s|>)`, "i").test(data.content_html)) {
      throw new Error(`Missing <${tag}> tag in content_html`);
    }
  }

  return { titleLen, metaLen, words };
}

async function generateSingle(item, planets, remedies, apiKey) {
  const planetData = planets[item.planetId];
  const remedyData = remedies[item.planetId];
  const prompt = buildPrompt(item, planetData, remedyData);

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Graha Remedy Cluster A Generator",
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            {
              role: "system",
              content: "You are an expert Vedic astrology scholar and SEO editor. Return strictly valid JSON.",
            },
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" },
          temperature: 0.4,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`OpenRouter ${response.status}: ${text}`);
      }

      const body = await response.json();
      const raw = body.choices?.[0]?.message?.content;
      if (!raw) throw new Error("Empty model response");

      const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
      const parsed = JSON.parse(cleaned);
      const stats = validateArticle(parsed);

      return { parsed, stats };
    } catch (err) {
      if (attempt === 3) throw err;
      console.warn(`Attempt ${attempt} for ${item.slug} failed: ${err.message}. Retrying...`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}

async function main() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is required in .env");

  const planets = JSON.parse(await fs.readFile(path.join(ROOT_DIR, "data/planets/planets.json"), "utf8"));
  const remedies = JSON.parse(await fs.readFile(path.join(ROOT_DIR, "data/remedies/remedies.json"), "utf8"));

  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  console.log(`Starting Cluster A generation: ${CLUSTER_A_ITEMS.length} planetary mantras...`);

  const results = [];
  for (let i = 0; i < CLUSTER_A_ITEMS.length; i += 1) {
    const item = CLUSTER_A_ITEMS[i];
    const outPath = path.join(OUTPUT_DIR, `${item.slug}.json`);
    const altPath = path.join(OUTPUT_DIR, `${item.slug.replace(/-/g, "_")}.json`);

    try {
      const existing = JSON.parse(await fs.readFile(outPath, "utf8"));
      const stats = validateArticle(existing);
      console.log(`[${i + 1}/${CLUSTER_A_ITEMS.length}] Already valid: ${item.slug}.json (${stats.words} words) - skipping.`);
      results.push({ slug: item.slug, keyword: item.primaryKeyword, ...stats });
      continue;
    } catch {
      // not generated yet or invalid, proceed
    }

    console.log(`\n[${i + 1}/${CLUSTER_A_ITEMS.length}] Generating: ${item.primaryKeyword} (${item.slug})...`);

    const { parsed, stats } = await generateSingle(item, planets, remedies, apiKey);

    await fs.writeFile(outPath, `${JSON.stringify(parsed, null, 2)}\n`, "utf8");
    await fs.writeFile(altPath, `${JSON.stringify(parsed, null, 2)}\n`, "utf8");

    console.log(`✓ Saved ${item.slug}.json | Title: ${stats.titleLen}c | Meta: ${stats.metaLen}c | Words: ${stats.words}`);
    results.push({ slug: item.slug, keyword: item.primaryKeyword, ...stats });
  }

  console.log("\n================ CLUSTER A GENERATION COMPLETED ================");
  console.table(results);
}

main().catch((err) => {
  console.error(`Cluster A failed: ${err.message}`);
  process.exitCode = 1;
});
