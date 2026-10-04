# Verification record — 2026-10-04

Current result: the local, deployable MVP passes the checks below. **Railway hosting and human playtesting remain unverified.** The content version is `f911a2b4477a2aaa`; database schema version is 1.

## Verified locally

| Gate | Evidence | Result |
| --- | --- | --- |
| Source preservation | SHA-256 comparison against 68 pre-implementation files, excluding the three authorized root-document appends | No unexpected changes; existing legacy deletions preserved |
| Full-library tagging | `npm run content:check` | 1,242 entries across 58 source files; all 43 canonical classes, 129 backgrounds, and 50 authored template feats accounted for |
| Launch content | Same check | 8 classes, 24 traits, 18 monsters, 8 events, 20 actions, 10 equipment cards, 3 finales; references/effects/prices/art inputs validated |
| Prompt exports | `npm run content:build` then content check | 273 prompt forms for 91 cards; 18 monster brief/clean-prompt file pairs; no image or flavor generation performed |
| Rules, API, persistence, collection | `npm run check` | 29 tests pass, including 60 seeded simulated runs at 3/6 players |
| Browser play | `npm run test:e2e` | 4 scenarios pass: onboarding/collection/archive plus full 1-, 3-, and 6-browser games through results/rematch; solo rechecked after hiding unavailable help controls |
| Mobile/desktop | Chromium screenshots and browser assertions | 390px and 1440px layouts inspected; no page overflow or uncaught browser errors; mobile build collapse and quick navigation work |
| Repeated setup and runtime | `npm run setup` twice; `serve` twice; `stop` twice | Both installs/builds pass; start/stop are repeatable and scoped to the recorded app process |
| Dependency audit | Pinned `npm ci` audit | No known vulnerabilities reported at verification time |
| Docker | Compose build with `--no-cache` | Node 24.19.0 image builds; frontend and backend run as one service |
| Persistent restart | Three real Socket.IO clients, Docker restart, reconnect | Same seat credentials, private hands, room state, and pinned content recover |
| Online backup and restore | Container backup; stopped service; maintenance-container restore; restart | Three clients recover the backed-up hands and room |
| Content pin across deployment | New image serves new content; old test room reconnects | Old room retains `f1ca510b87683630` while `/health` reports the new bundle |
| Original library audit | `python3 tools/content_audit.py` | No errors; four pre-existing missing canonical-file warnings and one generic-race-template note remain |

The rules suite covers conditional benefits/penalties, data-driven balance, class swaps, trait replacement, helper consent/payment, reserved currency, sequential interventions, shields/cleansing, ties, escape, Triggered recovery, purchases, therapy, recycling, finale eligibility, timeout endings, host transfer, and pause/resume.

Server tests use actual sockets and SQLite. They cover private projections, invalid tokens, origin rejection, malformed/stale/reused commands, concurrent spending, lobby seat revocation, old content, receipt replay, backup, and restart. A separate regression proves that a crash during an already-paused turn counts downtime once.

Solo now starts with one connected seat and pauses only when that seat disconnects. Larger rooms have no fixed six-seat cap. Deterministic setup tests cover 1, 2, 7, 12, and 40 players with complete builds and unique physical card instances. These checks do not establish large-room pacing or production load capacity. Existing undealt lobbies adopt the current bundle; a server test verifies a former three-player-minimum lobby starts solo with its original seat token. Started runs retain their pinned content.

Browser runs use independent profiles and the real production UI/API. They play accelerated decisions and pass intervention windows early. Their wall-clock duration is **not** evidence that human sessions meet the 25–40 minute target. Reducer simulations are mechanical tests, not a measure of fun.

Screenshots are available locally in ignored `output/playwright/`. Disposable room tokens are in an ignored file, never in this record. The local Docker preview uses `http://localhost:3037`; its lifetime depends on Docker remaining running.

## Pending external gates

- **Railway:** the CLI reports `Unauthorized. Please login with railway login`. No hosted service, persistent Railway volume, public HTTPS URL, or live hosted smoke test is claimed. Sign in and identify the destination workspace/project to continue the already-authorized deployment.
- **Human pacing:** run the three- and six-person sessions in `PLAYTEST.md`; measure duration, waits, repeated losses, and finale stalls. Balance remains an initial proposal until these sessions happen.
- **Art:** readable placeholder cards ship. Final art direction and image production are intentionally deferred.

CryptoCon and tropical coworking have catalogue relevance tags and can use the campaign interface; their playable campaign decks are not part of this dating-mixer release.

## Reproduce

From `party-game/`, use Node 24.19.0:

```sh
npm run setup
npm run check
npx playwright install chromium
npm run test:e2e
```

For Docker and backup/restore commands, see `DEPLOYMENT.md`. Use disposable rooms for restart tests. Refresh and check ICM after changing files; its generated inventory is derived context, not runtime evidence.
