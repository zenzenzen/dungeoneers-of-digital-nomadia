# Limited Run Campaign Pack

Status: playtest draft
Target runtime: 30-120 minutes per campaign
Design route: load-ego game-development, using game designer and game developer categories

This pack addresses the current short-run gap: DDN already has a strong voice, a combat chassis, factions, NPCs, monsters, and locations, but it needs compact campaign packets with varied encounter structures. These are written for fast play, feedback, and quick iteration, not for a full adventure path.

## Design Rails

- Start in motion. No "you meet in a cafe" unless the cafe is already on fire socially.
- One short run should have one obvious goal, one pressure clock, and one memorable room-level situation.
- Every run needs at least two viable solution routes: social pressure, investigation, stealth, trade, public spectacle, tech fix, or graceful retreat.
- Cuttable beats are named so a DM can land the plane when the table is slow.
- The joke should create a decision, not just a reference.
- Do not repeat one structure. This pack rotates heist, queue negotiation, digital trial, clue mystery, public tribunal, event crisis, pitch showdown, faction-clock conflict, survival comedy, timed media gauntlet, public mystery boss, and multi-route infiltration.

## DM Source Notes

The external references are design inspiration, not copied adventure text.

- [Sly Flourish Lazy GM Resource Document](https://slyflourish.com/lazy_gm_resource_document.html): used for strong starts, flexible scene lists, secrets/clues, evocative locations, and lightweight prep.
- [The Alexandrian: Three Clue Rule](https://thealexandrian.net/wordpress/1118/roleplaying-games/three-clue-rule): used for the clue-net runs so missing one clue does not stall the table.
- [The Alexandrian: Don't Prep Plots - Tools, Not Contingencies](https://thealexandrian.net/wordpress/37422/roleplaying-games/dont-prep-plots-tools-not-contingencies): used to frame situations with tools and pressure instead of scripted paths.
- [D&D Beyond forum: simple 2-hour one-shot for a new DM](https://www.dndbeyond.com/forums/dungeons-dragons-discussion/dungeon-masters-only/56598-looking-for-simple-2-hour-one-shot-for-4-5-level-3): used for the "narratively simple, adaptable, point A to point B" constraint.
- [Reddit r/DMAcademy: work one-shot traps](https://www.reddit.com/r/DMAcademy/comments/1cjz43o/i_will_dm_a_oneshot_or_short_campaign_at_work_ive/): used for the rough rule that one focused encounter can fill an hour, plus the advice to give each character a way to shine.
- [Reddit r/DMAcademy: best one-shots](https://www.reddit.com/r/DMAcademy/comments/1ix2hjb/whats_the_best_one_shot_you_ever_play_as_dm/): used for the principle that weird situations work when players still have clear agency.
- [Reddit r/DMAcademy: funny/lighthearted ideas](https://www.reddit.com/r/DMAcademy/comments/lamscz/funny_lighthearted_one_shot_or_campaign_ideas/): used for the "challenge without lethal cruelty" comedy-dungeon lesson.
- [Winghorn Press: A Wild Sheep Chase](https://winghornpress.com/adventures/a-wild-sheep-chase/): used as a model for a compact absurd premise that still has concrete action.
- [Anvil & Ink: 2 Hour D&D Adventure Guide](https://anvilnink.com/2-hour-dnd-adventure-guide/): used for in-medias-res starts, tight scene economy, and short-session combat limits.

## 30-Minute Micro Campaigns

### The Last Functioning Outlet Heist

- Encounter: `encounter_last_outlet_heist`
- Level: 1-2
- Core structure: single-objective heist
- Location: `location_avocado_cafe`
- Pressure clock: 4 battery segments

Strong start: The party's laptop hits 4 percent while Barista Kyle announces that the last working outlet is now "for customers who ordered food, emotionally speaking."

Scenes:

1. Socket read: the outlet is visible, occupied, and socially protected by a Digital Nomad Evil.
2. Approach choice: distract the Queue Skipper, invoke fake fire-code knowledge, barter coffee, or crawl under the table like a cable goblin with better posture.
3. Complication: the power strip sparks, the laptop battery drops, and someone says "I actually reserved that outlet."
4. Resolution: claim power, share power, or accidentally become cafe policy.

Cuttable beat: Skip the complication and resolve on the first successful approach if the table is under 20 minutes.

Failure should still be funny: the laptop dies mid-sentence and autocorrects the last commit message into a cry for help.

DM note: This borrows Sly Flourish's strong-start discipline and the forum advice that a one-hour-ish game should not hide its goal. The fun hypothesis is that socket access is absurdly petty but mechanically urgent.

Feedback prompts:

- Did every PC find a way to help within one scene?
- Did the battery clock create pressure without feeling punitive?
- Was the funniest solution also mechanically viable?

### Visa Counter Speedrun

- Encounter: `encounter_visa_counter_speedrun`
- Level: 1-3
- Core structure: public negotiation / queue obstacle
- Location: `location_border_crossing_office`
- Pressure clock: 4 counter-closing segments

Strong start: The party is already at window B-17. Window B-17 is blinking. The Embassy Official has the stamp. The printer has become a regional antagonist.

Scenes:

1. Immediate ask: get the stamp, appointment, or number with actual authority.
2. Queue ecology: a Visa Runner, a Queue Skipper, and a person holding 17 passports all have different incentives.
3. Printer villainy: `visa_printer_jam` forces a tech/bureaucracy solve or a public charm pivot.
4. Fallout: legal stamp, unofficial maybe-stamp, or "come back tomorrow" with Heat.

Cuttable beat: Remove the Queue Skipper and make the printer the sole complication.

DM note: Based on short one-shot advice favoring simple, adaptable transit goals. Do not make this a puzzle maze. Let the party know what they need and let the comedy come from how many tiny systems resist it.

Feedback prompts:

- Was the queue legible as a social battlefield?
- Did the players understand their options in the first five minutes?
- Was failure playable, or did it feel like paperwork homework?

### The Group Chat Trial

- Encounter: `encounter_group_chat_trial`
- Level: 2-3
- Core structure: digital courtroom / reputation triage
- Location: `location_online`
- Pressure clock: 4 viral-momentum segments

Strong start: A cropped screenshot has entered the group chat. It has already been reacted to with eyes, skull, and one devastating "hmm."

Scenes:

1. Opening allegation: the Reply Guy explains the party's own message back to them incorrectly.
2. Evidence race: retrieve context, expose bait, or flood the thread with a better narrative.
3. Frenemy cross-exam: an ally gives "help" that is shaped exactly like a knife.
4. Verdict: mute thread, restore context, or leave with a new digital haunting.

Cuttable beat: Collapse evidence race and Frenemy cross-exam into one opposed roll if the table is moving slowly.

DM note: This uses the Alexandrian "prep tools, not contingencies" idea: prepare screenshot, accuser, ally, and clock, then let the players build the defense.

Feedback prompts:

- Did digital social combat feel different from physical room combat?
- Did the party have enough non-CHA options?
- Did the thread remain funny without becoming mean?

## 45-60 Minute Flash Campaigns

### The QR Code Menu of Doom

- Encounter: `encounter_qr_menu_doom`
- Level: 1-2
- Core structure: mystery with redundant clues
- Location: `location_avocado_cafe`
- Pressure clock: 6 brunch-rush segments

Strong start: The WiFi password is gone. The QR menu opens six tabs, three of them are wrong, and Barista Kyle says the password is "obvious if you respect the space."

Clue net:

- Receipt phrase: the itemized bill spells part of the password through suspiciously capitalized menu items.
- Wall art cipher: a neon sign reads like decor until the party rotates the plant shelf.
- Kyle's trade: patience, a clean table, or genuine apology earns a hint.

Possible routes: clue-solving, Kyle influence scene, Foodie rivalry, direct WiFi dowsing, or stealing the router label.

Cuttable beat: If time is tight, make any two clues enough and let the third become bonus reward.

DM note: This is the explicit Three Clue Rule run. Do not attach one critical clue to one critical roll. Any player action that plausibly investigates the cafe can surface a clue.

### The 5-Star Review Tribunal

- Encounter: `encounter_five_star_review_tribunal`
- Level: 2-4
- Core structure: public boss negotiation
- Location: `location_the_bistro`
- Pressure clock: 6 review-posting segments

Strong start: The restaurant's rating drops from 4.6 to 4.5 before initiative. A Karen has opened the review screen and selected "ambience: hostile."

Scenes:

1. The complaint: establish what she wants, what staff can give, and what the crowd believes.
2. Crowd sway: protect staff, fact-check the claim, offer an absurd compromise, or make the room laugh with the party.
3. Camera flash mob: any loud success risks becoming content.
4. Review verdict: five stars, no review, weird review, or viral retaliation.

Cuttable beat: Skip crowd sway and resolve directly through staff protection if the party commits early.

DM note: This is a situation, not a fixed plot. The party can win by empathy, procedural judo, misdirection, public pressure, or accepting a costly compromise.

### Rooftop Ring Light Eclipse

- Encounter: `encounter_rooftop_ring_light_eclipse`
- Level: 2-4
- Core structure: event crisis / moving zones
- Location: `location_rooftop_bar`
- Pressure clock: 6 golden-hour segments

Strong start: The sunset is perfect for twelve minutes. The sponsor wants photos now. The ring lights start smoking like they read the comments.

Zones:

- Photo wall: best reward, worst spotlight.
- Bar line: social cover and bad music.
- VIP booth: sponsor access guarded by Clout Chaser etiquette.
- Balcony edge: quiet strategy space, unless someone starts filming from below.

Cuttable beat: Remove the VIP booth and let the sponsor DM arrive after the party saves the photo wall.

DM note: This follows short-session advice to contain play in one evocative location. Make the rooftop feel spatially different without needing a grid.

### The Pitch Deck Funeral

- Encounter: `encounter_pitch_deck_funeral`
- Level: 3-5
- Core structure: pitch showdown / tech repair
- Location: `location_the_startup_incubator`
- Pressure clock: 6 investor-attention segments

Strong start: The founder opens FINAL_final_ACTUAL_use_this_v7. The title slide says "Untilted Deck." The investor checks their watch in a way that deals psychic damage.

Routes:

- Engineering route: fix the deck, recover the demo, tame the free-trial expiry.
- Social route: own the chaos and sell the recovery.
- Sabotage route: make the rival deck look worse.
- Honesty route: cut the lies and pitch the one thing that actually works.

Cuttable beat: If the room is roaring, skip the rival and make the deck itself the enemy.

DM note: Let each skill type shine. The best outcome is not "the deck is perfect"; it is "the room believes this team can survive itself."

## 75-90 Minute Mini Campaigns

### Coworking Coup Opening Night

- Encounter: `encounter_coworking_coup_opening`
- Level: 3-6
- Core structure: faction-clock conflict
- Location: `location_the_coworking_space`
- Pressure clocks: Corporate Lease, Regular Morale, Printer Mutiny

Strong start: The Corporate Machine announces "community-first synergy" while an employee removes the free coffee and charges a beanbag a subscription fee.

Flow:

1. Opening announcement: read the room and identify which regulars can be moved.
2. First clock push: stop a bad calendar invite, win a whiteboard argument, or grab the conference room.
3. Printer mutiny: a side problem becomes leverage if treated with dignity.
4. Vote-by-vibes finale: public counterproposal, quiet lockout, or union Slack invite.

Cuttable beat: If short on time, merge Printer Mutiny into the finale as a wildcard ally.

DM note: This uses DDN's influence tracks and the Lazy GM scene-list principle. Wins should be mixed: block the lease but raise Heat, or win morale but lose access.

### Friday Night Fyre Lite

- Encounter: `encounter_friday_night_fyre_lite`
- Level: 2-5
- Core structure: survival comedy / scam collapse
- Location: `location_full_moon_party_thailand`
- Resource tracks: Chill, water, battery, clout, shade

Strong start: The beach mixer has no stage, no shade, no confirmed artist, and a banner that misspells both "exclusive" and the island.

Play loops:

- Scavenge: find water, food, signal, shade, or a real adult.
- Expose: gather proof the sponsor vanished.
- Monetize: become the replacement organizers and try not to hate yourselves.
- Escape: survive until the boat while the party becomes content around you.

Cuttable beat: Drop one resource track. Battery and water are the sharpest.

DM note: Reddit short-game advice warns against too much story in a tight session. This run is a pressure cooker, not a lore lecture.

### The Podcast Guest No One Can Leave

- Encounter: `encounter_podcast_guest_hostage`
- Level: 3-5
- Core structure: timed media gauntlet
- Location: `location_studio`
- Pressure clock: 5 episode segments

Strong start: The host says "quick question" and every microphone light turns red.

Segments:

1. Cold open: introduce yourself without saying the cursed thing.
2. Sponsor read: sell a product nobody understands.
3. Caller betrayal: a listener has receipts.
4. Emergency ad break: earned short rest, retcon, or whispered panic.
5. Final plug: leave with dignity, sponsor, or a clip that ruins the week.

Cuttable beat: Remove Caller Betrayal if the party is already on fire.

DM note: This is deliberately not room-based. Use segments like rooms so the table still feels progression.

## 100-120 Minute Table-Length Campaigns

### DevCon AI Keynote Doom Loop

- Encounter: `encounter_devcon_ai_keynote`
- Level: 5-7
- Core structure: mystery plus public boss
- Location: `location_the_tech_conference`
- Pressure clock: keynote credibility

Strong start: The keynote speaker tells the same founder anecdote twice and remembers a Q&A question nobody has asked yet.

Clue net:

- Badge logs show impossible movement.
- The founder anecdote repeats with generated synonyms.
- The Q&A memory references a future question.
- Optional deep clue: the demo only fails when asked something emotionally specific.

Finale options:

- Public debate: defeat it with live Fact Check.
- Demo sabotage: make the AI fail safely.
- Narrative judo: get the crowd to ask questions only a person could survive.
- Escape hatch: steal the stable demo recording and let the institution burn politely.

Cuttable beat: Skip the optional deep clue and move to the public finale at minute 80.

DM note: Use Alexandrian clue redundancy and "don't prep plots" tools. Do not script the reveal. The reveal happens when the party makes the evidence legible to the crowd.

### Club Cartel Guest List Infiltration

- Encounter: `encounter_club_cartel_guest_list`
- Level: 4-6
- Core structure: multi-route social heist
- Location: `location_itaewon_roppongi_sukhumvit`
- Pressure clocks: Door Suspicion, Nightlife Operator Patience

Strong start: The party is at the velvet rope. The Gatekeeper asks, "Who do you know here?" and the answer is spiritually complicated.

Routes:

- Door route: charm, status, fake wristband, or procedural threat.
- Dance route: become visible enough to be invited.
- DM route: backchannel a promoter or fake a sponsor contact.
- VIP route: bluff table economics and survive bottle-service math.

Cuttable beat: Remove VIP route if the party gets in early; convert it into the finale instead.

DM note: This borrows the forum preference for simple objectives while preserving D&D-style agency. The objective is simple: get the list. The route is open.

### The Great Bangkok Burnout: Last Outlet Run

- Encounters to combine: `encounter_last_outlet_heist`, `encounter_qr_menu_doom`, `encounter_coworking_coup_opening`
- Level: 2-5
- Core structure: three-act limited campaign
- Locations: `location_avocado_cafe`, `location_ekkamai_bangkok`, `location_the_coworking_space`
- Pressure clocks: Battery, Cafe Heat, Corporate Lease

Strong start: The party wakes to three messages: the WiFi password changed, the only cafe with AC is closing for renovations, and the coworking space now calls chairs "focus surfaces."

Acts:

1. Find signal: solve the QR menu / WiFi clue problem before the cafe turns.
2. Secure power: heist the last outlet and decide whether to share it.
3. Hold the room: use the gained access and favors to resist the coworking takeover.

Alternate endings:

- Communal win: shared power and union Slack invite.
- Hustler win: party controls the outlet economy and becomes the problem.
- Burnout win: nobody wins cleanly, but everyone learns who brings a power bank.

Cuttable beat: If the table is under 90 minutes, skip Act 2 and make the outlet the reward for Act 1.

DM note: This is the flagship sampler. It uses the short-session "episode" structure: each act can close cleanly while pointing to a larger campaign.

## Playtest Feedback Form

After each run, capture:

- Runtime actual:
- Slowest beat:
- Funniest player action:
- Did each PC get a spotlight moment?
- Most confusing rule/content reference:
- Which clock mattered most?
- Which hazard felt like real pressure?
- Which reward would the players remember next session?
- Would this run expand into a longer campaign? Why?
