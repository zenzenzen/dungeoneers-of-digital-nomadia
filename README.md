# Dungeoneers of Digital Nomadia

**Swipe Right, Regret Later** is a browser party game about surviving a dating mixer with your dignity mostly intact. Draw a personality, fight social monsters, bargain for help, sabotage your friends, and reach a romance finale. No DM required.

Play with **one or more people**, including solo testing. Rooms have no fixed six-seat cap. The pacing target is 25–40 minutes for 3–6 friends; human playtests are still pending.

## Play locally

Use Node **24.19.0**. The application has its own dependencies and lockfile:

```sh
cd party-game
npm run setup
npm run serve
```

Open `http://localhost:3000`. Share the room code with another browser or device that can reach the same server. Stop with `npm run stop`.

Or start the single-service Docker build from the repository root:

```sh
docker compose -f party-game/compose.yaml up --build -d
```

The SQLite volume preserves rooms across restarts. [Deployment and recovery](party-game/docs/DEPLOYMENT.md) covers Railway, backups, and restoration. Railway publishing has not yet been verified.

## What is included

- Private rooms, server-owned rules, private hands, reconnect, timeouts, and rematches.
- Random classes and traits with visible conditional bonuses and penalties; negotiation, intervention cards, Chill, loot, levels, and finales.
- A 91-card dating-mixer launch deck, with 1,242 tagged catalogue entries linked to original source files.
- All six currencies preserved without implicit exchange rates; discoveries and endings persist locally without permanent power.
- Separate flavor, full artwork-brief, and clean image prompts for every playable card, plus individual files for all 18 launch monsters. Artwork remains placeholder.
- Mobile and desktop interfaces, deterministic rules tests, real multiplayer browser scenarios, Docker, and Railway configuration.

[App setup](party-game/README.md) · [Party rules](rules/party_game.md) · [Flavor and artwork guide](party-game/docs/PROMPT_GUIDE.md) · [Verification record](party-game/docs/VERIFICATION.md)

## Source library and earlier design work

The original tabletop library, jokes, and source prices remain available. Party adaptations live in `party-game/` and have a separate rules contract. CryptoCon and tropical coworking are future campaigns; only the dating mixer currently has a playable deck.

The former Next.js/pnpm workspace is retired. Design mockups remain under `design/`, and brand files remain under `brand/`. Content-coherence work is recorded in [the audit](CONTENT_COHERENCE_AUDIT.md) and [touch manifest](CONTENT_COHERENCE_TOUCH_MANIFEST.md).

<details>
<summary>Explore the original tabletop game and content families</summary>

## Original tabletop library

> *A satirical tabletop RPG where digital nomads battle through social combat, WiFi dead zones, and coworking space drama.*
>
> **Violence is replaced by vibes.**

---

## 🎲 What Is This?

**Dungeoneers of Digital Nomadia** is a tabletop RPG system that parodies modern digital nomad culture, startup life, influencer drama, and the eternal quest for good WiFi. Instead of swords and spells, adventurers wield laptops and lattes. Instead of hit points, you have **Chill**. Instead of armor class, you have **Cringe Resistance**.

Combat isn't physical—it's *social*. You **Gaslight**, **Gatekeep**, and **Girlboss** your way through encounters with Karens, Crypto Bros, LinkedIn Lunatics, and the dreaded Meeting That Could Have Been An Email.

---

## 🧠 Core Mechanics

### The Six Stats
| Stat | Governs |
|------|---------|
| **Strength** | Hustle endurance, blocking exits, forcing social compliance |
| **Dexterity** | Typing speed, dodging questions, ghosting |
| **Constitution** | Burnout resistance, jet lag immunity, caffeine tolerance |
| **Intelligence** | Fact-checking, coding, gatekeeping |
| **Wisdom** | Reading vibes, spotting manipulation, WiFi dowsing |
| **Charisma** | Clout, content quality, gaslighting power |

### Combat Stats
- **Chill** — Your health track, ego stability, and ability to stay in the room. At 0 Chill, you're **Triggered**.
- **Cringe Resistance** — How hard it is to embarrass you: `10 + floor(level / 2) + WIS mod + CHA mod + outfit/item bonuses`.
- **Vibe Check** — Initiative: `d20 + higher of DEX mod or CHA mod + bonuses`.

### Damage Types
| Type | Description |
|------|-------------|
| **Psychic** | Mental/emotional damage (the main damage type) |
| **Sonic** | Loud, annoying, grating attacks |
| **Reputation** | Damage to social standing (harder to heal) |
| **Cringe** | Secondhand embarrassment damage |
| **Necrotic** | Energy drain, will-sapping tedium |
| **Poison** | Toxic energy, fumes, bad street food, and chemical regret |

---

## 🎭 Sample Classes

| Class | Hit Die | Vibe |
|-------|---------|------|
| **Influencer** | d8 | Clout Aura, Vicious Mockery: Call Out, Sponsorship Deals |
| **Crypto Bro** | d6 | Blockchain Pact, FUD Blast, HODL defense |
| **Full Stack Wizard** | d6 | INT-based spellcasting, Coffee Recovery, School of Deprecation |
| **Yoga Teacher** | d8 | Chakra Points, Unarmored Defense, Stunning Strike: Namaste |
| **Karen** | d10 | Manager Summoning, Entitlement Aura, Speak to Manager |
| **Discord Mod** | d10 | Ban Hammer Aura, Sacred Fedora, Cleansing Touch: Delete |
| **Burnout Survivor** | d12 | Exhaustion Resistance, Quiet Quitting, Boundaries |
| **Reply Guy** | d6 | Notification Spam, Persistence, Sliding Into DMs |

