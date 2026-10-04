# Content Coherence Audit & Remediation Plan

> Status: remediation implemented on `codex/content-coherence-audit-plan`; strict vocabulary audit
> is clean. Owner decisions captured below.
> Date: 2026-05-31. Original linter baseline: **95 ERROR / 38 WARN / 16 INFO** (vocabulary
> section). Current strict vocabulary audit: **0 ERROR / 0 WARN / 0 INFO**.

This document is the single source of truth for the content-cohesion effort. It records what was
misaligned, which decisions resolved it, and how to keep the drift from returning. Run
`python3 tools/content_audit.py` for the live, line-addressed report.

---

## 1. The core finding

The repo has a genuinely well-designed **canon**:

- `rules/combat_system.md` — the combat chassis (resolution, stats, damage types, action economy)
- `rules/status_afflictions.md` — every condition, buff, and debuff (the condition source of truth)
- `rules/content_schema_standards.md` — the target data model (structured effect fields, controlled IDs)

The original problem was that the canon was written **after** most of the content. That left **three
generations of schema layered in one repo**, with the magic/item/attack interaction vocabulary only
lining up in the newest, smallest layer. The remediation pass has now migrated the main back-catalogue
to that canon.

**Current compliance map:**

| File | Rows | Schema generation | State |
|------|------|-------------------|-------|
| `weapons/weapons.csv` | 3 | Current (canon) | ✅ Reference template |
| `magic_items/magic_items.csv` | 3 | Current (canon) | ✅ Reference template |
| `armors/armors.csv` | 60 | Migrated item/outfit schema | ✅ Controlled vocabulary clean |
| `equipment/items.csv` | 53 | Migrated item/gear schema | ✅ Canon duplicates retired/redirected |
| `monsters/monsters.csv` | 89 | Migrated monster schema | ✅ Uses `cringe_resistance`/`chill` |
| `spells/spells.csv` | 105 | Migrated spell schema | ✅ Structured mechanics columns |

This is not "bad content." The brand voice is strong and the captions read cleanly. The incoherence
is **mechanical/vocabulary drift**, which is invisible to the old structural audit (it passed clean)
but obvious to a reader. The fix is conforming the back-catalogue to a canon that already exists.

---

## 2. Priority 1 — Interaction-system alignment (resolved)

Five vocabularies were fractured. They were unified first because spells, monsters, items, and
conditions all have to speak one mechanical language.

### A. Damage types — forbidden physical types everywhere
Canon (`rules/combat_system.md:104-113`) defines exactly six: **Psychic, Sonic, Reputation, Cringe,
Necrotic, Poison** — and explicitly says *"If an old file says slashing, bludgeoning… convert it."*

- Baseline offenders included monster `bludgeoning`/`slashing`, item effect strings such as
  `damage:1d6:STR:bludgeoning`, and orphaned damage references like fire, water, crash, and age.
- Current state: those rows have been converted or rewritten to canon damage/resource effects.

**→ Decision (owner): collision damage maps to Cringe damage + forced movement (Prone/Shove), not a
new damage type.**

### B. Conditions — suffix drift + an undefined state
`status_afflictions.md` is the source of truth. Baseline monster/spell rows used unsuffixed shorthand:
`(Charm)`×4, `(Stun)`×3, `(Confusion)`×3, `(Frighten)`, `(Blindness)`, `(Paralyze)`. These have been
normalized to canonical conditions.

- `Paralyze`/"Paralyzes" was normalized to **Stunned**.
- `Sleep` and sleep-causing `Unconscious` now point at the new **Asleep** condition.

**→ Decision (owner): add an "Asleep" condition to `status_afflictions.md`; point all sleep sources at it.**

### C. Defense & health field names — propagated
The largest structural misalignment was the chassis rename. Canon uses **Cringe Resistance** and
**Chill**; `monsters/monsters.csv` now uses `cringe_resistance` and `chill`, and inline AC/HP wording
has been converted where it affected mechanics.

### D. Currency — `gp`/`gold` leakage resolved
Schema says `cash_cp` / `cost_btc`, never gold. Baseline leaks included GP regeneration, gold-loss
resistance, mixed armor costs, paywall wording, and original quest rewards. Current migrated rows use
controlled currency/resource IDs.

### E. Off-brand raw-D&D imports
Baseline mechanics pasted from D&D without setting conversion included "Wall of Force",
"Counterspell", "Power Word Kill - Lite", "Banishment", "Detect Evil/Alignment", "True Seeing",
alignment labels, and bare spell-name effects. The migrated content replaces those with setting
language or canonical conditions.

### F. Stats that don't exist
Baseline rows referenced **Sanity** as a stat, but there is no Sanity track. Those references have
been converted to Chill or controlled reward/resource terms.

---

## 3. Priority 2 — Cross-file contradictions (same object, different rules)

`equipment/items.csv` duplicated items that also live in the canon-compliant files, with conflicting
stats:

| Item | weapons/magic_items.csv (canon) | equipment/items.csv (legacy) |
|------|----------------------------------|------------------------------|
| Mechanical Keyboard | INT, **sonic**, 1500cp, rare | STR **bludgeoning** + CON sonic, 150cp |
| Selfie Stick | DEX, **cringe**, 120cp | DEX **bludgeoning**, 15cp |
| Power Bank of Infinite Charge | rare, 9000cp, attunement, charges | **legendary**, 5000 **btc**, no charges |

Current state: the canon files win, and the `items.csv` duplicates have been retired or redirected.

---

## 4. Priority 3 — Schema drift: mechanics buried in prose

`content_schema_standards.md:52-75` mandates structured effect fields (`save_type`,
`save_dc_formula`, `damage_type`, `condition_ids`, `duration`, `concentration`…).

