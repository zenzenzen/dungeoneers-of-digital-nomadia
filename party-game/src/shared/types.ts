export const currencies = [
  "cash_cp",
  "btc",
  "exposure",
  "therapy_healedness",
  "social_capital",
  "temp_chill",
] as const;
export type Currency = (typeof currencies)[number];
// BTC balances are integer satoshis; presentation converts to BTC. No exchange rates.
export type Wallet = Record<Currency, number>;
export type CardKind =
  "class" | "trait" | "monster" | "event" | "action" | "equipment" | "finale";
export type Effect =
  | { kind: "power"; amount: number; tags?: string[] }
  | { kind: "combat"; amount: number; side: "party" | "encounter" }
  | { kind: "chill"; amount: number }
  | { kind: "resource"; currency: Currency; amount: number }
  | { kind: "draw"; amount: number }
  | { kind: "class_swap" }
  | { kind: "escape" }
  | { kind: "cleanse" }
  | { kind: "shield" };
export interface SourceRef {
  path: string;
  sha256: string;
  row?: number;
  heading?: string;
}
export interface SourceAsset {
  id: string;
  name: string;
  family: string;
  assetType: string;
  sourceRefs: SourceRef[];
  variants: { sourceRef: SourceRef; text: string }[];
  originalJokes: string[];
  tags: string[];
  campaigns: string[];
  comicPremise: string;
  visualMotifs: string[];
  adaptationStatus: "candidate" | "reference";
  classificationStatus: "inferred";
  candidates: {
    id: string;
    type: "class" | "trait";
    name: string;
    field: string;
  }[];
  relatedIds: string[];
}
export interface CardDefinition {
  id: string;
  kind: CardKind;
  name: string;
  flavor: string;
  rules: string;
  tags: string[];
  effects: Effect[];
  sources: string[];
  authorship: "adapted" | "new";
  quantity: number;
  strength?: number;
  tier?: number;
  setback?: number;
  rewards?: Partial<Wallet>;
  loot?: number;
  price?: { currency: Currency; amount: number };
  ending?: string;
  art: {
    subject: string;
    action: string;
    setting: string;
    joke: string;
    motifs: string[];
    palette: string[];
    composition?: string;
  };
}
export interface CampaignDefinition {
  id: string;
  title: string;
  description: string;
  version: string;
  pools: Record<CardKind, string[]>;
  difficulty?: { minLevel: number; tier: number }[];
  rules: {
    negotiationMs?: number;
    turnDraw?: number;
    selfCareDraw?: number;
    socialCapitalFloor?: number;
    protectionCost?: number;
    minPlayers: number;
    maxPlayers: number | null;
    startChill: number;
    maxChill: number;
    startLevel: number;
    finaleLevel: number;
    maxRounds: number;
    traitSlots: number;
    equipmentSlots: number;
    handLimit: number;
    startingTraits: number;
    startingHand: number;
    turnMs: number;
    interventionMs: number;
    recoveryChill: number;
    escapeTarget: number;
    startingWallet: Wallet;
    therapyHeal: number;
    therapyPrice: number;
    selfCareHeal: number;
    marketSize: number;
  };
  endings: { failed: string[] };
}
export interface ContentBundle {
  version: string;
  cards: CardDefinition[];
  campaign: CampaignDefinition;
}
export interface CardInstance {
  instanceId: string;
  cardId: string;
}
export interface Player {
  id: string;
  name: string;
  connected: boolean;
  level: number;
  chill: number;
  triggered: boolean;
  wallet: Wallet;
  classCard: CardInstance | null;
  traits: CardInstance[];
  equipment: CardInstance[];
  hand: CardInstance[];
  pendingTrait: CardInstance | null;
  discoveries: string[];
  ending?: string;
}
export interface Deck {
  draw: CardInstance[];
  discard: CardInstance[];
}
export interface Deal {
  id: string;
  helperId: string;
  currency: Currency;
  amount: number;
  loot: number;
}
export interface Encounter {
  card: CardInstance;
  helperId: string | null;
  offer: Deal | null;
  deal: Deal | null;
  partyBonus: number;
  encounterBonus: number;
  intervened: string[];
  passed: string[];
  shields: string[];
  logs: string[];
  adjustments: {
    source: string;
    amount: number;
    side: "party" | "encounter";
  }[];
}
export type Phase =
  "lobby" | "prepare" | "negotiate" | "intervene" | "cleanup" | "finished";
export interface GameState {
  id: string;
  code: string;
  hostId: string;
  revision: number;
  contentVersion: string;
  players: Player[];
  phase: Phase;
  turnIndex: number;
  round: number;
  run: number;
  rng: number;
  instanceSequence: number;
  decks: Record<string, Deck>;
  market: CardInstance[];
  encounter: Encounter | null;
  deadline: number | null;
  turnDeadline: number | null;
  paused: boolean;
  pausedAt: number | null;
  winnerId: string | null;
  log: string[];
  boughtThisTurn: boolean;
  recoveredThisTurn: boolean;
  createdAt: number;
  updatedAt: number;
}
export type Command =
  | { type: "start" }
  | { type: "reveal" }
  | { type: "finale"; cardId: string }
  | { type: "self_care" }
  | { type: "therapy" }
  | { type: "buy"; instanceId: string; replaceId?: string }
  | {
      type: "offer";
      helperId: string;
      currency: Currency;
      amount: number;
      loot: number;
    }
  | { type: "accept"; offerId: string }
  | { type: "decline" }
  | { type: "ready" }
  | { type: "play"; instanceId: string; targetId?: string }
  | { type: "pass" }
  | { type: "protect" }
  | { type: "resolve" }
  | { type: "escape" }
  | { type: "choose_trait"; replaceId?: string; discard?: boolean }
  | { type: "discard"; instanceId: string }
  | { type: "end_turn" }
  | { type: "rematch" }
  | { type: "kick"; playerId: string };
export interface Envelope {
  commandId: string;
  expectedRevision: number;
  command: Command;
}
export interface Modifier {
  source: string;
  amount: number;
}
export interface CombatView {
  party: number;
  encounter: number;
  modifiers: Record<string, Modifier[]>;
}
export type PublicPlayer = Omit<
  Player,
  "hand" | "pendingTrait" | "discoveries"
> & {
  handCount: number;
  hand?: CardInstance[];
  pendingTrait?: CardInstance | null;
};
export interface Snapshot {
  id: string;
  code: string;
  hostId: string;
  revision: number;
  contentVersion: string;
  selfId: string;
  players: PublicPlayer[];
  phase: Phase;
  turnIndex: number;
  round: number;
  run: number;
  market: CardInstance[];
  encounter: Encounter | null;
  deadline: number | null;
  paused: boolean;
  winnerId: string | null;
  log: string[];
  combat: CombatView | null;
  discoveries: string[];
  legalActions: string[];
  serverTime: number;
  boughtThisTurn: boolean;
  recoveredThisTurn: boolean;
}
export interface Ack {
  ok: boolean;
  code?: string;
  message?: string;
  revision?: number;
  duplicate?: boolean;
}
