# Architecture

`party-game/` is a standalone Node 24 application with its own lockfile. React/Vite renders the client; Fastify and Socket.IO serve the app and authoritative commands; SQLite persists rooms, token hashes, content bundles, and idempotency receipts. One Docker instance owns one persistent volume.

`src/engine/game.ts` is a deterministic reducer. Clients send command ID plus expected revision; server validation and one SQLite transaction precede each broadcast. Projections contain public boards and only the requesting player's private hand. Deck order and RNG state never leave the server.

Started runs pin a complete content bundle in SQLite. Undealt lobbies and rematches adopt the current version. Restart restores committed logical time and pauses until enough seats reconnect. New deployments retain old room content; new campaign fields retain compatibility defaults for the first launch bundle.

Source CSV/prose/visual assets are preserved. `scripts/catalogue.py` builds traceable candidates in `content/catalogue.json`. `scripts/seed-content.ts` authors the approved deck and campaign. Separate versioned flavor, full visual brief, and clean image templates export prompt packets and individual monster files; production does not call AI services. Local browser collections never grant power.
