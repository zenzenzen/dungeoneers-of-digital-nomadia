# DDN Campaign Site Buildout Plan

Date: 2026-05-31

## Product Thesis

**Dungeoneers of Digital Nomadia should look like a venture-backed lifestyle operating system for remote founders, then slowly reveal itself as the playable tabletop RPG that satirizes those people.**

The site should be polished enough to pass as a premium startup page: confident typography, crisp product imagery, social proof, motion, pricing-like modules, and self-important conversion copy. The joke is that the product is a game about WiFi scarcity, social combat, factional coworking warfare, and reputation damage.

## Research Notes

### UI Reference Systems

- Mobbin is useful as a reference model because it organizes real product screens by app, screen type, UI element, flow, and text-in-screenshot search. For DDN, this argues for a compendium that treats monsters, items, spells, quests, and factions as browsable patterns instead of static files.
- Modern startup sites are moving away from decorative noise toward one strong visual conviction: an interactive hero, product output in motion, restrained accent color, and copy that demonstrates the product before explaining it.

### Tabletop Tool Patterns

- Roll20 and Foundry both show that compendium content becomes more valuable when it can be dragged, imported, shared, filtered, and attached to active play.
- Demiplane's Nexus model is the cleanest conceptual reference: character tools, digital compendiums, searchable listings, cross-linking, and quick-reference rules in one ecosystem.
- Archives of Nethys and Pathfinder community threads show the power and danger of advanced search: complex filters are loved by power users, but they need a friendly default mode.

## Visual Thesis

**Pretentious tropical venture studio meets premium rules compendium: white space, kinetic product demos, editorial photography, sharp tables, and one bright accent that feels expensive until the copy makes it ridiculous.**

Avoid the previous beige/amber fantasy-console direction. This reboot should feel closer to:

- a climate-tech startup deck
- a founder retreat landing page
- a boutique coworking brand
- an AI productivity app with too much confidence

Recommended palette:

- `Investor Black` #101114
- `Pitch Deck White` #F7F8F3
- `WiFi Blue` #2D7FF9
- `Mango Signal` #FFB84D
- `Visa Stamp Green` #20B486
- `Burnout Coral` #F05D5E
- `Muted Chrome` #D8DEE8

Use `WiFi Blue` as the main action color, with `Mango Signal` and `Burnout Coral` reserved for game states. The palette should read premium SaaS first, tropical parody second.

Typography:

- Display: a sharp grotesk or editorial sans for startup confidence.
- UI/body: a clean app sans with tight but readable tables.
- Optional accent: a mono face for stat labels, dice formulas, and "operational telemetry."

Logo direction:

- Use a cosmic sparkle/star mark as an "AI platform" parody, not a direct clone of any existing brand.
- The mark should feel like a chrome-edged star emoji that got overfunded: reflective silver rim, bright rainbow core, sharp ridiculous points, no decorative background aura.
- Gradient families to explore:
  - Yellow -> orange -> purple/pink.
  - Pink -> yellow -> green.
  - Yellow -> pink -> violet -> green for the louder launch version.
- Current concept asset: `brand/ddn_ai_star_logo.svg`.

## Content Plan

### 1. Homepage: "The Operating System for Location-Independent Adventurers"

Job: sell the campaign as if it were a founder productivity platform.

Hero:

- Full-bleed image or generated cinematic scene: rooftop coworking space at dusk, laptops open, dice, iced coffees, rolling suitcases, dead power outlet, suspiciously intense networking energy.
- Brand first: **Dungeoneers of Digital Nomadia**
- Headline: **Scale your party. Disrupt your Chill.**
- Body: "A satirical tabletop RPG for remote workers, founders, creators, crypto pilgrims, and everyone trapped in a networking event with no exits."
- CTAs: `Enter the Campaign` and `Browse the Compendium`
- Hero product layer: live "Vibe Check" meter, WiFi uptime badge, faction heat ticker, current campaign card.

Support sections:

