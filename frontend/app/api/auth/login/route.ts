import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import {
  COOKIE_NAME,
  MAX_AGE_SECONDS,
  publicUser,
  readUsers,
  signToken,
} from "@/src/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = (await req.json().catch(() => ({}))) as {
      email?: string;
      password?: string;
    };
    const normalized = (email ?? "").trim().toLowerCase();

    if (!normalized || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const user = readUsers().find((u) => u.email === normalized);
    if (!user) {
      return NextResponse.json({ error: "No account found with this email address." }, { status: 401 });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "Incorrect password. Please try again." }, { status: 401 });
    }

    const token = signToken(user);
    const res = NextResponse.json({ user: publicUser(user) });
    res.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: MAX_AGE_SECONDS,
    });

    return res;
  } catch (err: any) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Could not log in. Please try again." }, { status: 500 });
  }
}
