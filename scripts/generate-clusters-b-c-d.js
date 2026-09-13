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

const ALL_TASKS = [
  // ─── CLUSTER B: 2 DEDICATED BEEJ MANTRAS ────────────────────────────
  {
    cluster: "B",
    slug: "shani-beej-mantra",
    primaryKeyword: "shani beej mantra",
    secondaryKeywords: [
      "beej mantra of shani dev",
      "shani ka beej mantra",
      "shani dev ka beej mantra",
      "shani beej mantra benefits",
      "shani beej mantra 108 times"
    ],
    paaQuestions: [
      "How many times should we chant Shani Beej mantra?",
      "What happens if we chant Shani Beej mantra daily?",
      "What are the rules and precautions for Shani Beej mantra jaap?",
      "Who should avoid chanting Shani Beej mantra without guidance?"
    ],
    promptDirective: `
Focus exclusively on the Tantrik Seed Sound (Beej Mantra) of Saturn: "Om Praam Preem Praum Sah Shanaischaraya Namaha" (ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः).
Contrast this high-potency acoustic bija sadhana with standard namaha chants.
Detail the vibrational physics of the seed syllables (Praam, Preem, Praum), acoustic calming of Sade Sati and Kantaka Shani, strict 108 jaap vidhi on Saturdays, Rudraksha mala usage, evening timing, and behavioral humility.
`
  },
  {
    cluster: "B",
    slug: "shukra-beej-mantra",
    primaryKeyword: "shukra beej mantra",
    secondaryKeywords: [
      "shukra beej mantra benefits",
      "shukra dev beej mantra",
      "venus beej mantra",
      "shukra beej mantra in english",
      "shukra beej mantra for love"
    ],
    paaQuestions: [
      "What is the benefit of chanting Shukra Beej mantra?",
      "How many times should Shukra Beej mantra be chanted?",
      "What is the best day and time to chant Shukra Beej mantra?",
      "Can Shukra Beej mantra improve marriage and relationships?"
    ],
    promptDirective: `
Focus exclusively on the Tantrik Seed Sound (Beej Mantra) of Venus: "Om Draam Dreem Draum Sah Shukraya Namaha" (ॐ द्रां द्रीं द्रौं सः शुक्राय नमः).
Explain the esoteric resonance of the Draam, Dreem, Draum bija root frequencies governed by Shukracharya.
Explain how it refines Ojas (vital luster), harmonizes relationship friction, dissolves creative blocks, and attracts satvic prosperity. Include Friday twilight chanting vidhi, white attire, Goddess Lakshmi alignment, and 108 count rules.
`
  },

  // ─── CLUSTER C: 6 REMEDY & PROBLEM HUBS ─────────────────────────────
  {
    cluster: "C",
    slug: "rahu-remedies",
    primaryKeyword: "rahu remedies",
    secondaryKeywords: [
      "rahu mahadasha remedies",
      "rahu dasha remedies",
      "best rahu remedy",
      "rahu dosha remedies"
    ],
    paaQuestions: [
      "What is the best remedy for Rahu?",
      "How to calm down aggressive Rahu?",
      "Which god is worshipped to remove Rahu dosha?",
      "What things should be avoided during Rahu dasha?"
    ],
    promptDirective: `
Write an exhaustive guide to planetary remedies for Rahu (the North Node).
Cover manifestations of afflicted Rahu: mental restlessness, sudden setbacks, addiction patterns, chronic phobias, and illusion.
Provide classical multidimensional remedies:
- Chanting: Om Rahave Namaha and Durga Kavach
- Fasting: Saturday vrata after sunset (coconut preparations)
- Daan: Blue/dark grey cloth, blankets to the needy, mustard oil, supporting addiction recovery
- Deity: Goddess Durga worship on Saturdays
- Lifestyle: Radical honesty, clutter-free South-West zone, avoiding gambling/intoxicants.
`
  },
  {
    cluster: "C",
    slug: "ketu-remedy",
    primaryKeyword: "ketu remedy",
    secondaryKeywords: [
      "ketu remedies",
      "ketu dasha remedies",
      "ketu mahadasha remedies",
      "powerful ketu remedies",
      "ketu dosha remedies"
    ],
    paaQuestions: [
      "How can I make my Ketu positive?",
      "What happens when Ketu is weak in a chart?",
      "Which food pleases Ketu?",
      "What are the simplest daily remedies for Ketu?"
    ],
    promptDirective: `
Write a complete guide to Vedic remedies for Ketu (the South Node / Moksha Karaka).
Cover signs of troubled Ketu: sudden detachment, spiritual restlessness, feeling alienated, misdiagnosed health issues.
Classical remedial protocol:
- Chanting: Om Ketave Namaha and Ganesha Atharvashirsha
- Fasting: Tuesday fasting with simple moong dal khichdi
- Daan: Feeding street dogs, donating grey/black blankets, sesame seeds
- Deity: Lord Ganesha (supreme remover of Ketu's karmic knots)
- Lifestyle: Solitude for meditation, releasing past resentments, simple sattvic living.
`
  },
  {
    cluster: "C",
    slug: "vedic-astrology-remedies",
    primaryKeyword: "vedic astrology remedies",
    secondaryKeywords: [
      "graha remedies",
      "navagraha remedies",
      "astrological remedies in vedic astrology",
      "planetary remedies"
    ],
    paaQuestions: [
      "What are the main types of remedies in Vedic astrology?",
      "Do astrological remedies really change destiny?",
      "Can we do remedies for all 9 planets at once?",
      "How long does it take for Vedic remedies to show results?"
    ],
    promptDirective: `
Write the definitive pillar guide to Vedic astrology remedies (Jyotish Upayas).
Explain the philosophical framework of Karma (Sanchita, Prarabdha, Kriyamana) and how spiritual remedies function as corrective momentum, not magical bribes.
Break down the classical categories:
1. Mantra (acoustic vibrational therapy)
2. Vrata (fasting & biological discipline)
3. Daan (conscious charity targeting karmic debt)
4. Yajna & Puja (ritual offerings and temple worship)
5. Behavioral modification (lifestyle ethics).
Provide a structured overview table of all 9 grahas with their ruling day, deity, and core remedy. Emphasize why a birth chart consultation is required before wearing gemstones or doing aggressive sadhana.
`
  },
  {
    cluster: "C",
    slug: "mercury-planet-remedies",
    primaryKeyword: "mercury planet remedies",
    secondaryKeywords: [
      "budh remedies",
      "mercury remedies in astrology",
      "remedies for weak mercury",
      "budh grah remedies"
    ],
    paaQuestions: [
      "How to strengthen weak Mercury in kundali?",
      "What are the symptoms of an afflicted Mercury?",
      "What should be donated on Wednesday for Mercury?",
      "Which deity cures Mercury-related afflictions?"
    ],
    promptDirective: `
Write an authoritative remedial guide for planet Mercury (Budh Graha).
Explain how weak or combust Mercury manifests: communication breakdown, stuttering or nervous speech, poor analytical focus, business losses, skin irritations.
Classical remedial protocol:
- Chanting: Om Budhaya Namaha and Vishnu Sahasranamam
- Fasting: Wednesday fasting with green vegetables or green moong
- Daan: Donating green gram, green clothing, textbooks and stationery to underprivileged students
- Deity: Lord Vishnu worship on Wednesdays
- Lifestyle: Practicing truthfulness in speech, organizing finances, cultivating learning habits.
`
  },
  {
    cluster: "C",
    slug: "moon-remedies",
    primaryKeyword: "moon remedies",
    secondaryKeywords: [
      "chandra remedies",
      "remedies for weak moon",
      "moon dasha remedies",
      "chandra graha remedies"
    ],
    paaQuestions: [
      "What are the best remedies for a weak Moon?",
      "How does an afflicted Moon affect mental health in astrology?",
      "What items should be donated for Moon?",
      "Can Moon remedies cure chronic overthinking?"
    ],
    promptDirective: `
Write an authoritative remedial guide for the Moon (Chandra Graha - Manas Karaka).
Explain the psychological impact of afflicted Moon: chronic anxiety, emotional mood swings, depressive tendencies, insomnia, strained maternal bonds.
Classical remedial protocol:
- Chanting: Om Chandraya Namaha and Shiva Panchakshari / Durga Saptashati
- Fasting: Monday fasting with evening milk or kheer
- Daan: Donating white rice, milk, silver, pearls to women, feeding elderly women
- Deity: Lord Shiva worship (Jal Abhishekam on Shiva Lingam)
- Lifestyle: Honoring and caring for one's mother, drinking water from silver utensils, mindfulness meditation near water bodies.
`
  },
  {
    cluster: "C",
    slug: "evil-eye-remedies",
    primaryKeyword: "evil eye remedies",
    secondaryKeywords: [
      "evil eye removal remedies",
      "home remedies to remove evil eye",
      "vedic rituals for evil eye protection",
      "nazar dosha remedies"
    ],
    paaQuestions: [
      "How to remove evil eye according to Vedic tradition?",
      "What are the signs of evil eye (nazar lagna)?",
      "Which mantra removes negative energy immediately?",
      "Can salt and mustard seeds really ward off the evil eye?"
    ],
    promptDirective: `
Write a culturally authentic, grounded Vedic guide to Evil Eye (Nazar Dosha / Drishti) remedies.
Avoid fear-mongering and superstitious hysteria; ground the concept in aura pollution, intense negative envy, and psychic friction connected to afflicted Mars, Rahu, or Saturn.
Provide time-tested Vedic remedies:
- Chanting: Hanuman Chalisa (especially verses 24-25), Mahamrityunjaya Mantra
- Salt & Mustard Seed Utara ritual (circling clockwise 7 times and burning)
- Lighting a mustard oil lamp at the entrance at twilight
- Protection through Hanuman sindoor or Kala Dhaga (black thread) with sanctification
- Lifestyle: Cultivating humility, not broadcasting unfinalized plans, maintaining spiritual boundaries.
`
  },

  // ─── CLUSTER D: 1 HYBRID CALCULATOR LANDING PAGE ───────────────────
  {
    cluster: "D",
    slug: "career-astrology",
    primaryKeyword: "career astrology",
    secondaryKeywords: [
      "job astrology",
      "career prediction by date of birth",
      "career astrology calculator",
      "astrology remedies for career"
    ],
    paaQuestions: [
      "How to find your career in astrology?",
      "Which house is seen for job and career in Kundali?",
      "Which planet causes delays in career progression?",
      "How to remove career blockages with astrology remedies?"
    ],
    promptDirective: `
Write a high-converting, deeply educational guide connecting Career Astrology with personalized Vedic remedies.
Explain the astrological anatomy of career and livelihood:
- The 10th House (Karma Bhava - profession, public status)
- The 6th House (daily job, competition, service)
- The 2nd and 11th Houses (wealth and gains from work)
- Key Career Karakas: Saturn (labor, persistence, delays), Sun (executive authority, government), Mercury (commerce, analytics, technology), Mars (initiative, technical skills).
Explain why people face career stagnation (Sade Sati, combustion, afflicted 10th lord) and how Vedic remedies (Aditya Hridayam, Hanuman Chalisa, Shani daan) unblock stalled momentum.
Integrate multiple natural invitations to use the free birth chart remedy calculator to analyze active dasha periods and specific planetary afflictions.
`
  }
];

