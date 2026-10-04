import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  addPlayer,
  card,
  combatView,
  draw,
  emptyRoom,
  presence,
  project,
  reduce,
  RuleError,
  strength,
  tick,
} from "../src/engine/game";
import type { ContentBundle, GameState, Command } from "../src/shared/types";
const bundle: ContentBundle = JSON.parse(
  readFileSync(new URL("../content/launch.json", import.meta.url), "utf8"),
);
function game(count = 3, seed = 42) {
  let s = emptyRoom("room", "ABC234", "p0", bundle.version, 1000, seed);
  for (let i = 0; i < count; i++)
    s = addPlayer(s, bundle, `p${i}`, `Player ${i}`, 1000);
  s = presence(s, new Set(s.players.map((p) => p.id)), 1000)!;
  return reduce(s, bundle, "p0", { type: "start" }, 1000);
}
const act = (
  s: GameState,
  cmd: Command,
  id = s.players[s.turnIndex].id,
  now = 1001,
) => reduce(s, bundle, id, cmd, now);
function encounter(s = game(), id = "monster_the_ghoster") {
  const tier = Math.min(3, Math.ceil(s.players[s.turnIndex].level / 2));
  s.decks[`encounter${tier}`].draw.push({
    instanceId: "fixed-encounter",
    cardId: id,
  });
  return act(s, { type: "reveal" });
}
function action(s: GameState, id: string, owner = "p0") {
  s.players
    .find((p) => p.id === owner)!
    .hand.push({ instanceId: `test:${id}`, cardId: id });
  return { type: "play", instanceId: `test:${id}` } as Command;
}
function passAll(s: GameState) {
  for (const p of s.players) {
    if (s.phase !== "intervene") break;
    s = act(s, { type: "pass" }, p.id);
  }
  return s;
}
const rejects = (f: () => unknown, code: string) =>
  assert.throws(f, (e) => e instanceof RuleError && e.code === code);

test("campaign data controls recovery, draw cadence, favor price, and encounter tiers", () => {
  const custom = structuredClone(bundle);
  Object.assign(custom.campaign.rules, {
    socialCapitalFloor: 3,
    protectionCost: 2,
    selfCareHeal: 1,
    selfCareDraw: 2,
    turnDraw: 2,
    negotiationMs: 8000,
  });
  custom.campaign.difficulty = [{ minLevel: 1, tier: 3 }];
  let s = game();
  s.players[0].chill = 1;
  s = reduce(s, custom, "p0", { type: "self_care" }, 1001);
  assert.equal(s.players[0].chill, 2);
  assert.equal(s.players[0].hand.length, 5);
  s = reduce(s, custom, "p0", { type: "end_turn" }, 1002);
  assert.equal(s.players[1].hand.length, 5);
  assert.equal(s.players[1].wallet.social_capital, 3);
  const monster = custom.cards.find(
    (c) => c.kind === "monster" && c.tier === 3,
  )!;
  s.decks.encounter3.draw.push({ instanceId: "tier-test", cardId: monster.id });
  s = reduce(s, custom, "p1", { type: "reveal" }, 1003);
  assert.equal(s.encounter!.card.cardId, monster.id);
  assert.equal(s.deadline, 9003);
  s = reduce(s, custom, "p1", { type: "ready" }, 1004);
  assert.ok(!project(s, custom, "p0", 1004).legalActions.includes("protect"));
  s = reduce(s, custom, "p1", { type: "protect" }, 1005);
  assert.equal(s.players[1].wallet.social_capital, 1);
});

test("seeded setup is repeatable; exact initial deal and per-viewer privacy", () => {
  const s = game(6);
  assert.deepEqual(s, game(6));
  for (const p of s.players) {
    assert.equal(p.hand.length, 3);
    assert.equal(p.traits.length, 2);
    assert.equal(p.equipment.length, 1);
    assert.equal(p.chill, 6);
    assert.equal(p.level, 1);
  }
  assert.equal(new Set(s.players.map((p) => p.classCard!.cardId)).size, 6);
  const view = project(s, bundle, "p0", 1001);
  assert.equal(view.players[0].hand!.length, 3);
  assert.equal(view.players[1].hand, undefined);
  for (const hidden of ["rng", "decks", "instanceSequence", "turnDeadline"])
    assert.ok(!(hidden in view));
});

