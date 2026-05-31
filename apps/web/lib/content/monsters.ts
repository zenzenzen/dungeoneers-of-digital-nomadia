import { readFile } from "node:fs/promises";
import path from "node:path";
import { parseCsv } from "./csv";

export type Monster = {
  id: string;
  slug: string;
  name: string;
  type: string;
  size: string;
  armorClass: number;
  hitPoints: string;
  speed: string;
  challengeRating: string;
  abilities: string;
  attacks: string;
  attackList: string[];
  special_traits: string;
  traitList: string[];
  version: string;
  isActive: boolean;
};

let monsterCache: Monster[] | null = null;

function getRepoRoot() {
  return path.resolve(process.cwd(), "../..");
}

function toSlug(id: string) {
  return id.replace(/^monster_/, "");
}

function parseList(input: string) {
  return input
    .split(";")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export async function getMonsters() {
  if (monsterCache) {
    return monsterCache;
  }

  const filePath = path.join(getRepoRoot(), "monsters", "monsters.csv");
  const csvText = await readFile(filePath, "utf8");
  const rows = parseCsv(csvText);

  monsterCache = rows
    .map((row) => ({
      id: row.id,
      slug: toSlug(row.id),
      name: row.name,
      type: row.type,
      size: row.size,
      armorClass: Number(row.armor_class),
      hitPoints: row.hit_points,
      speed: row.speed,
      challengeRating: row.challenge_rating,
      abilities: row.abilities,
      attacks: row.attacks,
      attackList: parseList(row.attacks),
      special_traits: row.special_traits,
      traitList: parseList(row.special_traits),
      version: row.version,
      isActive: row.is_active === "true",
    }))
    .filter((monster) => monster.isActive)
    .sort((left, right) => left.name.localeCompare(right.name));

  return monsterCache;
}

export async function getMonsterTypes() {
  const monsters = await getMonsters();
  return [...new Set(monsters.map((monster) => monster.type))].sort((left, right) => left.localeCompare(right));
}

export async function getMonsterBySlug(slug: string) {
  const monsters = await getMonsters();
  return monsters.find((monster) => monster.slug === slug) ?? null;
}