- `The Platform`: campaign arcs, rules, compendium, session tools.
- `The Social Combat Stack`: Chill, Cringe Resistance, Vibe Check, Heat, Clout, Burnout.
- `Market Categories`: monsters, items, spells, factions, locations, quests.
- `Traction`: fake metrics like "96 NPCs onboarded", "105 spells shipped", "1 functioning outlet remaining".
- `Founder Testimonials`: in-world quotes from Crypto Bros, Burnout Survivors, Karens, VC Shamans.

Final CTA:

- "Join the waitlist for enlightenment. Or just roll initiative."

### 2. Campaign Hub

Job: turn campaign seeds into browsable adventure products.

Layout:

- Left: campaign list with filters for setting, theme, level, session count, factions.
- Center: selected campaign overview, act structure, quest chain, faction pressure.
- Right: "Operational Risk" panel showing opposition, featured monsters, unresolved links, and table-readiness score.

First flagship:

- **The Great Bangkok Burnout** should be the first polished campaign route because it has a strong setting, obvious resource scarcity, and a funny core premise.

Key interactions:

- Campaign cards expand into startup case-study pages.
- Session beats appear as an interactive timeline.
- Faction clocks animate as the party makes choices.
- "Prep mode" hides spoilers and exposes only player-facing hooks.

### 3. Compendium Arcology

Job: make the content database feel like a premium SaaS knowledge product and a proper GM tool.

Top-level collections:

- Monsters
- NPCs
- Items
- Outfits/Armor
- Spells
- Skills
- Factions
- Locations
- Quests
- Hazards
- Rules

Core layout:

- Persistent search across all entities.
- Filter drawer with friendly defaults and optional advanced mode.
- Results in dense table view, visual grid view, and "pitch deck" view.
- Detail pages with stat block, flavor, rules text, linked quests, linked factions, loot, related entities, and "seen in campaigns."

Monster page:

- Startup profile style: role, challenge rating, Chill, Cringe Resistance, actions, reactions, traits, tags.
- "Encounter Fit" suggestions: minion, controller, skirmisher, boss, social-only.
- Similar monsters and escalation chain.

Item page:

- Price, rarity, slot, attunement, effects, tags.
- "Procurement narrative" instead of bland acquisition: bought, bartered, gifted, stolen from a coworking booth, obtained through a suspicious referral link.

Rules page:

- Fast lookup for conditions, action types, damage types, and social combat formulas.
- Inline popovers for terms like Chill, Triggered, Heat, Clout, Reputation, Gatekeep, Gaslight, Girlboss.

### 4. Session Room

Job: support actual play without trying to replace a full VTT on day one.

MVP tools:

- Vibe Check initiative tracker.
- Chill and Heat trackers.
- Encounter roster pulled from the compendium.
- Dice formula buttons.
- Player-safe handout mode.
- Session recap generator from GM notes.

Future tools:

- Character sheets.
- Drag entity to encounter.
- Party inventory.
- Faction turn resolution.
- Relationship/influence map.

### 5. Character Workbench

Job: give players a place to build joke characters that still obey the rules.

MVP:

- Select class, background, skills, starting items.
- Generate a printable character summary.
- Track Chill, Cringe Resistance, Vibe Check, saves, social attacks, and conditions.

Future:

- Level progression.
- Feats and races/origins once those files are filled in.
- Spell preparation.
- Job/downtime loop.

## Interaction Thesis

1. **Hero demo as satire:** the homepage behaves like a serious product demo, but the widgets report absurd campaign state: "Runway: 3 iced coffees", "Heat: investor-adjacent", "WiFi confidence: performative."
2. **Compendium as product search:** entity browsing should feel like Mobbin or a fintech dashboard: instant search, saved filters, crisp tables, animated detail drawers.
3. **Cross-links as discovery:** every monster, item, spell, quest, and faction should expose related content so the campaign feels like an interconnected world instead of CSV islands.

## Information Architecture

Primary nav:

- `Campaigns`
- `Compendium`
- `Rules`
- `Session Room`
- `Characters`
- `About`

Secondary nav inside Compendium:

