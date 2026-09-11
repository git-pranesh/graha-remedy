import express from "express";
import cors from "cors";
import { planetRoutes } from "./routes/planets.js";
import { remedyRoutes } from "./routes/remedies.js";
import { remedyRulesRoutes } from "./routes/remedyRules.js";
import { chartRoutes } from "./routes/chart.js";
import { personalizedRoutes } from "./routes/personalized.js";
import { universalRoutes } from "./routes/universal.js";
import { authRoutes } from "./routes/auth.js";
import { reportsRoutes } from "./routes/reports.js";

const app = express();
const PORT = parseInt(process.env.PORT ?? "", 10) || 3001;

// Middleware (credentials: true lets the auth cookie cross the :5173 → :3001 origin)
app.use(cors({ origin: ["http://localhost:5173", "http://localhost:5174"], credentials: true }));
app.use(express.json());

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    app: "graha-remedy-api",
    version: "0.1.0",
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use("/api/planets", planetRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/remedies/universal", universalRoutes);
app.use("/api/remedies/personalized", personalizedRoutes);
app.use("/api/remedies", remedyRoutes);
app.use("/api/remedy-rules", remedyRulesRoutes);
app.use("/api/chart", chartRoutes);

// 404 fallback
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`🪐 Graha Remedy API running on http://localhost:${PORT}`);
});
