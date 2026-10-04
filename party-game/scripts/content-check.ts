import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { z } from "zod";
import { currencies } from "../src/shared/types";
const whole = z.number().int().nonnegative();
const effect = z.discriminatedUnion("kind", [
  z
    .object({
      kind: z.literal("power"),
      amount: z.number().int(),
      tags: z.array(z.string()).optional(),
    })
    .strict(),
  z
    .object({
      kind: z.literal("combat"),
      amount: z.number().int(),
      side: z.enum(["party", "encounter"]),
    })
    .strict(),
  z.object({ kind: z.literal("chill"), amount: z.number().int() }).strict(),
  z
    .object({
      kind: z.literal("resource"),
      currency: z.enum(currencies),
      amount: z.number().int(),
    })
    .strict(),
  z.object({ kind: z.literal("draw"), amount: whole.max(5) }).strict(),
  z
    .object({ kind: z.enum(["class_swap", "escape", "cleanse", "shield"]) })
    .strict(),
]);
const cardSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9_]+$/),
    kind: z.enum([
      "class",
      "trait",
      "monster",
      "event",
      "action",
      "equipment",
      "finale",
    ]),
    name: z.string().min(1),
    flavor: z.string().min(1),
    rules: z.string().min(1),
    tags: z.array(z.string()).min(1),
    effects: z.array(effect),
    sources: z.array(z.string()),
    authorship: z.enum(["new", "adapted"]),
    quantity: whole.min(1).max(10),
    strength: whole.optional(),
    tier: whole.min(1).max(3).optional(),
    setback: whole.optional(),
    loot: whole.optional(),
    rewards: z.partialRecord(z.enum(currencies), whole).optional(),
    price: z.object({ currency: z.enum(currencies), amount: whole }).optional(),
    ending: z.string().optional(),
    art: z.object({
      subject: z.string().min(1),
      action: z.string().min(1),
      setting: z.string().min(1),
      joke: z.string().min(1),
      motifs: z.array(z.string()),
      palette: z.array(z.string()).min(1),
      composition: z.string().min(1).optional(),
    }),
  })
  .strict();
const bundle = JSON.parse(
  readFileSync(new URL("../content/launch.json", import.meta.url), "utf8"),
);
const catalogue = JSON.parse(
  readFileSync(new URL("../content/catalogue.json", import.meta.url), "utf8"),
);
const cards = z.array(cardSchema).parse(bundle.cards);
const errors: string[] = [];
const ruleSchema = z
  .object(
    Object.fromEntries(
      [
        "minPlayers",
        "startChill",
        "maxChill",
        "startLevel",
        "finaleLevel",
        "maxRounds",
        "traitSlots",
        "equipmentSlots",
        "handLimit",
        "startingTraits",
        "startingHand",
        "turnMs",
        "interventionMs",
        "recoveryChill",
        "escapeTarget",
        "therapyHeal",
        "therapyPrice",
        "selfCareHeal",
        "marketSize",
        "negotiationMs",
        "turnDraw",
        "selfCareDraw",
        "socialCapitalFloor",
        "protectionCost",
      ].map((name) => [name, whole.min(1)]),
    ),
  )
  .extend({
    maxPlayers: whole.min(1).nullable(),
    startingWallet: z.record(z.enum(currencies), whole),
  })
  .strict();
ruleSchema.parse(bundle.campaign.rules);
const difficulty = z
  .array(z.object({ minLevel: whole.min(1), tier: whole.min(1) }).strict())
  .min(1)
  .parse(bundle.campaign.difficulty);
if (
  difficulty[0].minLevel !== bundle.campaign.rules.startLevel ||
  difficulty.some((d, i) => i > 0 && d.minLevel <= difficulty[i - 1].minLevel)
)
  errors.push(
    "Difficulty thresholds must be ordered and cover the starting level.",
  );
if (
  bundle.campaign.rules.negotiationMs + bundle.campaign.rules.interventionMs >
  bundle.campaign.rules.turnMs
)
  errors.push("Encounter windows must fit within the turn limit.");
const expected = {
  class: 8,
  trait: 24,
  monster: 18,
  event: 8,
  action: 20,
  equipment: 10,
  finale: 3,
};
for (const [k, n] of Object.entries(expected))
  if (cards.filter((c) => c.kind === k).length !== n)
    errors.push(`${k}: expected ${n}`);
const ids = new Set<string>();
const sources = new Set(catalogue.assets.map((a: any) => a.id));
for (const c of cards) {
  if (ids.has(c.id)) errors.push(`Duplicate ${c.id}`);
  ids.add(c.id);
  if (
    /\b(gp|d20|STR|DEX|CON|WIS|CHA|hit points|armor class|saving throw|spell slot)\b/.test(
      `${c.rules} ${c.flavor}`,
    )
  )
    errors.push(`Legacy rule ${c.id}`);
  if (c.authorship === "adapted" && !c.sources.length)
    errors.push(`Missing provenance ${c.id}`);
  for (const s of c.sources)
    if (!sources.has(s)) errors.push(`Unresolved source ${s}`);
  if (
    ["monster", "finale"].includes(c.kind) &&
    (c.strength === undefined || c.setback === undefined)
  )
    errors.push(`Missing encounter rules ${c.id}`);
  if (c.kind === "equipment" && !c.price) errors.push(`Missing price ${c.id}`);
  if (c.kind === "finale" && !c.ending) errors.push(`Missing ending ${c.id}`);
  for (const e of c.effects) {
    if (["class", "trait", "equipment"].includes(c.kind) && e.kind !== "power")
      errors.push(`Unsupported passive ${c.id}`);
    if (c.kind === "event" && !["chill", "resource", "draw"].includes(e.kind))
      errors.push(`Unsupported event ${c.id}`);
  }
}
for (const [k, pool] of Object.entries(bundle.campaign.pools) as [
  string,
  string[],
][]) {
  for (const id of pool)
    if (!cards.some((c) => c.id === id && c.kind === k))
      errors.push(`Invalid pool reference ${k}/${id}`);
}
const calculated = createHash("sha256")
  .update(JSON.stringify({ cards: bundle.cards, campaign: bundle.campaign }))
  .digest("hex")
  .slice(0, 16);
