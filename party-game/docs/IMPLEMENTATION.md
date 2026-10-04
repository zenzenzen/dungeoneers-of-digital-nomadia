# Party game implementation — 2026-10-04

Approved scope: Swipe Right, Regret Later; private 3–6 player rooms; random class and trait cards; deterministic server rules; preserved source catalogue; local discoveries; Docker and Railway deployment.

## Touch manifest

- Add `party-game/**`: application, engine, source importer, catalogue, prompt templates, tests, deployment configuration, and operational documentation.
- Add `.icm/**`: context workspace and generated inventory.
- Add `rules/party_game.md`: the separate party mode contract.
- Append party-mode pointers to `README.md`, `CONTEXT.md`, and `CONTENT_COHERENCE_TOUCH_MANIFEST.md`.
- Preserve all original CSV, prose, images, legacy tracked deletions, and unrelated modifications.

## Execution contract

Single-agent discipline: user permits subagents only at GPT-5.4 or below; this session advertises no eligible model. No silent substitution. Work proceeds in bounded content, engine, server, frontend, and verification passes. Source files were hashed before implementation.

Core boundaries: source assets are evidence; approved party cards are executable content; generated tags are provisional classification; simulated tests do not establish human enjoyment; a deployment package is not hosted verification.

## Interface direction

Visual thesis: a pastel social disaster played on a crisp, dark-ink card table. Cream surfaces, lavender/coral/mint category colors, strong typography, readable cards rather than a marketing dashboard.

Content plan: join/create directly; lobby explains one turn; table keeps the encounter central, opponents visible, and hand close to the next action; collection is a searchable reference.

Interaction thesis: cards lift on focus, revealed encounters enter once, and turn/connection changes announce themselves. Respect reduced motion. Placeholder illustration motifs stay replaceable.

## Gates

1. Catalogue provenance, complete family coverage, approved card effects.
2. Deterministic mechanics, edge cases, economy, private projections.
3. Transactional commands, reconnect, timeouts, restart and backup recovery.
4. Three- and six-browser end-to-end runs; mobile/desktop inspection.
5. Docker build and live Railway smoke test, when authenticated access exists.
6. Human playtest at both player-count extremes remains an external acceptance gate.

Fresh evidence and remaining limitations are recorded in `VERIFICATION.md` at handoff.

## Follow-up — solo play and prompt production

User request, 2026-10-04: allow any positive player count, including solo tests; make flavor capacity and monster artwork prompts explicit. Touch scope: party-game engine, server, client copy, content validation/export, tests, prompt templates/guidance, party rules, and curated ICM cards. Preserve source assets and games already in progress. Undealt lobbies can adopt the current content bundle; started runs stay pinned. Validate solo completion/reconnect, large-table deals, prompt completeness, and the rebuilt local Docker preview.
