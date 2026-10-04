# Project Context

Last updated: 2026-10-04.

## Purpose

Dungeoneers of Digital Nomadia contains a satirical source library and an independent browser party game. The active product is Swipe Right, Regret Later in `party-game/`, with solo testing and private multiplayer rooms. Original tabletop content remains preserved; its canon order below applies to that source library. Party gameplay follows `rules/party_game.md` and its versioned executable campaign/card data.

## Canon Source Order

Use this order when files disagree:

1. `rules/combat_system.md`
2. `rules/status_afflictions.md`
3. `rules/controlled_vocabulary.md`
4. `rules/content_schema_standards.md`
5. Structured CSV fields
6. Free-text notes and flavor

Key canon terms:

- Health is `Chill`.
- Defense is `Cringe Resistance`; use `challenge_rating` for monster/encounter difficulty.
- Damage types are `psychic`, `sonic`, `reputation`, `cringe`, `necrotic`, and `poison`.
- Legacy physical damage maps to canon effects, usually Cringe plus forced movement or `prone_social`.
- Currency/resource IDs are controlled; use `cash_cp`, `btc`, `exposure`,
  `therapy_healedness`, `social_capital`, or `temp_chill`.
- `Sanity`, `Karma`, `gp`, `sp`, `gold`, `armor_class`, and `hit_points` are legacy drift.

## Coherence Work

The 2026-05-31 content coherence pass lives on branch `codex/content-coherence-audit-plan`.

- Plan/status: `CONTENT_COHERENCE_AUDIT.md`
- Touched-file manifest: `CONTENT_COHERENCE_TOUCH_MANIFEST.md`
- Controlled vocabulary reference: `rules/controlled_vocabulary.md`

Strict controlled-vocabulary audit is expected to pass:

```bash
python3 tools/content_audit.py --strict
```

The non-strict audit may still report template-housekeeping warnings for categories that have
templates but no data file.

## Legacy workspace retirement

The earlier `apps/`, `packages/`, `tooling/`, root package, and pnpm workspace were already deleted before the party-game implementation. The user authorized including those removals in the launch-overhaul PR on 2026-10-04. Do not restore that workspace implicitly.

Node validation now runs independently inside `party-game/`: use Node 24.19.0, `npm ci`, `npm run check`, `npm run build`, and `npm run test:e2e`. The Python audit still validates the original library.

## Editing Rules

- Do not hand-edit ignored generated outputs under `packages/content/generated/` or
  `apps/web/public/content/`.
- Add any new coherence-touch target to `CONTENT_COHERENCE_TOUCH_MANIFEST.md` before editing it.
- Preserve flavor text when migrating rows; move mechanics into structured fields instead of
  deleting jokes.
- Prefer IDs over display names in references.


## Party-game pivot — 2026-10-04

`party-game/` is the independent browser implementation of Swipe Right, Regret Later. Its explicit mode contract is `rules/party_game.md`; do not apply the old d20 chassis inside this app. The old tracked app/package deletions remain preserved. The app has its own npm lockfile, Node 24 runtime, deterministic server engine, SQLite persistence, generated source catalogue, and Docker/Railway configuration.

Use `.icm/` for routed project context. Read `party-game/docs/VERIFICATION.md` before claiming delivery; local verification, live hosting, and human playtests are distinct gates.
