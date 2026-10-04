# Party mode: Swipe Right, Regret Later

This is a separate mode. Its rules override the tabletop combat chassis only inside `party-game/`. The original RPG rules and source library remain preserved.

## Setup and objective

One or more connected guests start at level 1 with 6 Chill, one random class, two different traits, one equipment card, and three action cards. Start with 100 cash and 1 social capital; other balances start at zero. The host deals; no DM adjudicates play. There is no fixed seat cap. Every seated player must be connected to start. Solo uses the same encounters, progression, and endings; help deals require another player. The 25–40 minute pacing target remains intended for three to six people, pending human playtests.

Defeat monsters to gain levels. At level 5, choose and defeat a finale to achieve a fictional romance ending. Only the active player wins. After eight complete rounds, a run without a winner ends with unsuccessful character endings. No player is eliminated.

## A turn

Preparation → encounter → optional help deal → intervention → resolution → cleanup.

There is a 90-second turn limit. Normal later turns draw one action card. Before revealing, buy at most one market item or use therapy once. Instead of an encounter, self-care restores 3 Chill and draws an action card, but grants no level.

Reveal from the tier associated with your level (1–2, 3–4, or 5). Events apply their printed effects immediately. Monsters have strength, rewards, loot, and a failed-escape setback. A finale is an explicit choice available at level 5.

Negotiation lasts up to 25 seconds, preserving time for the 20-second intervention window. The active player can open interventions early or attempt an escape. A timeout opens interventions; it never gives the active player an automatic win.

## Strength, help, and sabotage

Strength is level plus equipment plus matching class/trait effects and played modifiers. Bonuses and penalties trigger from encounter tags. The app displays every contribution. Higher strength wins; ties favor the encounter.

The active player can offer one other connected, non-Triggered player a currency amount and/or part of the printed loot. The helper must accept. Accepted helpers stay committed for that encounter, even if they disconnect. Their strength joins the active player’s. Promised currency stays reserved. Payment happens only after victory; helpers gain no level. Loot means action-card draws in this launch campaign.

Each player may make one intervention: play an action card, or spend one available social capital to protect the party from the next hostile strength action. Shields are consumed in order. Cards resolve in server arrival order. A pass is final for that encounter. Resolution happens when all connected players pass or the window expires.

Victory grants the card’s rewards and one level, capped at 5. Each actual level gained draws a new trait. At three traits, replace one or discard the new draw. Equipment is capped at two; choose a replacement when buying a third. End your own turn with no more than five action cards.

## Escape, Chill, and recovery

An escape roll of 5 or 6 succeeds. Escape gives no rewards. On a failed escape, both the active player and an accepted helper lose the printed Chill amount. An automatic-escape card can be used only by the active player.

Temporary Chill absorbs losses first. At zero Chill, become Triggered and discard one random action card. Triggered players cannot help or intervene until their next personal turn, which restores 4 Chill. Ordinary therapy restores 3 Chill, consuming one `therapy_healedness` token before charging 50 cash. At the start of a personal turn, social capital refreshes to at least 1.

## Currency and continuity

Keep `cash_cp`, `btc`, `exposure`, `therapy_healedness`, `social_capital`, and `temp_chill` separate. BTC balances use integer satoshis internally. Prices and rewards explicitly choose their resource; no automatic exchange exists. Original source prices remain unchanged in the archive; party prices are adaptations.

At the deal, complete copies of the class, trait, equipment, and action pools scale with the number of seats. Relative card quantities stay unchanged, each physical copy has a unique identity, and every player receives a full build. Discarded cards recycle when their corresponding deck empties. Seeded randomness and all outcomes belong to the server. Disconnects do not reroll draws or cancel deals. A solo table pauses when its sole player disconnects. A multiplayer table pauses below two connected players. Pausing preserves remaining time. Disconnected turns still time out when at least two players remain. A timed-out preparation takes self-care; cleanup discards the pending trait and excess hand cards before advancing.

Undealt lobbies and rematches adopt the current content version; started runs keep their pinned bundle. Rematches reset power and wallets. Discovered cards and personal endings persist in the player’s browser, with export/import. They confer no competitive advantage.
