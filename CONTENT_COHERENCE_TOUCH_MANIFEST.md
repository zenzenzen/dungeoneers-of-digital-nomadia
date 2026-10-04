# Content Coherence Touch Manifest

> Branch: `codex/content-coherence-audit-plan`
> Source plan: `CONTENT_COHERENCE_AUDIT.md`
> Housekeeping update: 2026-05-31
> Rule: do not edit outside this manifest without adding the file here first.

This manifest bounds the remediation work for the content-coherence effort. It separates files that
may be edited from files that are canon/reference-only inputs for the rewrite and evaluation agents.

---

## Write Targets

| File | Phase | Owner lane | Planned touch | Validation |
|------|-------|------------|---------------|------------|
| `CONTENT_COHERENCE_AUDIT.md` | Coordination | parent | Preserve audit as source plan; update only if decisions change | Review diff for decision drift |
| `CONTENT_COHERENCE_TOUCH_MANIFEST.md` | Coordination | parent | Track every planned write/read scope | File stays current before new edits |
| `CONTEXT.md` | Context | parent | Summarize current canon, validation commands, and worktree caveats for future agents | New agent can start without reading the full audit first |
| `.cursorrules` | Context | parent | Align agent-facing creation rules with controlled vocabulary and migrated schemas | No stale GP/AC/HP/physical-damage guidance remains |
| `README.md` | Context | parent | Update public project context, canon references, and validation commands | README points at current canon and audit docs |
| `rules/status_afflictions.md` | 0 | canon worker | Add `Asleep` as a canonical condition with wake rules and source list | Sleep references point to `Asleep` |
| `rules/combat_system.md` | 0 | canon worker | Add collision-damage conversion note: physical contact maps to Cringe plus forced movement | No new physical damage type introduced |
| `rules/controlled_vocabulary.md` | 1 | canon worker | New reference table for valid `damage_type`, `condition_id`, and `currency_id` values | Values match canon docs and linter constants |
| `tools/content_audit.py` | 2 | parent/tooling worker | Keep vocabulary linter; adjust only if canon vocabulary changes | `python3 tools/content_audit.py`; `python3 tools/content_audit.py --strict` after migration |
| `spells/spells.csv` | 3 | spells worker | Migrate from prose-only mechanics to structured spell fields; resolve paralyze/sleep/raw-D&D drift | CSV parses; no forbidden vocab in spell rows |
| `spells/spells_template.csv` | 3 | spells worker | Align template columns to migrated spell schema | Header matches `spells/spells.csv` |
| `monsters/monsters.csv` | 3 | monsters worker | Rename chassis fields to `cringe_resistance`/`chill`; normalize attacks, damage, and conditions | CSV parses; no `armor_class`, `hit_points`, `bludgeoning`, or `slashing` |
| `monsters/monsters_template.csv` | 3 | monsters worker | Align template columns to migrated monster schema | Header matches `monsters/monsters.csv` |
| `armors/armors.csv` | 3 | armor/equipment worker | Add universal columns; normalize cost to `cost_cp`; remove orphan refs such as Water/Crash/Age/Sanity | CSV parses; effects use controlled vocabulary |
| `armors/armors_template.csv` | 3 | armor/equipment worker | Align template columns to migrated armor schema | Header matches `armors/armors.csv` |
| `armors/armors_database_formatted.csv` | 3 | armor/equipment worker | Keep duplicate armor source coherent with migrated armor vocabulary or retire it explicitly | No stale Sanity/Water/Crash/Age drift remains |
| `equipment/items.csv` | 3 | armor/equipment worker | De-duplicate canon weapon/magic-item rows; fix damage strings and undefined spell refs | CSV parses; canonical duplicates retired or redirected |
| `equipment/equipment_template.csv` | 3 | armor/equipment worker | Align template columns to migrated item/gear schema | Header matches `equipment/items.csv` |
| `hazards/hazards.csv` | 3 | coherence gap worker | Normalize condition shorthand drift such as `charm` to canonical condition names | CSV parses; hazard effects use canonical conditions |
| `npcs/npcs.csv` | 4 | coherence gap worker | Normalize leaked `GP` and raw alignment terms that contradict setting vocabulary | CSV parses; no obvious currency/alignment drift remains |
| `quests/quests.csv` | 4 | quests worker | Thread original quests into Limited Run campaigns; normalize rewards and reward types | CSV parses; original quests have campaign linkage where applicable |
| `quests/quests_template.csv` | 4 | quests worker | Align template with any reward/linkage schema changes | Header matches `quests/quests.csv` |
| `campaigns/campaigns.csv` | 4 | quests worker | Update if campaign rows need bidirectional quest/encounter membership; remove stray HP terminology | Featured quest lists remain coherent |
| `campaigns/limited_runs/README.md` | 4 | quests worker | Update only if intro-beat threading needs documented campaign order | README agrees with quest campaign links |
| `packages/content-schema/src/index.ts` | Tooling | tooling worker | Update Zod schemas for migrated monster/spell/item/armor fields | `corepack pnpm run content:build` validates migrated CSVs |
| `apps/web/lib/compendium.ts` | Tooling | tooling worker | Update monster types/transforms for `chill`, `cringe_resistance`, `actions`, `traits` | Web TypeScript build/lint uses migrated fields |
| `apps/web/lib/content/monsters.ts` | Tooling | tooling worker | Update monster loader/view model for migrated monster fields | Monster pages read migrated CSV columns |
| `apps/web/app/page.tsx` | Tooling | tooling worker | Replace legacy AC/HP display language on home content cards | UI copy matches canon chassis |
| `apps/web/app/compendium/monsters/page.tsx` | Tooling | tooling worker | Update search/card metadata to migrated monster fields | Compendium list renders migrated monsters |
| `apps/web/app/compendium/monsters/[slug]/page.tsx` | Tooling | tooling worker | Update detail stat labels/values to Cringe Resistance and Chill | Monster detail page matches canon chassis |
| `package.json` | 5 | parent/tooling worker | Add or adjust strict audit script only after content migration passes | Existing scripts still work |

