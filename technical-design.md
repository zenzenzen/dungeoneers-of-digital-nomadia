# Dungeoneers of Digital Nomadia — Web Platform Technical Design

> A modern, clean, pixel-art-retro web client for browsing the DDN compendium, authoring characters, and — eventually — running asynchronous multiplayer RPG sessions in the spirit of [fables.gg](https://fables.gg), packaged with the turn cadence of *Words with Friends*.

---

## 0. Document Status

| Field | Value |
|---|---|
| Version | 0.1.0 (initial spec) |
| Status | Draft — awaiting implementation kickoff |
| Author | Johnson Deng + Claude |
| Target repo | `Dungeoneers of Digital Nomadia` (monorepo, web package to be added) |
| Scope | Front-end architecture, visual system, data layer, phased rollout, multiplayer primitives, pixel-art asset pipeline |

---

## 1. Product Vision

DDN today is a CSV-backed ruleset. The web platform converts it into:

1. **A compendium** — browse monsters, classes, spells, items with search, filters, and lore.
2. **A character workbench** — assemble and persist sheets, inventories, and relationships.
3. **A session runner** — host async "games" where 2–6 players join via a short code and take turns at their own pace, scaffolded by an AI narrator (fables.gg-style) but grounded in the DDN rules.
4. **A social object** — share monsters, encounter logs, and character cards the way people share Duolingo streaks.

### Aesthetic thesis

The two visual registers must coexist:

- **Chrome (app shell, navigation, browsing, dashboards)**: "airport lounge at 11pm" — near-black backgrounds (`#0B0D10`), cool gray strokes, generous whitespace, crisp sans-serif (Inter / Geist), thin hairline dividers, muted accent ambers. Think Linear + Arc + departure-board signage.
- **Content (RPG surfaces, combat, NPC interactions, loot)**: pixel art icons and portraits, rendered crisp at integer scales, framed inside **notification-banner cards** that feel like iOS lock-screen alerts — rounded rectangles, avatar on the left, one-line headline, secondary detail, and a subtle glow for "new." See the attached reference for the target look.

The duality is the point: browsing feels like a premium reference app; playing feels like your phone is buzzing with a party of friends mid-heist.

---

## 2. Phased Rollout

Each phase must ship as a standalone, aesthetically complete slice. Later phases add surface area without rebuilding earlier ones.

### Phase 1 — Compendium (read-only, single-player, beautiful)
**Goal:** anyone can browse the full DDN dataset on desktop or mobile web. No accounts.

- Static generation of all CSV-backed entities (monsters, classes, spells, skills, equipment, armors, weapons, magic_items, npcs, locations, backgrounds, races, feats, quests, encounters, factions, treasure, tools, jobs, miscellaneous_objects).
- Compendium index pages with filter chips (type, CR, level, tags), typeahead search (Fuse.js), keyboard navigation (`/` to focus search, `j/k` to scroll results, `Enter` to open).
- Detail pages per entity, cross-linked (e.g. a monster's "Summon Manager" links to the minion's stat block).
- Pixel-art portrait per monster/class/NPC, procedurally placeholder until curated art lands (see §8).
- Deep-linkable URLs: `/compendium/monsters/karen`, `/compendium/classes/influencer`.
- Dark/light toggle, but dark is canonical.

**Non-goals in Phase 1:** auth, persistence, character sheets, multiplayer, AI.

### Phase 2 — Character Workbench (local, single-player)
- Character sheet authoring with live-calculated stats (Chill, Cringe Resistance, Vibe Check).
- Inventory and spell management drawn from the compendium.
- Local-first persistence (IndexedDB via Dexie); export/import JSON.
- Optional account (email magic link) to sync across devices.
- Relationship tracker (NPC affinity bars) shown as notification-banner cards matching the reference screenshot.

### Phase 3 — Async Sessions (multi-player, turn-based, coded join)
- Host creates a session → 6-char join code (`CRYPT7`).
- Guest join: name + passphrase (convertible to full account later without losing progress).
- Turn order enforced server-side; players take actions when it's their turn; others get push notifications (web-push + email fallback).
- Session state log is append-only, replayable, shareable as a read-only URL.
- "Words with Friends" cadence: a turn can take a minute or a day. Idle timeouts configurable by host (12h / 3d / 7d).

### Phase 4 — AI Narrator (fables.gg parity)
- LLM-backed GM that narrates scenes, adjudicates social-combat rolls, and drives NPCs — constrained to the DDN ruleset via tool-use.
- Graphical manual inputs: dice-roll widget, target-picker, status-effect chips (matches fables.gg "hold-to-roll" feel but themed DDN).
- Safety: house rules, content guardrails, ability to rewind a turn.

### Phase 5 — Social & Discovery
- Public session highlights, shareable encounter logs, character cards as OG images.
- Leaderboards by campaign theme, community-authored encounters with moderation queue.
- Spectator mode for completed sessions.

---

## 3. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Clients                               │
│  Next.js Web App (desktop + mobile web, PWA-installable)     │
│  Service Worker (offline compendium, push notifications)     │
└──────────────┬──────────────────────────────────┬────────────┘
               │ HTTPS + WSS                      │ Web Push
               ▼                                  ▼
┌─────────────────────────────────────────────────────────────┐
│                     Edge / API Layer                         │
│   Next.js Route Handlers (RSC + server actions)              │
│   tRPC or typed fetch for session mutations                  │
│   WebSocket gateway (Pusher / Ably / self-hosted ws)         │
└──────────────┬──────────────────────────────────┬────────────┘
               ▼                                  ▼
┌────────────────────────┐         ┌──────────────────────────┐
│     Postgres           │         │   LLM Provider            │
│  (Supabase / Neon)     │         │   Anthropic claude-opus   │
│  - users, sessions     │         │   (Phase 4+)              │
│  - turns, events       │         └──────────────────────────┘
│  - characters          │
│  - content snapshots   │         ┌──────────────────────────┐
└────────────────────────┘         │   Object Storage          │
                                   │   (R2 / S3)              │
┌────────────────────────┐         │   Pixel-art assets,      │
│   Content Build Layer  │         │   OG images, user uploads│
│   CSV → JSON → SQLite  │         └──────────────────────────┘
│   Shipped to client    │
│   for offline browse   │
└────────────────────────┘
```

### Tech choices and rationale

| Concern | Pick | Why |
|---|---|---|
| Framework | **Next.js 15 (App Router, RSC)** | Best-in-class DX for mixed static/dynamic; SEO on compendium pages matters for growth; server actions simplify mutations. |
| Language | **TypeScript strict** | Non-negotiable for a schema this shape-heavy. |
| Styling | **Tailwind v4 + CSS variables** | Design tokens live in CSS vars so the airport-lounge / pixel-card dualism is a single source swap. |
| Components | **shadcn/ui** (Radix underneath) | Owned components; accessibility baked in; easy to skin. |
| Iconography (chrome) | **Lucide** | Matches the reference screenshot's stroke weight. |
| Pixel art | Custom `<PixelSprite />` component over `<canvas>` with `image-rendering: pixelated` | See §8 for asset pipeline. |
| State (client) | **Zustand** (UI) + **TanStack Query** (server cache) | Zustand for ephemeral UI, Query for everything networked. Avoid Redux. |
| Persistence (local) | **Dexie (IndexedDB)** | Offline-first character drafts; session event replay cache. |
| DB | **Postgres** via **Supabase** (or Neon + Auth.js) | Row-level security handles session authorization cheaply. |
| Realtime | **Supabase Realtime** (Phase 3), or Ably if scale forces it | Async cadence means we don't need low-latency; simple pub/sub is enough. |
| Auth | **Auth.js** w/ email magic link + guest-code flow | See §6. |
| Search | **Fuse.js** (client) in Phase 1; **pg_trgm** + typesense later | Keep Phase 1 zero-infra. |
| Testing | **Vitest** + **Playwright** + **Storybook** | Storybook doubles as design-system documentation. |
| Analytics | **PostHog** (self-host option) | Session replay helps UX iteration on the banner metaphor. |
| Hosting | **Vercel** (app) + **Supabase** (data) + **Cloudflare R2** (assets) | Low ops; all have generous free tiers. |

---

## 4. Information Architecture

```
/                               → Landing (departure-board hero, CTA to Compendium)
/compendium                     → Browse hub
  /compendium/monsters          → List + filters
  /compendium/monsters/:slug    → Detail
  /compendium/classes           → …
  /compendium/spells            → …
  (one segment per folder in the repo)
/characters                     → (Phase 2) list of user's characters
  /characters/new               → Builder
  /characters/:id               → Sheet view
/sessions                       → (Phase 3) list of active sessions
  /sessions/:code               → Session room
  /sessions/:code/turn/:n       → Deep link to a specific turn (spectator + replay)
/join                           → Guest-code entry
/account                        → Auth, profile, notification preferences
/rules                          → Rendered markdown from /rules/*
```

### URL & slug rules

- Slugs derived from the CSV `id` column stripped of the `monster_` / `class_` / etc. prefix.
- Every entity resolvable via `/c/:type/:slug` short URL for share cards.
- 301 from plural and alternate forms.

---

## 5. Visual Design System

### 5.1 Design tokens

All tokens live in `/packages/tokens/tokens.css` and are referenced by name — never hardcoded in components.

```css
:root {
  /* Surfaces — airport lounge */
  --surface-void:     #0B0D10;  /* page background */
  --surface-raised:   #14171C;  /* cards */
  --surface-elevated: #1B1F26;  /* popovers, modals */
  --surface-inset:    #090B0E;  /* search fields, wells */

  /* Strokes */
  --stroke-hairline:  rgba(255,255,255,0.06);
  --stroke-default:   rgba(255,255,255,0.10);
  --stroke-strong:    rgba(255,255,255,0.18);

  /* Text */
  --text-primary:     #F5F7FA;
  --text-secondary:   #A7AEBB;
  --text-tertiary:    #6B7280;
  --text-disabled:    #3F4552;

  /* Accents — used sparingly, like gate numbers */
  --accent-amber:     #E8A33D;  /* primary accent (see "Build Relationships" in ref) */
  --accent-amber-dim: rgba(232,163,61,0.12);
  --accent-cyan:      #5EC8F2;  /* info */
  --accent-pink:      #F472B6;  /* relationships / heart */
  --accent-green:     #4ADE80;  /* positive deltas */
  --accent-red:       #F87171;  /* damage / negative */

  /* RPG semantic — map to status effect palette */
  --status-chill:     var(--accent-cyan);
  --status-triggered: var(--accent-red);
  --status-cringe:    #C084FC;
  --status-clout:     var(--accent-amber);

  /* Radii & spacing */
  --radius-card:      12px;
  --radius-banner:    14px;  /* notification-banner feel */
  --radius-pill:      999px;
  --space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 16px;
  --space-5: 24px; --space-6: 32px; --space-7: 48px; --space-8: 64px;

  /* Type */
  --font-sans: "Inter", "Geist", system-ui, sans-serif;
  --font-display: "Geist", "Inter", sans-serif;   /* slightly tighter for headers */
  --font-mono: "JetBrains Mono", ui-monospace, monospace;
  --font-pixel: "Press Start 2P", "VT323", monospace; /* reserved for pixel-card headlines */
}
```

### 5.2 Type scale

| Token | Size / LH | Use |
|---|---|---|
| `display-xl` | 56 / 60, tracking -0.02em | Landing hero only |
| `display-lg` | 40 / 44 | Compendium section headers |
| `heading-md` | 24 / 30 | Entity detail page titles |
| `heading-sm` | 18 / 24 | Card titles |
| `body-lg`    | 16 / 24 | Lore paragraphs |
| `body-md`    | 14 / 20 | Default |
| `caption`    | 12 / 16, tracking 0.02em, uppercase | Meta rows (CR, tags) |
| `pixel`      | 10 / 12, pixelated font | Only inside pixel-card chrome |

### 5.3 Components

Authoritative inventory (Storybook stories required for each):

- **AppShell**: top nav, left rail (compendium categories), content area, notification dock.
- **SearchBar**: `⌘K` opens global palette over app; `/` focuses inline.
- **FilterChipRow**: horizontally scrollable chips with counts.
- **EntityCard**: grid card for a monster/spell/etc. Shows pixel portrait, name, 1-line subtitle, CR/level pill.
- **StatBlock**: canonical D&D-style stat panel, but themed DDN (Chill instead of HP, etc.).
- **NotificationBanner**: the hero component for RPG surfaces. Props: `avatar`, `title`, `body`, `meta`, `tone: 'neutral'|'positive'|'warn'|'danger'|'magic'`, `glow: boolean`, `action?`. Renders the rounded-rect card seen in the reference.
- **RelationshipBanner**: specialized variant with dual avatars, affinity label (`Friendly`), before → after number, delta chip (`↑ 10`).
- **PixelSprite**: renders a sprite from our pack at the requested integer scale.
- **DiceWidget**: graphical d20/d6 with momentum physics; the manual input for Phase 4 AI sessions.
- **TurnTimeline**: vertical feed of banners, one per event, grouped by turn.
- **JoinCodeInput**: 6-slot OTP-style input with haptic feedback on mobile.

### 5.4 Motion

- Durations: `fast 120ms`, `base 200ms`, `slow 320ms`; curve `cubic-bezier(0.2, 0.8, 0.2, 1)`.
- Banners enter with a 6px translate-up + fade, then a one-time 1.5s amber glow pulse for "new."
- Honor `prefers-reduced-motion`: disable glow pulse, keep fades.

### 5.5 Accessibility targets

- WCAG 2.1 **AA** on all chrome. AAA on body text.
- All interactive pixel art has a text alternative; decorative sprites `aria-hidden`.
- Every action reachable by keyboard; focus ring uses `--accent-amber`.
- Color never the sole channel for stat deltas (always also `↑` / `↓` glyph).

---

## 6. Auth & Session Model

### 6.1 Identities

| Kind | How obtained | Persistence |
|---|---|---|
| **Anonymous browse** | default for Phase 1 | none |
| **Guest player** | join code + display name + passphrase | server-side row with `is_guest=true`, identifier = `guest_:uuid` |
| **Full account** | email magic link | standard user row |
| **Upgraded guest** | guest adds email later | row `is_guest → false`, keeps all session history |

Passphrase for guests is not an email replacement — it's a local rejoin token so a guest closing the browser tab can get back into their character without re-logging. Stored bcrypt-hashed.

### 6.2 Session join flow

```
Host → creates session → POST /api/sessions
  ← { code: "CRYPT7", hostToken }
