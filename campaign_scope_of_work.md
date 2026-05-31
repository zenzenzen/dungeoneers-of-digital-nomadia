# DDN Full Campaign Scope of Work

Date: 2026-05-02

This scope organizes what is still needed to turn **Dungeoneers of Digital Nomadia** from a strong CSV-backed rules/content collection into a full playable campaign. It treats "Pathfinder 3.5e rules" as **Pathfinder 1e / D&D 3.5-style d20 compatibility**: ability modifiers, d20 checks, action economy, class progression, Challenge Rating / APL encounter math, XP or milestone advancement, treasure pacing, feats, skills, and spell/condition rules.

Primary rules references used for the check:

- Pathfinder 1e ability scores and modifiers: https://www.aonprd.com/Rules.aspx?ID=41
- Pathfinder 1e skills and skill ranks: https://aonprd.com/Rules.aspx?ID=79
- Pathfinder 1e character advancement: https://www.aonprd.com/Rules.aspx?Category=Basics&Name=Character+Advancement
- Pathfinder 1e encounter design, CR/APL, XP, and wealth by level: https://pathfinder.d20srd.org/coreRulebook/gamemastering.html
- Pathfinder 1e items, currency, and starting wealth: https://aonprd.com/Rules.aspx?ID=65

## Current Local Context

### Core Rules

- `rules/combat_system.md`
  - Canonical DDN combat chassis.
  - Already aligns with 3.5/PF-style action rhythm: standard, move, swift, immediate, full-round.
  - Defines `Chill`, `Cringe Resistance`, `Vibe Check`, saves, attack formulas, damage types, zones, and conversion priority.
- `rules/status_afflictions.md`
  - Main condition/buff vocabulary.
  - Needs to become ID-addressable content if encounters, spells, and app logic are going to reference conditions reliably.
- `rules/influence_system.md`
  - Faction and social influence framework.
  - Good campaign-scale engine, but needs encounter rewards/consequences wired into campaigns and quests.
- `rules/dm_manual.md`
  - Strong flash-session GM guide.
  - Needs a long-form campaign guide: act structure, downtime, travel, faction clocks, advancement, and reward cadence.
- `rules/specialized_game_modes.md`
  - Has useful optional modes and several explicit unfinished notes around speed dating consequences and balance testing.
- `rules/content_schema_standards.md`
  - Best source for where schemas should go next.
  - Names the split between flavor text and rules text, and the need for structured effects.

### Campaign Content

- `campaigns/campaigns.csv`
  - 15 active campaign seeds.
  - These are good pitches/arcs, but not yet full adventure paths.
  - All 15 rows have blank `featured_npc_ids` and `featured_location_ids`.
  - 10 of 15 rows have blank `featured_quest_ids`.
  - 11 of 15 rows have blank `featured_encounter_ids`.
- `quests/quests.csv`
  - 30 active quests across main, side, social, investigation, fetch, challenge, survival, event, and boss categories.
  - 25 of 30 quests have no linked structured encounter.
  - 0 of 30 quests have `campaign_id` populated, so quests are not yet assigned to campaign arcs.
  - One quest intentionally uses `quest_giver_text` instead of a quest-giver NPC ID.
- `encounters/encounters.csv`
  - 3 active structured encounters.
  - This is the biggest bottleneck for full campaign play.
  - `encounters/encounters.md` has additional prose encounters that can be converted into structured rows.
- `locations/locations.csv`
  - 92 active structured locations.
  - `locations/locations.md` has richer prose and hazards that should be harvested into structured location, hazard, and encounter content.
- `factions/factions.csv`
  - 12 active factions.
  - Strong enough to support campaign clocks and faction turns, but reward/consequence tables need formalization.
- `npcs/npcs.csv`
  - 96 active NPCs.
  - Good campaign cast pool.
  - Needs role assignment per campaign/act and stronger links to scenes, encounters, faction clocks, and quest beats.
  - All `campaign_ids` are blank — NPCs are unassigned to arcs.
  - NPCs carry influence-track data (`trust`, `access`, `leverage`, `heat`, `influence_threshold`) but no combat stats beyond `class_id`/`level`. Combatant NPCs need stat blocks or a clear policy of "use the matching monster row".
