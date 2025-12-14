# Specialized Game Modes

> Quick-play variants of Dungeoneers of Digital Nomadia designed for specific themes, party types, and time constraints. Perfect for game nights, icebreakers, or when you want concentrated chaos.

---

## Mode Design Philosophy

Standard campaigns run 2-4 hours with full character builds and narrative arcs. These **Speed Modes** are designed for:

- **Duration**: 10-30 minutes per session
- **Characters**: Pre-gen or 5-minute quick builds
- **Encounters**: 2-3 focused interactions
- **NPCs**: 1-2 per session maximum
- **Victory Conditions**: Clear, fast, hilarious

---

# 🌹 SPEED DATING SHOWDOWN

*"Swipe Right or Die Trying"*

### Overview
Players compete in a series of rapid-fire romantic/social encounters. Each player attempts to charm, impress, or survive dates with increasingly unhinged NPCs. Last person with Chill remaining wins—or the first to successfully "Match" with 3 dates.

### Quick Build (2 minutes)
| Step | Options |
|------|---------|
| **Name** | Your worst dating app handle |
| **Primary Stat** | Pick ONE: CHA (Smooth), WIS (Perceptive), or DEX (Quick Exit) |
| **Chill** | 15 + CON modifier (everyone starts with CON 10) |
| **CR** | 10 + WIS mod + CHA mod |
| **Special Move** | Pick one: *Unmatch* (flee encounter), *Super Like* (advantage on one roll), *Report Profile* (force NPC reroll) |

### The Date Pool (Roll d8)

| d8 | Date NPC | Danger Level | Red Flag |
|----|----------|--------------|----------|
| 1 | **The Love Bomber** | CR 2 | Gives compliment every turn; if you accept 3, you're Charmed (stuck) |
| 2 | **The Breadcrumber** | CR 1 | Disadvantage on all attacks; can't be pinned down |
| 3 | **The Catfish** | CR 3 | Reveal at end of date: stats were lies. Take 2d6 psychic. |
| 4 | **The Situationship Seeker** | CR 2 | Immune to commitment-based attacks; drains 1 Chill/round of ambiguity |
| 5 | **The Oversharer** | CR 2 | First attack: 3d6 psychic (trauma dump). Subsequent: 1d4 psychic |
| 6 | **The Photo Was Old** | CR 1 | Perception DC 14 to notice. If failed, Cringed for encounter |
| 7 | **The Podcast Pitcher** | CR 2 | Must listen to 3-round pitch. WIS save DC 13 or Bored (disadvantage) |
| 8 | **The Negging Artist** | CR 3 | +4 to attack. Each hit reduces your attack by 1 (confidence drain) |

### Speed Dating Rules

**Round Structure:**
1. **First Impression** (1 round): Both sides make CHA checks. Higher roll speaks first.
2. **The Conversation** (2-3 rounds): Social combat or roleplay. GM describes escalating red flags.
3. **The Check, Please** (1 round): Decide: **Match** (success), **Ghost** (flee), or **Block** (mutual destruction).

