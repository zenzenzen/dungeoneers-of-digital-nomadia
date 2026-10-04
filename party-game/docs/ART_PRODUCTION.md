# First monster artwork batch

Prepared on 2026-10-04. No images have been generated or accepted. The game still uses placeholder illustrations.

## Engine choice

Start with **GPT Image 2.5 Sunburst through the connected Higgsfield service**. These cards depend on specific visual relationships: someone disappearing while their shoes remain, or cocktail umbrellas treated as courtroom evidence. My recommendation favors careful scene construction and targeted revisions. This is a production hypothesis, not a measured winner for our deck.

OpenAI currently recommends Sunburst for demanding image quality and describes improved editing and subject preservation over GPT Image 2. The local generation skill still names GPT Image 2 as its default; current provider documentation and the connected model catalogue both expose 2.5. [OpenAI prompting guide](https://developers.openai.com/api/docs/guides/image-prompting)

| Candidate | Role in this project | Reason |
| --- | --- | --- |
| GPT Image 2.5 Sunburst | First choice; three pilot images | Quality-oriented generation and precise revisions suit scenes where the joke depends on an exact gesture or object relationship. |
| Nano Banana Pro | Challenger; the same three images | Google's professional asset model supports complex instructions and reference-driven production. Compare its illustration style and consistency directly. |
| Nano Banana 2 | Later iteration option | Google positions it for speed and volume. Test it after the deck's visual direction is settled. |
| FLUX 3 Image | Reserve for difficult layouts | Its element bounding boxes may help when ordinary scene instructions repeatedly fail. The connector exposes generation, but its full native layout workflow has not been tested here. |

The Google roles follow its [model selection guidance](https://ai.google.dev/gemini-api/docs/image-generation). FLUX's layout controls are documented on its [model page](https://bfl.ai/models/flux-3-image). These provider descriptions establish capabilities, not comparative artistic results. Revisit the choice after reviewing our own samples.

## Six-image pilot

Generate each scene once with each model, using identical prompt text and no image references. Use **4:3 landscape, 2K**, and **high quality** for Sunburst. Nano Banana Pro exposes a resolution selector but no separate quality tier. A 2K label can resolve to different pixel dimensions between providers; record actual dimensions when results arrive.

| Monster | What it tests |
| --- | --- |
| The Ghoster | Intentional transparency, a clear silhouette, and an abandoned-object joke. |
| The Situationship | Two people, rope continuity, and uncertainty conveyed through acting. |
| The Bill-Splitting Tribunal | An ensemble, hands, tiny props, and a comic hierarchy of attention. |

The provisional direction is painterly social satire: gouache texture, fantasy-card staging, contemporary adults and props, Web 2.0 pastels, and deep plum shadows. Every scene should contain one readable joke. Final art style stays open until this comparison is reviewed.

## Prepared files

All paths below are relative to `party-game/`.

- `content/art-pilot/plan.v1.json`: selection, parameters, scene checks, research links, and preparation status.
- `content/art-pilot/style.v1.txt`: shared rendering direction and palette.
- `content/art-pilot/model-schemas.2026-10-04.json`: public model constraints captured from the connected provider; no account details.
- `content/art-pilot/prepared/manifest.json`: six requests with exact prompt, request, source-brief, and source-prompt hashes.
- `content/art-pilot/prepared/*.art.txt`: three clean prompts for direct image generation.
- `content/art-pilot/prepared/*.request.json`: six complete Higgsfield connector arguments. These are preparation data, not submissions.
- `content/art-pilot/prepared/review-template.csv`: blank review rows. Copy it to ignored `output/art-pilot/review.csv` before scoring.

The original full briefs remain in `content/prompt-packets/monsters/`. They contain provenance, approved flavor, immutable mechanics, and art inputs. Only the clean scene and shared rendering direction enter the image requests. Flavor and gameplay text never become lettering in the artwork.

Rebuild and verify offline:

```sh
npm run art:prepare
npm run art:check
npm run content:check
```

Preparation overwrites generated files in `content/art-pilot/prepared/`. Keep results and completed reviews under `output/art-pilot/`. After editing source art, first run `npm run content:build`. No command above submits jobs, uploads references, or spends credits.

## Run and review

When generation is requested, verify the saved model parameters against the live service. Use the connected Higgsfield tool; local CLI generation is not ready because no workspace is selected. Check the provider's destination preference before submitting. Preserve each exact request and its hash with the returned job ID. If submission times out, reconcile the original job before retrying.

Budget has not been quoted or authorized in this preparation. The six requests specify one image each and no automatic retries. Confirm current billing for this batch when it is scheduled. Do not assume website unlimited allowances apply to connector jobs.

Review candidates without model labels first, at full resolution and 200 pixels wide. Also inspect a 4:3 crop and a wider crop approximating the current variable-width card window. The current UI has fixed-height placeholder art; responsive image cropping still needs implementation once assets are accepted.

Score 0–5 for the visible joke, phone readability, shared style, anatomy, and scene fidelity. Use weights of 30%, 25%, 20%, 15%, and 10%, respectively. An initial acceptance target is 4/5 overall, with at least 4 for both joke and readability. These are editorial targets, not benchmark results.

Reject any image with baked-in text/UI, missing joke-bearing objects, distracting anatomy errors, or a crop that hides the joke. Deliberate ghost transparency is not an anatomy error. Check every scene-specific item in the manifest. Record the failure and change one prompt detail for a revision; do not repeatedly submit an unchanged request.

Select one approved image as the first style reference. Before the remaining fifteen monsters, test the chosen model on one new scene using that reference for palette and brushwork only. Record its role and file hash. Do not reproduce the reference character in every card. Keep the same direction across the deck while varying people, silhouettes, settings, and focal props.

## Accept into the game

Retain original outputs, actual model settings, prompt hash, source card ID, job ID, dimensions, and review decision in the local result record. Preserve any supplied provenance metadata in originals. Export accepted illustrations to WebP and add a versioned asset mapping from card ID to image URL, alt text, and focal position. Target 1200×900 for the web master after checking that the crop preserves the joke; keep the untouched original separately.

The asset mapping and image renderer are the next implementation step. Keep a placeholder fallback, lazy-load collection art, and inspect the accepted cards at phone and desktop widths. An image becomes shipped artwork only after that integration and visual check. None of these acceptance or integration steps has happened yet.