- `monsters/monsters.csv`
  - ~50 active stat blocks spanning Challenge Rating 0.5 to 7.
  - Schema: `id, name, type, size, armor_class, hit_points, speed, challenge_rating, abilities, attacks, special_traits, version, is_active`.
  - This is the de facto encounter combatant table — covers Karens, Mansplainers, Crypto Scammers, Bestie Betrayers, Scarlet Warlord, etc.
  - `attacks` and `special_traits` are pipe-/semicolon-delimited DSL strings, not parsed. The feature parser in `packages/content-schema/src/feature-dsl.ts` should be extended to cover this.
  - No stat-block derivation rules from CR (see Compatibility Gaps).
  - No tags for "social-only", "physical-threat", "boss", "minion", "elite", "horde" — encounter authors cannot filter by role.
- Hazards
  - **No structured hazards table exists.** `encounters/encounters.csv` has a `hazard_ids` column and `locations/locations.csv` has a `hazard_tags` column, but neither resolves to a hazard entity. Hazards are the missing third leg of every encounter.

### Player Options

- `classes/classes.csv`
  - 43 active classes.
  - Good class identities and feature DSL exist.
  - Missing PF-style level tables, BAB/social attack progression, class skill lists, skill ranks per level, feats/feature progression, and class spell lists.
- `backgrounds/backgrounds.csv`
  - 129 active backgrounds.
  - Strong starting identity layer.
  - Needs final skill/tool/language normalization and starting wealth/equipment compatibility.
- `skills/skills.csv`
  - 64 active skills.
  - `skills/skill_aliases.csv` has 169 aliases.
  - Needs PF-style skill rank rules, class skill bonuses, trained-only flags, untrained use flags, and DC bands.
- `character_sheets/character_sheets.csv`
  - 3 active sample PCs.
  - Needs a full printable/player-facing sheet and validation against character creation rules.
- `races/races_template.csv`
  - Template only; no `races/races.csv`.
  - Template still uses generic fantasy sample content.
- `feats/feats_template.csv`
  - Template only; no `feats/feats.csv`.

### Gear, Spells, Rewards

- `spells/spells.csv`
  - 105 active spells.
  - Current schema is old-style: `description` carries too much rules load.
  - Needs save type, save DC formula, damage formula, damage type, condition IDs, concentration, caster class IDs, targeting, and clear action type.
- `equipment/items.csv`
  - 53 active mundane/special items.
  - Useful base inventory.
- `armors/armors_database_formatted.csv`
  - 60 active database-ready armor/outfit rows.
  - Prefer this over `armors/armors.csv` for campaign/app work.
- `armors/armors.csv`
  - 61 rows, older legacy format. Kept for reference but not the source of truth.
  - Decide: deprecate and delete, or merge unique rows into `armors_database_formatted.csv`. The audit should warn until one of the two ships.
- `weapons/weapons.csv`
  - 3 active rows.
  - Needs a real social-combat weapon/tool list.
- `magic_items/magic_items.csv`
  - 3 active rows.
  - Needs tiered campaign rewards, attunement-like limits if used, charges/recharge rules, and price bands.
- `treasure/treasure.csv`
  - 3 active rows.
  - Needs hoards, favors, access rewards, information rewards, faction rewards, BTC/cash conversion, and Pathfinder-style wealth pacing.
- `jobs/jobs_template.csv`
  - Template only; no `jobs/jobs.csv`.
- `miscellaneous_objects/miscellaneous_objects_template.csv`
  - Template only; no `miscellaneous_objects/miscellaneous_objects.csv`.

### Web/App Context

- `technical-design.md`
  - Product plan for compendium, character workbench, async sessions, AI narrator, and social discovery.
  - Campaign scope should feed Phase 2 and Phase 3: character creation, encounters, session events, and rules engine.
- `packages/content-schema/src/index.ts`
  - Zod schemas currently cover only `classes`, `monsters`, `npcs`, and `spells`.
  - Needs schemas for campaigns, quests, encounters, locations, factions, backgrounds, skills, gear, rewards, feats, races, and conditions.
- `packages/content-schema/src/feature-dsl.ts`
  - Feature parser exists and should be expanded as class features become level-based.
- `tooling/content-build/src/build-content.ts`
  - Builds CSV into generated JSON for app/public use.
  - Currently validates only entity types present in `schemaRegistry`.
