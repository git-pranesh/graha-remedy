import { NextResponse } from "next/server";
import { readReports } from "@/src/lib/reports";

interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, { params }: Props) {
  const { id } = await params;
  const reports = readReports();
  const report = reports[id];

  if (!report) {
    return NextResponse.json(
      { error: "This reading could not be found. It may have been removed." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    id: report.id,
    createdAt: report.createdAt,
    title: report.title,
    chartResult: report.chartResult,
    personalizedResult: report.personalizedResult,
  });
}
