# Controlled Vocabulary

This is the citeable reference for controlled values used by structured content fields. Use the
lowercase ID in data and the display name in prose.

## ID Rules

- Use lowercase `snake_case` IDs in CSV fields.
- Use semicolons for multi-value fields such as `condition_ids`.
- Do not invent new IDs in row prose. Add them here and to the relevant canon rule file first.
- Display names in `rules/status_afflictions.md` are canonical; IDs are their lowercase data form.
- Parenthetical display text is dropped when it only explains scope, such as `exhaustion`, `slow`,
  and `fomo`. Keep parenthetical text when it disambiguates a family, such as `grappled_social`.

## `damage_type`

| ID | Display | Canon source | Use for |
|----|---------|--------------|---------|
| `psychic` | Psychic | `rules/combat_system.md` | Shame, stress, emotional splash damage |
| `sonic` | Sonic | `rules/combat_system.md` | Yelling, chewing, speakerphone pressure, feedback |
| `reputation` | Reputation | `rules/combat_system.md` | Social standing, credibility, trust, public receipts |
| `cringe` | Cringe | `rules/combat_system.md` | Secondhand embarrassment, style collapse, collision fallout |
| `necrotic` | Necrotic | `rules/combat_system.md` | Draining tedium, burnout, dead-eyed decay |
| `poison` | Poison | `rules/combat_system.md`; `rules/status_afflictions.md` | Toxins, bad food, fumes, substances |

Legacy physical or generic-fantasy damage must be converted before import:

| Legacy term | Canon conversion |
|-------------|------------------|
| `bludgeoning`, `slashing`, `piercing` | Usually `cringe` plus forced movement, `prone_social`, or item loss |
| `thunder` | `sonic` |
| `radiant` | Usually `reputation` or `cringe`, depending on the rule text |
| `fire`, `cold`, `lightning`, `acid` | Rewrite as a canon damage type or a non-damage scene effect |
| `gold damage`, `water damage`, `crash damage`, `age damage` | Rewrite as cash loss, item loss, forced movement, or an existing condition |

## `condition_id`

These IDs come from `rules/status_afflictions.md`.

### Negative Conditions

| ID | Display |
|----|---------|
| `triggered` | Triggered |
| `cancelled` | Cancelled |
| `shadowbanned` | Shadowbanned |
| `burnout` | Burnout |
| `cringed` | Cringed |
| `confused` | Confused |
| `charmed` | Charmed |
| `frightened` | Frightened |
| `stunned` | Stunned |
| `incapacitated` | Incapacitated |
| `bored` | Bored |
| `distracted` | Distracted |
| `panic` | Panic |
| `asleep` | Asleep |
| `annoyed` | Annoyed |
| `embarrassed` | Embarrassed |
| `shamed` | Shamed |
| `judged` | Judged |
| `ghosted` | Ghosted |
| `doubt` | Doubt |
| `uncomfortable` | Uncomfortable |
| `poisoned` | Poisoned |
| `exhaustion` | Exhaustion |
| `hangover` | Hangover |
| `food_poisoning` | Food Poisoning |
| `jet_lag` | Jet Lag |
| `blinded` | Blinded |
| `deafened` | Deafened |
| `obsessed` | Obsessed |
| `craving` | Craving |
| `phone_addiction` | Phone Addiction |
| `fomo` | FOMO |
| `doomscroll_compulsion` | Doomscroll Compulsion |
| `identity_crisis` | Identity Crisis |
| `purposeless` | Purposeless |
| `imposter_syndrome` | Imposter Syndrome |
| `anxious` | Anxious |
| `irritable` | Irritable |
| `slow` | Slow |
| `difficult_terrain_emotional` | Difficult Terrain (Emotional) |
| `cannot_be_ignored` | Cannot Be Ignored |
| `grappled_social` | Grappled (Social) |
| `restrained_social` | Restrained (Social) |
| `prone_social` | Prone (Social) |
| `silenced` | Silenced |
| `surprised` | Surprised |
| `power_loss` | Power Loss |
| `cursed_review` | Cursed (Review) |
| `red_mouth_stain` | Red Mouth Stain |
| `back_pain` | Back Pain |
| `carpal_tunnel` | Carpal Tunnel |