- `tools/content_audit.py`
  - Existing audit passes with warnings only.
  - Extend this to enforce campaign completeness, level coverage, encounter budget coverage, missing reward IDs, and structured effect fields.
- `apps/web/lib/compendium.ts`
  - Monster-focused compendium helper.
  - Needs general entity browsing and cross-linking for campaign play.

## Pathfinder / 3.5-Style Compatibility Check

### Already Aligned

- Core d20 resolution exists: `d20 + modifiers` vs target number.
- Ability modifier math matches the PF/3.5 pattern.
- Action economy in `rules/combat_system.md` already uses standard, move, swift, immediate, and full-round actions.
- Spell levels 0-9 exist in `spells/spells.csv`.
- Monsters already have Challenge Rating-like `challenge_rating`.
- Characters use level, class, ability scores, Chill, defense, speed, skills, features, and equipment.
- Factions and influence make a good DDN-native replacement for some dungeon-crawl logistics.

### Compatibility Gaps

- Pathfinder CR means **Challenge Rating**, while DDN prose uses `CR` for **Cringe Resistance**. Keep `challenge_rating` for encounter math and reserve `CR` only for defense in prose.
- Character creation is incomplete: no race/origin data file, no point-buy guidance, no favored class rule, no skill ranks per level, no class skill bonuses, and no feat progression.
- Class progression is not yet level-by-level. A full campaign needs class tables from levels 1-20 or a defined smaller level range.
- Saves are DDN-custom primary/secondary/untrained. That is workable, but it needs a conversion note against Fortitude/Reflex/Will or a deliberate statement that DDN replaces them.
- Combat math lacks an equivalent for BAB/CMB/CMD. DDN can replace this with social attack bonus and social maneuver defense, but it should be explicit.
- Encounter design lacks APL-based budget rules. Pathfinder expects encounter difficulty around APL, with easy/average/challenging/hard/epic bands.
- Structured encounters are far too few for a full campaign: 3 rows is enough for a demo, not an adventure path.
- Rewards are not paced against XP/level or wealth-by-level equivalents.
- Spell records need structured targeting, save, damage, condition, and duration data before they can be adjudicated consistently.
- Conditions and buffs need stable IDs so spells, monsters, encounters, and the app can all refer to the same effects.
- No defined outcome at 0 Chill. Pathfinder/3.5 has unconscious/stable/dying/dead at HP thresholds. DDN needs an equivalent: Triggered? Cancelled? Burnout? Walk-of-shame? With recovery rules.
- No critical hit or fumble rules for d20 resolution. Even the social-combat reskin needs to define what a natural 20 / natural 1 produces (auto-success, doubled damage, complication, comedy beat).
- No NPC initiative or action-economy parity statement. PCs use Vibe Check; do monsters/NPCs roll the same, take a fixed slot, or use a "bad guys go on X" rule? Multi-NPC combat is unrunnable until this is decided.
- Concentration is implied by spells but not formalized — no DC formula for maintaining concentration when struck.
- Contested checks (social grapple, escape, gatekeep, fact-check) lack a single resolution rule. Pick one: opposed d20, attacker-vs-DC, both-roll-higher-wins.
- No multiclass, retraining, or favored-class equivalent. Required as soon as any campaign passes level 3-4.
- No equivalent to attunement / item-slot caps. Without it, magic-item rewards stack indefinitely.
- Hazards have no schema, so encounter math cannot account for environmental damage or DC.
- Group skill checks, "aid another," take-10/take-20, and passive checks are not specified.

## Scope of Work

### 1. Define the Campaign Product

Goal: one complete playable adventure path, not just many seeds.

Deliverables:

- Pick one flagship campaign from `campaigns/campaigns.csv`.
- Define party size, starting level, ending level, advancement method, and target session count.
- Write a campaign bible with premise, tone, safety/tone boundaries, main cast, factions, locations, clocks, and finale.
- Add a local campaign module folder, for example `campaigns/the_great_bangkok_burnout/`, with an overview, act files, encounter notes, reward tables, and handouts.

Suggested first flagship: `campaign_the_great_bangkok_burnout`, because it already has active quests, strong setting pressure, and obvious resource scarcity.

Relevant files:

