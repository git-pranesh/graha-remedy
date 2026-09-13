import { NextResponse } from "next/server";
import { getAuthUserFromCookie, publicUser } from "@/src/lib/auth";

export async function GET(req: Request) {
  const cookieHeader = req.headers.get("cookie");
  const user = getAuthUserFromCookie(cookieHeader);
  if (!user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }
  return NextResponse.json({ user: publicUser(user) });
}