Guest → /join → enters "CRYPT7" → name + passphrase → POST /api/sessions/CRYPT7/join
  ← { sessionToken, seat }
All clients subscribe to channel session:CRYPT7 for turn/event updates.
```

Codes are 6 chars from `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` (no ambiguous 0/O/1/I/L). ~1B keyspace; collision check at insert. Codes expire 30 days after last activity.

### 6.3 Authorization

- Every session action checks `(userId, sessionId) ∈ session_members`.
- Turn actions check `session.current_seat == member.seat`.
- Supabase RLS policies mirror these for defense-in-depth.

---

## 7. Data Model

### 7.1 Content (read-only, derived from CSVs)

Build step at `pnpm content:build`:
1. Walk repo, read every `*/<entity>.csv`.
2. Validate against Zod schemas per entity type.
3. Emit `/apps/web/public/content/<entity>.json` and a combined `/apps/web/public/content/index.json`.
4. Emit a **SQLite** file (`content.db`) shipped to the client for offline search via sql.js — keeps Phase 1 server-free.

Schemas live in `/packages/content-schema`. Example:

```ts
export const MonsterSchema = z.object({
  id: z.string().regex(/^monster_[a-z0-9_]+$/),
  name: z.string(),
  type: z.enum(["Humanoid","Fiend","Aberration","Construct","Elemental"]),
  size: z.enum(["Tiny","Small","Medium","Large","Huge","Gargantuan"]),
  armor_class: z.number().int(),
  hit_points: z.string(), // "45 (6d8+18)"
  speed: z.string(),
  challenge_rating: z.union([z.number(), z.literal("1/2"), z.literal("1/4")]),
  abilities: z.string(),
  attacks: z.string(),
  special_traits: z.string(),
  version: z.string(),
  is_active: z.boolean(),
});
```

Parsing helpers convert `abilities` (`"Str 10, Dex 12, …"`) and class `features` (pipe/semicolon-separated DSL) into structured shapes at build time. The DSL as it appears in `classes.csv` (`aura:…|bonus:…|context:…; attack:…`) needs its own tiny parser — add `/packages/content-schema/src/feature-dsl.ts` for this.

### 7.2 Application tables (Postgres)

```sql
-- users
create table users (
  id uuid primary key default gen_random_uuid(),
  email citext unique,
  display_name text not null,
  is_guest boolean not null default false,
  passphrase_hash text,              -- for guests
  created_at timestamptz default now()
);