- `campaigns/campaigns.csv`
- `quests/quests.csv`
- `locations/locations.csv`
- `npcs/npcs.csv`
- `factions/factions.csv`
- `rules/dm_manual.md`
- `rules/influence_system.md`

### 2. Build the Adventure Path Structure

Goal: convert a campaign seed into a playable arc.

Deliverables:

- 3-5 act outline with level ranges.
- 8-12 session beats for the first full campaign.
- Main quest chain with branching side quests.
- At least 3 faction clocks that advance on failures, delays, or visible wins.
- Downtime loop between sessions: recover Chill, reduce Heat, work jobs, pursue relationships, shop, research, craft, and repair reputation.
- Clear campaign finale and at least two alternate endings.

Relevant files:

- `campaigns/campaigns.csv`
- `quests/quests.csv`
- `rules/influence_system.md`
- `rules/dm_manual.md`

### 3. Finish Character Creation and Advancement

Goal: make characters legal, balanced, and campaign-ready.

Deliverables:

- Create `races/races.csv` as DDN origins instead of generic fantasy races.
- Create `feats/feats.csv` with prerequisites and mechanical benefits.
- Add level progression tables for each playable class or define a limited launch roster first.
- Add class skill lists and skill ranks per level.
- Define point-buy or array options using PF-style ability score expectations.
- Define favored class or DDN replacement.
- Define advancement cadence: XP table, milestone, or hybrid.
- Update sample PCs in `character_sheets/character_sheets.csv` after formulas are final.

Relevant files:

- `classes/classes.csv`
- `backgrounds/backgrounds.csv`
- `skills/skills.csv`
- `races/races_template.csv`
- `feats/feats_template.csv`
- `character_sheets/character_sheets.csv`
- `rules/combat_system.md`

### 4. Normalize Core Math

Goal: make DDN feel Pathfinder-adjacent without copying every subsystem.

Deliverables:

- Define `social_attack_bonus` progression as the DDN analog to BAB.
- Define social maneuver rules for grapple, shove/reposition, block, gatekeep, flee, and escape.
- Finalize save mapping: DDN primary/secondary/untrained or Fortitude/Reflex/Will equivalents.
- Add DC bands for easy, average, hard, and extreme social/skill tasks.
- Define how monsters derive defense, save bonuses, attack bonuses, Chill, and damage by challenge rating.
- Add conversion notes for legacy terms like AC/HP/bonus action/reaction.

Relevant files:

- `rules/combat_system.md`
- `rules/status_afflictions.md`
- `monsters/monsters.csv`
- `classes/classes.csv`
- `skills/skills.csv`

### 5. Expand Structured Encounters

Goal: enough encounters for a full campaign and enough math to balance them.

Deliverables:

- Convert prose encounters from `encounters/encounters.md` into structured rows.
- Add 30-50 campaign-ready encounters across levels 1-10 for the first full campaign.
- Add hazards as structured content instead of semicolon-only strings.
- Add encounter budget notes: APL, effective challenge rating, XP/milestone value, treasure value, faction effects, and failure consequences.
- Link every campaign quest to at least one encounter.
- Build reusable encounter templates for social combat, investigation, chase, negotiation, faction conflict, survival, and boss scenes.

Relevant files:

- `encounters/encounters.csv`
- `encounters/encounters.md`
- `quests/quests.csv`
- `monsters/monsters.csv`
- `locations/locations.csv`
- `rules/combat_system.md`

### 6. Reward, Treasure, and Economy Pass

Goal: rewards should support progression instead of being punchlines only.

Deliverables:

- Create reward categories for cash, gear, information, access, clout, reputation repair, faction favors, and BTC.
- Define cp/sp/gp/pp or intentionally DDN-specific currency conversion.
- Add wealth-by-level equivalent for DDN.
- Expand `treasure/treasure.csv`, `magic_items/magic_items.csv`, and `weapons/weapons.csv`.
- Add cost and rarity bands for mundane gear, outfits, magic items, favors, and services.
- Tie quest rewards to campaign advancement and faction clocks.

Relevant files:

- `treasure/treasure.csv`
- `magic_items/magic_items.csv`
- `equipment/items.csv`
- `armors/armors_database_formatted.csv`
- `weapons/weapons.csv`
- `quests/quests.csv`
- `rules/influence_system.md`

### 7. Structure Spells, Conditions, and Effects

