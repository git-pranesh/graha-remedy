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

const PROMPT = `
You are an authoritative, culturally authentic Vedic astrology (Jyotish) scholar and editor.
Write a comprehensive, in-depth guide targeting the primary keyword: "rahu mantra".

Target Audience: Serious seekers and astrology readers in India and the global Vedic diaspora looking for authentic guidance on Rahu mantras, chanting procedure (jaap vidhi), and associated remedies.
Tone: Respectful, spiritually grounded, educational, practical, zero sensationalism or superstition, zero false guarantees.

Input Data to adhere to strictly:
- Planet: Rahu (Sanskrit: राहु), shadow planet (Chhaya Graha), element Air, associated with Saturday, color Dark Blue / Smoke Grey.
- Governs: Illusion (Maya), obsession, foreign connections, unexpected life changes, mental restlessness.
- Approved Mantras:
  1. Beginner / Namaha Mantra:
     - Devanagari: ॐ राहवे नमः
     - Transliteration: Om Rahave Namaha (Pronounced: Om Ra-ha-ve Na-ma-ha)
     - Classical schedule: 108 repetitions daily during evening / night or Rahu Kalam, ideally for a 40-day discipline (sankalpa).
  2. Beej Mantra (Tantrik / Seed Mantra):
     - Devanagari: ॐ भ्रां भ्रीं भ्रौं सः राहवे नमः
     - Transliteration: Om Bhram Bhreem Bhraum Sah Rahave Namaha
     - Usage: Recited 108 times, especially on Saturdays or during Rahu Mahadasha / Antardasha.
  3. Stotram / Protection:
     - Durga Kavach (from Markandeya Purana) or dedicated Rahu Stotram, recited on Saturdays.
  4. Prescribed Deity:
     - Worship through Goddess Durga (Durga is the presiding protective deity for calming Rahu's malefic energy).
  5. Supporting Remedies:
     - Fasting: Saturday fast (consuming food only after sunset, simple sattvic or coconut-based items).
     - Daan (Charity): Donating dark blue/grey clothing, blankets to the needy or homeless, coconut, mustard oil, or supporting anti-addiction charities.
     - Puja / Ritual: Clean dark blue or modest attire, lighting a mustard oil or sesame lamp on Saturday evening, offering blue flowers or coconut, avoiding arrogance and deception.
     - Temple Visit: Visiting Goddess Durga temples on Saturdays or reciting quiet prayers during Rahu Kalam.

Keywords to naturally incorporate (do not keyword-stuff; weave naturally into headings and sentences):
- Primary: rahu mantra
- Secondary: beej mantra for rahu, rahu ka mantra, rahu mantra jaap, rahu beej mantra in english, rahu dev mantra

Structure & Content Requirements:
- Title: Clean, compelling, SEO-optimized title (under 60 characters).
- Meta Description: Enticing summary for Google Search (140-155 characters).
- Article Word Count: 1,000 to 1,250 words of rich, substantive text (not fluff).
- Format: HTML body only (using <h2>, <h3>, <p>, <ul>, <li>, <strong>, <blockquote>).
- Essential Sections:
  1. <h2>The Significance of Rahu in Vedic Astrology</h2> (explain why Rahu is feared vs. what it actually represents: ambition, illusion, mental turbulence, and the need for spiritual clarity).
  2. <h2>Core Rahu Mantras and Their Meanings</h2> (present the Namaha Mantra and the Beej Mantra with Sanskrit Devanagari, English transliteration, pronunciation guide, and spiritual meaning).
  3. <h2>How to Perform Rahu Mantra Jaap (Step-by-Step Vidhi)</h2> (timing, posture, facing direction South-West or North-East, using Rudraksha mala, 108 count, 40-day discipline, mental state).
  4. <h2>Why Goddess Durga Worship Balances Rahu</h2> (explain the classical Vedic link between Durga Kavach and Rahu pacification).
  5. <h2>Complementary Vedic Remedies: Fasting, Daan & Lifestyle</h2> (Saturday fasting, donations, behavioral discipline - honesty, avoiding intoxicants).
  6. <h2>Key Takeaways for Practicing Rahu Mantra</h2> (structured summary list).
  7. <h2>Frequently Asked Questions About Rahu Mantra</h2> (Answer real PAA queries: What is the most powerful Rahu mantra? When is the best time to chant Rahu mantra? Can anyone chant Rahu Beej mantra? What precautions should be taken during Rahu Mahadasha?).
  8. Call-to-action note inviting the reader to consult their full birth chart or use a personalized Vedic calculation to understand their planetary placements before undertaking intense austerities.

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

async function main() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is missing in .env");
  }

  console.log(`Calling OpenRouter using model: ${MODEL}...`);
  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "Graha Remedy Sample Writer",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: "You are an expert Vedic astrology scholar and SEO editor. Return strictly valid JSON.",
        },
        { role: "user", content: PROMPT },
      ],
      response_format: { type: "json_object" },
      temperature: 0.4,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter Error ${response.status}: ${errorText}`);
  }

  const result = await response.json();
  const rawContent = result.choices?.[0]?.message?.content;
  if (!rawContent) {
    throw new Error("Empty response received from OpenRouter");
  }

  const cleaned = rawContent.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  const parsed = JSON.parse(cleaned);

  // Compute word count
  const textOnly = parsed.content_html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const wordCount = textOnly.split(/\s+/).length;

  console.log("\n================ GENERATION SUMMARY ================");
  console.log(`Title (${parsed.seo_title.length} chars): ${parsed.seo_title}`);
  console.log(`Meta Desc (${parsed.meta_desc.length} chars): ${parsed.meta_desc}`);
  console.log(`Article Word Count: ${wordCount} words`);

  const outPath = path.join(ROOT_DIR, "data/seo_research/sample-rahu-mantra.json");
  await fs.writeFile(outPath, `${JSON.stringify(parsed, null, 2)}\n`, "utf8");
  console.log(`Saved sample article to ${outPath}`);
}

main().catch((err) => {
  console.error(`Generation error: ${err.message}`);
  process.exitCode = 1;
});
