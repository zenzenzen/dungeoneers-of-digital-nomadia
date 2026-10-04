# Flavor and monster artwork

The [first artwork production plan](ART_PRODUCTION.md) selects current image models and prepares a six-image comparison from three monsters. It includes clean requests, shared art direction, and review criteria. Generation has not started.

Every card keeps its flavor, rules, executable effects, provenance, and art direction in separate fields. The rendered card gives flavor its own paragraph beneath the rules. That paragraph wraps and grows with the text. The source catalogue also retains original joke excerpts and full source variants, so a short card line does not replace the longer source material.

Aim for one good line, usually under 25 words, on the card face. Keep longer stories as editorial candidates until there is a suitable collection detail view. The flavor template can propose a 40–80 word vignette; that output is not automatically saved as approved card copy.

## Files to use

- `content/art-direction/monsters.v1.json` contains a specific subject, visible action, setting, visual joke, motifs, and composition for each of the 18 launch monsters. These are newly authored proposals based on the cards. Final style remains open.
- `content/prompt-packets/monsters/index.json` lists each monster's two ready-to-use files.
- `<card-id>.brief.json` is the full working packet: original jokes and source hashes, approved flavor, immutable mechanics, art inputs, a flavor-writing prompt, an art-brief prompt, and a direct image prompt.
- `<card-id>.art.txt` is the clean image prompt. Copy its contents into an image generator. It contains only the scene and visual instructions.
- `content/prompt-packets/launch.json` holds the same three prompt forms for every playable card, including classes, traits, equipment, events, actions, and finales.

The versioned templates live in `prompts/flavor.v2.txt`, `prompts/visual.v2.txt`, and `prompts/visual-clean.v1.txt`. Earlier templates remain available for comparison.

## Write the joke before expanding it

Use the character's behavior to carry the humor. The Ghoster leaves a solid pair of shoes and an untouched drink while the person disappears. The Bill-Splitting Tribunal treats cocktail umbrellas like courtroom evidence. The image should let someone notice the joke before reading the card.

Keep source quotations exact. Mark new lines as new and adaptations as adapted. If an original joke already works, keep it. Do not force another punchline into every sentence, explain why the situation is funny, or make the prose sound like advertising.

Flavor can describe embarrassment, hope, vanity, or awkward timing. It cannot quietly award a bonus, promise a currency payout, or add a new ability. Review any generated text beside the packet's immutable mechanics before accepting it.

## Build the artwork prompt

Start with one visible subject doing one visible thing. Add the setting, then the object or reaction that makes the joke legible. Use composition to direct attention: a large receipt in the foreground, a disappearing silhouette by the door, or an absurdly tiny object treated as something precious.

Use the richness and dramatic staging of fantasy trading-card illustration with mint, lavender, peach, cyan, and warm cream. Keep contemporary clothes and social props recognizable. Put the humor in posture, expressions, scale, and timing. Any people are fictional adults.

At phone size, the main silhouette and visual joke should survive. Avoid a crowd of competing focal points. Use quiet edges so the image remains usable when cropped. The default art window is landscape 4:3; the interface provides the surrounding card frame.

The **full prompt** asks a writing model to refine a structured brief and return a clean prompt. It is useful when exploring alternatives or changing direction. Review that result before using it.

The **clean prompt** asks an image model to draw the scene directly. It excludes source IDs, hashes, gameplay effects, JSON instructions, and editorial notes. Keep the negative prompt separate when the image tool offers a field for it. Otherwise the clean file already says to omit lettering, logos, frames, rules boxes, and UI.

Do not ask the image model to render the card's name, stats, or flavor. The app owns that lettering. A beautiful illustration with baked-in rules is harder to revise and harder to read.

## Edit and regenerate

Edit a monster's art inputs in `content/art-direction/monsters.v1.json`. Edit approved flavor and mechanics in `scripts/seed-content.ts`, reviewing those changes independently. From `party-game/`, run:

```sh
npm run content:build
npm run content:check
```

Review both outputs for the changed monster. Confirm that the clean prompt describes the intended scene and contains no mechanics or unresolved placeholders. The content check verifies coverage, references, template versions, and exact exported files.

These commands assemble prompts locally. They do not call a text or image model, spend generation credits, approve new prose, or replace placeholder art. Keep generated candidates and rendered images separate from approved card data until reviewed.