Phase 5 note: during remediation this repo had package scripts but no visible CI workflow file.
Treat `package.json` script wiring as the first strict-gate step if the package/web workspace is
present; add CI workflow wiring only after a CI target exists or is intentionally introduced.

Current worktree caveat: as of the 2026-05-31 housekeeping update, tracked `apps/`, `packages/`,
`tooling/`, root package, and pnpm workspace files are deleted from the working tree. Do not restore
or further edit them without explicit user direction. The content audit remains runnable.

Generated but ignored outputs may be rewritten by validation/build commands and should not be
committed unless the repo policy changes: `packages/content/generated/*.json` and
`apps/web/public/content/*.json`.

---

## Read-Only Canon Inputs

| File | Used for |
|------|----------|
| `rules/content_schema_standards.md` | Target columns, structured-effect rules, universal fields |
| `rules/combat_system.md` | Combat chassis, damage taxonomy, Cringe Resistance/Chill conversion priority |
| `rules/status_afflictions.md` | Canon condition names, buffs, debuffs, condition interactions |
| `weapons/weapons.csv` | Canon source of truth for weapon duplicates in `equipment/items.csv` |
| `magic_items/magic_items.csv` | Canon source of truth for magic-item duplicates in `equipment/items.csv` |
| `campaigns/campaigns.csv` | Campaign IDs and featured content for quest threading |
| `encounters/encounters.csv` | Valid encounter IDs for `linked_encounter_ids` |
| `npcs/npcs.csv` | Valid quest giver and named NPC references; writable only for coherence-gap cleanup |
| `locations/locations.csv` | Valid quest and encounter location references |
| `factions/factions.csv` | Valid sponsoring/opposition faction references |
| `hazards/hazards.csv` | Valid hazard IDs for encounter references; writable only for coherence-gap cleanup |

`campaigns/campaigns.csv`, `npcs/npcs.csv`, `hazards/hazards.csv`, `rules/combat_system.md`, and
`rules/status_afflictions.md` appear in both sections because some lanes may edit them while other
lanes must treat them as canon inputs.

---

## Delegation Lanes

### Canon Worker

- Write scope: `rules/status_afflictions.md`, `rules/combat_system.md`,
  `rules/controlled_vocabulary.md`.
- Non-goal: mass-edit content rows.
- Pass condition: new canon decisions are explicit and citeable.

