import { NextResponse } from "next/server";
import { getAuthUserFromCookie } from "@/src/lib/auth";
import {
  makeId,
  makeTitle,
  persistReports,
  readReports,
  type StoredReport,
} from "@/src/lib/reports";

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      chartResult?: unknown;
      personalizedResult?: unknown;
    };
    const { chartResult, personalizedResult } = body;

    if (!chartResult || !personalizedResult) {
      return NextResponse.json(
        { error: "Required fields: chartResult, personalizedResult" },
        { status: 400 }
      );
    }

    const cookieHeader = req.headers.get("cookie");
    const user = getAuthUserFromCookie(cookieHeader);
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

    return NextResponse.json({ id }, { status: 201 });
  } catch (err: any) {
    console.error("Save report error:", err);
    return NextResponse.json({ error: "Could not save the reading." }, { status: 500 });
  }
}
