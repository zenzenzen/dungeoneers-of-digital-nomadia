# Unified Social Combat System

> Violence is still gauche. The difference now is that the rules know what the hell they are doing.

This is the canonical combat chassis for Dungeoneers of Digital Nomadia. It keeps the satire, but it gives classes, spells, monsters, items, and encounters one shared mechanical language.

## Design Goals

1. Keep the joke, structure the rule.
2. Feel adjacent to D&D 3.5e without pretending we are doing a museum reenactment.
3. Make content database-ready for a future app, card game, or encounter builder.

## Core Resolution

- Roll `d20 + modifiers` against a target number.
- Use a direct attack roll against **Cringe Resistance** when you are putting social pressure on someone in real time.
- Use a **save** when the target is resisting a status effect, trap, spell, compulsion, or area effect.
- Use a **contest** when both parties are actively pushing each other, such as bargaining, blocking an exit, or escaping a conversation trap.

## Action Economy

To keep the game closer to a 3.5e rhythm, each round gives you:

- **1 Standard Action**: attack, cast a spell, deploy an item, help an ally, or do one major scene move.
- **1 Move Action**: reposition, close distance, leave a zone, stand up, draw gear, or shift platforms.
- **1 Swift Action**: short setup effects, quips, focus changes, boosts, receipts collection, or lightweight item use.
- **1 Immediate Action** between your turns: reactions like `Mute`, `HODL`, or `No Actually`.
- **1 Full-Round Action** when a move is so extra it eats the whole turn: `Cancel`, `Hard Launch`, `Pitch Deck Spiral`, extended `Trauma Dump`, or equivalent boss nonsense.

If an ability says `bonus action`, treat it as a **swift action**. If it says `reaction`, treat it as an **immediate action**.

## Character Math

### Ability Modifiers

Use the normal d20 modifier formula:

- `10-11 = +0`
- `12-13 = +1`
- `14-15 = +2`
- `16-17 = +3`
- `18-19 = +4`
- continue by twos from there

### Chill

**Chill** is your health track, emotional durability, ego stability, and ability to stay in the room.

- Level 1 Chill: class `hit_die` maximum + CON modifier
- Later levels: add average hit die value + CON modifier, or roll if your table enjoys chaos
- Temporary Chill stacks separately and is lost first

**0 Chill always means Triggered.** You lose the scene, leave the immediate exchange, and cannot keep taking turns unless a game mode explicitly overrides this in writing.

### Cringe Resistance

**Cringe Resistance** is the unified defense score for social attacks.

`10 + floor(level / 2) + WIS mod + CHA mod + outfit bonus + shield/item bonus + situational modifiers`

Notes:

- Use `challenge_rating` for monsters and encounters. Do not call that `CR`.
- Reserve `CR` for **Cringe Resistance** only.

### Vibe Check

**Vibe Check** is initiative.

`d20 + higher of DEX mod or CHA mod + initiative bonuses`

DEX handles reflexes. CHA handles main-character entry energy. Let the player choose whichever is higher at the start of the scene unless a feature says otherwise.

### Saves

Classes already store a `save_primary` and `save_secondary`, so the game should use those instead of pretending every row already knows Fort/Ref/Will math.

- **Primary save**: `2 + floor(level / 2) + relevant ability mod`
- **Secondary save**: `1 + floor(level / 3) + relevant ability mod`
- **Untrained save**: `floor(level / 3) + relevant ability mod`

When converting to app logic, treat these as the class's good and secondary save progressions.

### Save DCs

- Spell DC: `10 + spell level + casting ability mod`
- Ability DC: `10 + floor(level / 2) + relevant ability mod`
- Item DC: `10 + item tier + relevant ability mod or fixed item value`

## Attacks, Spells, and Maneuvers

### Direct Social Attacks

Use:

`d20 + floor(level / 2) + relevant ability mod + item/class bonuses`

Target:

- **Cringe Resistance** for direct pressure
- A **save** for compulsion, area effects, illusions, panic, or bodily awkwardness

### Damage Types

These are the canonical damage types for this setting:

- **Psychic**: shame, stress, emotional splash damage
- **Sonic**: yelling, chewing, speakerphone terrorism
- **Reputation**: damage to social standing, credibility, or trust
- **Cringe**: secondhand embarrassment, style collapse, aura corrosion
- **Necrotic**: draining tedium, dead-eyed burnout, existential rot

If an old file says `slashing`, `bludgeoning`, or `gold damage`, convert it to one of the above or rewrite it as forced movement, item loss, or cash loss.

### Standard Maneuvers

These are the baseline actions every future class, monster, and encounter should riff on:

- **Call Out**: direct psychic or reputation attack
- **Gaslight**: psychic attack that can apply `Confused` or `Doubt`
- **Gatekeep**: attack that punishes targets with the `poser` tag or low context knowledge
- **Fact Check**: low damage, strips `Misinformation`
- **Mute**: immediate action, gain protection from one verbal attack
- **Block**: spend 1 Social Capital to become `Blocked` against one target for 1 minute
- **Dissociate**: swift action, gain resistance this round but lose reactions
- **Social Grapple**: lock someone into the exchange
- **Shove / Reposition**: force someone out of your face, out of line, or into a worse zone
- **Cancel**: full-round action that requires `Receipts Collected`

## Zones and Positioning

Use broad scene zones instead of counting every sad little five-foot square:

- **Personal**: whisper range, touching range, DMs, close-up camera range
- **Table**: same booth, same coworking cluster, same elevator
- **Room**: same venue or obvious social cluster
- **Scene**: same rooftop, terminal, livestream, or event floor
- **Remote**: not co-located; you need tech, signal, or platform access

Most social attacks work at `Personal`, `Table`, or `Room`. Mass embarrassment and online posting can reach `Scene` or `Remote`.

## Conditions and Canonical Names

Use the names in `rules/status_afflictions.md` as the source of truth.

Important canonicalizations:

- `Blocked` means targeted social immunity against one source, not banishment
- `Cannot Be Ignored` is the official state for relentless attention-seeking
- `Misinformation` is a named buff that can be removed by `Fact Check`
- `Receipts Collected` is the setup state for `Cancel`
- If old content says `paralyzed`, default to `Stunned` unless a stricter rule is written

## Undefined Legacy Terms, Now Defined

### Poser

A creature or NPC tagged `poser` is claiming identity, taste, or authority they have not earned. `Gatekeep` and similar effects often gain bonuses against them.

### Misinformation

A social buff representing a false narrative that has not been publicly corrected yet.

- Effect: `+2 Cringe Resistance vs Fact Check and investigation-style attacks`
- Removed by: `Fact Check`, `Zone of Truth (Fact Check)`, or credible public contradiction

### Social Capital

A spendable scene currency representing goodwill, status, or relationship leverage.

- Default: `1 + CHA mod`, minimum 1 per long rest
- Typical uses: `Block`, call in a favor, cut a line, force an introduction, or survive being obviously wrong in public

## Recovery

- **Short Rest / Self-Care**: restore spent swift-use abilities and recover some Chill
- **Long Rest / Retreat / Therapy**: restore full Chill, reduce exhaustion, reset daily scene currencies
- **Influence damage** and faction consequences usually persist beyond a rest unless specifically repaired

## Conversion Rule

If older content contradicts this file, use this priority order:

1. `rules/combat_system.md`
2. `rules/status_afflictions.md`
3. class and item structured data
4. free-text encounter notes
5. flavor text, because jokes are not allowed to secretly rewrite math
