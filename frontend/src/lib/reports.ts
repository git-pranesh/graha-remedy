import { randomBytes } from "node:crypto";
import { readStore, writeStore } from "../services/json-store";

export interface StoredReport {
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

export function readReports(): Record<string, StoredReport> {
  const file = readStore<ReportsFile>("reports");
  return file.reports ?? {};
}

export function persistReports(reports: Record<string, StoredReport>): void {
  readStore<ReportsFile>("reports").reports = reports;
  writeStore("reports");
}

export function makeId(): string {
  const reports = readReports();
  for (let attempt = 0; attempt < 5; attempt++) {
    const id = randomBytes(5).toString("base64url");
    if (!(id in reports)) return id;
  }
  return `${Date.now().toString(36)}${randomBytes(2).toString("base64url")}`;
}

export function makeTitle(chart: any): string {
  const place = String(chart?.geo?.placeName ?? "").split(",")[0]?.trim() ?? "Birth";
  const dob = String(chart?.input?.dateOfBirth ?? "");
  const when = dob ? new Date(dob).toISOString().slice(0, 10) : "";
  return [place, when].filter(Boolean).join(" · ") || "Saved reading";
}
