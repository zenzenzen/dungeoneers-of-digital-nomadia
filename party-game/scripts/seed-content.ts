import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import type {
  CardDefinition,
  CardKind,
  Effect,
  SourceAsset,
  ContentBundle,
} from "../src/shared/types";

const catalogue = JSON.parse(
  readFileSync(new URL("../content/catalogue.json", import.meta.url), "utf8"),
) as { assets: SourceAsset[] };
const normalize = (s: string) =>
  s
    .toLowerCase()
    .replace(/^the /, "")
    .replace(/[^a-z0-9]/g, "");
const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
const source = (family: string, name: string) => {
  const matches = catalogue.assets.filter(
    (a) =>
      a.family === family &&
      a.assetType === "record" &&
      normalize(a.name) === normalize(name),
  );
  if (!matches.length) throw new Error(`Missing source: ${family}/${name}`);
  return matches[0].id;
};
const monsterArt = JSON.parse(
  readFileSync(
    new URL("../content/art-direction/monsters.v1.json", import.meta.url),
    "utf8",
  ),
).monsters as Record<string, Partial<CardDefinition["art"]>>;
const cards: CardDefinition[] = [];
function add(
  kind: CardKind,
  name: string,
  flavor: string,
  rules: string,
  tags: string[],
  effects: Effect[],
  family?: string,
  sourceName = name,
  extra: Partial<CardDefinition> = {},
) {
  const id = `${kind}_${slug(name)}`;
  cards.push({
    id,
    kind,
    name,
    flavor,
    rules,
    tags,
    effects,
    sources: family ? [source(family, sourceName)] : [],
    authorship: family ? "adapted" : "new",
    quantity: kind === "class" || kind === "finale" ? 1 : 3,
    art: {
      subject: name,
      action: flavor,
      setting: "A rooftop dating mixer in Digital Nomadia",
      joke: flavor,
      motifs: tags,
      palette: ["mint", "lavender", "peach", "cyan", "cream"],
      composition:
        "One focal subject with a clear silhouette, foreground/background separation, and quiet space around the edges",
      ...(monsterArt[id] ?? {}),
    },
    ...extra,
  });
}
const power = (amount: number, ...tags: string[]): Effect => ({
  kind: "power",
  amount,
  ...(tags.length ? { tags } : {}),
});
const combat = (
  amount: number,
  side: "party" | "encounter" = "party",
): Effect => ({ kind: "combat", amount, side });

const classes = [
  [
    "Digital Nomad",
    "travel",
    "office",
    "Home is where the WiFi connects automatically.",
  ],
  [
    "Influencer",
    "status",
    "boundaries",
    "The connection is authentic. The lighting is sponsored.",
  ],
  [
    "Crypto Bro",
    "money",
    "wellness",
    "Looking for someone to hold through the bear market.",
  ],
  [
    "Yoga Teacher",
    "wellness",
    "tech",
    "Very flexible. Except about your attachment style.",
  ],
  [
    "Life Coach",
    "boundaries",
    "money",
    "You are not single. You are pre-partnered.",
  ],
  [
    "Startup Founder",
    "tech",
    "first_impressions",
    "Our relationship is still in stealth.",
  ],
  [
    "Burnout Survivor",
    "office",
    "nightlife",
    "My five-year plan is a nap with benefits.",
  ],
  ["Reply Guy", "awkward", "boundaries", "Already typing. Nobody asked."],
];
for (const [name, good, bad, flavor] of classes)
  add(
    "class",
    name,
    flavor,
    `+1 strength. +2 against ${good.replaceAll("_", " ")}; −1 against ${bad.replaceAll("_", " ")}.`,
    [good, bad],
    [power(1), power(2, good), power(-1, bad)],
    "classes",
  );

