/**
 * Tiny file-backed JSON store.
 *
 * Files live in /data at the project root (users.json, reports.json).
 * Documents are cached in memory and written back atomically on demand —
 * fine for a small MVP; swap for a real DB when the user base grows.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// backend/src/services → ../../../data = <project root>/data
const DATA_DIR = path.resolve(__dirname, "..", "..", "..", "data");

const cache = new Map<string, Record<string, unknown>>();

function filePath(name: string): string {
  return path.join(DATA_DIR, `${name}.json`);
}

/** Read (and cache) a store. Creates an empty object if the file is missing. */
export function readStore<T>(name: string): T {
  let store = cache.get(name);
  if (store === undefined) {
    const fp = filePath(name);
    if (fs.existsSync(fp)) {
      store = JSON.parse(fs.readFileSync(fp, "utf-8")) as Record<string, unknown>;
    } else {
      store = {};
    }
    cache.set(name, store);
  }
  return store as T;
}

/** Persist the in-memory store to disk (atomic via temp file + rename). */
export function writeStore(name: string): void {
  const store = cache.get(name);
  if (store === undefined) return;
  const fp = filePath(name);
  fs.mkdirSync(path.dirname(fp), { recursive: true });
  const tmp = `${fp}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(store, null, 2), "utf-8");
  fs.renameSync(tmp, fp);
}
