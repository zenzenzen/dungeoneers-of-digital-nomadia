import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import type { ContentBundle, SourceAsset } from "../src/shared/types";
const bundle: ContentBundle = JSON.parse(
  readFileSync(new URL("../content/launch.json", import.meta.url), "utf8"),
);
const assets: SourceAsset[] = JSON.parse(
  readFileSync(new URL("../content/catalogue.json", import.meta.url), "utf8"),
).assets;
const template = (name: string) =>
  readFileSync(new URL(`../prompts/${name}.txt`, import.meta.url), "utf8");
const flavor = template("flavor.v2");
const visual = template("visual.v2");
const clean = template("visual-clean.v1");
function fill(template: string, values: Record<string, string>) {
  return template
    .replace(/\{\{(\w+)\}\}/g, (_, key) => {
      if (!(key in values)) throw new Error(`Missing prompt input ${key}`);
      return values[key];
    })
    .trim();
}
const packets = bundle.cards.map((c) => {
  const sources = c.sources.map((id) => {
    const asset = assets.find((a) => a.id === id);
    if (!asset) throw new Error(`Missing source ${id}`);
    return asset;
  });
  const provenance = sources.map((s) => ({
    id: s.id,
    sourceRefs: s.sourceRefs,
    jokes: s.originalJokes,
  }));
  const mechanics = {
    rules: c.rules,
    effects: c.effects,
    strength: c.strength,
    rewards: c.rewards,
    setback: c.setback,
    loot: c.loot,
    price: c.price,
    ending: c.ending,
  };
  const inputs = {
    card_id: c.id,
    name: c.name,
    kind: c.kind,
    campaign: bundle.campaign.title,
    source_material: JSON.stringify(provenance),
    comic_premise: c.flavor,
    tags: c.tags.join(", "),
    rules: c.rules,
    mechanics: JSON.stringify(mechanics),
    ...c.art,
    motifs: c.art.motifs.join(", "),
    palette: c.art.palette.join(", "),
    composition:
      c.art.composition ??
      "One focal subject, a clear silhouette, and quiet space at the edges",
  };
  return {
    schemaVersion: 2,
    cardId: c.id,
    name: c.name,
    kind: c.kind,
    contentVersion: bundle.version,
    inputs: {
      campaign: bundle.campaign.title,
      approvedFlavor: c.flavor,
      sources: provenance,
      immutableMechanics: mechanics,
      art: c.art,
    },
    flavor: { template: "flavor.v2", prompt: fill(flavor, inputs) },
    visual: {
      template: "visual.v2",
      prompt: fill(visual, inputs),
      cleanTemplate: "visual-clean.v1",
      cleanPrompt: fill(clean, inputs),
      negativePrompt:
        "text, lettering, numbers, captions, logos, watermarks, card frame, rules box, user interface",
      aspectRatio: "4:3",
      styleStatus: "provisional",
    },
    status: "prompt_only",
  };
});
const destination = new URL("../content/prompt-packets/", import.meta.url);
mkdirSync(new URL("monsters/", destination), { recursive: true });
writeFileSync(
  new URL("launch.json", destination),
  JSON.stringify(packets, null, 2) + "\n",
);
const monsters = packets.filter((p) => p.kind === "monster");
for (const packet of monsters) {
  writeFileSync(
    new URL(`monsters/${packet.cardId}.brief.json`, destination),
    JSON.stringify(packet, null, 2) + "\n",
  );
  writeFileSync(
    new URL(`monsters/${packet.cardId}.art.txt`, destination),
    packet.visual.cleanPrompt + "\n",
  );
}
writeFileSync(
  new URL("monsters/index.json", destination),
  JSON.stringify(
    monsters.map((p) => ({
      cardId: p.cardId,
      name: p.name,
      fullBrief: `${p.cardId}.brief.json`,
      cleanPrompt: `${p.cardId}.art.txt`,
    })),
    null,
    2,
  ) + "\n",
);
console.log(
  `Exported ${packets.length} flavor prompts, ${packets.length} full art prompts, ${packets.length} clean art prompts, and ${monsters.length} monster file pairs.`,
);
