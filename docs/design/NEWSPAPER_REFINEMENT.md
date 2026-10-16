# SC01 / SC04 newspaper refinement — 12 October 2026

Status: implemented and locally verified; owner review of this refinement is pending. This is a focused increment, not completion of WP02 or release approval. The original 30 native review frames remain on page 0:1.

## Subsequent controls pass

The newspaper geometry remains the baseline. A bounded SC01/SC04/SC05 controls refinement updates the working frames and reader; the earlier 38-master/70-instance counts below describe the pre-controls checkpoint. See [current control inventory, native links and evidence](CONTROLS_REFINEMENT.md). Both refinements still await owner review.

## Review the actual work

New native page: **09 SC01–SC04 — Newspaper refinement** (8:693), in the existing [Aggregator file](https://www.figma.com/design/cU1bmSQP5Nh5PX0WayfEpT/Aggregator?node-id=8-693). Eighteen new editable screen frames: Home and full standard article at 1440, 834, and 390 in Light/Dark, plus six mobile long-title/text-only/unavailable-image article variants. Thirty-eight native components and 70 instances on this page include shared publication mastheads and captioned/compact media. Prior components remain untouched.

| View | Native Figma | Actual browser capture |
|---|---|---|
| Desktop Home | [8:710](https://www.figma.com/design/cU1bmSQP5Nh5PX0WayfEpT/Aggregator?node-id=8-710) | 1440 light (local-only evidence: `../engineering/evidence/newspaper-home-1440-light.png`) |
| Desktop article opening | [8:724](https://www.figma.com/design/cU1bmSQP5Nh5PX0WayfEpT/Aggregator?node-id=8-724) | 1440 light (local-only evidence: `../engineering/evidence/newspaper-article-1440-light.png`) |
| Mobile Home | [8:1567](https://www.figma.com/design/cU1bmSQP5Nh5PX0WayfEpT/Aggregator?node-id=8-1567) | 390 light (local-only evidence: `../engineering/evidence/newspaper-home-390-light.png`) |
| Mobile article opening | [8:1584](https://www.figma.com/design/cU1bmSQP5Nh5PX0WayfEpT/Aggregator?node-id=8-1584) | 390 light (local-only evidence: `../engineering/evidence/newspaper-article-390-light.png`) |
| Tablet Home / article | [8:1166](https://www.figma.com/design/cU1bmSQP5Nh5PX0WayfEpT/Aggregator?node-id=8-1166) / [8:1184](https://www.figma.com/design/cU1bmSQP5Nh5PX0WayfEpT/Aggregator?node-id=8-1184) | 834 Home (local-only evidence: `../engineering/evidence/newspaper-home-834-light.png`) / article (local-only evidence: `../engineering/evidence/newspaper-article-834-light.png`) |
| Dark desktop / mobile Home | [8:2029](https://www.figma.com/design/cU1bmSQP5Nh5PX0WayfEpT/Aggregator?node-id=8-2029) / [8:2893](https://www.figma.com/design/cU1bmSQP5Nh5PX0WayfEpT/Aggregator?node-id=8-2893) | 1440 dark (local-only evidence: `../engineering/evidence/newspaper-home-1440-dark.png`) / 390 dark (local-only evidence: `../engineering/evidence/newspaper-home-390-dark.png`) |

[Complete native inventory](figma-newspaper-inventory.json). [Local Home](http://127.0.0.1:3000/) and [matching article](http://127.0.0.1:3000/articles/alderwick-evening-shuttle). Local API remains on port 4000. No deployment.

## Composition and deliberate departures

- Centered UnifrakturMaguntia blackletter publication name; Newsreader headlines/body and Manrope interface text. The name has its own full-width row, so unequal utilities cannot shift it. The font is locally bundled, OFL-1.1; Georgia is the failed-font fallback.
- Warm paper/forest and a separate dark theme retain the accepted identity. Fine rules, compact navigation, approximately 3/6.6/3 opening columns. The lead is first in DOM and mobile visual order; tablet uses lead/briefing then updates.
- The reference supplies editorial rhythm, not branding or content. Latest updates are chronological, not a popularity claim. Navigation exposes supported edition anchors: Home, Culture, Latest updates and The briefing. Broader topic/search services remain pending.
- Only four related fictional dispatches exist. Repeated placement and the intentionally long-title stress fixture are visible, rather than implying a populated live newsroom. Below the opening are a route figure and text briefs.
- Article H1 is centered, followed directly by its complete 3:2 image. Caption, synthetic disclosure, credit and original-asset link follow immediately. Context/metadata/Sources/reading controls follow; narrative remains left-aligned at a maximum 720px.
- The original synthetic photo is shared by Home and article. Its explicit focal point is retained; the full uncropped composition preserves the vehicle and library. Text-only and unavailable-image openings do not substitute unrelated media.
- Inline original route SVG and a silent, captioned, playable 4-second route animation follow relevant passages. They are illustrative, not the fictional publisher demonstration listed as source 4.

## Implementation and media boundary

Reusable Vue components: PublicationMasthead, EditorialMedia, StoryBrief. The Nuxt SSR/Express/worker architecture is unchanged. Media is a bounded optional extension to the existing fixture contract (leadMedia and inlineMedia), not a new database schema, ingestion pipeline, selection score or ranking service.

Each asset records dimensions, focal point, alt text, caption, credit, original URL, provenance, availability and explicit display permission. Unknown permission is not accepted by the contract; denied media is omitted from the public projection. Media selections and captions are part of the review digest. Illustrations cannot satisfy evidence item/origin thresholds. Existing source rights, identity, review and withdrawal gates remain.

Images use a semantic labeled native object with a fallback message, allowing network-image failure to stay readable even with JavaScript disabled. Asset URLs are constrained to local fixture paths. The video uses native controls and a local WebVTT track, with no autoplay. [Asset provenance, generation prompt and hashes](MEDIA_PROVENANCE.md).

Normal story anchors support direct routes, new tabs and browser history. Theme query is preserved on story and masthead links. The native lead-image/headline prototype opens its corresponding article for all six size/theme pairs; masthead returns Home and Sources scrolls to the local bibliography. Secondary Figma stories link to the matching mobile fixture frames; the browser remains responsive at the current width. Native animation posters open the local playable article rather than claiming Figma playback. These are deliberate prototype boundaries.

## Verification

- 10 policy/API tests passed, including media permission exclusion, unchanged evidence threshold and digest invalidation.
- Typecheck, ESLint, production build and SSR checks passed.
- Existing browser suite: 36 checks passed; 12 separate Pretext observations preserved.
- Focused suite: 32 combinations of widths 320/360/390/768/834/1024/1440/1920 × Light/Dark × JS on/off, checking both Home and article per combination. True masthead/H1 centering, image ratio, shared asset, body measure, captions/credit, mobile lead-first, complete bibliography and Sources navigation passed.
- Twelve actual click/direct-route/history journey checks and four media-state/playback checks passed. Long headlines at 200% text, keyboard skip/visible focus, failed font loading and no-JS failed-image fallback passed.
- Native screenshot review covered desktop Home/article, mobile Home/article, dark desktop Home/tablet article, and the long-title/text-only/unavailable-image states. Corrected initial article centering and heading weight, refined masthead navigation, and removed temporary QA slices. Main section bounds are separate from component masters; prior review frames remain intact. Final native audit: 18 screen frames, no direct-child horizontal overflow, zero temporary slices, and 114 prototype nodes before adding native attribution hyperlinks.
- Focused results (local-only evidence: `../engineering/newspaper-checks.json`), existing results (local-only evidence: `../engineering/browser-checks.json`), failed-image/font capture (local-only evidence: `../engineering/evidence/newspaper-failed-image-fonts-320.png`). Run `./scripts/npm.ps1 run test:newspaper` with local servers and Chrome.

Still pending: owner review of this refinement, manual assistive-technology/cross-browser audit, broader WP02 coverage, real identity/persistence/publication and source-rights services, and existing release gates. Eleven high transitive audit findings remain. This work does not certify WCAG conformance, production media rights, performance targets or launch readiness.

