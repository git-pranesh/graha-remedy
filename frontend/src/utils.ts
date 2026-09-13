import fs from "node:fs";
import path from "node:path";

function findDataDir(): string {
  const localData = path.resolve(process.cwd(), "data");
  if (fs.existsSync(localData)) return localData;
  const parentData = path.resolve(process.cwd(), "..", "data");
  if (fs.existsSync(parentData)) return parentData;
  return localData;
}

const DATA_DIR = findDataDir();

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
  if (!fs.existsSync(dirPath)) return [];
  return fs
    .readdirSync(dirPath)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(".json", ""));
}
