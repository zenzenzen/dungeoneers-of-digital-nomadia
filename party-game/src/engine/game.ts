import type {
  CardDefinition,
  CardInstance,
  Command,
  ContentBundle,
  GameState,
  Player,
  Snapshot,
  CombatView,
  Wallet,
  Currency,
  Modifier,
} from "../shared/types";

export class RuleError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
  }
}
function need(yes: unknown, code: string, message: string): asserts yes {
  if (!yes) throw new RuleError(code, message);
}
const active = (s: GameState) => s.players[s.turnIndex];
export const card = (b: ContentBundle, id: string): CardDefinition => {
  const c = b.cards.find((x) => x.id === id);
  if (!c) throw new Error(`Unknown card ${id}`);
  return c;
};
export const player = (s: GameState, id: string) => {
  const p = s.players.find((x) => x.id === id);
  if (!p)
    throw new RuleError("NOT_SEATED", "Your seat is no longer in this room.");
  return p;
};
function log(s: GameState, text: string) {
  s.log.push(text);
  s.log = s.log.slice(-60);
}
export function random(s: GameState) {
  let x = s.rng | 0;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  s.rng = x >>> 0;
  return s.rng / 4294967296;
}
function shuffle<T>(s: GameState, items: T[]) {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(random(s) * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}
function instance(s: GameState, id: string): CardInstance {
  return { instanceId: `${s.run}:${++s.instanceSequence}`, cardId: id };
}
function putDeck(
  s: GameState,
  b: ContentBundle,
  key: string,
  ids: string[],
  minimum = 0,
) {
  const baseSize = ids.reduce((n, id) => n + card(b, id).quantity, 0);
  need(baseSize > 0, "EMPTY_POOL", `No cards configured for ${key}.`);
  const copies = Math.max(1, Math.ceil(minimum / baseSize));
  s.decks[key] = {
    draw: shuffle(
      s,
      ids.flatMap((id) =>
        Array.from({ length: card(b, id).quantity * copies }, () =>
          instance(s, id),
        ),
      ),
    ),
    discard: [],
  };
}
export function draw(s: GameState, key: string): CardInstance | null {
  const d = s.decks[key];
  if (!d) return null;
  if (!d.draw.length) {
    d.draw = shuffle(s, d.discard.splice(0));
  }
  return d.draw.pop() ?? null;
}
// Defaults preserve rooms pinned to the first launch bundle. New campaigns
// declare these values explicitly in their content.
const difficulty = (b: ContentBundle) =>
  b.campaign.difficulty ?? [
    { minLevel: 1, tier: 1 },
    { minLevel: 3, tier: 2 },
    { minLevel: 5, tier: 3 },
  ];
function encounterTier(b: ContentBundle, level: number) {
  return difficulty(b)
    .filter((d) => level >= d.minLevel)
    .at(-1)!.tier;
}
function discard(s: GameState, b: ContentBundle, c: CardInstance) {
  const def = card(b, c.cardId);
  const key =
    def.kind === "monster"
      ? `encounter${def.tier}`
      : def.kind === "event"
        ? `encounter${encounterTier(b, active(s).level)}`
        : def.kind;
  if (s.decks[key]) s.decks[key].discard.push(c);
}
function discover(p: Player, id: string) {
  if (!p.discoveries.includes(id)) p.discoveries.push(id);
}
function giveActions(s: GameState, p: Player, count: number) {
  for (let i = 0; i < count; i++) {
    const c = draw(s, "action");
    if (c) {
      p.hand.push(c);
      discover(p, c.cardId);
    }
  }
}
function gain(p: Player, amounts: Partial<Wallet>) {
  for (const [k, v] of Object.entries(amounts))
    p.wallet[k as Currency] = Math.max(
      0,
      Math.min(1e12, p.wallet[k as Currency] + v),
    );
}
function chill(s: GameState, b: ContentBundle, p: Player, amount: number) {
  if (amount < 0) {
    const blocked = Math.min(p.wallet.temp_chill, -amount);
    p.wallet.temp_chill -= blocked;
    amount += blocked;
  }
  p.chill = Math.max(0, Math.min(b.campaign.rules.maxChill, p.chill + amount));
  if (p.chill === 0 && !p.triggered) {
    p.triggered = true;
    if (p.hand.length) {
      const c = p.hand.splice(Math.floor(random(s) * p.hand.length), 1)[0];
      discard(s, b, c);
    }
    log(s, `${p.name} is Triggered. A quiet recovery awaits their next turn.`);
  }
}
function prepare(s: GameState, b: ContentBundle, now: number, drawCard = true) {
  s.phase = "prepare";
  s.encounter = null;
  s.boughtThisTurn = false;
  s.recoveredThisTurn = false;
  s.deadline = s.turnDeadline = now + b.campaign.rules.turnMs;
  const p = active(s);
  if (p.triggered) {
    p.triggered = false;
    p.chill = b.campaign.rules.recoveryChill;
    log(s, `${p.name} returns with ${p.chill} Chill.`);
  }
  p.wallet.social_capital = Math.max(
    b.campaign.rules.socialCapitalFloor ?? 1,
    p.wallet.social_capital,
  );
  if (drawCard) giveActions(s, p, b.campaign.rules.turnDraw ?? 1);
  log(s, `${p.name}'s turn. Round ${s.round}.`);
}
export function emptyRoom(
  id: string,
  code: string,
  hostId: string,
  version: string,
  now: number,
  seed: number,
): GameState {
  return {
    id,
    code,
    hostId,
    contentVersion: version,
    revision: 0,
    players: [],
    phase: "lobby",
    turnIndex: 0,
    round: 0,
    run: 0,
    rng: seed || 0x9e3779b9,
    instanceSequence: 0,
    decks: {},
    market: [],
    encounter: null,
    deadline: null,
    turnDeadline: null,
    paused: false,
    pausedAt: null,
    winnerId: null,
    log: [],
    boughtThisTurn: false,
    recoveredThisTurn: false,
    createdAt: now,
    updatedAt: now,
  };
}
export function addPlayer(
  state: GameState,
  b: ContentBundle,
  id: string,
  name: string,
  now: number,
): GameState {
  const s = structuredClone(state);
  need(
    s.phase === "lobby",
    "ALREADY_STARTED",
    "Only the lobby accepts new players.",
  );
  need(
    b.campaign.rules.maxPlayers === null ||
      s.players.length < b.campaign.rules.maxPlayers,
    "ROOM_FULL",
    "This room is full.",
  );
  need(
    !s.players.some((p) => p.name.toLowerCase() === name.toLowerCase()),
    "NAME_TAKEN",
    "Choose a different nickname.",
  );
  s.players.push({
    id,
    name,
    connected: false,
    level: b.campaign.rules.startLevel,
    chill: b.campaign.rules.startChill,
    triggered: false,
    wallet: { ...b.campaign.rules.startingWallet },
    classCard: null,
    traits: [],
    equipment: [],
    hand: [],
    pendingTrait: null,
    discoveries: [],
  });
  s.revision++;
  s.updatedAt = now;
  return s;
}
function start(s: GameState, b: ContentBundle, now: number) {
  const r = b.campaign.rules;
  need(
    s.players.length >= r.minPlayers && s.players.every((p) => p.connected),
    "PLAYERS_NEEDED",
    `Connect every seated player before starting (minimum ${r.minPlayers}).`,
  );
  s.run++;
  s.instanceSequence = 0;
  s.round = 1;
  s.turnIndex = 0;
  s.winnerId = null;
  s.decks = {};
  s.log = [];
  s.paused = false;
  s.pausedAt = null;
  const seats = s.players.length;
  const capacity = {
    class: seats + 1,
    trait: seats * (r.traitSlots + 1),
    action: seats * (r.handLimit + 1),
    equipment: seats * r.equipmentSlots + r.marketSize,
    finale: 0,
  };
  for (const kind of [
    "class",
    "trait",
    "action",
    "equipment",
    "finale",
  ] as const)
    putDeck(s, b, kind, b.campaign.pools[kind], capacity[kind]);
  for (const tier of new Set(difficulty(b).map((d) => d.tier)))
    putDeck(s, b, `encounter${tier}`, [
      ...b.campaign.pools.monster.filter((id) => card(b, id).tier === tier),
      ...b.campaign.pools.event,
    ]);
  for (const p of s.players) {
    Object.assign(p, {
      level: r.startLevel,
      chill: r.startChill,
      triggered: false,
      wallet: { ...r.startingWallet },
      traits: [],
      equipment: [],
      hand: [],
      pendingTrait: null,
      ending: undefined,
    });
    p.classCard = draw(s, "class");
    if (p.classCard) discover(p, p.classCard.cardId);
    for (let i = 0; i < r.startingTraits; i++) {
      const c = uniqueTrait(s, p);
      if (c) {
        p.traits.push(c);
        discover(p, c.cardId);
      }
    }
    const gear = draw(s, "equipment");
    if (gear) {
      p.equipment.push(gear);
      discover(p, gear.cardId);
    }
    giveActions(s, p, r.startingHand);
  }
  s.market = Array.from({ length: r.marketSize }, () =>
    draw(s, "equipment"),
  ).filter((x): x is CardInstance => x !== null);
  // Setup already grants a full starting hand; the normal turn draw begins next turn.
  prepare(s, b, now, false);
}
function uniqueTrait(s: GameState, p: Player): CardInstance | null {
  const d = s.decks.trait;
  const total = d.draw.length + d.discard.length;
  for (let n = 0; n < total; n++) {
    const c = draw(s, "trait");
    if (!c) return null;
    if (!p.traits.some((t) => t.cardId === c.cardId)) return c;
    d.discard.push(c);
  }
  return null;
}
export function strength(
  s: GameState,
  b: ContentBundle,
  p: Player,
  tags: string[],
): Modifier[] {
  const result: Modifier[] = [{ source: "Level", amount: p.level }];
  for (const c of [p.classCard, ...p.traits, ...p.equipment])
    if (c) {
      const def = card(b, c.cardId);
      for (const e of def.effects) {
        if (
          e.kind === "power" &&
          (!e.tags || e.tags.some((t) => tags.includes(t)))
        )
          result.push({ source: def.name, amount: e.amount });
      }
    }
  return result;
}
export function combatView(s: GameState, b: ContentBundle): CombatView | null {
  if (!s.encounter) return null;
  const e = s.encounter,
    def = card(b, e.card.cardId);
  const fighters = [active(s), ...(e.helperId ? [player(s, e.helperId)] : [])];
  const modifiers: Record<string, Modifier[]> = {};
  let total = 0;
  for (const p of fighters) {
    modifiers[p.id] = strength(s, b, p, def.tags);
    total += modifiers[p.id].reduce((a, m) => a + m.amount, 0);
  }
  return {
    party: total + e.partyBonus,
    encounter: (def.strength ?? 0) + e.encounterBonus,
    modifiers,
  };
}
function cleanup(s: GameState) {
  s.phase = "cleanup";
  s.deadline = s.turnDeadline;
}
function finish(s: GameState, b: ContentBundle, winner: Player | null) {
  s.phase = "finished";
  s.winnerId = winner?.id ?? null;
  s.deadline = s.turnDeadline = null;
  for (const p of s.players)
    if (p !== winner)
      p.ending =
        b.campaign.endings.failed[
          Math.floor(random(s) * b.campaign.endings.failed.length)
        ];
  log(
    s,
    winner
      ? `${winner.name} found romance. The algorithm would like a word.`
      : "Last call. Nobody won romance; everyone acquired lore.",
  );
}
function settle(s: GameState, b: ContentBundle) {
  const e = s.encounter!;
  const c = card(b, e.card.cardId);
  const lead = active(s);
  const combat = combatView(s, b)!;
  if (combat.party > combat.encounter && !lead.triggered) {
    gain(lead, c.rewards ?? {});
    const loot = c.loot ?? 0;
    if (e.deal && e.helperId) {
      const helper = player(s, e.helperId);
      const d = e.deal;
      need(
        lead.wallet[d.currency] >= d.amount,
        "DEAL_UNFUNDED",
        "The accepted deal must remain funded.",
      );
      lead.wallet[d.currency] -= d.amount;
      helper.wallet[d.currency] += d.amount;
      giveActions(s, helper, d.loot);
      giveActions(s, lead, loot - d.loot);
      log(
        s,
        `${helper.name} received ${d.amount} ${d.currency} and ${d.loot} loot for helping.`,
      );
    } else giveActions(s, lead, loot);
    log(
      s,
      `${lead.name} defeated ${c.name}: ${combat.party} to ${combat.encounter}.`,
    );
    if (c.kind === "finale") {
      lead.ending = c.ending;
      finish(s, b, lead);
      return;
    }
    const leveled = lead.level < b.campaign.rules.finaleLevel;
    lead.level = Math.min(b.campaign.rules.finaleLevel, lead.level + 1);
    const trait = leveled ? uniqueTrait(s, lead) : null;
    if (trait) {
      discover(lead, trait.cardId);
      if (lead.traits.length < b.campaign.rules.traitSlots)
        lead.traits.push(trait);
      else lead.pendingTrait = trait;
    }
    discard(s, b, e.card);
    cleanup(s);
  } else escape(s, b, false);
}
function escape(s: GameState, b: ContentBundle, automatic: boolean) {
  const e = s.encounter!,
    c = card(b, e.card.cardId);
  const roll = automatic ? 6 : Math.floor(random(s) * 6) + 1;
  const escaped = automatic || roll >= b.campaign.rules.escapeTarget;
  log(
    s,
    `${active(s).name} ${escaped ? "escaped" : "failed to escape"} ${c.name}${automatic ? "" : ` (rolled ${roll})`}. No rewards.`,
  );
  if (!escaped) {
    chill(s, b, active(s), -(c.setback ?? 0));
    if (e.helperId) chill(s, b, player(s, e.helperId), -(c.setback ?? 0));
  }
  if (c.kind !== "finale") discard(s, b, e.card);
  cleanup(s);
}
function next(s: GameState, b: ContentBundle, now: number) {
  s.turnIndex = (s.turnIndex + 1) % s.players.length;
  if (s.turnIndex === 0) s.round++;
  if (s.round > b.campaign.rules.maxRounds) {
    finish(s, b, null);
    return;
  }
  prepare(s, b, now);
}
function mark(s: GameState, now: number) {
  s.revision++;
  s.updatedAt = now;
}

export function reduce(
  state: GameState,
  b: ContentBundle,
  actorId: string,
  cmd: Command,
  now: number,
): GameState {
  const s = structuredClone(state),
    p = player(s, actorId),
    r = b.campaign.rules;
  need(p.connected, "DISCONNECTED", "Reconnect before acting.");
  need(!s.paused, "PAUSED", "Waiting for another player to reconnect.");
  if (s.deadline !== null && now >= s.deadline && cmd.type !== "resolve")
    throw new RuleError("WINDOW_CLOSED", "The action window has closed.");
  const own = () =>
    need(
      active(s).id === actorId,
      "NOT_YOUR_TURN",
      "It is another player’s turn.",
    );
  const phase = (...phases: string[]) =>
    need(
      phases.includes(s.phase),
      "WRONG_PHASE",
      "That action is unavailable in this phase.",
    );
  switch (cmd.type) {
    case "start":
      phase("lobby");
      need(actorId === s.hostId, "HOST_ONLY", "Only the host can start.");
      start(s, b, now);
      break;
    case "kick":
      phase("lobby");
      need(
        actorId === s.hostId && cmd.playerId !== actorId,
        "HOST_ONLY",
        "Only the host can remove another lobby seat.",
      );
      player(s, cmd.playerId);
      s.players = s.players.filter((x) => x.id !== cmd.playerId);
      break;
    case "rematch":
      phase("finished");
      need(
        actorId === s.hostId,
        "HOST_ONLY",
        "Only the host can open a rematch.",
      );
      s.phase = "lobby";
      s.encounter = null;
      s.winnerId = null;
      s.paused = false;
      s.deadline = null;
      s.turnDeadline = null;
      log(s, "Rematch lobby open.");
      break;
    case "therapy":
      own();
      phase("prepare");
      need(
        !s.recoveredThisTurn,
        "ALREADY_RECOVERED",
        "One recovery purchase per turn.",
      );
      need(p.chill < r.maxChill, "FULL_CHILL", "Your Chill is already full.");
      if (p.wallet.therapy_healedness > 0) p.wallet.therapy_healedness--;
      else {
        need(
          p.wallet.cash_cp >= r.therapyPrice,
          "INSUFFICIENT_FUNDS",
          "Not enough cash for therapy.",
        );
        p.wallet.cash_cp -= r.therapyPrice;
      }
      chill(s, b, p, r.therapyHeal);
      s.recoveredThisTurn = true;
      log(s, `${p.name} invested in a little self-awareness.`);
      break;
    case "self_care":
      own();
      phase("prepare");
      chill(s, b, p, r.selfCareHeal);
      giveActions(s, p, r.selfCareDraw ?? 1);
      log(
        s,
        `${p.name} chose self-care: recover Chill and draw an action; no level.`,
      );
      cleanup(s);
      break;
    case "buy": {
      own();
      phase("prepare");
      need(
        !s.boughtThisTurn,
        "ALREADY_BOUGHT",
        "One market purchase per turn.",
      );
      const i = s.market.findIndex((c) => c.instanceId === cmd.instanceId);
      need(i >= 0, "MISSING_CARD", "That market card is gone.");
      const item = s.market[i],
        def = card(b, item.cardId),
        price = def.price!;
      need(
        p.wallet[price.currency] >= price.amount,
        "INSUFFICIENT_FUNDS",
        "Not enough of that currency.",
      );
      if (p.equipment.length >= r.equipmentSlots) {
        const j = p.equipment.findIndex((c) => c.instanceId === cmd.replaceId);
        need(j >= 0, "CHOOSE_REPLACEMENT", "Choose equipment to replace.");
        discard(s, b, p.equipment.splice(j, 1)[0]);
      }
      p.wallet[price.currency] -= price.amount;
      p.equipment.push(item);
      discover(p, item.cardId);
      s.market.splice(i, 1);
      const replacement = draw(s, "equipment");
      if (replacement) s.market.push(replacement);
      s.boughtThisTurn = true;
      log(s, `${p.name} bought ${def.name}.`);
      break;
    }
    case "reveal":
    case "finale": {
      own();
      phase("prepare");
      let c: CardInstance | null;
      if (cmd.type === "finale") {
        need(
          p.level >= r.finaleLevel,
          "LEVEL_REQUIRED",
          `Reach level ${r.finaleLevel} first.`,
        );
        need(
          b.campaign.pools.finale.includes(cmd.cardId),
          "INVALID_FINALE",
          "Unknown finale.",
        );
        c = instance(s, cmd.cardId);
      } else c = draw(s, `encounter${encounterTier(b, p.level)}`);
      need(c, "EMPTY_DECK", "No encounter remains.");
      const def = card(b, c.cardId);
      for (const x of s.players) discover(x, c.cardId);
      log(s, `${p.name} revealed ${def.name}.`);
      s.encounter = {
        card: c,
        helperId: null,
        offer: null,
        deal: null,
        partyBonus: 0,
        encounterBonus: 0,
        intervened: [],
        passed: [],
        shields: [],
        logs: [],
        adjustments: [],
      };
      if (def.kind === "event") {
        for (const e of def.effects) {
          if (e.kind === "resource") gain(p, { [e.currency]: e.amount });
          if (e.kind === "draw") giveActions(s, p, e.amount);
          if (e.kind === "chill") chill(s, b, p, e.amount);
        }
        discard(s, b, c);
        cleanup(s);
      } else {
        s.phase = "negotiate";
        s.deadline = Math.max(
          now,
          Math.min(
            now + (r.negotiationMs ?? 25_000),
            s.turnDeadline! - r.interventionMs,
          ),
        );
      }
      break;
    }
    case "offer": {
      own();
      phase("negotiate");
      const e = s.encounter!;
      need(
        !e.helperId,
        "HELPER_LOCKED",
        "Your accepted helper is locked for this encounter.",
      );
      const helper = player(s, cmd.helperId);
      need(
        helper.id !== p.id && helper.connected && !helper.triggered,
        "HELPER_UNAVAILABLE",
        "Choose an available helper.",
      );
      need(
        Number.isSafeInteger(cmd.amount) &&
          cmd.amount >= 0 &&
          p.wallet[cmd.currency] >= cmd.amount,
        "INSUFFICIENT_FUNDS",
        "Offer only currency you currently hold.",
      );
      need(
        Number.isInteger(cmd.loot) &&
          cmd.loot >= 0 &&
          cmd.loot <= (card(b, e.card.cardId).loot ?? 0),
        "INVALID_LOOT",
        "The encounter cannot pay that much loot.",
      );
      e.offer = {
        id: `offer:${s.revision + 1}`,
        helperId: helper.id,
        currency: cmd.currency,
        amount: cmd.amount,
        loot: cmd.loot,
      };
      break;
    }
    case "accept": {
      phase("negotiate");
      const e = s.encounter!;
      need(
        e.offer && e.offer.helperId === p.id && e.offer.id === cmd.offerId,
        "OFFER_EXPIRED",
        "That offer is no longer addressed to you.",
      );
      need(!p.triggered, "TRIGGERED", "Recover before helping.");
      e.helperId = p.id;
      e.deal = e.offer;
      e.offer = null;
      log(s, `${p.name} agreed to help ${active(s).name}.`);
      break;
    }
    case "decline":
      phase("negotiate");
      need(
        s.encounter?.offer?.helperId === p.id,
        "NO_OFFER",
        "No offer to decline.",
      );
      s.encounter!.offer = null;
      break;
    case "ready":
      own();
      phase("negotiate");
      s.phase = "intervene";
      s.encounter!.offer = null;
      s.deadline = Math.min(now + r.interventionMs, s.turnDeadline!);
      break;
    case "protect": {
      phase("intervene");
      const e = s.encounter!;
      need(!e.passed.includes(p.id), "ALREADY_PASSED", "You already passed.");
      need(
        !e.intervened.includes(p.id),
        "ALREADY_PLAYED",
        "One intervention per encounter.",
      );
      need(!p.triggered, "TRIGGERED", "Recover before intervening.");
      const reserved =
        active(s).id === p.id && e.deal?.currency === "social_capital"
          ? e.deal.amount
          : 0;
      need(
        p.wallet.social_capital - reserved >= (r.protectionCost ?? 1),
        "INSUFFICIENT_FUNDS",
        `Keep accepted help payments reserved. You need ${r.protectionCost ?? 1} available social capital.`,
      );
      p.wallet.social_capital -= r.protectionCost ?? 1;
      e.shields.push(p.id);
      e.intervened.push(p.id);
      e.logs.push(
        `${p.name} spent ${r.protectionCost ?? 1} social capital to protect the party.`,
      );
      break;
    }
    case "play": {
      phase("intervene");
      const e = s.encounter!;
      need(!e.passed.includes(p.id), "ALREADY_PASSED", "You already passed.");
      need(!p.triggered, "TRIGGERED", "Recover before intervening.");
      need(
        !e.intervened.includes(p.id),
        "ALREADY_PLAYED",
        "One intervention per encounter.",
      );
      const i = p.hand.findIndex((c) => c.instanceId === cmd.instanceId);
      need(i >= 0, "MISSING_CARD", "That card is not in your hand.");
      const item = p.hand[i],
        def = card(b, item.cardId);
      need(
        def.kind === "action",
        "NOT_ACTION",
        "Only action cards can intervene.",
      );
      if (def.effects.some((x) => x.kind === "escape"))
        need(
          p.id === active(s).id,
          "ACTIVE_ONLY",
          "Only the active player can choose an automatic escape.",
        );
      p.hand.splice(i, 1);
      discard(s, b, item);
      e.intervened.push(p.id);
      for (const x of s.players) discover(x, item.cardId);
      const hostile = def.effects.some(
        (x) =>
          x.kind === "combat" &&
          (x.side === "party" ? x.amount < 0 : x.amount > 0),
      );
      if (hostile && e.shields.length) {
        e.shields.shift();
        e.logs.push(`${def.name} was blocked.`);
        break;
      }
      e.logs.push(`${p.name} played ${def.name}.`);
      for (const effect of def.effects) {
        if (effect.kind === "combat") {
          e.adjustments.push({
            source: def.name,
            amount: effect.amount,
            side: effect.side,
          });
          if (effect.side === "party") e.partyBonus += effect.amount;
          else e.encounterBonus += effect.amount;
        }
        if (effect.kind === "chill") chill(s, b, active(s), effect.amount);
        if (effect.kind === "resource")
          gain(p, { [effect.currency]: effect.amount });
        if (effect.kind === "draw") giveActions(s, p, effect.amount);
        if (effect.kind === "shield") e.shields.push(p.id);
        if (effect.kind === "cleanse") {
          e.adjustments = e.adjustments.filter(
            (x) => x.side !== "party" || x.amount >= 0,
          );
          e.partyBonus = e.adjustments
            .filter((x) => x.side === "party")
            .reduce((n, x) => n + x.amount, 0);
        }
        if (effect.kind === "class_swap") {
          const replacement = draw(s, "class");
          if (replacement) {
            if (p.classCard) discard(s, b, p.classCard);
            p.classCard = replacement;
            discover(p, replacement.cardId);
          }
        }
        if (effect.kind === "escape") escape(s, b, true);
      }
      break;
    }
    case "pass": {
      phase("intervene");
      const e = s.encounter!;
      if (!e.passed.includes(p.id)) e.passed.push(p.id);
      if (
        s.players
          .filter((x) => x.connected)
          .every((x) => e.passed.includes(x.id))
      )
        settle(s, b);
      break;
    }
    case "resolve":
      phase("intervene");
      need(
        now >= s.deadline! ||
          s.players
            .filter((x) => x.connected)
            .every((x) => s.encounter!.passed.includes(x.id)),
        "WINDOW_OPEN",
        "Other players still have time to intervene.",
      );
      settle(s, b);
      break;
    case "escape":
      own();
      phase("negotiate");
      escape(s, b, false);
      break;
    case "choose_trait": {
      own();
      phase("cleanup");
      need(p.pendingTrait, "NO_TRAIT", "No pending trait.");
      if (cmd.discard) discard(s, b, p.pendingTrait);
      else {
        const i = p.traits.findIndex((c) => c.instanceId === cmd.replaceId);
        need(i >= 0, "CHOOSE_REPLACEMENT", "Choose a trait to replace.");
        discard(s, b, p.traits.splice(i, 1)[0]);
        p.traits.push(p.pendingTrait);
      }
      p.pendingTrait = null;
      break;
    }
    case "discard": {
      phase("prepare", "cleanup");
      own();
      const i = p.hand.findIndex((c) => c.instanceId === cmd.instanceId);
      need(i >= 0, "MISSING_CARD", "That card is not in your hand.");
      discard(s, b, p.hand.splice(i, 1)[0]);
      break;
    }
    case "end_turn":
      own();
      phase("cleanup");
      need(
        !p.pendingTrait,
        "CHOOSE_TRAIT",
        "Keep or discard your new trait first.",
      );
      need(
        p.hand.length <= r.handLimit,
        "HAND_LIMIT",
        `Discard down to ${r.handLimit} action cards.`,
      );
      next(s, b, now);
      break;
  }
  mark(s, now);
  return s;
}

export function tick(
  state: GameState,
  b: ContentBundle,
  now: number,
): GameState | null {
  if (state.paused || state.deadline === null || now < state.deadline)
    return null;
  const s = structuredClone(state),
    p = active(s);
  if (s.phase === "prepare") {
    chill(s, b, p, b.campaign.rules.selfCareHeal);
    giveActions(s, p, b.campaign.rules.selfCareDraw ?? 1);
    cleanup(s);
  } else if (s.phase === "negotiate") {
    s.phase = "intervene";
    s.encounter!.offer = null;
    s.deadline = Math.min(
      now + b.campaign.rules.interventionMs,
      s.turnDeadline!,
    );
  } else if (s.phase === "intervene") settle(s, b);
  if (s.phase === "cleanup" && now >= s.turnDeadline!) {
    if (p.pendingTrait) {
      discard(s, b, p.pendingTrait);
      p.pendingTrait = null;
    }
    while (p.hand.length > b.campaign.rules.handLimit)
      discard(s, b, p.hand.pop()!);
    next(s, b, now);
  }
  mark(s, now);
  return s;
}
export function presence(
  state: GameState,
  connected: Set<string>,
  now: number,
): GameState | null {
  const s = structuredClone(state);
  let changed = false;
  for (const p of s.players) {
    const value = connected.has(p.id);
    if (value !== p.connected) {
      p.connected = value;
      changed = true;
    }
  }
  const host = s.players.find((p) => p.id === s.hostId);
  if (!host?.connected) {
    const next = s.players.find((p) => p.connected);
    if (next && next.id !== s.hostId) {
      s.hostId = next.id;
      changed = true;
    }
  }
  const running = s.phase !== "lobby" && s.phase !== "finished";
  const shouldPause =
    running &&
    s.players.filter((p) => p.connected).length < Math.min(2, s.players.length);
  if (shouldPause && !s.paused) {
    s.paused = true;
    s.pausedAt = now;
    changed = true;
  }
  if (!shouldPause && s.paused) {
    const elapsed = now - (s.pausedAt ?? now);
    if (s.deadline !== null) s.deadline += elapsed;
    if (s.turnDeadline !== null) s.turnDeadline += elapsed;
    s.paused = false;
    s.pausedAt = null;
    changed = true;
  }
  if (!changed) return null;
  mark(s, now);
  return s;
}
export function project(
  s: GameState,
  b: ContentBundle,
  selfId: string,
  now: number,
): Snapshot {
  const self = player(s, selfId);
  const own = active(s)?.id === selfId;
  const legal: string[] = [];
  if (!s.paused && self.connected) {
    if (s.phase === "lobby" && s.hostId === selfId) legal.push("start", "kick");
    if (s.phase === "finished" && s.hostId === selfId) legal.push("rematch");
    if (own && s.phase === "prepare") {
      legal.push("reveal", "self_care", "discard");
      if (self.level >= b.campaign.rules.finaleLevel) legal.push("finale");
      if (!s.boughtThisTurn) legal.push("buy");
      if (!s.recoveredThisTurn) legal.push("therapy");
    }
    if (s.phase === "negotiate") {
      if (own)
        legal.push(
          "ready",
          "escape",
          ...(!s.encounter!.helperId &&
          s.players.some((p) => p.id !== selfId && p.connected && !p.triggered)
            ? ["offer"]
            : []),
        );
      if (s.encounter?.offer?.helperId === selfId)
        legal.push("accept", "decline");
    }
    if (s.phase === "intervene") {
      if (!s.encounter!.passed.includes(selfId)) {
        legal.push("pass");
        if (!self.triggered && !s.encounter!.intervened.includes(selfId)) {
          legal.push("play");
          const deal = s.encounter!.deal;
          const reserved =
            own && deal?.currency === "social_capital" ? deal.amount : 0;
          if (
            self.wallet.social_capital - reserved >=
            (b.campaign.rules.protectionCost ?? 1)
          )
            legal.push("protect");
        }
      }
      if (now >= s.deadline!) legal.push("resolve");
    }
    if (own && s.phase === "cleanup")
      legal.push("choose_trait", "discard", "end_turn");
  }
  return {
    id: s.id,
    code: s.code,
    hostId: s.hostId,
    revision: s.revision,
    contentVersion: s.contentVersion,
    selfId,
    players: s.players.map((p) => {
      const { hand, pendingTrait, discoveries, ...publicFields } = p;
      return {
        ...publicFields,
        handCount: hand.length,
        ...(p.id === selfId ? { hand, pendingTrait } : {}),
      };
    }),
    phase: s.phase,
    turnIndex: s.turnIndex,
    round: s.round,
    run: s.run,
    market: s.market,
    encounter: s.encounter,
    deadline: s.deadline,
    paused: s.paused,
    winnerId: s.winnerId,
    log: s.log,
    combat: combatView(s, b),
    discoveries: self.discoveries,
    legalActions: legal,
    serverTime: now,
    boughtThisTurn: s.boughtThisTurn,
    recoveredThisTurn: s.recoveredThisTurn,
  };
}