const traits = [
  [
    "Genetically Blessed Height",
    "first_impressions",
    "travel",
    "The profile says 183. The doorframe has questions.",
  ],
  [
    "Clean Freak",
    "wellness",
    "nightlife",
    "Your love language is a freshly disinfected surface.",
  ],
  [
    "Super Well Traveled",
    "travel",
    "boundaries",
    "Thirty countries. One story. Repeated.",
  ],
  [
    "Hot Athletic Body",
    "first_impressions",
    "office",
    "Emotionally unavailable. Physically in excellent condition.",
  ],
  [
    "Connoisseur of Fine Things",
    "status",
    "money",
    "Can identify the vintage of a financial mistake.",
  ],
  [
    "Big Bank Account",
    "money",
    "boundaries",
    "It cannot buy love. It can reserve the rooftop.",
  ],
  [
    "Coffee Shop Warrior",
    "office",
    "nightlife",
    "Holds a table better than a conversation.",
  ],
  [
    "Digital Detox Believer",
    "wellness",
    "tech",
    "Please validate my offline journey online.",
  ],
  [
    "Perpetual Networker",
    "status",
    "boundaries",
    "Was this a date or a discovery call?",
  ],
  [
    "Yoga Instructor Certificate",
    "wellness",
    "money",
    "Two hundred hours of training. Infinite unsolicited advice.",
  ],
  [
    "Minimalist (Owns MacBook Pro)",
    "tech",
    "status",
    "Everything I own fits in one very expensive bag.",
  ],
  [
    "Polyglot Pretender",
    "travel",
    "first_impressions",
    "Fluent in ordering beer and changing the subject.",
  ],
  [
    "Actual Polyglot",
    "travel",
    "awkward",
    "Can misunderstand mixed signals in seven languages.",
  ],
  [
    "Never Lost",
    "travel",
    "boundaries",
    "I know exactly where this is going. Allegedly.",
  ],
  [
    "Obsessed Food & Drink Knower",
    "nightlife",
    "office",
    "A tasting note has become a hostage situation.",
  ],
  [
    "Blogger Vlogger",
    "status",
    "first_impressions",
    "Could you do that vulnerable moment again?",
  ],
  [
    "Chronic Oversharer",
    "awkward",
    "first_impressions",
    "The icebreaker came with a family medical history.",
  ],
  [
    "Extreme Cheapskate",
    "money",
    "nightlife",
    "Split the bill, including emotional labor.",
  ],
  [
    "Trust Fund Kid",
    "money",
    "office",
    "Self-made, with a small loan from the group chat.",
  ],
  [
    "Burned Out Ex-Corporate",
    "office",
    "status",
    "Available immediately. Enthusiasm negotiable.",
  ],
  [
    "Spiritual Bypass Master",
    "wellness",
    "boundaries",
    "It is not avoidance. It is a higher vibration.",
  ],
  [
    "No Boundaries",
    "nightlife",
    "boundaries",
    "A plus-one to your entire life.",
  ],
  [
    "Perpetually Jetlagged",
    "travel",
    "tech",
    "Emotionally in yesterday. Physically at this bar.",
  ],
  [
    "Living Off Savings",
    "money",
    "status",
    "Financial independence, with a countdown.",
  ],
];
for (const [name, good, bad, flavor] of traits)
  add(
    "trait",
    name,
    flavor,
    `+2 against ${good.replaceAll("_", " ")}; −1 against ${bad.replaceAll("_", " ")}.`,
    [good, bad],
    [power(2, good), power(-1, bad)],
    "feats",
  );

