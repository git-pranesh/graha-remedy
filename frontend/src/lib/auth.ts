import jwt from "jsonwebtoken";
import { readStore, writeStore } from "../services/json-store";

export const COOKIE_NAME = "graha_token";
export const MAX_AGE_SECONDS = 90 * 24 * 60 * 60; // 90 days
const JWT_SECRET: string = process.env.JWT_SECRET ?? "graha-dev-secret-change-me";

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

interface UsersFile {
  users: User[];
}

export function readUsers(): User[] {
  const file = readStore<UsersFile>("users");
  return file.users ?? [];
}

export function persistUsers(users: User[]): void {
  readStore<UsersFile>("users").users = users;
  writeStore("users");
}

export function publicUser(u: User) {
  return { id: u.id, email: u.email };
}

export function signToken(user: User): string {
  return jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: MAX_AGE_SECONDS,
  });
}

export function parseCookies(header: string): Record<string, string> {
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

export function getAuthUserFromCookie(cookieHeader?: string | null): User | null {
  if (!cookieHeader) return null;
  const token = parseCookies(cookieHeader)[COOKIE_NAME];
  if (!token) return null;
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { sub?: string };
    if (!payload.sub) return null;
    return readUsers().find((u) => u.id === payload.sub) ?? null;
  } catch {
    return null;
  }
}
