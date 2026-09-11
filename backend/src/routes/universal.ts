import { Router } from "express";
import { readFileSync } from "fs";
import { join } from "path";

export const universalRoutes = Router();

// Load universal remedies data once at startup
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// universal.json lives in /data/remedies/ at the project root (3 levels up from routes/)
const universalPath = join(__dirname, "..", "..", "..", "data", "remedies", "universal.json");
const universalData = JSON.parse(
  readFileSync(universalPath, "utf-8")
);

/**
 * GET /api/remedies/universal
 *
 * Returns the universal remedies data:
 * - foundation: Ganesha invocations (always shown first)
 * - categories: problem-specific universal remedies
 * - general: general well-being mantras
 */
universalRoutes.get("/", (_req, res) => {
  res.json(universalData);
});

/**
 * GET /api/remedies/universal/:category
 *
 * Returns universal remedies for a specific category
 */
universalRoutes.get("/:category", (req, res) => {
  const { category } = req.params;
  const categoryData = universalData.categories?.[category];
  
  if (!categoryData) {
    res.status(404).json({ error: `No universal remedies for category: ${category}` });
    return;
  }
  
  res.json({
    foundation: universalData.foundation,
    ...categoryData,
  });
});