const monsters: [string, string, string, string?, string?][] = [
  [
    "The Ghoster",
    "boundaries",
    "Last seen: emotionally unavailable.",
    "monsters",
  ],
  [
    "The Mansplainer",
    "tech",
    "Actually, the correct way to enjoy this date is—",
    "monsters",
  ],
  [
    "The One-Upper",
    "travel",
    "You went to Bali? They discovered it.",
    "monsters",
  ],
  [
    "The Pick-Me",
    "first_impressions",
    "Not like other people. In precisely the usual way.",
    "monsters",
  ],
  [
    "The Clout Chaser",
    "status",
    "Looking for a meaningful connection with your followers.",
    "monsters",
  ],
  [
    "The Minor Red Flag",
    "awkward",
    "A little concerning. Excellent hair, though.",
    "monsters",
  ],
  [
    "The Situationship",
    "boundaries",
    "A relationship with a free trial and no cancellation button.",
    "monsters",
  ],
  [
    "The Trauma Dumper",
    "wellness",
    "The appetizer arrived midway through the origin story.",
    "monsters",
  ],
  [
    "The Energy Vampire",
    "office",
    "An intimate dinner for two. One of you leaves with the energy.",
    "monsters",
  ],
  [
    "The Nice Guy",
    "first_impressions",
    "Has a receipt for every basic act of decency.",
    "monsters",
  ],
  [
    "The Crypto Bro",
    "money",
    "The spark is real. The returns are hypothetical.",
    "monsters",
  ],
  [
    "The Influencer Boyfriend",
    "status",
    "An unpaid internship with occasional hand-holding.",
    "monsters",
  ],
  [
    "The Algorithm’s Favorite",
    "tech",
    "Everyone matched. Somehow nobody connected.",
  ],
  [
    "The Ex in the Group Chat",
    "boundaries",
    "Typing… since three relationships ago.",
  ],
  [
    "The Soft-Launch Detective",
    "status",
    "Enhance the reflection in the wine glass.",
  ],
  [
    "The Bill-Splitting Tribunal",
    "money",
    "Six cocktails. Seven conflicting theories of fairness.",
  ],
  [
    "The Attachment Style Podcast",
    "wellness",
    "A forty-minute answer to “How was your day?”",
  ],
  [
    "The Last-Call Love Bomber",
    "nightlife",
    "Already planning your destination wedding. Cannot recall your name.",
  ],
];
monsters.forEach(([name, tag, flavor, family], i) => {
  const tier = Math.floor(i / 6) + 1,
    strength = 2 + tier * 2 + (i % 3);
  add(
    "monster",
    name,
    flavor,
    `Beat strength ${strength}: gain 1 level, ${tier * 50} cash and 1 loot. Failed escape: lose ${tier === 3 ? 3 : 2} Chill.`,
    [tag, ...(i % 2 ? ["awkward"] : ["first_impressions"])],
    [],
    family,
    name,
    {
      strength,
      tier,
      setback: tier === 3 ? 3 : 2,
      rewards: { cash_cp: tier * 50, ...(i % 3 === 0 ? { exposure: 1 } : {}) },
      loot: 1,
    },
  );
});
const events: [string, string, string, Effect[]][] = [
  [
    "The Icebreaker Circle",
    "awkward",
    "Your fun fact is now legally binding.",
    [{ kind: "draw", amount: 2 }],
  ],
  [
    "Paid in Exposure",
    "status",
    "Your rent is unfortunately not an influencer.",
    [{ kind: "resource", currency: "exposure", amount: 2 }],
  ],
  [
    "Complimentary Therapy",
    "wellness",
    "The bartender has heard worse.",
    [{ kind: "resource", currency: "therapy_healedness", amount: 1 }],
  ],
  [
    "The Open Bar",
    "nightlife",
    "Confidence, temporarily on the house.",
    [{ kind: "resource", currency: "temp_chill", amount: 2 }],
  ],
  [
    "Found a Wallet",
    "money",
    "The universe provides. In modest denominations.",
    [{ kind: "resource", currency: "cash_cp", amount: 100 }],
  ],
  [
    "The Group Chat Vouches",
    "boundaries",
    "References available upon romantic request.",
    [{ kind: "resource", currency: "social_capital", amount: 1 }],
  ],
  [
    "A Very Small Airdrop",
    "tech",
    "You are now an investor in a coin named after a vegetable.",
    [{ kind: "resource", currency: "btc", amount: 1000 }],
  ],
  [
    "Unsolicited Feedback",
    "first_impressions",
    "“You look different in person.” So does their personality.",
    [
      { kind: "chill", amount: -1 },
      { kind: "draw", amount: 1 },
    ],
  ],
];
for (const [name, tag, flavor, effects] of events)
  add(
    "event",
    name,
    flavor,
    effects
      .map((e) =>
        e.kind === "draw"
          ? `Draw ${e.amount} action cards.`
          : e.kind === "chill"
            ? `Lose ${-e.amount} Chill.`
            : e.kind === "resource"
              ? `Gain ${e.amount} ${e.currency === "btc" ? "satoshis" : e.currency.replaceAll("_", " ")}.`
              : "",
      )
      .join(" "),
    [tag],
    effects,
  );