*43 classes total and counting...*

---

## 👹 Sample Monsters

| Monster | Challenge | Signature Move |
|---------|----| ---------------|
| **The Karen** | 3 | Screech (3d6 sonic), Summon Manager |
| **The Energy Vampire** | 4 | Drain Will (2d8 necrotic + fatigue), Aura of Tedium |
| **The Mansplainer** | 2 | "Actually..." (reaction, disadvantage on target's check) |
| **The LinkedIn Lunatic** | 3 | Toxic Positivity (Immune to psychic damage) |
| **The MLM Hun** | 3 | "Hey Girl" (Charm), Pyramid Structure (summons minions) |
| **The Hostel Snorer** | 1 | Snore (AoE Asleep/Exhaustion) |
| **The Loud American** | 3 | Volume Eleven (3d6 sonic, 30ft radius) |
| **The Expat Bubble** | 4 | Engulf, Immune to local language |

*70+ monsters ready to ruin your day...*

---

## ✨ Sample Spells

| Spell | Level | Effect |
|-------|-------|--------|
| **Power Word: Cringe** | 9 | Target with <50 Chill is instantly Triggered |
| **Gaslight** | 5 | Target believes a false memory of your choice |
| **The Irish Exit** | 3 | Teleport out of social gathering without saying goodbye |
| **Where Are You From** | 1 | Compel target to reveal country of origin. +2 CHA if same nationality |
| **Meeting That Could Have Been An Email** | 2 | Applies Bored or Stunned to targets in 30ft |
| **Ratio** | 3 | Interrupts a spell, pitch, or post. If successful, caster takes psychic damage |
| **Have You Tried The Food Yet** | Cantrip | Fill dead air. +1 CHA for 10 minutes. No info exchanged. |

*100+ spells including the entire boring party small talk divination tree...*

---

## 🏠 Project Structure

```
📁 Dungeoneers of Digital Nomadia/
├── 📁 classes/          # 43 source classes
├── 📁 monsters/         # 70+ creatures to encounter
├── 📁 spells/           # 100+ spells and abilities  
├── 📁 skills/           # WiFi Dowsing, Doomscrolling, etc.
├── 📁 equipment/        # Laptops, lattes, and lifestyle gear
├── 📁 armors/           # "Outfits" that boost Cringe Resistance
├── 📁 rules/            # Combat system, status afflictions
├── 📁 locations/        # Coworking spaces, hostels, rooftop bars
├── 📁 npcs/             # Friends, frenemies, and vendors
├── 📁 quests/           # Adventures in Digital Nomadia
└── 📁 encounters/       # Pre-built social combat scenarios
```

---

## 🎯 Design Philosophy

1. **Combat is conversation** — All "attacks" are verbal/social: witty clapbacks, awkward silences, devastating ratio
2. **Stats are real** — Humor is paramount, but mechanics are consistent and playable
3. **Modern mundane is magical** — AirPods are Headgear of Isolation, Ring Lights are summoned for +2 CHA
4. **Everyone is a valid target** — Karens, Crypto Bros, Yoga Cultists, LinkedIn Lunatics, and yes, Digital Nomads themselves
5. **Parody with precision** — Mock the culture, keep the game functional

---

## 🚧 Status

The 2026-05-31 content coherence pass is implemented on `codex/content-coherence-audit-plan`.
The back-catalogue now uses the canon vocabulary for Chill, Cringe Resistance, damage types,
conditions, and currency IDs.

For the current full-campaign scope, file map, and Pathfinder/3.5-style rules gap check, see [`campaign_scope_of_work.md`](campaign_scope_of_work.md).
For the coherence decisions and touched-file manifest, see [`CONTENT_COHERENCE_AUDIT.md`](CONTENT_COHERENCE_AUDIT.md) and [`CONTENT_COHERENCE_TOUCH_MANIFEST.md`](CONTENT_COHERENCE_TOUCH_MANIFEST.md).

### Canon References

- [`rules/combat_system.md`](rules/combat_system.md) — combat chassis, Chill, Cringe Resistance, damage taxonomy
- [`rules/status_afflictions.md`](rules/status_afflictions.md) — conditions, buffs, debuffs, and recovery rules
- [`rules/controlled_vocabulary.md`](rules/controlled_vocabulary.md) — valid IDs for damage, conditions, and currency
- [`rules/content_schema_standards.md`](rules/content_schema_standards.md) — target schemas for app-ready content

### Validation

```bash
python3 tools/content_audit.py
python3 tools/content_audit.py --strict
```

---

## 💬 Contributing

Got ideas for classes, monsters, spells, or items? The world of Digital Nomadia is vast and full of people who deserve to be satirized. Open an issue or PR!

---

## 📜 License

This project is for fun and parody purposes. Play responsibly. Touch grass occasionally.

---

*Remember: If you reach 0 Chill, you're not dead—you're just Triggered. Take a Self-Care short rest and come back when you've processed your emotions.*

</details>
