/**
 * Saved readings ("reports").
 *
 * - POST /api/reports        — save a reading (guests allowed; linked to the
 *                              account automatically when a session exists)
 * - GET  /api/reports/:id    — load a reading by its short id
 * - GET  /api/reports/mine   — list the current user's readings
 *
 * Stored in /data/reports.json. No birth-chart data is ever recomputed
 * here — the full chart + personalised result is persisted as-is.
 */

import { Router } from "express";
import { randomBytes } from "node:crypto";
import { readStore, writeStore } from "../services/json-store.js";
import { getAuthUser } from "./auth.js";

export const reportsRoutes = Router();

interface StoredReport {
  id: string;
  createdAt: string;
  userId: string | null;
  title: string;
  chartResult: unknown;
  personalizedResult: unknown;
}

interface ReportsFile {
  reports: Record<string, StoredReport>;
}

function readReports(): Record<string, StoredReport> {
  const file = readStore<ReportsFile>("reports");
  return file.reports ?? {};
}

function persistReports(reports: Record<string, StoredReport>): void {
  readStore<ReportsFile>("reports").reports = reports;
  writeStore("reports");
}

function makeId(): string {
  for (let attempt = 0; attempt < 5; attempt++) {
    const id = randomBytes(5).toString("base64url"); // ~8 chars
    if (!(id in readReports())) return id;
  }
  return `${Date.now().toString(36)}${randomBytes(2).toString("base64url")}`;
}

function makeTitle(chart: any): string {
  const place = String(chart?.geo?.placeName ?? "").split(",")[0]?.trim() ?? "Birth";
  const dob = String(chart?.input?.dateOfBirth ?? "");
  const when = dob ? new Date(dob).toISOString().slice(0, 10) : "";
  return [place, when].filter(Boolean).join(" · ") || "Saved reading";
}

/* POST /api/reports */
reportsRoutes.post("/", (req, res) => {
  const { chartResult, personalizedResult } = (req.body ?? {}) as {
    chartResult?: unknown;
    personalizedResult?: unknown;
  };
  if (!chartResult || !personalizedResult) {
    res.status(400).json({ error: "Required fields: chartResult, personalizedResult" });
    return;
  }

  const user = getAuthUser(req);
  const id = makeId();
  const report: StoredReport = {
    id,
    createdAt: new Date().toISOString(),
    userId: user?.id ?? null,
    title: makeTitle(chartResult),
    chartResult,
    personalizedResult,
  };

  const reports = readReports();
  reports[id] = report;
  persistReports(reports);

  res.status(201).json({ id });
});

/* GET /api/reports/mine — must come before /:id */
reportsRoutes.get("/mine", (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: "Please log in to see your saved readings." });
    return;
  }
  const reports = readReports();
  const mine = Object.values(reports)
    .filter((r) => r.userId === user.id)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .map((r) => ({ id: r.id, createdAt: r.createdAt, title: r.title }));
  res.json({ reports: mine });
});

/* GET /api/reports/:id */
reportsRoutes.get("/:id", (req, res) => {
  const { id } = req.params;
  const report = readReports()[id];
  if (!report) {
    res.status(404).json({ error: "This reading could not be found. It may have been removed." });
    return;
  }
  res.json({
    id: report.id,
    createdAt: report.createdAt,
    title: report.title,
    chartResult: report.chartResult,
    personalizedResult: report.personalizedResult,
  });
});
