import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { parse } from "csv-parse/sync";

import { parseFeatureDsl, schemaRegistry, type KnownEntityType } from "@ddn/content-schema";

const currentFile = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(currentFile), "../../..");
const generatedDir = path.join(root, "packages/content/generated");
const publicDir = path.join(root, "apps/web/public/content");

type IndexEntry = {
  type: string;
  count: number;
  sourcePath: string;
};

async function ensureDirectory(dirPath: string) {
  await fs.mkdir(dirPath, { recursive: true });
}

function looksBoolean(value: string) {
  return value === "true" || value === "false";
}

function normalizeValue(value: string) {
  const trimmed = value.trim();

  if (looksBoolean(trimmed)) {
    return trimmed === "true";
  }

  return trimmed;
}

async function readCsv(filePath: string) {
  const contents = await fs.readFile(filePath, "utf8");
  return parse(contents, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }).map((row: Record<string, string>) => {
    return Object.fromEntries(
      Object.entries(row).map(([key, value]) => [key, normalizeValue(value)]),
    );
  });
}

async function writeJson(dirPath: string, name: string, data: unknown) {
  await fs.writeFile(path.join(dirPath, `${name}.json`), JSON.stringify(data, null, 2) + "\n");
}

async function build() {
  await ensureDirectory(generatedDir);
  await ensureDirectory(publicDir);

  const directoryEntries = await fs.readdir(root, { withFileTypes: true });
  const indexEntries: IndexEntry[] = [];

  for (const entry of directoryEntries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const csvPath = path.join(root, entry.name, `${entry.name}.csv`);

    try {
      await fs.access(csvPath);
    } catch {
      continue;
    }

    const rows = await readCsv(csvPath);
    const schema = schemaRegistry[entry.name as KnownEntityType];

    const transformedRows = rows.map((row: Record<string, unknown>) => row);

    const validatedRows = schema
      ? transformedRows.map((row) => {
          const validated = schema.parse(row);

          if (entry.name === "classes" && typeof row.features === "string") {
            return {
              ...validated,
              parsed_features: parseFeatureDsl(row.features),
            };
          }

          return validated;
        })
      : transformedRows;

    await writeJson(generatedDir, entry.name, validatedRows);
    await writeJson(publicDir, entry.name, validatedRows);

    indexEntries.push({
      type: entry.name,
      count: validatedRows.length,
      sourcePath: path.relative(root, csvPath),
    });
  }

  const index = {
    generatedAt: new Date().toISOString(),
    entities: indexEntries.sort((left, right) => left.type.localeCompare(right.type)),
  };

  await writeJson(generatedDir, "index", index);
  await writeJson(publicDir, "index", index);
}

build().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
