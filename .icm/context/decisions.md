# Decisions

- Party mode is a separate product layer; the original D&D library stays intact.
- Initial campaign is Swipe Right, Regret Later. CryptoCon and tropical coworking are future campaign content, not shipped playable campaigns.
- Random class and trait cards define the build. One class, three traits, two equipment slots, five action cards; only explicit effects swap class. One active player levels per won encounter.
- Private rooms for any positive player count, server-owned outcomes, no DM or accounts. Socket seat tokens reclaim players. Solo resumes with one connected seat; multiplayer still pauses below two. Complete deck copies scale with table size. Single-instance SQLite and Docker are the MVP deployment boundary.
- Preserve six currencies. Internal BTC uses integer satoshis; displayed BTC is formatting, not an exchange rate.
- Art remains placeholder. Independent flavor, full art-brief, and clean image prompts prepare later production without paid generation. The 18 launch monsters have specific visible scenes and individual export files.
- Human 3-/6-player tests must establish 25–40 minute pacing; simulation cannot establish fun.
