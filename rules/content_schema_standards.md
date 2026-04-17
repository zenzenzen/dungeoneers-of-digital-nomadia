# Content Schema Standards

> Flavor text is the brand voice. Rules text is the contract. Stop making them share a toothbrush.

This file defines the content-model direction for Dungeoneers of Digital Nomadia so new material can be funny, consistent, and app-ready at the same time.

## Universal Rules

Every table should eventually include:

- `id`
- `name`
- `version`
- `is_active`
- `tags`
- `flavor_text`
- `rules_text`

Optional but strongly recommended:

- `summary`
- `source`
- `region_tags`
- `art_brief`
- `card_title`
- `card_body`

## Canonical Naming Rules

- Use `challenge_rating` for encounter difficulty
- Use `cringe_resistance` or `cr_bonus` for defense values
- Reserve `CR` for **Cringe Resistance** in prose
- Use controlled IDs for `condition_id`, `damage_type`, `currency_id`, `resource_id`, `skill_id`, and `faction_id`

## Flavor vs Rules

Every record should separate:

- **Flavor text**: the Steve Jackson energy, millennial despair, and Gen Z side-eye
- **Rules text**: exact mechanics

Bad:

- one sentence that is both a joke and the only place a DC is mentioned

Good:

- `flavor_text`: "A power bank held together by stickers and spite."
- `rules_text`: "Gain 1 use of Power Loss immunity per long rest."

## Structured Effects

Do not bury real mechanics in description fields.

Each effect should be representable with structured fields such as:

- `action_type`
- `range`
- `area`
- `targeting`
- `attack_stat`
- `save_type`
- `save_dc_formula`
- `damage_formula`
- `damage_type`
- `condition_id`
- `duration`
- `concentration`
- `uses`
- `recharge`
- `resource_cost`
- `summon_id`

If a file cannot hold that directly, add `effects_json` or split to child rows later.

## Recommended Per-Entity Columns

### Classes

- `id`
- `name`
- `hit_die`
- `primary_stat`
- `save_primary`
- `save_secondary`
- `features`
- `tags`
- `version`
- `is_active`

`classes/classes.csv` is currently the closest thing to the canonical pattern.

### Backgrounds

- `background_id`
- `name`
- `class_id` or `class_restriction`
- `skill_ids`
- `tool_ids`
- `language_ids`
- `starting_gear`
- `feature_id`
- `flavor_text`
- `mechanical_notes`
- `version`
- `is_active`

Do not keep section headers as fake CSV rows.

### Skills

- `skill_id`
- `name`
- `governing_ability`
- `skill_category`
- `parent_skill_id`
- `description`
- `example_use`
- `version`
- `is_active`

`governing_ability` must always be one of `STR, DEX, CON, INT, WIS, CHA`.

### Spells and Abilities

- `spell_id`
- `name`
- `level`
- `school`
- `caster_class_ids`
- `action_type`
- `range`
- `targeting`
- `save_type`
- `save_dc_formula`
- `damage_formula`
- `damage_type`
- `condition_ids`
- `duration`
- `concentration`
- `flavor_text`
- `rules_text`
- `tags`
- `version`
- `is_active`

### Monsters

- `monster_id`
- `name`
- `role`
- `type`
- `size`
- `challenge_rating`
- `chill`
- `cringe_resistance`
- `speed`
- `abilities`
- `actions`
- `reactions`
- `traits`
- `loot`
- `flavor_text`
- `tags`
- `version`
- `is_active`

### Items and Gear

- `item_id`
- `name`
- `category`
- `subtype`
- `slot`
- `rarity`
- `cost_cp`
- `cost_btc`
- `acquisition_type`
- `sell_value_cp`
- `weight_lb`
- `attunement_required`
- `effects_json`
- `flavor_text`
- `rules_text`
- `tags`
- `version`
- `is_active`

Use `acquisition_type` to preserve things like `free`, `rental`, `exposure`, or `varies` instead of flattening them into fake prices.

### NPCs, Quests, and Encounters

NPCs need:

- `npc_id`
- `faction_id`
- `disposition`
- `trust`
- `access`
- `leverage`
- `heat`

Quests need:

- `quest_id`
- `quest_giver_npc_id`
- `reward_type`
- `failure_state`
- `linked_encounter_ids`

Encounters need:

- `encounter_id`
- `enemy_ids`
- `hazard_ids`
- `location_id`
- `win_condition`
- `loss_condition`
- `reward_ids`

## Currency and Resources

Standardize these as first-class entities:

- `cash_cp`
- `btc`
- `exposure`
- `therapy_healedness`
- `social_capital`
- `temp_chill`

Do not use `gp`, `gold`, `BTC`, and `cash` interchangeably inside rules text if the app will ever need to read it.

## Migration Priorities

1. Fix malformed CSVs and comment rows inside data files.
2. Normalize IDs and controlled vocabularies.
3. Convert prose mechanics into structured effect data.
4. Update templates and import tooling.
5. Only then do mass content generation, because otherwise you are industrializing drift.
