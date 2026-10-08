import { NextResponse } from "next/server";
import { computeToolReport, type ToolInput } from "@/src/services/tool-report";

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^\d{1,2}:\d{2}$/;

export async function POST(req: Request) {
  let body: ToolInput;
  try {
    body = (await req.json()) as ToolInput;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const { dateOfBirth, timeOfBirth, placeOfBirth, timeUnknown } = body;
  if (!dateOfBirth || !DATE.test(dateOfBirth)) {
    return NextResponse.json({ error: "Enter a valid date of birth" }, { status: 400 });
  }
  const year = Number(dateOfBirth.slice(0, 4));
  if (year < 1800 || year > 2100) {
    return NextResponse.json({ error: "Date of birth must be between 1800 and 2100" }, { status: 400 });
  }
  if (!timeUnknown && (!timeOfBirth || !TIME.test(timeOfBirth))) {
    return NextResponse.json({ error: "Enter a valid time of birth, or tick 'I don't know my birth time'" }, { status: 400 });
  }
  if (!placeOfBirth || placeOfBirth.trim().length < 2) {
    return NextResponse.json({ error: "Enter your place of birth" }, { status: 400 });
  }
  try {
    const report = await computeToolReport({ ...body, timeOfBirth: timeOfBirth ?? "12:00" });
    return NextResponse.json(report);
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    if (/geocod/i.test(message)) {
      return NextResponse.json(
        { error: "We couldn't find that place. Start typing your town or city and pick it from the list." },
        { status: 400 },
      );
    }
    console.error("tools/report failed:", err);
    return NextResponse.json({ error: "Calculation failed. Please try again." }, { status: 500 });
  }
}
