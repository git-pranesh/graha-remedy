import { NextResponse } from "next/server";
import { runRulesEngine, computeAfflictions } from "@/src/services/rules-engine";
import type { AstroChart, VimshottariDasha } from "@/src/services/astro-engine";
import type { DoshaFlags } from "@/src/services/dosha";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      chart?: AstroChart;
      doshas?: DoshaFlags;
      dasha?: VimshottariDasha;
      problems?: string[];
      latitude?: number;
      longitude?: number;
    };
    const { chart, doshas, dasha, problems } = body;

    if (!chart || !doshas || !problems) {
      return NextResponse.json(
        { error: "Required fields: chart, doshas, problems" },
        { status: 400 }
      );
    }

    if (!Array.isArray(problems) || problems.length === 0) {
      return NextResponse.json({ error: "Provide a non-empty 'problems' array" }, { status: 400 });
    }

    const result = runRulesEngine(chart, doshas, problems, dasha);
    const afflictions = computeAfflictions(chart, doshas);
    const templeMatches: Record<string, unknown> = {};

    return NextResponse.json({
      afflictions,
      ...result,
      templeMatches,
    });
  } catch (err: any) {
    console.error("Personalized remedy error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to compute personalized remedies" },
      { status: 500 }
    );
  }
}