Goal: make every rules effect machine-readable and table-runnable.

Deliverables:

- Migrate `spells/spells.csv` toward the schema in `spells/spells_template.csv`.
- Add condition IDs and create a structured condition table if needed.
- Separate `flavor_text` from `rules_text`.
- Add save type, save DC formula, damage formula, damage type, duration, concentration, targeting, and caster class IDs.
- Normalize action names: convert `bonus action` to `swift action` and `reaction` to `immediate action` where appropriate.
- Add balance pass for high-impact spells that skip scenes or remove enemies.

Relevant files:

- `spells/spells.csv`
- `spells/spells_template.csv`
- `rules/status_afflictions.md`
- `rules/content_schema_standards.md`
- `rules/combat_system.md`

### 8. Build Campaign Tooling and Audits

Goal: make missing campaign work visible every time content changes.

Deliverables:

- Extend `tools/content_audit.py` to report:
  - campaigns missing featured NPCs, quests, locations, or encounters
  - quests missing campaign links
  - quests missing encounter links
  - encounters missing rewards, hazards, or encounter budget fields
  - spells missing structured effect fields
  - player options missing level/progression metadata
- Add schemas for all active CSV types in `packages/content-schema/src/index.ts`.
- Add generated JSON pages for campaigns, quests, encounters, locations, factions, classes, backgrounds, spells, gear, and conditions.
- Add cross-reference reports for "what content is not used by any campaign."

Relevant files:

- `tools/content_audit.py`
- `packages/content-schema/src/index.ts`
- `tooling/content-build/src/build-content.ts`
- `packages/content/src/index.ts`
- `apps/web/lib/compendium.ts`

### 9. Player and GM-Facing Materials

Goal: make it runnable by someone who did not write the repo.

Deliverables:

- Player quickstart.
- Character creation guide.
- GM campaign guide.
- Session zero guide.
- Printable/reference character sheet.
- Encounter-running checklist.
- Campaign handouts and location one-pagers.
- Rules glossary for DDN terms mapped to PF/3.5-style terms.

Relevant files:

- `README.md`
- `rules/dm_manual.md`
- `rules/combat_system.md`
- `rules/status_afflictions.md`
- `character_sheets/character_sheets_template.csv`

### 10. Safety, Tone, and Sensitivity

Goal: DDN is an adult comedy whose humor leans on stereotype and cringe. A campaign cannot ship to other tables without explicit safety scaffolding and a defensible content review.

Deliverables:

- Add a `rules/safety_tools.md` covering X-card, lines & veils, "open door" rule, pause-and-check, and tone calibration session-zero questions.
- Per-campaign content warnings: extend `campaigns/campaigns.csv` with `content_warnings` and `excluded_themes` columns.
- Per-encounter sensitivity tags on `encounters/encounters.csv` (e.g., `body_image`, `racialized_caricature`, `sexual_content`, `mental_health`, `addiction`).
- Author guidance on writing stereotype-based comedy: punch up vs. punch down, stock characters vs. specific people, when to swap a stereotype for a structural target.
- Sensitivity-review checklist for every named NPC, monster, and location that draws on a real culture or community.
- A documented appeals process for content concerns from playtesters.

Relevant files:

- `campaigns/campaigns.csv`
- `encounters/encounters.csv`
- `npcs/npcs.csv`
- `monsters/monsters.csv`
- `locations/locations.csv`
- `rules/dm_manual.md`

### 11. Session 0 and Onboarding

Goal: a brand-new GM with one brand-new table can start playing without reading the entire repo.

Deliverables:

- `rules/session_zero.md`: a script with table introductions, expectations, safety tools, content boundaries, character pitches, party hook, and a stripped-down rules primer.
- 4-6 pregenerated PCs validated end-to-end against the final character creation rules. Place under `character_sheets/pregens/`.
- "First 30 minutes" GM cheat sheet: how to run the opening scene, when to roll Vibe Check, how to introduce factions, when to spend Heat.
- New-player one-pager that explains Chill, Cringe Resistance, Vibe Check, and the four influence tracks in plain language.
- Optional Quickstart adventure: 1-session, level 1, single location, 2-3 encounters, ends with a Trust hook into the flagship campaign.

Relevant files:

