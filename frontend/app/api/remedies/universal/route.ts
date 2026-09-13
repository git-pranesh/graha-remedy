import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

function findDataDir(): string {
  const localData = path.resolve(process.cwd(), "data");
  if (fs.existsSync(localData)) return localData;
  const parentData = path.resolve(process.cwd(), "..", "data");
  if (fs.existsSync(parentData)) return parentData;
  return localData;
}

export async function GET() {
  try {
    const dataDir = findDataDir();
    const filePath = path.join(dataDir, "remedies", "universal.json");
    const raw = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw);
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Universal remedies error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load universal remedies" },
      { status: 500 }
    );
  }
}