### Positive Statuses And Buffs

| ID | Display |
|----|---------|
| `hustle` | Hustle |
| `haste` | Haste |
| `rage_sprint` | Rage (Sprint) |
| `temp_chill` | Temp Chill |
| `advantage` | Advantage |
| `concentration` | Concentration |
| `clout` | Clout |
| `entitlement_aura` | Entitlement Aura |
| `perfect_lighting` | Perfect Lighting |
| `glass_skin` | Glass Skin |
| `looking_effortless` | Looking Effortless |
| `filter_of_beauty` | Filter of Beauty |
| `hodl` | HODL |
| `muted` | Muted |
| `safe_space` | Safe Space |
| `blocked` | Blocked |
| `dissociated` | Dissociated |
| `boundaries` | Boundaries |
| `wifi_sense` | WiFi Sense |
| `algorithm_understanding` | Algorithm Understanding |
| `misinformation` | Misinformation |
| `receipts_collected` | Receipts Collected |
| `portent` | Portent |
| `dark_knowledge` | Dark Knowledge |
| `local_knowledge` | Local Knowledge |
| `well_fed` | Well-Fed |
| `caffeinated` | Caffeinated |
| `meditated` | Meditated |
| `cat_therapy` | Cat Therapy |
| `hot_spring_soaked` | Hot Spring Soaked |
| `full_chill_restored` | Full Chill Restored |
| `chemical_resistance` | Chemical Resistance |
| `exhaustion_resistance` | Exhaustion Resistance |
| `sugar_immunity` | Sugar Immunity |
| `irony_defense` | Irony Defense |
| `fly_speed` | Fly Speed |
| `teleport_available` | Teleport Available |
| `ethereal` | Ethereal |
| `incognito` | Incognito |
| `cannot_be_found` | Cannot Be Found |

`resistance:<damage_type>` and `immunity:<condition_id>` are effect expressions, not literal
condition IDs. Validate the parameter against this file.

Parenthetical status rows handled specially:

| Display row | Data form |
|-------------|-----------|
| Exhaustion (Levels 1-6) | `exhaustion` |
| FOMO (Fear of Missing Out) | `fomo` |
| Slow (Aura Effect) | `slow` |
| Rage (Sprint) | `rage_sprint` |
| Cursed (Review) | `cursed_review` |
| Resistance (Damage Type) | Use `resistance:<damage_type>` |
| Immunity (Condition) | Use `immunity:<condition_id>` |

### Legacy Condition Canonicalization

| Legacy term | Canon ID |
|-------------|----------|
| `Charm` | `charmed` |
| `Stun` | `stunned` |
| `Confusion` | `confused` |
| `Frighten` | `frightened` |
| `Blindness` | `blinded` |
| `Paralyze`, `Paralyzed`, `Paralysis` | `stunned` |
| `Sleep`, sleep-causing `Unconscious` | `asleep` |
| `Fatigue` | `exhaustion` |

## `currency_id`

Use these IDs for structured money, compensation, and spendable scene resources.

| ID | Use for | Structured columns |
|----|---------|--------------------|
| `cash_cp` | Cash in canonical CP units | `cost_cp`, reward amounts, treasure amounts |
| `btc` | Crypto-denominated cost or reward | `cost_btc` |
| `exposure` | Non-cash compensation paid in attention or portfolio value | `reward_type`, `currency_id` |
| `therapy_healedness` | Recovery progress or therapy reward | `reward_type`, `resource_id` |
| `social_capital` | Scene goodwill, leverage, and favor currency | `resource_id`, `cost_resource_id` |
| `temp_chill` | Temporary Chill granted as a resource | `resource_id` |

Column names such as `cost_cp` and `cost_btc` are amount columns. When a generic `currency_id`
column is used, store `cash_cp` or `btc`.

Forbidden currency terms: `gp`, `sp`, `gold`, `gold pieces`, uppercase `BTC` as an ID, freeform
`cash`, `Sanity`, and `Karma`.