- `rules/dm_manual.md`
- `rules/combat_system.md`
- `rules/influence_system.md`
- `character_sheets/character_sheets.csv`
- `character_sheets/character_sheets_template.csv`

### 12. Combat Edge Cases and Resolution Rules

Goal: rule arguments at the table get answered by the rules, not invented on the spot.

Deliverables:

- Critical hit / fumble rules for d20 checks, including a social-combat-flavored crit table.
- Outcome at 0 Chill: define the equivalent of dying/stable/dead. Suggested arc: Triggered → Cancelled → Burnout, with a recovery clock.
- NPC initiative and action economy: do monsters roll Vibe Check, take a fixed slot, or follow group initiative? Define minion/elite/boss action budgets.
- Concentration: DC formula when struck, simultaneous-spell rules, and a list of which DDN effects require concentration.
- Contested check resolution: pick a single canonical pattern for grapple/escape/gatekeep/fact-check.
- Stealth and perception interactions, including passive perception equivalent.
- Group skill checks, aid another, take-10, take-20, and assist actions.
- Chase rules (vehicular and on foot) at least at sketch level — the digital nomad setting includes scooter chases and airport sprints.
- Initiative variants for ambush, social ambush, and "you walked into the wrong DM."
- Multiclassing rules, including how class-skill lists, BAB-equivalent, and saves combine.
- Retraining and respec windows.

Relevant files:

- `rules/combat_system.md`
- `rules/status_afflictions.md`
- `classes/classes.csv`
- `monsters/monsters.csv`

### 13. Downtime, Rest, Recovery, and Travel

Goal: time passes between encounters, and the rules say what happens.

Deliverables:

- Short rest / long rest equivalents: what they restore (Chill, spell slots, ability uses), how long they take, how often per day.
- Recovery cadence for Heat, Cringe, and other persistent meters.
- Downtime activities: work jobs, repair reputation, build influence, craft, research, train, recover from Triggered, mend a relationship, ghost a faction.
- Time-tracking rules: in-fiction days/weeks per session, how faction clocks tick relative to time.
- Travel rules between regions (Bangkok ↔ Bali ↔ Taipei ↔ etc.): scooter, rideshare, plane, train, walk-of-shame. Each with cost, time, complication tables.
- Mounts/vehicles at least as a stub: GrabBike, scooter, party van, surfboard.
- Encounter-to-encounter resource recovery (per-scene vs. per-day vs. per-rest) — must be defined for class features and spells to be balanced.

Relevant files:

- `rules/dm_manual.md`
- `rules/combat_system.md`
- `rules/influence_system.md`
- `jobs/jobs_template.csv`

### 14. Hazards and Environmental Effects

Goal: hazards become structured content, not semicolon-only tags.

Deliverables:

- Create `hazards/hazards.csv` with columns: `id, name, trigger, detect_dc, disable_dc, save_type, save_dc, effect_text, condition_ids, damage_formula, damage_type, recurrence, region_tags, version, is_active`.
- Migrate the hazard tags currently in `locations/locations.csv` and `encounters/encounters.csv` into structured rows.
- Harvest hazards from `locations/locations.md` (panic-WiFi outage, judgmental noise, gentrification heat, food poisoning, language barrier, scammer alley).
- Add a Zod schema in `packages/content-schema/src/index.ts`.
- Extend `tools/content_audit.py` to check that every `hazard_ids` reference resolves.
- Define how hazards contribute to encounter budget alongside monsters.

Relevant files:

- `locations/locations.csv`
- `locations/locations.md`
- `encounters/encounters.csv`
- `packages/content-schema/src/index.ts`
- `tools/content_audit.py`

### 15. App Surface Contracts and Rule Engine

Goal: the scope-of-work names what app surfaces consume each content type, so structural decisions don't have to be re-litigated when the UI starts.

Deliverables:

- Encounter Runner contract: which fields the GM view reads, which buttons fire which engine actions, what the player view shows.
- Character Workbench contract: validation rules at character creation, what the engine refuses, retraining flows.
- Compendium contract: cross-link rules between entity pages (NPC → factions/quests/encounters, location → hazards/encounters, spell → conditions, etc.).
- Session Save State: the canonical shape of a campaign-in-flight (PC sheets, faction clock values, NPC dispositions, calendar, played encounters, banner-event log).
- Rule Engine API: the function signatures `packages/engine` must expose to drive the Encounter Runner deterministically (roll, applyDamage, applyCondition, advanceClock, resolveSocialGrapple, etc.).
- A scoped subset of these contracts that aligns to Phase 2 of `technical-design.md`, separate from the Phase 4 AI narrator subset.

