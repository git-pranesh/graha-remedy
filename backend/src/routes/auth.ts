/**
 * Simple email + password auth.
 *
 * - Passwords hashed with bcrypt (pure-JS bcryptjs)
 * - JWT stored in an HttpOnly, SameSite=Lax cookie (no localStorage)
 * - Users persisted in /data/users.json via the file-backed store
 *
 * Works across the dev setup (frontend :5173 → backend :3001) because
 * both are same-site (localhost). Set `JWT_SECRET` in production.
 */

import { Router, type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import { readStore, writeStore } from "../services/json-store.js";

const COOKIE_NAME = "graha_token";
const MAX_AGE_SECONDS = 90 * 24 * 60 * 60; // 90 days
const JWT_SECRET: string = process.env.JWT_SECRET ?? "graha-dev-secret-change-me";

if (!process.env.JWT_SECRET) {
  console.warn(
    "⚠️  JWT_SECRET not set — using an insecure development secret. Set JWT_SECRET in production.",
  );
}

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

interface UsersFile {
  users: User[];
}

function readUsers(): User[] {
  const file = readStore<UsersFile>("users");
  return file.users ?? [];
}

function persistUsers(users: User[]): void {
  readStore<UsersFile>("users").users = users;
  writeStore("users");
}

function publicUser(u: User) {
  return { id: u.id, email: u.email };
}

function signToken(user: User): string {
  return jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: MAX_AGE_SECONDS,
  });
}

export function setAuthCookie(res: Response, token: string): void {
  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${MAX_AGE_SECONDS}`,
  );
}

function clearAuthCookie(res: Response): void {
  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`,
  );
}

function parseCookies(req: Request): Record<string, string> {
  const header = req.headers.cookie ?? "";
  const out: Record<string, string> = {};
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (key) out[key] = decodeURIComponent(value);
  }
  return out;
}

/** Resolve the authenticated user from the request, or null. */
export function getAuthUser(req: Request): User | null {
  const token = parseCookies(req)[COOKIE_NAME];
  if (!token) return null;
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { sub?: string };
    if (!payload.sub) return null;
    return readUsers().find((u) => u.id === payload.sub) ?? null;
  } catch {
    return null;
  }
}

export const authRoutes = Router();

/* POST /api/auth/register */
authRoutes.post("/register", async (req, res) => {
  try {
    const { email, password } = (req.body ?? {}) as { email?: string; password?: string };
    const normalized = (email ?? "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      res.status(400).json({ error: "Please enter a valid email address." });
      return;
    }
    if (!password || password.length < 6) {
      res.status(400).json({ error: "Password must be at least 6 characters." });
      return;
    }

    const users = readUsers();
    if (users.some((u) => u.email === normalized)) {
      res.status(409).json({ error: "An account with this email already exists. Try logging in." });
      return;
    }

    const user: User = {
      id: randomUUID(),
      email: normalized,
      passwordHash: await bcrypt.hash(password, 10),
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    persistUsers(users);

    setAuthCookie(res, signToken(user));
    res.status(201).json({ user: publicUser(user) });
  } catch (err: any) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Could not create the account. Please try again." });
  }
});

/* POST /api/auth/login */
authRoutes.post("/login", async (req, res) => {
  try {
    const { email, password } = (req.body ?? {}) as { email?: string; password?: string };
    const normalized = (email ?? "").trim().toLowerCase();
    const user = readUsers().find((u) => u.email === normalized);
    const ok = user && password ? await bcrypt.compare(password, user.passwordHash) : false;
    if (!user || !ok) {
      res.status(401).json({ error: "Incorrect email or password." });
      return;
    }
    setAuthCookie(res, signToken(user));
    res.json({ user: publicUser(user) });
  } catch (err: any) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Could not log in. Please try again." });
  }
});

/* POST /api/auth/logout */
authRoutes.post("/logout", (_req, res) => {
  clearAuthCookie(res);
  res.json({ ok: true });
});

/* GET /api/auth/me */
authRoutes.get("/me", (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  res.json({ user: publicUser(user) });
});
