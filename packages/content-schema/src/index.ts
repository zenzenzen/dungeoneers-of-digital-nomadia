import { z } from "zod";

import { parseFeatureDsl } from "./feature-dsl";

const booleanish = z.union([z.boolean(), z.string()]).transform((value) => {
  if (typeof value === "boolean") {
    return value;
  }

  return value.toLowerCase() === "true";
});

export const MonsterSchema = z.object({
  id: z.string().regex(/^monster_[a-z0-9_]+$/),
  name: z.string(),
  type: z.string(),
  size: z.string(),
  armor_class: z.coerce.number().int(),
  hit_points: z.string(),
  speed: z.string(),
  challenge_rating: z.union([z.coerce.number(), z.string()]),
  abilities: z.string(),
  attacks: z.string(),
  special_traits: z.string(),
  version: z.string(),
  is_active: booleanish,
});

export const ClassSchema = z.object({
  id: z.string().regex(/^class_[a-z0-9_]+$/),
  name: z.string(),
  hit_die: z.string(),
  primary_stat: z.string(),
  save_primary: z.string(),
  save_secondary: z.string(),
  features: z.string(),
  version: z.string(),
  tags: z.string().optional().default(""),
  is_active: booleanish,
});

export const SpellSchema = z.object({
  id: z.string().regex(/^spell_[a-z0-9_]+$/),
  name: z.string(),
  level: z.union([z.coerce.number(), z.string()]),
  school: z.string(),
  casting_time: z.string(),
  range: z.string(),
  components: z.string(),
  duration: z.string(),
  description: z.string(),
  version: z.string(),
  is_active: booleanish,
});

export const NpcSchema = z.object({
  id: z.string().regex(/^npc_[a-z0-9_]+$/),
  name: z.string(),
  race: z.string(),
  class: z.string(),
  class_id: z.string(),
  level: z.coerce.number(),
  location: z.string(),
  location_id: z.string(),
  role: z.string(),
  primary_faction_id: z.string(),
  notes: z.string(),
  version: z.string(),
  is_active: booleanish,
});

export const schemaRegistry = {
  classes: ClassSchema,
  monsters: MonsterSchema,
  npcs: NpcSchema,
  spells: SpellSchema,
};

export type Monster = z.infer<typeof MonsterSchema>;
export type ClassRecord = z.infer<typeof ClassSchema> & {
  parsed_features: ReturnType<typeof parseFeatureDsl>;
};
export type Spell = z.infer<typeof SpellSchema>;
export type Npc = z.infer<typeof NpcSchema>;

export type KnownEntityType = keyof typeof schemaRegistry;

export { parseFeatureDsl };
