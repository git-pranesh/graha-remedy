import { Router } from "express";
import { runRulesEngine, computeAfflictions } from "../services/rules-engine.js";
import type { AstroChart } from "../services/astro-engine.js";
import type { DoshaFlags } from "../services/dosha.js";
import type { VimshottariDasha } from "../services/astro-engine.js";

export const personalizedRoutes = Router();

/**
 * POST /api/remedies/personalized
 *
 * Body: {
 *   chart:     AstroChart
 *   doshas:    DoshaFlags
 *   problems:  string[]
 *   latitude?: number   (from geocoded place of birth)
 *   longitude?: number
 * }
 *
 * Returns personalised remedies + nearby temple matches per graha.
 */
personalizedRoutes.post("/", async (req, res) => {
  try {
    const { chart, doshas, dasha, problems, latitude, longitude } = req.body as {
      chart?: AstroChart;
      doshas?: DoshaFlags;
      dasha?: VimshottariDasha;
      problems?: string[];
      latitude?: number;
      longitude?: number;
    };

    if (!chart || !doshas || !problems) {
      res.status(400).json({
        error: "Required fields: chart, doshas, problems",
      });
      return;
    }

    if (!Array.isArray(problems) || problems.length === 0) {
      res.status(400).json({ error: "Provide a non-empty 'problems' array" });
      return;
    }

    // Run rules engine
    const result = runRulesEngine(chart, doshas, problems, dasha);
    const afflictions = computeAfflictions(chart, doshas);

    // Temple matching is intentionally omitted: the UI shows a single
    // "find a <deity> temple near you" Google Maps link instead of a
    // specific temple, so no external Overpass lookups are made.
    const templeMatches: Record<string, unknown> = {};

    res.json({
      afflictions,
      ...result,
      templeMatches,
    });
  } catch (err: any) {
    console.error("Personalized remedy error:", err);
    res.status(500).json({ error: err.message || "Failed to compute personalised remedies" });
  }
});

/**
 * GET /api/remedies/personalized/categories
 */
personalizedRoutes.get("/categories", (_req, res) => {
  res.json({
    categories: [
      { id: "health", label: "Health & Well-being" },
      { id: "finance", label: "Finance & Wealth" },
      { id: "career", label: "Career & Profession" },
      { id: "relationships", label: "Relationships & Marriage" },
      { id: "litigation", label: "Litigation & Legal" },
      { id: "mental_peace", label: "Mental Peace & Spiritual" },
    ],
  });
});
