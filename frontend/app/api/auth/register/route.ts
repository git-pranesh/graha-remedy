import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import {
  COOKIE_NAME,
  MAX_AGE_SECONDS,
  persistUsers,
  publicUser,
  readUsers,
  signToken,
  type User,
} from "@/src/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = (await req.json().catch(() => ({}))) as {
      email?: string;
      password?: string;
    };
    const normalized = (email ?? "").trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }
    if (!password || password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }

    const users = readUsers();
    if (users.some((u) => u.email === normalized)) {
      return NextResponse.json(
        { error: "An account with this email already exists. Try logging in." },
        { status: 409 }
      );
    }

    const user: User = {
      id: randomUUID(),
      email: normalized,
      passwordHash: await bcrypt.hash(password, 10),
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    persistUsers(users);

    const token = signToken(user);
    const res = NextResponse.json({ user: publicUser(user) }, { status: 201 });
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
    console.error("Register error:", err);
    return NextResponse.json(
      { error: "Could not create the account. Please try again." },
      { status: 500 }
    );
  }
}