**Match Conditions:**
- Reduce date to 0 Chill without going to 0 yourself = **Match** (they're into you)
- Both players above half Chill after 3 rounds = **Mutual Match**
- Both at 0 Chill = **Toxic Match** (you're now in a situationship)

**Victory Conditions:**
- **Individual Win**: First to 3 Matches OR last player standing
- **Group Win**: Everyone survives 5 dates (friendship ending)

### Speed Dating Monsters (Specialized)

```
monster_love_bomber,Love Bomber,Humanoid,Medium,12,25,30 ft,2,"Str 8, Dex 12, Con 10, Int 10, Wis 8, Cha 18","Compliment Barrage (1d4 charm stacks); Future Faking (2d6 psychic if rejected)","Intensity Aura (DC 14 WIS save or compelled to respond)"

monster_breadcrumber,Breadcrumber,Humanoid,Medium,14,18,35 ft,1,"Str 8, Dex 16, Con 10, Int 12, Wis 12, Cha 14","Maybe Later (Dodge); Mixed Signal (Confusion)","Elusive (Cannot be grappled or pinned to plans)"

monster_catfish,Catfish,Shapechanger,Medium,16,30,30 ft,3,"Str 10, Dex 14, Con 12, Int 14, Wis 10, Cha 16","Angle Shot (Illusion); Filter Magic (Disguise Self at will)","Reveal (At encounter end, true form causes 2d6 psychic)"

monster_situationship_seeker,Situationship Seeker,Humanoid,Medium,13,28,30 ft,2,"Str 10, Dex 14, Con 12, Int 12, Wis 10, Cha 14","Define This (Reversal - reflect question); Ambiguity Drain (1 Chill/round)","Commitment Immunity (Immune to relationship-defining attacks)"
```

### Sample Speed Date Encounter

> **THE OVERSHARER**
> 
> *Round 1*: "So I just got out of a really toxic relationship—anyway, my therapist says I'm an empath—do you believe in astrology? I'm a Scorpio rising with—"
> **Attack**: Trauma Dump (3d6 + CHA psychic). Player must WIS save DC 14 or be Stunned (overwhelmed).
> 
> *Round 2*: "—and then my mother said I'd never amount to anything, which is why I started my true crime podcast—"
> **Attack**: 1d4 psychic per round of continued listening.
> 
> *Round 3*: "Wait, you're leaving? But I just got to the part about my ex's restraining order!"
> **Reaction**: If player attempts to Ghost, Oversharer gets Attack of Opportunity: "I thought we had a connection!" (2d6 reputation damage).

---

# 🍺 DRUNK CHALLENGE MODE

*"Roll for Sobriety"*

### Overview
A chaotic party mode where players take on increasingly absurd challenges while managing their **Intoxication Level**. Perfect for actual drinking games (or mock-drinking with ridiculous substitutes). The game escalates as players get "worse" at everything.

### Quick Build (3 minutes)
| Step | Options |
|------|---------|
| **Name** | Your drunk alter-ego |
| **Tolerance** | CON score (start at 12, roll 3d6 for variance if desired) |
| **Chill** | 20 (you start confident) |
| **CR** | 12 + CON mod (liquid courage) |
| **Intoxication** | Start at Level 0 |

### Intoxication Levels

| Level | Name | Effect |
|-------|------|--------|
| 0 | **Sober** | Normal rules. Boring. |
| 1 | **Buzzed** | +2 CHA, -1 WIS. "I'm actually better at this after a drink." |
| 2 | **Tipsy** | +3 CHA, -2 WIS, -1 DEX. Advantage on Intimidation, disadvantage on Stealth. |
| 3 | **Drunk** | +2 CHA, -3 WIS, -2 DEX, -1 INT. Must speak in character voice. |
| 4 | **Hammered** | -2 ALL stats. Every action requires CON save DC 12 or do the opposite. |
| 5 | **Blackout** | 0 Chill. Wake up somewhere weird. Roll on Consequences table. |

### Gaining Intoxication
- **Drink Challenge**: Roleplay taking a drink → +1 Intoxication
- **Social Pressure**: Fail a CHA save when someone buys you a round → +1 Intoxication
- **Time Passes**: Every 3 rounds of real time → +1 Intoxication
- **Power Move**: Voluntarily +1 Intoxication for advantage on next roll

### Losing Intoxication
- **Water Break**: Spend action. CON save DC 10 → -1 Intoxication
- **Food**: Spend 2 rounds eating → -1 Intoxication
- **Fresh Air**: Leave scene for 1 round → -1 Intoxication (but may miss events)
- **Time**: After combat ends, -1 per 10 minutes real time

### Drunk Challenge Encounters (Roll d6)

| d6 | Challenge | Mechanics |
|----|-----------|-----------|
| 1 | **Karaoke Battle** | Performance check vs rival. Loser gains +1 Intoxication. |
| 2 | **Bar Argument** | Debate nonsense topic. CHA vs CHA. Loser takes 2d6 psychic (embarrassment). |
| 3 | **Dance Floor Showdown** | DEX contest. Fail by 5+? Fall prone. +1 Intoxication either way. |
| 4 | **Text Your Ex Challenge** | WIS save DC 15 or send a message. Fail? Roll on Regret table. |
| 5 | **Order Food Coherently** | INT check DC (10 + Intoxication). Fail? You get mystery food. |
| 6 | **Make a New Best Friend** | CHA check. Success: gain temporary ally. Fail: gain temporary nemesis. |

### The Consequences Table (Blackout Recovery)

Roll d20 when recovering from Level 5:

| d20 | Where Did You Wake Up? |
|-----|------------------------|
| 1-3 | On a stranger's couch. They seem nice? |
| 4-6 | In the back of a tuk-tuk. Still moving. |
| 7-9 | On the beach. It's 6 AM. Crabs are watching. |
| 10-12 | In a 7-Eleven, holding a corn dog. |
| 13-15 | At the airport. You have a ticket to somewhere. |
| 16-17 | In someone's Instagram story. It has 10k views. |
| 18-19 | You're now admin of a Facebook group you don't recognize. |
| 20 | You wake up having started a business. Roll to see if it's profitable. |

### Victory Conditions

- **Last One Standing**: Final player not at Blackout wins
- **Challenge Champion**: Most challenges won (regardless of state)
- **Controlled Chaos**: Win 3 challenges while staying at exactly Level 3

### Bar Encounter Monsters (Specialized)

```
monster_shot_pusher,Shot Pusher,Humanoid,Medium,14,30,30 ft,2,"Str 10, Dex 14, Con 18, Int 10, Wis 8, Cha 16","Round on Me (CHA save DC 14 or +1 Intoxication); Peer Pressure (1d6 + CHA psychic if refused)","Tolerance (Immune to Intoxication effects)"

monster_bathroom_line_blocker,Bathroom Line Blocker,Humanoid,Large,16,40,0 ft,2,"Str 16, Dex 8, Con 16, Int 8, Wis 10, Cha 8","Won't Move (Grapple); Small Talk (1d4 psychic/round)","Immovable (Cannot be pushed)"

monster_closing_time_dj,Closing Time DJ,Construct,Medium,15,35,0 ft,3,"Str 8, Dex 12, Con 14, Int 10, Wis 10, Cha 16","One More Song (Extends encounter); Last Call (Forces final drink check)","Crowd Control (AoE movement effects)"
```

---

# 🖥️ TECH NERD BATTLE ROYALE

*"My Framework Could Beat Up Your Framework"*

### Overview
Players are developers, IT professionals, or tech enthusiasts locked in brutal intellectual combat. Debates over tabs vs spaces can turn lethal. The battlefield: a coworking space, conference, or cursed Slack channel.

### Quick Build (3 minutes)
| Step | Options |
|------|---------|
| **Handle** | Your tech persona (optional: add "10x" prefix) |
| **Stack** | Pick your tech identity: **Frontend**, **Backend**, **DevOps**, **AI/ML**, **Security**, **Product** |
| **Primary Stat** | INT (raw knowledge), WIS (experience), or CHA (thought leadership) |
| **Chill** | 12 + INT mod (knowledge is armor) |
| **CR** | 10 + INT mod + WIS mod (pattern recognition) |
| **Hot Take** | Your signature controversial opinion (source of power and vulnerability) |

### Tech Stacks (Subclasses)

| Stack | Bonus | Weakness | Signature Move |
|-------|-------|----------|----------------|
| **Frontend** | +3 Deception (it works on my machine), Advantage vs non-tech | Vulnerable to "View Page Source" attacks | *CSS Crimes* (blind target with visual chaos) |
| **Backend** | +3 to Analysis, Immune to surface-level attacks | Disadvantage on explaining to non-devs | *SQL Injection* (bypass all defenses, 3d6 psychic) |
| **DevOps** | +3 to Intimidation (production access), can end encounters early | Vulnerable to "Did you check the logs?" | *Terraform Destroy* (AoE nuke, affects allies) |
| **AI/ML** | +3 to Bullshit, can make predictions (50% accurate) | Vulnerable to "But does it generalize?" | *Overfit* (perfect counter, but only works once) |
| **Security** | +3 Perception, can counter any attack once per encounter | Vulnerable to social engineering | *Pentest* (expose all enemy vulnerabilities) |
| **Product** | +3 Persuasion, can redirect conversations | Vulnerable to "When's the deadline?" | *Pivot* (completely change encounter objective) |

### Debate Attack Actions

| Attack | Roll | Damage | Effect |
|--------|------|--------|--------|
| **Well, Actually** | INT vs CR | 1d6 + INT psychic | If crit, target must acknowledge you're right |
| **Have You Tried Googling?** | WIS vs CR | 1d8 + WIS condescension | Target has disadvantage on next attack (shamed) |
| **Works on My Machine** | DEX save DC 14 | Avoid problem | Transfers problem to someone else |
| **Read the Docs** | INT vs CR | 2d6 + INT psychic | Only works if target hasn't actually read docs |
| **That's a Skill Issue** | CHA vs CR | 1d10 + CHA psychic | Risk: if you can't prove skill, take reflected damage |
| **Ship It** | No roll | End encounter | Consequences happen 1d4 rounds later (tech debt) |

### The Holy Wars (Encounter Triggers)

Any of these topics immediately initiates combat:

| Topic | Escalation DC | Critical Mass |
|-------|---------------|---------------|
| Tabs vs Spaces | DC 10 | 2 rounds |
| Vim vs Emacs (vs VS Code) | DC 8 | Immediate |
| Static vs Dynamic Typing | DC 12 | 3 rounds |
| Microservices vs Monolith | DC 11 | 4 rounds of architecture diagrams |
| Is X a Real Programming Language? | DC 9 | Until someone says "Turing complete" |
| AI Will Replace Developers | DC 6 | Immediate existential crisis |

### Tech Conference Encounter Table (Roll d8)

| d8 | Encounter | Challenge |
|----|-----------|-----------|
| 1 | **The Recruiter Ambush** | Survive 3 rounds of aggressive LinkedIn messaging in person |
| 2 | **Lightning Talk Roast** | Give a 2-minute pitch. Audience votes. Bottom score takes 3d6 psychic. |
| 3 | **Free Swag Stampede** | DEX save DC 14 or trampled for 2d4 bludgeoning |
| 4 | **The Hallway Track Debate** | Random holy war topic. No preparation. |
| 5 | **Imposter Syndrome Attack** | WIS save DC 15 or believe you don't belong. Disadvantage for 1 hour. |
| 6 | **The Networking Event** | CHA check DC 12 to successfully small talk. Fail? -1 INT (brain drain). |
| 7 | **Demo Gods** | Your demo WILL fail. INT check DC 16 to recover gracefully. |
| 8 | **Former Coworker** | Roll relationship: 1-3 awkward, 4-5 genuine connection, 6 you owe them money |

### Tech Villain Monsters (Specialized)

```
monster_10x_engineer,10x Engineer,Humanoid,Medium,18,50,40 ft,5,"Str 8, Dex 14, Con 10, Int 20, Wis 14, Cha 8","Code Review (3d6 + INT psychic); Rewrite From Scratch (Destroys all previous work); Leet Code (Stun if target can't solve)","Mythical Productivity (Acts twice per round)"

monster_scrum_master_gone_wild,Scrum Master Gone Wild,Aberration,Medium,14,35,30 ft,3,"Str 10, Dex 10, Con 12, Int 10, Wis 8, Cha 18","Standup That Could Be Email (2d6 + CHA psychic); Sprint Planning (Traps for 1 hour); Velocity Check (Shame attack)","Agile Shield (Resistant to direct criticism)"

monster_legacy_codebase,Legacy Codebase,Construct,Huge,8,100,0 ft,6,"Str 20, Dex 4, Con 20, Int 4, Wis 4, Cha 2","Undocumented Behavior (Random effect); Memory Leak (Drains all resources over time); Spaghetti Tangle (Grapple everything)","Too Big to Refactor (Cannot be destroyed, only contained)"

monster_stack_overflow_troll,Stack Overflow Troll,Humanoid,Medium,15,30,30 ft,2,"Str 8, Dex 12, Con 10, Int 16, Wis 14, Cha 6","Marked as Duplicate (Silences target); Downvote (1d8 + INT reputation damage)","Pedantic (Immune to imprecise language)"

monster_crypto_blockchain_guy,Crypto Blockchain Guy,Humanoid,Medium,12,28,30 ft,2,"Str 10, Dex 12, Con 10, Int 10, Wis 6, Cha 16","It's Decentralized (Cannot be countered with logic); WAGMI (Buff allies + self-delusion)","Bag Holder (Immune to financial criticism until proven broke)"
```

### Victory Conditions

- **Conference King/Queen**: Win 5 debates or technical encounters
- **Thought Leader**: Gain 3 followers (NPCs who agree with your hot take)
- **Shipped It**: Successfully deploy something to production (even if broken)
- **Imposter No More**: Successfully prove competence under pressure 3 times

---

# 🧠 BRAINSTORMING: FUTURE SPECIALIZED MODES

> Development notes and ideas for additional themed game variants.

---

## In Development

### 🏋️ GYM BRO GAUNTLET
*"Your Gains Are Under Attack"*

**Concept**: Protein-fueled combat in fitness spaces. Track macros instead of mana. Every encounter involves unsolicited advice.

**Core Mechanics Ideas**:
- Replace Chill with **Gains** (can be stolen by cardio)
- **Pump** meter that buffs but drains
- Mirror Check actions for self-buff
- Leg Day Vulnerability

**Target Audience**: Comedy fitness nights, gym-going friend groups

**Status**: Concept only

---

### 🎤 PODCAST BATTLEGROUND
*"Everyone Has a Podcast. Most Shouldn't."*

**Concept**: Compete to build the most successful podcast while sabotaging others. Listener counts as victory points. Actually recording content optional.

**Core Mechanics Ideas**:
- **Listener** currency that fluctuates
- Guest appearances as temporary buffs
- Controversy = high risk, high reward
- Sponsor attacks (read this ad or lose resources)

**Target Audience**: Media-savvy groups, content creator circles

**Status**: Concept only

---

### 💼 LINKEDIN WARFARE
*"Agree?"*

**Concept**: Corporate social combat. Build clout through increasingly unhinged professional posts. Get endorsed. Dodge HR.

**Core Mechanics Ideas**:
- **Engagement** as initiative modifier
- Humblebragging as primary attack
- Profile views as scouting
- Connection requests as alliance mechanics
- "Thoughts?" as nuclear option

**Target Audience**: Anyone who has suffered through corporate culture

**Status**: Partially designed (see LinkedIn Lunatic monster entry)

---

### 🧘 WELLNESS RETREAT SURVIVAL
*"Namaste in This Economy?"*

**Concept**: Survive a weekend at a questionable wellness center. Dodge cults. Question supplements. Find WiFi.

**Core Mechanics Ideas**:
- **Enlightenment** meter (high = detached, low = skeptical)
- No phone creates disadvantage
- Silent meditation as stealth mode
- "Guru" as final boss

**Target Audience**: Yoga skeptics, wellness industry survivors

**Status**: Concept only

---

### 👔 COWORKING SPACE CONQUEST
*"Reserved This Hot Desk 3 Hours Ago"*

**Concept**: Territory control in a shared workspace. Claim outlets. Guard the good chair. Survive the networking event.

**Core Mechanics Ideas**:
- **Turf** system with control points
- Passive aggressive escalation
- "Actually Using the Phone Booth" as nuclear option
- Free beer o'clock as chaos round

**Target Audience**: Remote workers, freelancers, digital nomads

**Status**: Strong overlap with core game; may integrate rather than separate

---

### 📱 INFLUENCER ISLAND
*"Content or Die"*

**Concept**: Battle royale where influence is oxygen. Lose followers = lose health. The algorithm is God.

**Core Mechanics Ideas**:
- Real-time follower count as health
- Content calendar as action economy
- Collabs as temporary alliances (betrayal built in)
- "Going Viral" as random encounter
- "Main Character Energy" as final form

**Target Audience**: Anyone online too much

**Status**: High potential, needs balance testing

---

## Mode Design Template

When creating new specialized modes, use this structure:

```markdown
## [EMOJI] MODE NAME
*"Tagline"*

### Overview
[2-3 sentences describing the core concept and vibe]

### Quick Build
[Table with simplified character creation - max 3 minutes]

### Core Mechanic Change
[What replaces or modifies standard Chill/CR/Initiative]

### Unique Resource
[If applicable - what new trackable resource exists]

### Encounter Table (d6 or d8)
[Themed random encounters]

### Specialized Monsters (3-5)
[NPCs/enemies built for this mode]

### Victory Conditions (2-3 options)
[How players win - competitive, cooperative, chaos]

### Estimated Play Time
[10-30 minutes target]
```

---

## Playtesting Notes

### Speed Dating
- [x] Basic mechanics work
- [ ] Need more Date NPCs (target: 20)
- [ ] "Toxic Match" outcome needs consequence table
- [ ] Consider: "Ex Shows Up" random event

### Drunk Challenge
- [x] Intoxication levels feel right
- [ ] Consequences table needs expansion
- [ ] Real drinking integration needs safety notes
- [ ] Consider: Hangover rules for multi-session

### Tech Nerd Battle
- [x] Holy Wars list is solid
- [ ] More stack archetypes needed
- [ ] Conference encounters need variety
- [ ] Consider: Remote vs In-Person modifiers

---

## Community Suggestion Queue

*Ideas submitted by players for future consideration:*

1. **Airport Layover Limbo** - Survive a 12-hour delay
2. **Hostel After Dark** - Horror survival with no private rooms
3. **Wedding Plus One** - Social survival at someone else's wedding
4. **Family Group Chat** - Navigating holiday drama
5. **Apartment Hunting** - PvP real estate combat
6. **Job Interview Gauntlet** - Multi-stage combat with HR bosses
7. **Music Festival Expedition** - Resource management + social chaos
8. **Book Club Bloodbath** - Competitive literary analysis

---

## Integration with Core Game

These modes can be used as:

1. **Standalone one-shots**: Perfect for new players or short sessions
2. **Campaign interludes**: Side quest breaks from main narrative
3. **Arena modes**: Competitive PvP with betting
4. **Tutorial modes**: Introduce mechanics in themed chunks
5. **Party games**: When you need games for actual parties

### Conversion Notes

Standard campaign characters can enter specialized modes with these adjustments:

- **Chill → Mode Health**: Convert at 1:1 or use mode-specific total
- **Skills carry over**: Apply relevant skill bonuses to mode checks
- **Equipment stays**: Themed reinterpretation of bonuses
- **Class features**: GM discretion on what applies

---

*Last Updated: [Insert Date]*
*Version: 0.1 (Alpha)*
*Status: Active Development*