const actions: [string, string, string, Effect[], string?][] = [
  [
    "Perfect Small Talk",
    "A conversation with absolutely no nutritional value.",
    "Party +3 strength.",
    [combat(3)],
    "spells",
  ],
  [
    "Where Are You From",
    "Turns harmless curiosity into a data product with eye contact.",
    "Party +2 strength.",
    [combat(2)],
    "spells",
  ],
  [
    "Super Like",
    "A small payment for a large expectation.",
    "Party +4 strength.",
    [combat(4)],
    "spells",
  ],
  [
    "The Irish Exit",
    "No goodbye. No notes. No further questions.",
    "Active player escapes immediately without rewards or setbacks.",
    [{ kind: "escape" }],
    "spells",
  ],
  [
    "Screenshot",
    "The cloud remembers what the heart forgives.",
    "Encounter +3 strength.",
    [combat(3, "encounter")],
    "spells",
  ],
  [
    "Ratio",
    "The group chat has reached a verdict.",
    "Encounter +2 strength.",
    [combat(2, "encounter")],
    "spells",
  ],
  [
    "Gaslight",
    "That is not what the notification said.",
    "Party −2 strength.",
    [combat(-2)],
    "spells",
  ],
  [
    "Safe Space",
    "A brief ceasefire in the discourse.",
    "Active player regains 2 Chill.",
    [{ kind: "chill", amount: 2 }],
    "spells",
  ],
  [
    "Block User",
    "Your peace has a privacy setting.",
    "Cancel the next hostile intervention this encounter.",
    [{ kind: "shield" }],
    "spells",
  ],
  [
    "Mansplain Shield",
    "We have already read the documentation.",
    "Remove negative party strength modifiers this encounter.",
    [{ kind: "cleanse" }],
    "spells",
  ],
  [
    "Change The Subject",
    "Anyway. Have you tried the food?",
    "Party +2 strength.",
    [combat(2)],
    "spells",
  ],
  [
    "Humble Brag Beam",
    "I am so humbled by how impressive I am.",
    "Party +3 strength.",
    [combat(3)],
    "spells",
  ],
  [
    "Double Text Defense",
    "Following up on my previous emotional investment.",
    "Party +2 strength.",
    [combat(2)],
    "spells",
  ],
  [
    "The Slow Fade",
    "One fewer exclamation mark, every day.",
    "Encounter +4 strength.",
    [combat(4, "encounter")],
    "spells",
  ],
  [
    "Read Receipts Off",
    "Schrödinger’s interest.",
    "Gain 2 temporary Chill.",
    [{ kind: "resource", currency: "temp_chill", amount: 2 }],
    "spells",
  ],
  [
    "Collaboration Request",
    "Can you help? The budget is friendship.",
    "Gain 1 social capital and party +1 strength.",
    [{ kind: "resource", currency: "social_capital", amount: 1 }, combat(1)],
    "spells",
  ],
  [
    "Personal Rebrand",
    "Same problems. New bio.",
    "Replace your own class with a random class card.",
    [{ kind: "class_swap" }],
  ],
  [
    "A Friend Has Receipts",
    "Nobody asked for the annotated timeline.",
    "Encounter +5 strength.",
    [combat(5, "encounter")],
  ],
  [
    "Emergency Hype Friend",
    "They have never been more confident in your questionable decisions.",
    "Party +5 strength.",
    [combat(5)],
  ],
  [
    "Pocket Pep Talk",
    "You are somebody’s very specific type.",
    "Active player regains 1 Chill; party +1 strength.",
    [{ kind: "chill", amount: 1 }, combat(1)],
  ],
];
for (const [name, flavor, rules, effects, family] of actions)
  add("action", name, flavor, rules, ["social"], effects, family);

