import {
  loadContentIndex,
  loadEntityCollection,
  type ContentIndex,
} from "@ddn/content";
import { promises as fs } from "node:fs";
import path from "node:path";

export type MonsterRecord = {
  id: string;
  slug: string;
  name: string;
  type: string;
  size: string;
  armor_class: number;
  hit_points: string;
  speed: string;
  challenge_rating: number | string;
  abilities: string;
  attacks: string;
  special_traits: string;
  version: string;
  is_active: boolean;
  attackList: string[];
  traitList: string[];
};

export async function getContentIndex(): Promise<ContentIndex> {
  try {
    return await loadContentIndex();
  } catch {
    const monsters = await getMonsters();
    return {
      generatedAt: new Date(0).toISOString(),
      entities: [
        {
          type: "monsters",
          count: monsters.length,
          sourcePath: "monsters/monsters.csv",
        },
      ],
    };
  }
}

export async function getMonsters(): Promise<MonsterRecord[]> {
  try {
    const records = await loadEntityCollection<Omit<MonsterRecord, "slug" | "attackList" | "traitList">>("monsters");
    return records
      .filter((monster) => monster.is_active)
      .map((monster) => hydrateMonster(monster))
      .sort((left, right) => left.name.localeCompare(right.name));
  } catch {
    return loadMonstersFromCsv();
  }
}

export async function getMonsterBySlug(slug: string): Promise<MonsterRecord | null> {
  const monsters = await getMonsters();
  return monsters.find((monster) => monster.slug === slug) ?? null;
}

export function getSlugFromId(id: string) {
  return id.split("_").slice(1).join("_");
}

export function parseAbilityLine(abilities: string) {
  return abilities.split(",").map((entry) => entry.trim()).filter(Boolean);
}

export function summarizeMonster(monster: MonsterRecord) {
  return `${monster.type} · ${monster.size} · CR ${monster.challenge_rating}`;
}

function getRepoRoot() {
  return path.resolve(process.cwd(), "../..");
}

function parseCsv(text: string): Array<Record<string, string>> {
  const rows: string[][] = [];
  const currentRow: string[] = [];
  let currentCell = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const nextCharacter = text[index + 1];

    if (inQuotes) {
      if (character === '"' && nextCharacter === '"') {
        currentCell += '"';
        index += 1;
        continue;
      }

      if (character === '"') {
        inQuotes = false;
        continue;
      }

      currentCell += character;
      continue;
    }

    if (character === '"') {
      inQuotes = true;
      continue;
    }

    if (character === ",") {
      currentRow.push(currentCell);
      currentCell = "";
      continue;
    }

    if (character === "\n") {
      currentRow.push(currentCell);
      rows.push([...currentRow]);
      currentRow.length = 0;
      currentCell = "";
      continue;
    }

    if (character !== "\r") {
      currentCell += character;
    }
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell);
    rows.push([...currentRow]);
  }

  const [headers, ...dataRows] = rows.filter((row) => row.some((cell) => cell.trim().length > 0));

  if (!headers) {
    return [];
  }

  return dataRows.map((row) =>
    headers.reduce<Record<string, string>>((record, header, columnIndex) => {
      record[header] = row[columnIndex] ?? "";
      return record;
    }, {}),
  );
}

function parseDelimitedList(value: string) {
  return value
    .split(";")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function hydrateMonster(monster: Omit<MonsterRecord, "slug" | "attackList" | "traitList">): MonsterRecord {
  return {
    ...monster,
    slug: getSlugFromId(monster.id),
    attackList: parseDelimitedList(monster.attacks),
    traitList: parseDelimitedList(monster.special_traits),
  };
}

async function loadMonstersFromCsv(): Promise<MonsterRecord[]> {
  const csvPath = path.join(getRepoRoot(), "monsters", "monsters.csv");
  const csvText = await fs.readFile(csvPath, "utf8");
  const rows = parseCsv(csvText);

  return rows
    .map((row) =>
      hydrateMonster({
        id: row.id,
        name: row.name,
        type: row.type,
        size: row.size,
        armor_class: Number(row.armor_class),
        hit_points: row.hit_points,
        speed: row.speed,
        challenge_rating: Number.isNaN(Number(row.challenge_rating)) ? row.challenge_rating : Number(row.challenge_rating),
        abilities: row.abilities,
        attacks: row.attacks,
        special_traits: row.special_traits,
        version: row.version,
        is_active: row.is_active === "true",
      }),
    )
    .filter((monster) => monster.is_active)
    .sort((left, right) => left.name.localeCompare(right.name));
}