Relevant files:

- `technical-design.md`
- `apps/web/lib/compendium.ts`
- `apps/web/lib/session-store.ts`
- `packages/engine/`
- `packages/content-schema/src/index.ts`

### 16. AI Narrator Guardrails

Goal: when Phase 4 lands, the AI narrator must stay inside the rules and the safety boundaries.

Deliverables:

- Define which actions are "engine-only" (dice, damage, condition application, clock ticks) vs. "narrator-allowed" (description, NPC voice, scene framing).
- Tag every encounter, NPC, and monster with an "AI-runnable" boolean and notes for narrators that need extra guardrails (e.g., culturally sensitive scenes).
- A blocked-content list and a tone style guide the narrator must follow per campaign.
- Replay/audit format: every narrator turn includes the structured action it asked the engine to take, so the GM can review.
- Test fixtures: 3-5 canonical encounter transcripts the narrator should be able to reproduce.

Relevant files:

- `technical-design.md`
- `packages/engine/`
- `encounters/encounters.csv`
- `npcs/npcs.csv`
- `monsters/monsters.csv`

### 17. Content Provenance, Versioning, and Licensing

Goal: when CSVs change, running campaigns and published artifacts know which version they are pinned to, and the project knows what it can legally distribute.

Deliverables:

- Per-row `version` and `is_active` are already present on most CSVs — formalize the version bump policy and what triggers a new version vs. an in-place edit.
- Campaign save state should pin a content snapshot (commit hash or content build hash) so a session never sees a quietly changed encounter mid-arc.
- `LICENSE.md` for the repo, plus `rules/LICENSE.md` confirming what is original DDN content vs. PF/3.5-adjacent vocabulary used as compatibility scaffolding.
- An attribution/provenance note on any content that draws from real cultures, communities, or trademarks.
- Decide whether the public web app ships the full ruleset or a derivative, and document the scope.

Relevant files:

- `README.md`
- `technical-design.md`
- `tooling/content-build/src/build-content.ts`
- `tools/content_audit.py`

## Suggested Milestones

### Milestone 1: Campaign Skeleton

- Pick flagship campaign.
- Add campaign module folder.
- Write 3-5 act outline and 8-12 session plan.
- Link existing quests, NPCs, factions, and locations into that campaign.
- Extend audit to flag campaign linkage gaps.

### Milestone 2: Rules Legality

- Finish races/origins and feats.
- Define class progression format.
- Define skill ranks/class skills.
- Finalize social attack bonus, save rules, DC bands, XP/milestone, and wealth pacing.

### Milestone 3: Encounter Pack

- Convert prose encounters.
- Add 30-50 structured encounters for the flagship campaign.
- Add hazards, rewards, failure states, and APL/challenge guidance.
- Link every flagship quest to encounter rows.

### Milestone 4: Effects and Rewards

- Migrate spells to structured effect schema.
- Add condition IDs.
- Expand weapons, magic items, and treasure.
- Tie rewards to level, wealth, and faction/influence consequences.

### Milestone 5: Run-Ready Release

- Add player quickstart and GM guide.
- Add printable sheet or app-ready sheet schema.
- Run audit clean.
- Playtest the first 2 sessions and update balance notes.

### Milestone 6: Safety, Edge Cases, and Session Zero

- Ship `rules/safety_tools.md` and `rules/session_zero.md`.
- Add content warnings and sensitivity tags to campaigns and encounters.
- Resolve combat edge cases: crit/fumble, 0-Chill outcome, NPC initiative, concentration, contested checks.
- Define short rest, long rest, and downtime cadence.
- Ship 4-6 validated pregens and a 1-session quickstart.

### Milestone 7: Hazards, Travel, and Tooling Lift

- Create `hazards/hazards.csv` and migrate tags into structured rows.
- Add travel rules, time tracking, and faction-clock cadence.
- Extend audits to enforce hazard references, content-warning coverage, and encounter-budget completeness.
- First Encounter Runner / Character Workbench contracts in `packages/engine`.

### Milestone 8: Engine, Narrator, and Provenance

