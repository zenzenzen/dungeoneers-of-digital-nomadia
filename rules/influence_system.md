# Influence, Reputation, and Faction Play

> Some fights are won by surviving the scene. The better fights are won three sessions earlier when everyone already thinks your rival is cringe.

This subsystem handles campaigns built around coworking wars, union drives, pitch competitions, community politics, dating ecosystems, and public meltdowns.

## The Four Influence Tracks

Every important NPC, group, or faction can track these independently:

- **Trust**: how much they believe you mean what you say
- **Access**: how much of their space, channel, or inner circle you can reach
- **Leverage**: what dirt, favors, proof, or soft power you hold over them
- **Heat**: how much scrutiny, suspicion, or public pressure is on you

Recommended scale:

- `0-5` for simple campaigns
- `0-10` for faction-heavy campaigns

## Default NPC Profile

For important NPCs, store:

- `disposition`: hostile, wary, neutral, warm, loyal
- `trust`
- `access`
- `leverage`
- `heat`
- `faction_id`
- `influence_threshold`

### Influence Threshold

Use:

`5 + level + WIS mod or CHA mod`

This is how much total pressure or progress you usually need before a major shift happens: confession, alliance, sponsorship, invite, leak, or surrender.

## Influence Scene Loop

1. Set the stake.
2. Pick which track matters.
3. Play 3-5 exchanges using standard, move, swift, and immediate actions.
4. Apply progress, backlash, or fallout.
5. Convert result into a persistent relationship change.

## Common Influence Actions

- **Read the Room**: WIS or Insight-style roll to learn which track matters most
- **Network**: CHA roll to gain Access
- **Trade Favor**: spend Social Capital to gain Trust or temporary Access
- **Leak Receipts**: spend Leverage to add Heat to an enemy
- **Public Apology**: reduce Heat, recover Trust if the audience buys it
- **Hard Launch**: make the relationship or alliance public; big reward, big backlash risk
- **Ghost**: exit cleanly, preserve Heat but usually lose Trust
- **Gather Information**: build Leverage without immediately escalating

## Factions

Every faction should have:

- `faction_id`
- `name`
- `agenda`
- `resource_pool`
- `morale`
- `territory`
- `rivals`
- `reward_table`

### Suggested Shared Faction Resources

- **Morale**: willingness to keep showing up
- **Cashflow**: rent, drinks, startup runway, bribe budget
- **Clout**: public reach and narrative control
- **Territory**: control of venues, channels, or neighborhoods

This makes campaigns like coworking takeovers, crypto cult infiltration, and union-building actually playable instead of pure improv.

## Favors and Debts

Track favors explicitly.

- Minor Favor: worth 1 Access or 1 Trust
- Major Favor: worth 2-3 Access or 2 Leverage
- Burning a favor should leave a mark in the data model

Suggested fields:

- `favor_id`
- `owes_npc_id`
- `owed_to_npc_id`
- `value`
- `due_by`
- `fallout_if_unpaid`

## Reputation Fallout

When a scene ends, do not only ask who won the round. Ask what the room remembers.

Apply one or more of:

- `Trust +1 / -1`
- `Heat +1 / +2`
- `Access gained or revoked`
- `Leverage created, spent, or exposed`
- `Faction morale shift`
- `Status effect` such as `Cancelled`, `Judged`, `Shadowbanned`, or `Doubt`

## Campaign-Scale Clocks

Use clocks or thresholds for long arcs:

- `investigation_clock`
- `union_support_clock`
- `brand_meltdown_clock`
- `visa_risk_clock`
- `gentrification_pressure_clock`
- `scam_exposure_clock`

Each should be tied to concrete triggers, not vibes alone.

## Database Guidance

For future app and card support, keep flavor and rules separate:

- `flavor_text`: the funny copy
- `rules_text`: the exact effect
- `effect_rows` or `effects_json`: machine-readable outcomes

The joke can still slap. It just does not get to hide the win condition anymore.