- `Monsters`
- `Items`
- `Spells`
- `NPCs`
- `Factions`
- `Locations`
- `Quests`
- `Hazards`

Recommended URLs:

- `/`
- `/campaigns`
- `/campaigns/the-great-bangkok-burnout`
- `/compendium`
- `/compendium/monsters`
- `/compendium/monsters/the-karen`
- `/compendium/items/noise-cancelling-headphones-of-isolation`
- `/rules/social-combat`
- `/session`
- `/characters`

## Buildout Phases

### Phase 0: Content Foundation

- Keep the campaign CSVs as the source of truth.
- Add a content build step later, but do not commit dependency folders or build artifacts.
- Normalize IDs and links between campaigns, quests, NPCs, locations, monsters, items, and factions.
- Add a structured hazards table because encounters already reference hazards conceptually.

Acceptance criteria:

- A single command can validate content relationships.
- Missing cross-links are reported as warnings.
- The flagship campaign has linked quests, locations, NPCs, factions, encounters, rewards, and hazards.

### Phase 1: Static Premium Site

- Build the homepage, campaign index, compendium index, and monster/item detail routes.
- Use static generation from local content.
- Ship responsive layouts before interactive play tools.
- Use real/generated visual assets, not abstract gradients as the main hero.

Acceptance criteria:

- Homepage feels like a polished startup launch.
- Compendium search and filters work for monsters and items.
- Monster and item pages are readable at the table on mobile.
- No dependency folders or generated build output are committed.

### Phase 2: Interactive Compendium

- Add global search.
- Add advanced filters.
- Add entity cross-linking.
- Add saved GM shortlist in local storage.
- Add player-safe spoiler toggle.

Acceptance criteria:

- A GM can find "CR 3 social controller monsters with sonic attacks" quickly.
- An item detail links to relevant rules and campaign appearances.
- A quest detail shows related NPCs, factions, locations, encounters, and rewards.

### Phase 3: Session Tools

- Add initiative/Vibe Check tracker.
- Add Chill, Heat, and condition tracking.
- Add encounter builder from compendium entries.
- Add handout mode.

Acceptance criteria:

- A GM can run a lightweight social combat encounter from the browser.
- The session room can import monsters/items/quests from the compendium without retyping.
- Player-safe mode hides GM-only notes.

### Phase 4: Character Workbench

- Add character creation and character sheets.
- Add class/background/skill/item selection.
- Add rules validation and printable output.

Acceptance criteria:

- A player can create a level 1 character from existing content.
- The sheet exposes the DDN-specific combat stats clearly.
- Missing race/feat/job data is treated as future scope, not broken UI.

## Implementation Recommendation

Use a small, explicit web stack:

- Next.js or Astro for static-first pages.
- TypeScript for content models.
- Zod or Valibot for CSV validation.
- Fuse.js or MiniSearch for fast client-side search.
- Framer Motion only where motion clarifies hierarchy.
- CSS modules or a small design-token file, not a heavy component framework at first.

Repo guardrails:

- Keep `node_modules`, `.next`, `dist`, and generated JSON ignored.
- Commit source, content, schemas, scripts, and design tokens only.
- Treat visual design as a first-class module, not a quick skin over tables.

## Open Product Decisions

- Should the first release be public-facing marketing plus compendium, or GM-only campaign prep?
- Should the visual identity lean more "luxury founder retreat" or more "AI productivity platform"?
- Should the homepage joke stay subtle until users scroll, or should the satire be obvious immediately?
- Should Session Room be local-only at first, or should multiplayer be planned from the start?
- Should "Compendium Arcology" become official language, or should the public UI use the simpler "Compendium" label?

## Immediate Next Steps

1. Pick the flagship campaign route: recommended `campaign_the_great_bangkok_burnout`.
2. Define the new design tokens before rebuilding the app.
3. Add content schemas for campaigns, quests, items, factions, and locations.
4. Build static homepage and compendium MVP.
5. Verify the site in desktop and mobile browsers before adding session tools.