### Spells Worker

- Write scope: `spells/spells.csv`, `spells/spells_template.csv`.
- Non-goal: change monsters/items to match spells.
- Pass condition: spell rows use structured mechanics and canonical condition/damage vocabulary.

### Monsters Worker

- Write scope: `monsters/monsters.csv`, `monsters/monsters_template.csv`.
- Non-goal: change global canon or spell definitions.
- Pass condition: monster chassis and attacks use `chill`, `cringe_resistance`, canonical damage,
  and canonical condition names.

### Armor/Equipment Worker

- Write scope: `armors/armors.csv`, `armors/armors_template.csv`, `equipment/items.csv`,
  `equipment/equipment_template.csv`, `armors/armors_database_formatted.csv`.
- Non-goal: change canon weapon or magic-item rows.
- Pass condition: legacy gear uses the item schema direction and does not contradict
  `weapons/weapons.csv` or `magic_items/magic_items.csv`.

### Coherence Gap Worker

- Write scope: `hazards/hazards.csv`, `npcs/npcs.csv`.
- Non-goal: broad NPC rewrite, new hazards, or quest/campaign edits.
- Pass condition: evaluator-reported manifest gaps are normalized or explicitly documented as
  false positives.

### Tooling Worker

- Write scope: `packages/content-schema/src/index.ts`, `apps/web/lib/compendium.ts`,
  `apps/web/lib/content/monsters.ts`, `apps/web/app/page.tsx`,
  `apps/web/app/compendium/monsters/page.tsx`,
  `apps/web/app/compendium/monsters/[slug]/page.tsx`, with optional `package.json` script additions.
- Non-goal: content-row rewrites.
- Pass condition: content build and web consumers understand migrated monster/spell/gear schemas.

### Quests Worker

- Write scope: `quests/quests.csv`, `quests/quests_template.csv`, with conditional edits to
  `campaigns/campaigns.csv` and `campaigns/limited_runs/README.md`.
- Non-goal: invent new quest content.
- Pass condition: original standalone quests are threaded into existing campaigns where the audit
  identifies a matching Limited Run expansion, and rewards use controlled values.

### Evaluation Agents

- Write scope: none.
- Read scope: all write targets plus read-only canon inputs.
- Pass condition: report exact remaining contradictions, linter blockers, and any manifest gaps.

---

## Global Validation

Run these from repo root:

```bash
python3 tools/content_audit.py
python3 tools/content_audit.py --strict
```

If the package/web workspace is restored, also run:

```bash
corepack pnpm run check
corepack pnpm --filter @ddn/web exec tsc --noEmit
corepack pnpm --filter @ddn/web build
```

Current expected state: strict controlled-vocabulary audit passes. Remaining structure/reference
warnings are template-housekeeping items unless promoted by a future scope.


## Party-game mode — 2026-10-04

Approved additive pivot tracked in `party-game/docs/IMPLEMENTATION.md`. New scope: `party-game/**`, `.icm/**`, `rules/party_game.md`; append navigation/context to `README.md` and `CONTEXT.md`. Original content and existing legacy-workspace deletions remain preserved.

## Launch PR packaging — 2026-10-04

User authorization: publish the full current overhaul as a new GitHub pull request. Include the previously present content-coherence changes, design/brand assets, independent party-game application, and legacy app/package removals. Exclude OS files, credentials, databases, installed dependencies, and disposable runtime/test output. Refresh the root README and CONTEXT.md for the active party mode; add repository ignore rules and CI validation without restoring the retired monorepo. Preserve existing source jokes and prices. Verify the staged package from a clean exported tree before pushing.

## Initial monster artwork preparation — 2026-10-04

Research current image models and prepare a six-image comparison using three existing monsters. Write scope: `party-game/content/art-pilot/**`, `party-game/scripts/prepare-monster-art.mjs`, `party-game/package.json`, `party-game/docs/ART_PRODUCTION.md`, prompt-guide navigation, and ICM context/commands. Preserve the approved content bundle and original prompt packets. Validation: model parameters against captured provider schemas, exact prompt/source hashes, six prepared requests, content check, and ICM refresh/check. No generation, uploads, or artwork publication belongs to this preparation step.
