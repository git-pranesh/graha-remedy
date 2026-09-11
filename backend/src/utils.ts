import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, "../../data");

/**
 * Read a JSON file from the data directory.
 * @param subfolder — subfolder inside /data (e.g. "planets", "remedies")
 * @param filename — optional filename without extension (defaults to subfolder name)
 */
export function readJsonData(
  subfolder: string,
  filename?: string
): unknown {
  const fileName = filename ?? subfolder;
  const filePath = path.join(DATA_DIR, subfolder, `${fileName}.json`);
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

/**
 * List all JSON files in a data subfolder.
 */
export function listJsonFiles(subfolder: string): string[] {
  const dirPath = path.join(DATA_DIR, subfolder);
  return fs
    .readdirSync(dirPath)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(".json", ""));
}