const gear: [string, string, string, number, number, string?][] = [
  [
    "Noise Cancelling Headphones of Isolation",
    "awkward",
    "Blocks out the haters. Occasionally also your date.",
    1,
    150,
    "equipment",
  ],
  [
    "Hoodie of Anonymity",
    "boundaries",
    "Soft-launch your entire personality.",
    1,
    100,
    "equipment",
  ],
  [
    "Ring Light of Plausible Chemistry",
    "status",
    "The spark has three color temperatures.",
    2,
    200,
  ],
  [
    "Emergency Breath Mints",
    "first_impressions",
    "A small investment in not being remembered wrong.",
    1,
    50,
  ],
  [
    "Power Bank of Emotional Availability",
    "tech",
    "Finally, someone with enough capacity.",
    1,
    100,
  ],
  [
    "Perfectly Casual Linen Shirt",
    "nightlife",
    "This effortless look took forty minutes.",
    2,
    200,
  ],
  [
    "Conversation Starter Tote",
    "travel",
    "Ask me about the thing I already want to tell you.",
    1,
    100,
  ],
  [
    "Therapy Journal (Mostly Blank)",
    "wellness",
    "The intention is doing a lot of work.",
    1,
    100,
  ],
  [
    "Verified Profile Badge",
    "status",
    "This disaster has been authenticated.",
    2,
    2,
  ],
  [
    "Hardware Wallet of Red Flags",
    "money",
    "Cold storage. Warm delusions.",
    2,
    1000,
  ],
];
gear.forEach(([name, tag, flavor, amount, price, family], i) =>
  add(
    "equipment",
    name,
    flavor,
    `+${amount} strength; another +1 against ${tag.replaceAll("_", " ")}.`,
    [tag],
    [power(amount), power(1, tag)],
    family,
    name,
    {
      price: {
        currency: i === 8 ? "exposure" : i === 9 ? "btc" : "cash_cp",
        amount: price,
      },
    },
  ),
);
for (const [name, tag, flavor, ending] of [
  [
    "Define the Relationship",
    "boundaries",
    "Four words. Several incompatible definitions.",
    "You made plans that both of you intend to keep. Suspiciously healthy.",
  ],
  [
    "Meet the Group Chat",
    "status",
    "The final interview has seven panelists and a shared album.",
    "The group chat approves. Your partner even texts back.",
  ],
  [
    "The “Not Looking for Anything Serious” Final Boss",
    "first_impressions",
    "A six-month situationship wearing a boss health bar.",
    "You found someone who means what they say. The algorithm is furious.",
  ],
])
  add(
    "finale",
    name,
    flavor,
    "Level 5 required. Beat strength 13 to achieve romance and win.",
    [tag, "awkward"],
    [],
    undefined,
    name,
    { strength: 13, setback: 3, loot: 2, rewards: { cash_cp: 100 }, ending },
  );

const pools = Object.fromEntries(
  ["class", "trait", "monster", "event", "action", "equipment", "finale"].map(
    (k) => [k, cards.filter((c) => c.kind === k).map((c) => c.id)],
  ),
) as ContentBundle["campaign"]["pools"];
const campaign: ContentBundle["campaign"] = {
  id: "swipe_right_regret_later",
  title: "Swipe Right, Regret Later",
  description:
    "A rooftop mixer. A room full of red flags. Your deeply questionable shot at romance.",
  version: "1.1.0",
  pools,
  difficulty: [
    { minLevel: 1, tier: 1 },
    { minLevel: 3, tier: 2 },
    { minLevel: 5, tier: 3 },
  ],
  rules: {
    negotiationMs: 25_000,
    turnDraw: 1,
    selfCareDraw: 1,
    socialCapitalFloor: 1,
    protectionCost: 1,
    minPlayers: 1,
    maxPlayers: null,
    startChill: 6,
    maxChill: 6,
    startLevel: 1,
    finaleLevel: 5,
    maxRounds: 8,
    traitSlots: 3,
    equipmentSlots: 2,
    handLimit: 5,
    startingTraits: 2,
    startingHand: 3,
    turnMs: 90_000,
    interventionMs: 20_000,
    recoveryChill: 4,
    escapeTarget: 5,
    startingWallet: {
      cash_cp: 100,
      btc: 0,
      exposure: 0,
      therapy_healedness: 0,
      social_capital: 1,
      temp_chill: 0,
    },
    therapyHeal: 3,
    therapyPrice: 50,
    selfCareHeal: 3,
    marketSize: 3,
  },
  endings: {
    failed: [
      "You left with a story, a coupon, and most of your dignity.",
      "You matched with yourself. Finally, someone who understands your schedule.",
      "The real romance was the friends you mildly sabotaged along the way.",
    ],
  },
};
const version = createHash("sha256")
  .update(JSON.stringify({ cards, campaign }))
  .digest("hex")
  .slice(0, 16);
writeFileSync(
  new URL("../content/launch.json", import.meta.url),
  JSON.stringify({ version, cards, campaign }, null, 2) + "\n",
);
console.log(`Authored ${cards.length} cards; content ${version}`);
