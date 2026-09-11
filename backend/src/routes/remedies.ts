import { Router } from "express";
import { readJsonData } from "../utils.js";

export const remedyRoutes = Router();

// GET /api/remedies — list all remedy categories
remedyRoutes.get("/", (_req, res) => {
  try {
    const remedies = readJsonData("remedies");
    res.json(remedies);
  } catch (err) {
    console.error("Error reading remedies data:", err);
    res.status(500).json({ error: "Failed to load remedies data" });
  }
});

// GET /api/remedies/:planetId — get remedies for a specific planet
remedyRoutes.get("/:planetId", (req, res) => {
  try {
    const remedies = readJsonData("remedies") as Record<string, unknown>;
    const remediesForPlanet = remedies[req.params.planetId];
    if (!remediesForPlanet) {
      res.status(404).json({ error: "No remedies found for this planet" });
      return;
    }
    res.json(remediesForPlanet);
  } catch (err) {
    console.error("Error reading remedy data:", err);
    res.status(500).json({ error: "Failed to load remedy data" });
  }
});