- `spells.csv` moved from prose-only mechanics to structured fields.
- `monsters.csv` moved from mixed authoring eras into a single migrated schema.
- `armors.csv` now has universal fields and structured item/outfit columns.

---

## 5. Priority 4 — Caption / flavor coherence

The brand voice holds; issues are localized:

- **Flavor doing the job of rules** was the main baseline risk; migrated high-risk rows now separate
  structured mechanics from flavor/rules text where the schemas support it.
- Captions that referenced mechanics that do not exist, including `Sanity` and `Cloudkill`, were
  normalized or removed from the migrated rows.
- English itself is clean — no broken grammar. The incoherence is mechanical, not linguistic.

---

## 6. Priority 5 — Quests: the "awkward standalones"

Confirmed, with a concrete cause. The **Limited Run pack** (`quests.csv:32-44` +
`campaigns/limited_runs/README.md`) is a polished, fully-linked chain (campaign_id + linked
encounters + faction clocks) that reuses the NPCs/locations of the **original 30 quests**. The
originals are effectively unlinked seeds/prequels of arcs that already exist:

| Standalone original (no campaign_id) | Limited-Run expansion |
|--------------------------------------|------------------------|
| The Lost WiFi Password (Barista Kyle, avocado cafe) | Last Outlet Heist / QR Menu of Doom |
| The Visa Run (Embassy Official) | Visa Counter Speedrun |
| The Influencer's Meltdown (Tiffany) | Rooftop Ring Light Eclipse |
| The Startup Pitch (Founder) | The Pitch Deck Funeral |
| The Networking Event (Recruiter Dan) | DevCon AI Keynote |
| The Podcast Guest / The 5-Star Review | Podcast Hostage / Review Tribunal |

**Fix:** thread the originals into the matching campaigns via `campaign_id` + `linked_encounter_ids`
(mark them as the intro beat). No new content required.

---

## 7. Tooling delivered

`tools/content_audit.py` now runs in two sections:

1. **Structure & References** (original checks) — reports remaining template housekeeping as
   non-blocking warnings/info.
2. **Controlled Vocabulary** — the interaction-system alignment gate. Flags, with exact
   `file:line`: forbidden damage types, chassis drift (`armor_class`/`hit_points`/inline `AC`/`HP`),
   currency leakage, `Sanity`, condition shorthand drift, suspect elements, and raw D&D imports.

Behavior:

- `python3 tools/content_audit.py` → full report, **exit 0** (non-breaking; safe for existing callers).
- `python3 tools/content_audit.py --strict` → vocab ERROR+WARN gate, currently **exit 0** after the
  migration.

The two canon decisions are baked into the linter (collision→Cringe+forced-movement messaging;
`Asleep` is the valid target for sleep drift).

---

## 8. Remediation plan (ordered to avoid re-work)

> Rule: do **not** mass-generate content until steps 1-3 are done — `content_schema_standards.md:240`
> warns this just "industrializes drift."

### Phase 0 — Canon gaps (prerequisite; small)
- [x] Add an **"Asleep"** condition to `rules/status_afflictions.md` (effect, duration, wake
      conditions: damage / loud noise; sources: Snore, Warm Sound, System Update).
- [x] Add a **collision-damage ruling** note to `rules/combat_system.md`: physical contact →
      Cringe damage + forced movement (Prone/Shove), never `bludgeoning`/`slashing`.

### Phase 1 — Controlled-vocabulary map (small)
- [x] Publish one reference table of valid `damage_type`, `condition_id`, and `currency_id` values
      (the linter already encodes these — promote them into a doc the team can cite).

### Phase 2 — Linter as gate (done; flip the switch later)
- [x] Vocabulary linter built into `tools/content_audit.py`.
- [x] Refresh linter targets for migrated columns.
- [x] Wire `--strict` into the available package gate after Phase 4 lands. This repo has no CI
      workflow yet, so `pnpm check` now runs `content:audit:strict`.

### Phase 3 — Migrate the big files (the bulk of the work, in dependency order)
- [x] `spells/spells.csv` → structured schema (`save_type`, `damage_type`, `condition_ids`, …);
      resolve paralyze→Stunned, sleep→Asleep, "Dominate Person"→Charmed, drop the bare-D&D names.
- [x] `monsters/monsters.csv` → rename `armor_class`→`cringe_resistance`, `hit_points`→`chill`;
      convert `bludgeoning`/`slashing` to Cringe + forced movement; suffix all conditions; structure
      the terse-era rows to match the detailed-era format.
- [x] `armors/armors.csv` → add `id`/`version`/`is_active`/`tags`; normalize `cost` to `cost_cp`;
      remove orphaned damage/condition refs (Water/Crash/Age, Sanity).
- [x] `equipment/items.csv` → de-duplicate against `weapons.csv`/`magic_items.csv`; fix `bludgeoning`
      effect strings; replace `Cloudkill` reference.

### Phase 4 — Quests
- [x] Thread the original 30 standalone quests into their Limited Run campaigns
      (`campaign_id` + `linked_encounter_ids`); normalize `gp` rewards to `cash_cp`/`cost_btc` and
      replace `Sanity`/`Karma`/etc. reward tokens with controlled `reward_type` values.

### Phase 5 — Lock it
- [x] Enable `--strict` in the repo's available validation gate. Drift can no longer return through
      `pnpm check`; add CI workflow wiring separately if/when the repo introduces CI.

---

## 9. Decisions log

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | Collision damage → **Cringe + forced movement** | Stays on-brand ("violence is vibes"); avoids a 7th damage type |
| 2 | Add **"Asleep"** condition to canon | Sleep sources existed with no defined condition to point at |
| 3 | Linter introduced **non-breaking by default**, gated under `--strict` | Lets the tool ship before the 95-error back-catalogue is migrated |
