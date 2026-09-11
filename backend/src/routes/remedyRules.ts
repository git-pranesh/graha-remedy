import { Router } from "express";
import { readJsonData } from "../utils.js";

export const remedyRulesRoutes = Router();

// GET /api/remedy-rules — list all problem-to-remedy mappings
remedyRulesRoutes.get("/", (_req, res) => {
  try {
    const rules = readJsonData("remedies_by_problem");
    res.json(rules);
  } catch (err) {
    console.error("Error reading remedy rules:", err);
    res.status(500).json({ error: "Failed to load remedy rules" });
  }
});

// POST /api/remedy-rules/lookup — given selected problems, return matched remedies
remedyRulesRoutes.post("/lookup", (req, res) => {
  try {
    const { problems } = req.body as { problems?: string[] };

    if (!problems || !Array.isArray(problems) || problems.length === 0) {
      res.status(400).json({ error: "Provide a non-empty 'problems' array" });
      return;
    }

    const rules = readJsonData("remedies_by_problem") as Record<string, string[]>;

    // Collect all planet IDs that govern the selected problems
    const matchedPlanetIds = new Set<string>();
    for (const problem of problems) {
      const planetIds = rules[problem];
      if (planetIds) {
        for (const pid of planetIds) {
          matchedPlanetIds.add(pid);
        }
      }
    }

    // Fetch remedies for all matched planets
    const remedies = readJsonData("remedies") as Record<string, unknown>;
    const matchedRemedies: Record<string, unknown> = {};
    for (const pid of matchedPlanetIds) {
      if (remedies[pid]) {
        matchedRemedies[pid] = remedies[pid];
      }
    }

    res.json({
      matchedProblems: problems,
      matchedPlanets: Array.from(matchedPlanetIds),
      remedies: matchedRemedies,
    });
  } catch (err) {
    console.error("Error performing remedy lookup:", err);
    res.status(500).json({ error: "Remedy lookup failed" });
  }
});