- Implement deterministic rule engine API for Phase 2/3 surfaces.
- Lock the AI narrator guardrails contract and tag content for AI-runnable scenes.
- Pin content versioning into campaign save state.
- Resolve licensing and provenance for the public web release.

## Immediate High-Value Tasks

1. Create `races/races.csv`, `feats/feats.csv`, `jobs/jobs.csv`, and `miscellaneous_objects/miscellaneous_objects.csv`.
2. Choose the first full campaign and populate its `featured_*` fields in `campaigns/campaigns.csv`.
3. Populate `campaign_id` in `quests/quests.csv` for quests belonging to the chosen campaign.
4. Convert `encounters/encounters.md` into structured `encounters/encounters.csv` rows.
5. Add encounter budget fields to encounters: `apl`, `effective_challenge_rating`, `xp_value`, `treasure_budget`, `faction_clock_effects`.
6. Add a structured condition/effects table and migrate spell records toward `spells/spells_template.csv`.
7. Extend `tools/content_audit.py` so this scope becomes enforceable.

## Open Questions

These are unresolved design choices that downstream work will block on. They are listed once here so they can be settled deliberately.

1. **Skill system shape.** Pathfinder-style skill ranks per level, 5e-style proficiency bonus, or DDN-native flat tiers? This decides class skill lists, background grants, and DC bands.
2. **Advancement curve.** XP table, milestone, or hybrid? If XP, the table needs to be authored. If milestone, the campaign acts must define the trigger beats.
3. **Save model.** Keep DDN-custom primary/secondary/untrained, or map to Fortitude/Reflex/Will, or both with a translation table?
4. **Social attack progression.** Linear (`level + ability mod`), tiered (martial vs. caster), or per-class (full / 3/4 / 1/2 BAB equivalents)?
5. **0-Chill outcome.** Triggered → Cancelled → Burnout? With what durations and recovery rules?
6. **Multiclass policy.** Free multiclass, gated by an ability prerequisite, or single-class only at launch?
7. **Magic item attunement equivalent.** Slot-based, "personal brand" cap, or unlimited?
8. **Action-economy parity.** PCs roll Vibe Check; do all NPCs/monsters roll, or do bands of foes share initiative slots?
9. **Currency.** GP/SP/CP, cash in local currency by region, or a single DDN abstraction (BTC + favors)?
10. **Race vs. origin terminology.** The repo uses both. Pick one as the canonical user-facing term and rename consistently.
11. **Stereotype-comedy review process.** Who signs off, what's the rubric, what's the appeal path?
12. **Public release scope.** Does the public web app ship the full rules and content, or a derivative? This determines licensing and content provenance work.
13. **AI narrator engine boundary.** What is the smallest set of structured actions the narrator must call into, and what is it allowed to improvise around?
14. **Content versioning vs. live edits.** Snapshot per session, snapshot per campaign, or live with a warning banner?

## Inconsistencies Resolved in This Revision

- `monsters/monsters.csv` is now listed under Current Local Context. It was previously referenced by Sections 4 and 5 but never inventoried.
- `armors/armors.csv` is now flagged explicitly as a legacy duplicate alongside `armors_database_formatted.csv`, with a deprecation decision called out.
- Hazards are now treated as a missing entity type rather than an undifferentiated tag string. A new section (Section 14) defines the `hazards/hazards.csv` schema.
- "Race" vs. "origin" terminology mismatch is now flagged in Open Questions instead of being silently inconsistent across sections.
- Compatibility Gaps now includes 0-Chill outcome, crit/fumble, NPC initiative, concentration, contested checks, multiclass, attunement-equivalent, hazards-as-data, and group-skill mechanics — gaps that the original revision did not name.

## Current Audit Snapshot

Ran `python3 tools/content_audit.py` on 2026-05-02.

Warnings:

- `feats/feats_template.csv` exists without `feats/feats.csv`.
- `jobs/jobs_template.csv` exists without `jobs/jobs.csv`.
- `miscellaneous_objects/miscellaneous_objects_template.csv` exists without `miscellaneous_objects/miscellaneous_objects.csv`.
- `races/races_template.csv` exists without `races/races.csv`.

Info:

- `races/races_template.csv` still uses generic fantasy sample content instead of DDN content.

No current audit errors.
