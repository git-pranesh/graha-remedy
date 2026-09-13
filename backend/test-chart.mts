/**
 * Test script — computes birth chart for:
 *   Date: 31 July 1990
 *   Time: 8:15 AM IST
 *   Place: Chennai, India
 *
 * Run with: npx tsx test-chart.mts
 */

import { computeChart, getCacheStats } from "./src/services/chart.js";
import { cleanup } from "./src/services/astro-engine.js";

async function main() {
  console.log("🪐 Graha Remedy App — Chart Calculation Test\n");
  console.log("=".repeat(60));
  console.log("Birth Details:");
  console.log("  Date:  31 July 1990");
  console.log("  Time:  8:15 AM IST");
  console.log("  Place: Chennai, India");
  console.log("=".repeat(60));

  try {
    const result = await computeChart({
      dateOfBirth: "1990-07-31",
      timeOfBirth: "08:15",
      placeOfBirth: "Chennai, India",
    });

    console.log("\n📍 GEOCODING");
    console.log(`  Place:    ${result.geo.placeName}`);
    console.log(`  Lat/Lng:  ${result.geo.latitude}, ${result.geo.longitude}`);
    console.log(`  Timezone: ${result.geo.timezone}`);

    console.log("\n🌅 ASCENDANT (LAGNA)");
    console.log(`  Sign:     ${result.chart.ascendant.sign} ${result.chart.ascendant.signDegree}`);
    console.log(`  Degree:   ${result.chart.ascendant.longitude.toFixed(4)}°`);
    console.log(`  Nakshatra:${result.chart.ascendant.nakshatra} Pada ${result.chart.ascendant.nakshatraPada}`);

    console.log("\n📊 AYANAMSA (Lahiri)");
    console.log(`  Value:    ${result.chart.ayanamsa.toFixed(4)}°`);

    console.log("\n🪐 PLANETARY POSITIONS (Sidereal)");
    console.log("-".repeat(75));
    console.log(
      "  " + "Planet".padEnd(10) +
      "Sign".padEnd(14) +
      "Degree".padEnd(10) +
      "House".padEnd(8) +
      "Retro".padEnd(8) +
      "Nakshatra".padEnd(20) +
      "Pada"
    );
    console.log("-".repeat(75));

    for (const p of result.chart.planets) {
      console.log(
        "  " +
        p.planet.padEnd(10) +
        p.sign.padEnd(14) +
        p.signDegree.padEnd(10) +
        String(p.house).padEnd(8) +
        (p.retrograde ? "Yes" : "No").padEnd(8) +
        (p.nakshatra ?? "").padEnd(20) +
        String(p.nakshatraPada ?? "")
      );
    }
    console.log("-".repeat(75));

    console.log("\n⏰ VIMSHOTTARI DASHA");
    console.log(`  Moon Nakshatra:   ${result.dasha.moonNakshatra} Pada ${result.dasha.moonNakshatraPada}`);
    console.log(`  Birth Dasha Lord: ${result.dasha.mahadashaLord}`);
    console.log(`  Balance Years:    ${result.dasha.balanceYears} years`);
    console.log(`  1st Mahadasha:    ${result.dasha.mahadashaStart} to ${result.dasha.mahadashaEnd}`);
    console.log(`  Current MD:       Running today`);
    console.log(`  Current AD:       ${result.dasha.currentAntardasha} (${result.dasha.antardashaStart} to ${result.dasha.antardashaEnd})`);

    if (result.dasha.sequence.length > 0) {
      console.log("\n  Mahadasha Sequence (first 12):");
      for (const md of result.dasha.sequence) {
        const marker = result.dasha.currentAntardasha === md.lord ? " ◀ current" : "";
        console.log(`    ${md.lord.padEnd(10)} ${md.start} → ${md.end}${marker}`);
      }
    }

    console.log("\n🚫 DOSHA FLAGS");
    console.log(`  Manglik:    ${result.doshas.manglik ? "⚠️  YES" : "✅ NO"}  — ${result.doshas.manglikDetails}`);
    console.log(`  Kaal Sarp:  ${result.doshas.kaalSarp ? "⚠️  YES" : "✅ NO"}  — ${result.doshas.kaalSarpDetails}`);
    console.log(`  Sade Sati:  ${result.doshas.sadeSati ? "⚠️  YES" : "✅ NO"}  — ${result.doshas.sadeSatiDetails}`);
    console.log(`  Pitra:      ${result.doshas.pitra ? "⚠️  YES" : "✅ NO"}  — ${result.doshas.pitraDetails}`);
    console.log(`  Nadi:       ${result.doshas.nadi ? "⚠️  YES" : "✅ NO"}  — ${result.doshas.nadiDetails}`);

    console.log("\n📦 CACHE");
    const stats = getCacheStats();
    console.log(`  Entries: ${stats.entries} / ${stats.maxEntries}`);
    console.log(`  Cached:  ${result.cached}`);

    console.log("\n" + "=".repeat(60));
    console.log("✅ Chart computation complete!");
    console.log("=".repeat(60));

  } catch (err: any) {
    console.error("\n❌ Error:", err.message);
    console.error(err.stack);
    process.exit(1);
  } finally {
    cleanup();
  }
}

main();
