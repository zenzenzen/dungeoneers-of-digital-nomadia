import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const generatedRoot = path.resolve(path.dirname(currentFile), "../generated");

export type ContentIndexEntry = {
  type: string;
  count: number;
  sourcePath: string;
};

export type ContentIndex = {
  generatedAt: string;
  entities: ContentIndexEntry[];
};

export async function loadContentIndex(): Promise<ContentIndex> {
  const filePath = path.join(generatedRoot, "index.json");
  const contents = await fs.readFile(filePath, "utf8");
  return JSON.parse(contents) as ContentIndex;
}

export async function loadEntityCollection<T = Record<string, string>>(
  entityType: string,
): Promise<T[]> {
  const filePath = path.join(generatedRoot, `${entityType}.json`);
  const contents = await fs.readFile(filePath, "utf8");
  return JSON.parse(contents) as T[];
}

export async function loadEntityBySlug<T extends { id: string } = { id: string }>(
  entityType: string,
  slug: string,
): Promise<T | null> {
  const entries = await loadEntityCollection<T>(entityType);
  return (
    entries.find((entry) => {
      const [, ...rest] = entry.id.split("_");
      return rest.join("_") === slug;
    }) ?? null
  );
}
