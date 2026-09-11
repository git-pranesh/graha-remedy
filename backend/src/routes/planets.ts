import { Router } from "express";
import { readJsonData } from "../utils.js";

export const planetRoutes = Router();

// GET /api/planets — list all planets
planetRoutes.get("/", (_req, res) => {
  try {
    const planets = readJsonData("planets");
    res.json(planets);
  } catch (err) {
    console.error("Error reading planets data:", err);
    res.status(500).json({ error: "Failed to load planet data" });
  }
});

// GET /api/planets/:id — get a single planet by id
planetRoutes.get("/:id", (req, res) => {
  try {
    const planets = readJsonData("planets") as Record<string, unknown>;
    const planet = planets[req.params.id];
    if (!planet) {
      res.status(404).json({ error: "Planet not found" });
      return;
    }
    res.json(planet);
  } catch (err) {
    console.error("Error reading planet data:", err);
    res.status(500).json({ error: "Failed to load planet data" });
  }
});
