# Digital Nomadia: Swipe Right, Regret Later

A private browser party game for one or more players, including solo testing. There is no fixed seat cap; human pacing is still aimed at 3–6 friends. Draw a personality, fight social monsters, bargain for help, sabotage your friends, and reach level 5 before attempting a romance finale. No DM, signup, runtime AI, or real dating required.

## Run locally

Use Node **24.19.0** (pinned in `.node-version`) and npm. From this directory:

```sh
npm run setup
npm run serve
```

Open `http://localhost:3000`. Each player needs a separate browser profile or device. Guests reconnect using the seat token saved in that browser. Nicknames, hands, room state, and command receipts are stored in SQLite; discoveries and endings stay in browser storage.

```sh
npm run stop
npm run check
npx playwright install chromium
npm run test:e2e
```

`serve` records its process identity; `stop` stops only that process group. `reset` deletes only this app’s disposable `data/` directory and refuses while the recorded server is running. It does not clear browser collections. Foreground development: `npm run dev` rebuilds the frontend, then watches server changes. Restart that command after editing frontend files.

## Docker

From the repository root:

```sh
docker compose -f party-game/compose.yaml up --build -d
docker compose -f party-game/compose.yaml logs --tail=30 game
docker compose -f party-game/compose.yaml down
```

The named volume survives `down`. Do not add `--volumes` unless you intend to erase rooms. The container initializes volume ownership, then runs the application as UID 1000. For a different port, set both `NOMADIA_PORT` and `PUBLIC_ORIGIN`.

## Content workflow

- `content/catalogue.json`: source-mapped archive, including CSV variants, Markdown sections, templates with authored entries, and visual files. Inferred tags are candidates for editorial review.
- `scripts/seed-content.ts`: authored launch deck. It resolves source references and writes the versioned `content/launch.json` bundle.
- `prompts/flavor.v2.txt`, `prompts/visual.v2.txt`, and `prompts/visual-clean.v1.txt`: independent generation templates. The export is prompt-only; no image generation service is called.
- `content/prompt-packets/launch.json`: 91 sets of flavor, full art-brief, and clean image prompts.
- `content/prompt-packets/monsters/`: individual full briefs and copy-ready image prompts for all 18 launch monsters. See [the flavor and artwork guide](docs/PROMPT_GUIDE.md).

```sh
npm run catalogue
npm run content:build
npm run content:check
```

Catalogue rebuilds require Python 3 and `docpipe`; large Markdown reads follow the repository’s docpipe gate. The generated catalogue and launch bundle are committed application inputs, so production requires neither tool. The importer never writes to source material. Content checks require the original repository beside this directory.

Source currency prices remain in the catalogue. Party-card prices are explicit adaptations. `btc` is represented internally as integer satoshis and displayed as BTC. Other resources are integers. There is no exchange rate or real-money integration.

## Architecture

`src/engine` contains the deterministic reducer. `server` validates commands and commits snapshots plus idempotency receipts in one SQLite transaction before broadcasting viewer-specific state. `src/client` renders legal actions; it cannot grant levels, draw cards, or write server balances.

Started runs pin a complete content bundle in SQLite. Later deployments do not replace their cards. Undealt lobbies and rematches adopt the current bundle. Restart restores committed state and logical time. Solo resumes when its player reconnects; multiplayer resumes with at least two connected players. Lobbies can start with one or more players when every seated player is connected. Complete deck copies scale with the table size while preserving configured card proportions. Host ownership transfers when the host disconnects. Reconnect credentials are seat-specific bearer tokens, never part of the invite URL.

Run a **single instance** against one SQLite volume. Horizontal scaling, accounts, solo bots, matchmaking, real social matching, built-in voice, and live AI content are outside this release.

## Delivery and evidence

- [Game rules](../rules/party_game.md)
- [Deployment and recovery](docs/DEPLOYMENT.md)
- [Implementation boundaries](docs/IMPLEMENTATION.md)
- [Verification record](docs/VERIFICATION.md)
- [Human playtest sheet](docs/PLAYTEST.md)

Local tests and simulations establish mechanical behavior. Human pacing/fun and a live hosted multiplayer session are separate acceptance gates.
