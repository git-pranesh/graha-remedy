import { NextResponse } from "next/server";
import { getAuthUserFromCookie } from "@/src/lib/auth";
import { readReports } from "@/src/lib/reports";

export async function GET(req: Request) {
  const cookieHeader = req.headers.get("cookie");
  const user = getAuthUserFromCookie(cookieHeader);
  if (!user) {
    return NextResponse.json({ error: "Please log in to see your saved readings." }, { status: 401 });
  }

  const reports = readReports();
  const mine = Object.values(reports)
    .filter((r) => r.userId === user.id)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .map((r) => ({ id: r.id, createdAt: r.createdAt, title: r.title }));

  return NextResponse.json({ reports: mine });
}