function buildPrompt(item) {
  return `
You are an authoritative, culturally authentic Vedic astrology (Jyotish) scholar and editor.
Write a comprehensive, in-depth guide targeting the primary keyword: "${item.primaryKeyword}".

Target Audience: Serious seekers and astrology readers in India and the global Vedic diaspora looking for authentic Jyotish guidance.
Tone: Grounded, spiritually authentic, practical, respectful, zero hype, zero superstitious guarantees.

Directive & Core Focus:
${item.promptDirective}

Keywords to naturally incorporate (do not keyword-stuff; weave naturally into headings and sentences):
- Primary keyword: "${item.primaryKeyword}"
- Secondary keywords: ${item.secondaryKeywords.map((k) => `"${k}"`).join(", ")}

Live Questions from Google People Also Ask to directly answer in the FAQ:
${item.paaQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")}

Structure & Content Requirements:
- Title: Clean, compelling, SEO-optimized title (45 to 60 characters). Include primary keyword.
- Meta Description: Enticing summary for Google Search (140 to 155 characters).
- Article Word Count: 1,150 to 1,500 words of rich, substantive text.
- Format: HTML body only (using <h2>, <h3>, <p>, <ul>, <li>, <strong>, <blockquote>).
- Ensure a logical hierarchy with 5 to 7 <h2> headings and appropriate <h3> sub-sections.
- Include a dedicated <h2>Frequently Asked Questions About ${item.primaryKeyword}</h2> answering all 4 PAA queries with detailed, expert <h3> paragraphs.
- Conclude with an introspective note inviting the reader to consult their birth chart (Janam Kundali) or use our free calculator for precise dasha and planetary dignity analysis.

Strict Disclaimers:
- No medical claims. Remedies are devotional/spiritual practices.
- No guaranteed instant fortunes.

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
  if (metaLen < 125 || metaLen > 170) {
    throw new Error(`meta_desc length is ${metaLen} chars (expected 125-170)`);
  }
  if (words < 1000 || words > 1950) {
    throw new Error(`content_html word count is ${words} (expected 1000-1950)`);
  }

  for (const tag of ["h2", "p", "ul", "li"]) {
    if (!new RegExp(`<${tag}(?:\\s|>)`, "i").test(data.content_html)) {
      throw new Error(`Missing <${tag}> tag in content_html`);
    }
  }

  return { titleLen, metaLen, words };
}

async function generateSingle(item, apiKey) {
  const prompt = buildPrompt(item);

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Graha Remedy Batch Generator",
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

  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  console.log(`Starting Generation for Clusters B, C, and D: ${ALL_TASKS.length} guides...`);

  const results = [];
  for (let i = 0; i < ALL_TASKS.length; i += 1) {
    const item = ALL_TASKS[i];
    const outPath = path.join(OUTPUT_DIR, `${item.slug}.json`);
    const altPath = path.join(OUTPUT_DIR, `${item.slug.replace(/-/g, "_")}.json`);

    try {
      const existing = JSON.parse(await fs.readFile(outPath, "utf8"));
      const stats = validateArticle(existing);
      console.log(`[${i + 1}/${ALL_TASKS.length}] [Cluster ${item.cluster}] Already valid: ${item.slug}.json (${stats.words} words) - skipping.`);
      results.push({ cluster: item.cluster, slug: item.slug, keyword: item.primaryKeyword, ...stats });
      continue;
    } catch {
      // proceed
    }

    console.log(`\n[${i + 1}/${ALL_TASKS.length}] [Cluster ${item.cluster}] Generating: "${item.primaryKeyword}" (${item.slug})...`);

    const { parsed, stats } = await generateSingle(item, apiKey);

    await fs.writeFile(outPath, `${JSON.stringify(parsed, null, 2)}\n`, "utf8");
    await fs.writeFile(altPath, `${JSON.stringify(parsed, null, 2)}\n`, "utf8");

    console.log(`✓ Saved ${item.slug}.json | Title: ${stats.titleLen}c | Meta: ${stats.metaLen}c | Words: ${stats.words}`);
    results.push({ cluster: item.cluster, slug: item.slug, keyword: item.primaryKeyword, ...stats });
  }

  console.log("\n================ GENERATION COMPLETED ================");
  console.table(results);
}

main().catch((err) => {
  console.error(`Generation failed: ${err.message}`);
  process.exitCode = 1;
});
