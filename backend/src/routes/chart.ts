import { Router } from "express";
import { computeChart, getCacheStats } from "../services/chart.js";
import type { BirthInput } from "../services/chart.js";

export const chartRoutes = Router();

/**
 * POST /api/chart
 *
 * Body: {
 *   dateOfBirth: "YYYY-MM-DD",
 *   timeOfBirth: "HH:MM",
 *   placeOfBirth: "City, Country"
 * }
 *
 * Returns: full birth chart with planets, houses, dasha, doshas.
 */
chartRoutes.post("/", async (req, res) => {
  try {
    const { dateOfBirth, timeOfBirth, placeOfBirth, currentCity, kulDevta } = req.body as BirthInput & { currentCity?: string; kulDevta?: string };

    // Validate
    if (!dateOfBirth || !timeOfBirth || !placeOfBirth) {
      res.status(400).json({
        error: "Missing required fields: dateOfBirth (YYYY-MM-DD), timeOfBirth (HH:MM), placeOfBirth",
      });
      return;
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const timeRegex = /^\d{1,2}:\d{2}$/;
    if (!dateRegex.test(dateOfBirth)) {
      res.status(400).json({ error: "dateOfBirth must be YYYY-MM-DD format" });
      return;
    }
    if (!timeRegex.test(timeOfBirth)) {
      res.status(400).json({ error: "timeOfBirth must be HH:MM format (24-hour)" });
      return;
    }

    const result = await computeChart({ dateOfBirth, timeOfBirth, placeOfBirth, currentCity, kulDevta });
    res.json(result);
  } catch (err: any) {
    console.error("Chart computation error:", err);
    res.status(500).json({
      error: err.message || "Failed to compute birth chart",
    });
  }
});

/**
 * GET /api/chart/cache-stats
 */
chartRoutes.get("/cache-stats", (_req, res) => {
  res.json(getCacheStats());
});