-- characters
create table characters (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references users(id) on delete cascade,
  name text not null,
  class_id text not null,            -- references content json
  level int not null default 1,
  stats jsonb not null,              -- { str, dex, con, int, wis, cha }
  chill_current int not null,
  chill_max int not null,
  inventory jsonb not null default '[]',
  relationships jsonb not null default '{}',
  version int not null default 1,
  updated_at timestamptz default now()
);

-- sessions
create table sessions (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  host_id uuid references users(id),
  status text not null check (status in ('lobby','active','paused','ended')),
  turn_timeout_hours int not null default 72,
  current_seat int not null default 0,
  settings jsonb not null default '{}',
  created_at timestamptz default now(),
  last_activity_at timestamptz default now()
);

create table session_members (
  session_id uuid references sessions(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  character_id uuid references characters(id),
  seat int not null,
  joined_at timestamptz default now(),
  primary key (session_id, user_id)
);

-- event log, append-only
create table session_events (
  id bigserial primary key,
  session_id uuid references sessions(id) on delete cascade,
  turn_number int not null,
  seat int not null,
  kind text not null,    -- 'narration','action','roll','banner','system'
  payload jsonb not null,
  created_at timestamptz default now()
);
create index on session_events(session_id, turn_number);
```

Turn state is the reduction of `session_events`. We store a `session_snapshots` cache (materialized every N events) so joiners don't replay the whole log.

### 7.3 Event shapes

Every gameplay-visible change is emitted as a **banner event** — this is what the UI renders in the timeline and what Phase 4 AI tool-use can produce:

```ts
type BannerEvent =
  | { kind: "dialogue"; speaker: CharacterRef; text: string }
  | { kind: "roll"; actor: CharacterRef; check: string; total: number; dc: number; success: boolean }
  | { kind: "damage"; source: CharacterRef; target: CharacterRef; amount: number; type: DamageType }
  | { kind: "relationship"; a: CharacterRef; b: CharacterRef; before: number; after: number; label: AffinityLabel }
  | { kind: "loot"; actor: CharacterRef; item: ItemRef; quantity: number }
  | { kind: "status"; target: CharacterRef; effect: StatusEffect; applied: boolean };
```

Each maps 1:1 to a `<NotificationBanner>` variant. This is the conceptual spine of the UI: **gameplay is a feed of banners**.

---

## 8. Pixel Art Asset Pipeline

Two tracks running in parallel:

### 8.1 Curated (human-authored)

- Target: 70+ monsters, 43+ classes, 30+ key NPCs at launch of Phase 2.
- Format: PNG, 32×32 base, with 64×64 and 128×128 upscales produced by integer nearest-neighbor at build time.
- Palette-locked to a 32-color DDN palette (defined in `/packages/assets/palette.gpl`) so everything feels of a piece.
- Commissioned or community-submitted via PR; stored in `/assets/sprites/<category>/<slug>.png`.

### 8.2 Procedural / AI-assisted (placeholder + expansion)

The goal is: a contributor adds a new monster CSV row and the site shows *something* visually coherent the same day, even before art lands.

Recommended tools (open source, GitHub):

| Repo | Role | Notes |
|---|---|---|
| [`astramind-ai/Pixel-Art-XL`](https://github.com/nerijs/pixel-art-xl) / nerijs' SDXL LoRA | Generate candidate sprites from the monster's text description | Run in a build job, not at request time; human curates. |
| [`sedthh/pixelparse`](https://github.com/sedthh/pixelparse) | Post-process AI output to snap to true pixel grid + quantize to palette | Critical: raw SDXL output is *not* pixel art, it's blurry sprites pretending. |
| [`lexaloffle/picotool`](https://github.com/dansanderson/picotool) or similar | Optional PICO-8 pipeline for a "we made these in a fantasy console" vibe | Nice-to-have. |
| [`doomemacs/pixel-art-shader`](https://github.com/gigamoto/pixel-art-upscaler) and **hqx** / **xBRZ** family | Higher-quality integer upscale | Use for presentation, never for source. |
| [`retrodiffusion`](https://github.com/retrodiffusion/retrodiffusion) | Commercial API option | Consider only if quality is materially better than the Pixel-Art-XL LoRA. |
| Sprite sheets from [OpenGameArt](https://opengameart.org) (CC0 / CC-BY) | Fill placeholder gaps | Track attribution in `/assets/ATTRIBUTION.md`. |

**Pipeline:**
1. Contributor adds `monster_foo` row → CI runs `pnpm art:generate monster_foo`.
2. Job generates 4 candidate PNGs using SDXL + Pixel-Art-XL LoRA with prompt templated from the row's `name` + `type` + `special_traits`.
3. Pixelparse snaps to grid and palette.
4. PR is opened with the 4 candidates and a picker UI; maintainer approves one.
5. Approved sprite is committed; build regenerates derivatives.

Until a curated sprite exists, the site renders a deterministic identicon-style sprite from the entity's `id` (seeded Perlin noise on the palette) so no entity is ever imageless.

---

## 9. RPG Runtime (Phases 3–4)

### 9.1 Turn model

- A session has seats 0..n-1; `current_seat` advances after each action is `committed`.
- A turn can contain multiple banner events (narration → roll → damage → status) but exactly one player-initiated **action**.
- Idle timeout: if `current_seat`'s player doesn't act within `turn_timeout_hours`, the seat is **skipped** with a system banner (`"Tennel was too busy doomscrolling to act"`). Host can disable.

### 9.2 Client contract

```ts
// src/lib/session/actions.ts
type PlayerAction =
  | { kind: "say"; text: string }
  | { kind: "attack"; targetId: string; weaponId: string }
  | { kind: "cast"; spellId: string; targets: string[] }
  | { kind: "skill"; skillId: string; dc?: number }
  | { kind: "use"; itemId: string; targetId?: string }
  | { kind: "flee" };

async function commitAction(sessionId: string, action: PlayerAction): Promise<BannerEvent[]>;
```

Server validates turn ownership, runs the rule engine (deterministic for Phase 3; LLM-augmented for Phase 4), appends banners, broadcasts.

### 9.3 Rule engine

`/packages/engine`: pure TS, no I/O. Given `(state, action)` returns `(state', events[])`. Testable with property-based tests (fast-check). This is the single source of truth for combat math; both the deterministic runtime and the LLM narrator go through it — the LLM cannot fudge numbers.

### 9.4 AI narrator (Phase 4)

- Model: `claude-opus-4-7` for narration, `claude-haiku-4-5` for cheap routing / summarization.
- Tools exposed to the model:
  - `roll(die, modifier)` — returns a number, logs a banner
  - `apply_damage(target, amount, type)`
  - `change_relationship(a, b, delta)`
  - `grant_item(target, itemId, qty)`
  - `narrate(text)`
  - `set_scene(locationId)`
- The model **never** writes raw state; it only calls tools. The engine enforces rules. This matches fables.gg's architecture and keeps cheating/hallucination bounded.
- Context budget: always include the current scene's last 20 banners + the active character's stat block + target statblocks. Older turns are summarized by Haiku into a running "campaign so far" string.
- Safety: moderation pass on narration before emit; house rules surfaced as a session setting (`pg13`, `hbo`); per-player block list respected.

---

## 10. Notifications & Async Cadence

- Web Push via standard `Push API` (VAPID keys, service worker).
- Email fallback (Resend) for users who deny push, gated by per-user digest frequency.
- Server-side scheduler (Supabase cron or Trigger.dev) for turn-timeout skips and weekly "your party is waiting" nudges.
- Every outbound notification is also a row in `notifications` so we can render an in-app inbox.

---

## 11. Performance Budgets

| Surface | Budget |
|---|---|
| Compendium list LCP (mobile, 4G throttled) | ≤ 1.8s |
| Compendium detail LCP | ≤ 1.5s |
| Session event → banner render | ≤ 250ms p95 after server emit |
| JS shipped to Phase 1 pages | ≤ 150KB gzip |
| Pixel sprite first paint | ≤ 50ms (served from CDN, cache-immutable) |

Enforcement: Lighthouse CI in PRs; bundle-size action with hard fail over budget.

---

## 12. Testing Strategy

- **Unit**: Vitest on the rule engine, feature-DSL parser, banner reducer. Aim 90%+ on `/packages/engine`.
- **Integration**: Playwright flows — compendium search, character creation, session join by code, turn commit.
- **Visual**: Storybook + Chromatic (or Percy) snapshots of every component in both registers (chrome and pixel).
- **Accessibility**: axe-core in CI; manual screen-reader pass every release.
- **Load**: k6 against the session WebSocket at 500 concurrent rooms × 6 players for Phase 3 launch.
- **LLM regression (Phase 4)**: scripted scenarios with deterministic seeds; assert engine state matches golden files regardless of narration wording.

---

## 13. Observability

- Logging: pino → Axiom or Logtail.
- Tracing: OpenTelemetry, key spans on `commitAction`, LLM tool calls, search queries.
- Product analytics: PostHog events keyed by `session_id` / `user_id`; critical funnel = landing → compendium → create-char → join-session → first-turn.
- Session replay on opt-in only.

---

## 14. Monorepo Layout

```
/
├── apps/
│   └── web/                      # Next.js app
├── packages/
│   ├── ui/                       # shadcn-derived components, NotificationBanner, PixelSprite
│   ├── tokens/                   # CSS tokens + Tailwind preset
│   ├── content-schema/           # Zod schemas + feature-DSL parser
│   ├── content/                  # Built JSON + SQLite output (gitignored, CI artifact)
│   ├── engine/                   # Pure rule engine
│   └── assets/                   # Palette, source sprites, build scripts
├── tooling/
│   ├── art-pipeline/             # Pixel-Art-XL runner, pixelparse wrapper
│   └── content-build/            # CSV → JSON/SQLite
├── (existing content folders)    # monsters/, classes/, spells/, … stay as the source of truth
└── technical-design.md           # this file
```

CSV folders remain canonical — the web app consumes generated JSON but the tabletop ruleset is still edited in-place by contributors who prefer a spreadsheet.

---

## 15. Open Questions

1. **Pixel font licensing** — "Press Start 2P" is OFL; confirm "VT323" fallback before shipping.
2. **Commercial art provider** — decide by end of Phase 2 whether SDXL+LoRA in-house is quality-sufficient or we buy Retrodiffusion credits.
3. **Realtime backend** — Supabase Realtime is simplest, but if we launch Phase 5 social features with spectator fan-out > 100 per room we may need Ably.
4. **Content licensing** — confirm DDN rules are parody-safe for public web distribution; keep `/rules/LICENSE.md` current.
5. **Guest → account merge** — what happens to a guest's in-progress session if they upgrade mid-turn? Proposed: atomic re-key of `session_members.user_id`.
6. **Monetization (later)** — none planned for Phase 1–3. If cosmetic sprite packs or premium AI narrator minutes ship later, billing via Stripe, but out of scope here.

---

## 16. Next Steps (post-approval)

1. Scaffold `apps/web` with Next.js 15 + Tailwind v4 + shadcn.
2. Port tokens from §5.1 into `/packages/tokens`.
3. Build the four keystone components in Storybook first: `AppShell`, `EntityCard`, `NotificationBanner`, `RelationshipBanner`.
4. Wire `content-build` to generate JSON for `monsters` and `classes`.
5. Ship `/compendium/monsters` end-to-end as the Phase 1 milestone-1 demo.

---

*End of spec.*
