# Verified commands

Run app commands inside `party-game/` with Node 24.19.0. The machine's default Node may differ; `.node-version` records the requirement.

| Purpose | Command | Effect |
| --- | --- | --- |
| Install and build | `npm run setup` | Repeatable pinned install, typecheck, Vite build |
| Start local app | `npm run serve` | Detached app on PORT or 3000; records scoped PID |
| Stop local app | `npm run stop` | Stops only the recorded process group |
| Validate | `npm run check` | Catalogue checks, TypeScript, engine/server tests |
| Browser scenarios | `npm run test:e2e` | Isolated server and 1-/3-/6-player Chromium sessions |
| Rebuild catalogue | `npm run catalogue` | Reads originals, writes derived catalogue; needs Python/docpipe |
| Rebuild cards/prompts | `npm run content:build` | Writes content bundle and independent prompt exports |
| Prepare artwork pilot | `npm run art:prepare` | Writes six requests locally; no provider calls |
| Verify artwork pilot | `npm run art:check` | Checks schemas, source/prompt hashes, and exact prepared files |
| Backup | `npm run backup -- <new-file>` | Online SQLite backup |
| Restore | `npm run restore -- <backup> --server-stopped` | Requires stopped app; preserves previous DB backup |

GitHub PR validation is defined in `.github/workflows/party-game.yml`: locked install, source audit, app checks, production build, browser sessions, and Docker build.

From repository root: `docker compose -f party-game/compose.yaml up --build -d`. Stop with `down`; keep the volume. `party-game/docs/DEPLOYMENT.md` covers Railway and maintenance restore.

ICM: `PYTHONPATH=/Users/dev/ai-gen-tooling python3 -m icm check .`; use `refresh .` after file changes, then re-check. Historical source validation: `python3 tools/content_audit.py`.
