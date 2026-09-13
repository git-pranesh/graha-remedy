import { NextResponse } from "next/server";
import { computeChart, type BirthInput } from "@/src/services/chart";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as BirthInput & { currentCity?: string; kulDevta?: string };
    const { dateOfBirth, timeOfBirth, placeOfBirth } = body;

    if (!dateOfBirth || !timeOfBirth || !placeOfBirth) {
      return NextResponse.json(
        { error: "Missing required fields: dateOfBirth (YYYY-MM-DD), timeOfBirth (HH:MM), placeOfBirth" },
        { status: 400 }
      );
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const timeRegex = /^\d{1,2}:\d{2}$/;
    if (!dateRegex.test(dateOfBirth)) {
      return NextResponse.json({ error: "dateOfBirth must be YYYY-MM-DD format" }, { status: 400 });
    }
    if (!timeRegex.test(timeOfBirth)) {
      return NextResponse.json({ error: "timeOfBirth must be HH:MM format (24-hour)" }, { status: 400 });
    }

    const chartResult = await computeChart(body);
    return NextResponse.json(chartResult);
  } catch (err: any) {
    console.error("Error computing birth chart:", err);
    return NextResponse.json(
      { error: err.message || "Failed to compute birth chart" },
      { status: 500 }
    );
  }
}