test("any positive table size receives a complete seeded build and enough deck copies", () => {
  for (const count of [1, 2, 7, 12, 40]) {
    const s = game(count);
    assert.deepEqual(s, game(count));
    assert.equal(s.players.length, count);
    assert.equal(s.market.length, bundle.campaign.rules.marketSize);
    for (const p of s.players) {
      assert.ok(p.classCard);
      assert.equal(p.traits.length, 2);
      assert.equal(new Set(p.traits.map((c) => c.cardId)).size, 2);
      assert.equal(p.equipment.length, 1);
      assert.equal(p.hand.length, 3);
    }
    const instances = s.players
      .flatMap((p) => [p.classCard!, ...p.traits, ...p.equipment, ...p.hand])
      .concat(
        s.market,
        ...Object.values(s.decks).map((d) => [...d.draw, ...d.discard]),
      );
    assert.equal(
      new Set(instances.map((c) => c.instanceId)).size,
      instances.length,
    );
  }
});

test("solo turns pause only when the seat disconnects and resume with preserved time", () => {
  const s = game(1);
  assert.equal(s.paused, false);
  assert.ok(
    !project(encounter(s), bundle, "p0", 1002).legalActions.includes("offer"),
  );
  assert.equal(presence(s, new Set(["p0"]), 2000), null);
  const paused = presence(s, new Set(), 2000)!;
  assert.equal(paused.paused, true);
  assert.equal(tick(paused, bundle, 999999), null);
  const resumed = presence(paused, new Set(["p0"]), 12_000)!;
  assert.equal(resumed.paused, false);
  assert.equal(resumed.deadline, s.deadline! + 10_000);
  let ended = resumed;
  while (ended.phase !== "finished")
    ended = tick(ended, bundle, ended.deadline!)!;
  assert.ok(ended.players[0].ending);
});
test("conditional class and trait modifiers explain both benefits and penalties", () => {
  const s = game(),
    p = s.players[0];
  p.classCard = { instanceId: "c", cardId: "class_yoga_teacher" };
  p.traits = [];
  p.equipment = [];
  assert.deepEqual(strength(s, bundle, p, ["wellness", "tech"]), [
    { source: "Level", amount: 1 },
    { source: "Yoga Teacher", amount: 1 },
    { source: "Yoga Teacher", amount: 2 },
    { source: "Yoga Teacher", amount: -1 },
  ]);
});
test("invalid actions cannot mutate the supplied state", () => {
  const s = game(),
    before = JSON.stringify(s);
  rejects(() => act(s, { type: "reveal" }, "p1"), "NOT_YOUR_TURN");
  assert.equal(JSON.stringify(s), before);
  rejects(
    () => act(s, { type: "finale", cardId: bundle.campaign.pools.finale[0] }),
    "LEVEL_REQUIRED",
  );
});
test("successful negotiated help pays once, levels only leader, and draws new trait", () => {
  let s = encounter();
  s.players[0].level = 4;
  s.players[0].wallet.cash_cp = 100;
  s.players[1].level = 4;
  s = act(s, {
    type: "offer",
    helperId: "p1",
    currency: "cash_cp",
    amount: 50,
    loot: 1,
  });
  const offer = s.encounter!.offer!.id;
  s = act(s, { type: "accept", offerId: offer }, "p1");
  rejects(
    () =>
      act(s, {
        type: "offer",
        helperId: "p2",
        currency: "cash_cp",
        amount: 0,
        loot: 0,
      }),
    "HELPER_LOCKED",
  );
  const before = s.players[1].wallet.cash_cp;
  s = act(s, { type: "ready" });
  s = passAll(s);
  assert.equal(s.phase, "cleanup");
  assert.equal(s.players[0].level, 5);
  assert.equal(s.players[1].level, 4);
  assert.equal(s.players[1].wallet.cash_cp, before + 50);
  assert.equal(s.players[0].traits.length, 3);
  rejects(() => act(s, { type: "resolve" }), "WRONG_PHASE");
});
test("offers validate available funds, quantities, identity and consent", () => {
  let s = encounter();
  rejects(
    () =>
      act(s, {
        type: "offer",
        helperId: "p1",
        currency: "btc",
        amount: 1,
        loot: 0,
      }),
    "INSUFFICIENT_FUNDS",
  );
  rejects(
    () =>
      act(s, {
        type: "offer",
        helperId: "p1",
        currency: "cash_cp",
        amount: 0,
        loot: 99,
      }),
    "INVALID_LOOT",
  );
  s = act(s, {
    type: "offer",
    helperId: "p1",
    currency: "cash_cp",
    amount: 0,
    loot: 0,
  });
  rejects(
    () => act(s, { type: "accept", offerId: s.encounter!.offer!.id }, "p2"),
    "OFFER_EXPIRED",
  );
});
test("one intervention each, serial modifiers, shields, and irrevocable pass", () => {
  let s = act(encounter(), { type: "ready" });
  const bad = action(s, "action_screenshot", "p1");
  s = act(s, { type: "protect" }, "p0");
  s = act(s, bad, "p1");
  assert.equal(s.encounter!.encounterBonus, 0);
  rejects(() => act(s, bad, "p1"), "ALREADY_PLAYED");
  s = act(s, { type: "pass" }, "p2");
  rejects(() => act(s, { type: "protect" }, "p2"), "ALREADY_PASSED");
  rejects(() => act(s, { type: "resolve" }), "WINDOW_OPEN");
});
test("accepted social capital payment stays reserved", () => {
  let s = encounter();
  s = act(s, {
    type: "offer",
    helperId: "p1",
    currency: "social_capital",
    amount: 1,
    loot: 0,
  });
  s = act(s, { type: "accept", offerId: s.encounter!.offer!.id }, "p1");
  s = act(s, { type: "ready" });
  rejects(() => act(s, { type: "protect" }), "INSUFFICIENT_FUNDS");
});
test("cleanse removes negative action modifiers without removing positive ones", () => {
  let s = act(encounter(), { type: "ready" });
  const bad = action(s, "action_gaslight", "p1"),
    good = action(s, "action_super_like", "p2"),
    clean = action(s, "action_mansplain_shield");
  s = act(s, bad, "p1");
  s = act(s, good, "p2");
  assert.equal(s.encounter!.partyBonus, 2);
  s = act(s, clean);
  assert.equal(s.encounter!.partyBonus, 4);
});
test("class swap changes only the owner through random deck draw", () => {
  let s = act(encounter(), { type: "ready" });
  const before = s.players[0].classCard!.cardId;
  const play = action(s, "action_personal_rebrand");
  s = act(s, play);
  assert.notEqual(s.players[0].classCard!.cardId, before);
  assert.equal(s.decks.class.discard.at(-1)!.cardId, before);
});
test("a tie does not award levels or rewards", () => {
  let s = act(encounter(), { type: "ready" });
  const combat = combatView(s, bundle)!;
  s.encounter!.encounterBonus += combat.party - combat.encounter;
  s = passAll(s);
  assert.equal(s.players[0].level, 1);
  assert.equal(s.phase, "cleanup");
});
test("temporary Chill absorbs damage before Chill; Triggered discards and recovers", () => {
  let s = encounter();
  s.players[0].chill = 1;
  s.players[0].wallet.temp_chill = 1;
  s.rng = 1;
  // xorshift seed 1 produces an escape roll of 1.
  const hand = s.players[0].hand.length;
  s = act(s, { type: "escape" });
  assert.equal(s.players[0].wallet.temp_chill, 0);
  assert.equal(s.players[0].chill, 0);
  assert.equal(s.players[0].triggered, true);
  assert.equal(s.players[0].hand.length, hand - 1);
  s = act(s, { type: "end_turn" });
  for (let i = 0; i < 2; i++) {
    s = act(s, { type: "self_care" });
    s = act(s, { type: "end_turn" });
  }
  assert.equal(s.players[0].chill, 4);
  assert.equal(s.players[0].triggered, false);
});
test("automatic escape consumes its card, rewards nothing, and is active-only", () => {
  let s = act(encounter(), { type: "ready" });
  const wrong = action(s, "action_the_irish_exit", "p1");
  rejects(() => act(s, wrong, "p1"), "ACTIVE_ONLY");
  const play = action(s, "action_the_irish_exit");
  const chill = s.players[0].chill;
  s = act(s, play);
  assert.equal(s.phase, "cleanup");
  assert.equal(s.players[0].chill, chill);
  assert.equal(s.players[0].level, 1);
});
test("full trait slots require a choice; replaced trait returns to deck", () => {
  let s = encounter();
  s.players[0].level = 4;
  s.players[0].traits.push({
    instanceId: "third",
    cardId: "trait_actual_polyglot",
  });
  s.encounter!.partyBonus = 100;
  s = act(s, { type: "ready" });
  s = passAll(s);
  assert.ok(s.players[0].pendingTrait);
  rejects(() => act(s, { type: "end_turn" }), "CHOOSE_TRAIT");
  const pending = s.players[0].pendingTrait!;
  s = act(s, { type: "choose_trait", replaceId: "third" });
  assert.equal(s.players[0].traits.length, 3);
  assert.ok(
    s.players[0].traits.some((c) => c.instanceId === pending.instanceId),
  );
});
test("market purchase checks price, equipment slots, and once-per-turn limit", () => {
  let s = game();
  s.players[0].wallet.cash_cp = 1000;
  s.market = [
    { instanceId: "market-test", cardId: "equipment_emergency_breath_mints" },
  ];
  s = act(s, { type: "buy", instanceId: "market-test" });
  assert.equal(s.players[0].wallet.cash_cp, 950);
  assert.equal(s.players[0].equipment.length, 2);
  rejects(
    () => act(s, { type: "buy", instanceId: s.market[0].instanceId }),
    "ALREADY_BOUGHT",
  );
});
test("therapy spends recovery progress before cash and respects recovery cap", () => {
  let s = game();
  s.players[0].chill = 1;
  s.players[0].wallet.therapy_healedness = 1;
  s = act(s, { type: "therapy" });
  assert.equal(s.players[0].chill, 4);
  assert.equal(s.players[0].wallet.cash_cp, 100);
  assert.equal(s.players[0].wallet.therapy_healedness, 0);
  rejects(() => act(s, { type: "therapy" }), "ALREADY_RECOVERED");
});
test("empty deck reshuffles discarded physical cards", () => {
  const s = game();
  s.decks.action = {
    draw: [],
    discard: [{ instanceId: "only", cardId: "action_super_like" }],
  };
  assert.equal(draw(s, "action")!.instanceId, "only");
  assert.equal(draw(s, "action"), null);
});
test("finale requires level 5 and yields a single winner", () => {
  let s = game();
  s.players[0].level = 5;
  s = act(s, { type: "finale", cardId: bundle.campaign.pools.finale[0] });
  s.encounter!.partyBonus = 100;
  s = act(s, { type: "ready" });
  s = passAll(s);
  assert.equal(s.phase, "finished");
  assert.equal(s.winnerId, "p0");
  assert.ok(s.players.every((p) => p.ending));
  s = act(s, { type: "rematch" });
  assert.equal(s.phase, "lobby");
  s = act(s, { type: "start" });
  assert.equal(s.run, 2);
  assert.equal(s.players[0].level, 1);
});
test("disconnect pauses below two and resumes with remaining clock; host transfers", () => {
  const s = game();
  let paused = presence(s, new Set(["p1"]), 2000)!;
  assert.equal(paused.paused, true);
  assert.equal(paused.hostId, "p1");
  assert.equal(tick(paused, bundle, 999999), null);
  paused = presence(paused, new Set(["p1", "p2"]), 12_000)!;
  assert.equal(paused.paused, false);
  assert.equal(paused.deadline, s.deadline! + 10_000);
});
test("timeout advances phases and eight rounds always ends without elimination", () => {
  let s = game(6);
  let transitions = 0;
  while (s.phase !== "finished" && transitions++ < 200) {
    s = tick(s, bundle, s.deadline!)!;
  }
  assert.equal(s.phase, "finished");
  assert.equal(s.players.length, 6);
  assert.equal(s.winnerId, null);
  assert.ok(s.players.every((p) => p.ending));
});
test("seeded three/six-player simulated campaigns stay valid and terminate", () => {
  for (const count of [3, 6])
    for (let seed = 1; seed <= 30; seed++) {
      let s = game(count, seed),
        steps = 0;
      while (s.phase !== "finished" && steps++ < 1000) {
        const id = s.players[s.turnIndex].id;
        const p = s.players[s.turnIndex];
        if (s.phase === "prepare")
          s = act(
            s,
            p.level >= 5
              ? { type: "finale", cardId: bundle.campaign.pools.finale[0] }
              : { type: "reveal" },
            id,
            s.updatedAt + 1,
          );
        else if (s.phase === "negotiate")
          s = act(s, { type: "ready" }, id, s.updatedAt + 1);
        else if (s.phase === "intervene") s = tick(s, bundle, s.deadline!)!;
        else if (s.phase === "cleanup") {
          if (p.pendingTrait)
            s = act(
              s,
              { type: "choose_trait", discard: true },
              id,
              s.updatedAt + 1,
            );
          else if (p.hand.length > 5)
            s = act(
              s,
              { type: "discard", instanceId: p.hand[0].instanceId },
              id,
              s.updatedAt + 1,
            );
          else s = act(s, { type: "end_turn" }, id, s.updatedAt + 1);
        }
        for (const p of s.players) {
          assert.ok(p.chill >= 0 && p.chill <= 6);
          assert.ok(
            Object.values(p.wallet).every(
              (v) => Number.isSafeInteger(v) && v >= 0,
            ),
          );
          assert.ok(p.traits.length <= 3 && p.equipment.length <= 2);
        }
      }
      assert.equal(s.phase, "finished");
    }
});