if (calculated !== bundle.version)
  errors.push("Content version does not match payload. Rerun seed-content.");
for (const f of catalogue.files) {
  const bytes = readFileSync(new URL("../../" + f.path, import.meta.url));
  if (createHash("sha256").update(bytes).digest("hex") !== f.sha256)
    errors.push(`Stale source ${f.path}`);
}
for (const a of catalogue.assets) {
  if (
    !a.sourceRefs.length ||
    !a.tags.length ||
    !a.campaigns.length ||
    !a.variants.length
  )
    errors.push(`Incomplete asset ${a.id}`);
  for (const id of a.relatedIds)
    if (!sources.has(id)) errors.push(`Unknown duplicate ${id}`);
}
for (const [path, count] of [
  ["classes/classes.csv", 43],
  ["backgrounds/backgrounds.csv", 129],
  ["feats/feats_template.csv", 50],
] as const) {
  const got = catalogue.assets.filter((a: any) =>
    a.sourceRefs.some((r: any) => r.path === path && r.row),
  ).length;
  if (got !== count) errors.push(`Coverage ${path}: ${got}/${count}`);
}
const packets = JSON.parse(
  readFileSync(
    new URL("../content/prompt-packets/launch.json", import.meta.url),
    "utf8",
  ),
);
if (
  packets.length !== cards.length ||
  packets.some(
    (p: any) =>
      p.contentVersion !== bundle.version ||
      !p.flavor.prompt ||
      !p.visual.prompt ||
      !p.visual.cleanPrompt ||
      p.flavor.template !== "flavor.v2" ||
      p.visual.template !== "visual.v2" ||
      p.visual.cleanTemplate !== "visual-clean.v1",
  )
)
  errors.push("Prompt packets missing or stale.");
const artDirections = JSON.parse(
  readFileSync(
    new URL("../content/art-direction/monsters.v1.json", import.meta.url),
    "utf8",
  ),
).monsters;
const monsterIds = cards
  .filter((c) => c.kind === "monster")
  .map((c) => c.id)
  .sort();
if (
  JSON.stringify(Object.keys(artDirections).sort()) !==
  JSON.stringify(monsterIds)
)
  errors.push(
    "Monster art directions must cover exactly the playable monsters.",
  );
const monsterIndex = JSON.parse(
  readFileSync(
    new URL("../content/prompt-packets/monsters/index.json", import.meta.url),
    "utf8",
  ),
);
if (
  JSON.stringify(monsterIndex.map((p: any) => p.cardId).sort()) !==
  JSON.stringify(monsterIds)
)
  errors.push("Monster prompt index is incomplete.");
for (const p of packets) {
  const definition = cards.find((c) => c.id === p.cardId);
  if (
    !definition ||
    p.inputs.approvedFlavor !== definition.flavor ||
    p.inputs.immutableMechanics.rules !== definition.rules
  )
    errors.push(`Prompt inputs drifted for ${p.cardId}`);
  if (/\{\{\w+\}\}/.test(JSON.stringify(p)))
    errors.push(`Unresolved prompt input ${p.cardId}`);
  if (
    /Return JSON|schemaVersion|source_[a-z]|Immutable gameplay/i.test(
      p.visual.cleanPrompt,
    )
  )
    errors.push(`Metadata leaked into clean art prompt ${p.cardId}`);
  if (definition?.kind === "monster") {
    const brief = JSON.parse(
      readFileSync(
        new URL(
          `../content/prompt-packets/monsters/${p.cardId}.brief.json`,
          import.meta.url,
        ),
        "utf8",
      ),
    );
    const clean = readFileSync(
      new URL(
        `../content/prompt-packets/monsters/${p.cardId}.art.txt`,
        import.meta.url,
      ),
      "utf8",
    ).trim();
    if (
      JSON.stringify(brief) !== JSON.stringify(p) ||
      clean !== p.visual.cleanPrompt
    )
      errors.push(`Stale monster export ${p.cardId}`);
    if (
      definition.art.action === definition.flavor ||
      !definition.art.composition
    )
      errors.push(
        `Monster needs concrete visual action and composition ${p.cardId}`,
      );
  }
}
if (errors.length) throw new Error(errors.join("\n"));
console.log(
  `Content verified: ${cards.length} playable cards, ${catalogue.assets.length} source entries, ${catalogue.files.length} source hashes, ${packets.length * 3} prompt forms, ${monsterIds.length} monster file pairs.`,
);
