# SC01 / SC04 / SC05 controls refinement — 12 October 2026

Implemented and locally verified. **Owner accepted the buttons as sufficient to continue on 12 October 2026 and cancelled further review packaging.** This does not approve every screen; the preceding newspaper refinement retains its separate review status. This is a bounded WP02 increment, not WP02 completion or release approval. All fixture-only, permission, publication and deployment restrictions remain.

## Review the result

- Before/after and interaction review (local-only evidence: `../../output/playwright/controls/review.html`): actual article, evidence and masthead crops; light/dark specimens; press → Brief selection → real clipboard success filmstrip; error/retry evidence.
- [Running article](http://127.0.0.1:3000/articles/alderwick-evening-shuttle#article-header), [dark article](http://127.0.0.1:3000/articles/alderwick-evening-shuttle?theme=dark#article-header), [development specimen](http://127.0.0.1:3000/lab/controls). The specimen is absent from public navigation and returns 404 from the production build.
- Native [controls section](https://www.figma.com/design/cU1bmSQP5Nh5PX0WayfEpT/Aggregator?node-id=14-6318), [Light specimen](https://www.figma.com/design/cU1bmSQP5Nh5PX0WayfEpT/Aggregator?node-id=14-6474), [Dark specimen](https://www.figma.com/design/cU1bmSQP5Nh5PX0WayfEpT/Aggregator?node-id=14-6653).
- Updated actual [Home](https://www.figma.com/design/cU1bmSQP5Nh5PX0WayfEpT/Aggregator?node-id=8-710), [Article](https://www.figma.com/design/cU1bmSQP5Nh5PX0WayfEpT/Aggregator?node-id=8-724), [mobile Article](https://www.figma.com/design/cU1bmSQP5Nh5PX0WayfEpT/Aggregator?node-id=8-1584), [Light inline Evidence context](https://www.figma.com/design/cU1bmSQP5Nh5PX0WayfEpT/Aggregator?node-id=14-7383), [Dark Evidence context](https://www.figma.com/design/cU1bmSQP5Nh5PX0WayfEpT/Aggregator?node-id=14-7422).
- [Recoverable native pre-controls snapshot](https://www.figma.com/design/cU1bmSQP5Nh5PX0WayfEpT/Aggregator?node-id=12-1522): 18 screen frames; all snapshot instances detached before editing shared masters. Original 30 review frames on 0:1 are preserved. Local pre-controls components, article and CSS are in `checkpoints/pre-controls/`.

## Reference study and independent adaptation

Inspected [Dqnamo Kitchen](https://www.dqnamo.com/kitchen), [Tactile Button](https://www.dqnamo.com/experiments/tactile-button) and [Dynamic Button](https://www.dqnamo.com/experiments/dynamic-button) in the browser, including pointer hover/down and a longer dynamic label. Reference screenshots and measured observations are in `output/playwright/controls/reference-*`. The reviewed pages and targeted reuse/license search exposed no explicit code reuse grant. This is not a comprehensive legal clearance. No reference source code, assets or React implementation was copied.

The independent Vue/CSS adaptation keeps Tactile's defined face, fine edge and compressible shallow depth. It uses 44px minimum targets, a 7px corner, 1px perimeter, 2px lower edge, 1px press displacement, 18px original outline icons and 8px label gaps. Press feedback is 100ms; surfaces and a single readable label settle over 160ms. Label text remains at full opacity throughout. Reduced motion removes animation, transitions and displacement.

Dynamic's changing label becomes a real clipboard action, with stable 148px toolbar width. There is no timer-created success, animated duplicate label, width measurement or new animation dependency. Long labels wrap. Manrope 14px/22px semibold controls preserve blackletter exclusively for the masthead. The smaller 11–12px theme utility retains its full 44px target.

Primary is forest/white in Light; Dark uses the existing deep surface, mint border and mint label. Secondary has a paper face and quieter lower edge; quiet utilities have no persistent depth. Danger is a restrained outlined specimen only. Semantic CSS aliases live in `apps/web/app/assets/controls.css`; existing global colors are unchanged. Figma uses bound semantic paints plus five narrow `control/*` aliases in the existing Light/Dark collection. Numeric geometry is explicit; this is not a claim of exhaustive numeric variable binding.

## Actual control inventory and migration

| Surface / control | Semantics and current behavior | Treatment / state coverage |
|---|---|---|
| Masthead theme | Working navigation link; same path, variant and hash, opposite theme query. No persistence/System setting. | Shared quiet face, moon/sun outline, 44px target; hover/press/focus. Home and every article use the same masthead. |
| Wordmark, Home/Culture/Latest/Briefing, story titles and media | Working navigation/edition anchors and article routes. | Remain typographic links; no raised topic buttons. |
| Standard / Brief | Working SSR query navigation, not JS tabs or an aria-pressed toggle. | Grouped paper track; selected surface, bold label, check and `aria-current=page`. Unselected links explicitly use `aria-current=false` to avoid router path-only matching marking both current. |
| Sources (4) | Working real `#sources` anchor; complete version bibliography. | Secondary outlined face and down icon. |
| Inspect evidence / disputed-count inspection | Working real `#claim-3` anchor to an inline section. | One primary toolbar link; repeated narrative inspection uses secondary. Native anchor focus reaches the section. |
| Evidence Source 2 / Source 3 | Working anchors to numbered bibliography entries. | Secondary text controls. |
| Evidence return | Working `#block-3` or `#brief-2` anchor, not a modal close action. | Quiet 44px back icon, accessible name “Return to disputed claim”; native focus returns to claim. No focus trap is invented. |
| Copy link | New working client clipboard action; absent without JS or clipboard API. | Native button; Copy link → Copying… → Copied only after resolved write; rejection exposes Retry copy and browser-address fallback. Pending `aria-disabled` preserves focus and blocks repeated input. One live region; stale route/unmount results ignored. Copies current reading variant, omitting theme/hash. |
| Inline citations | Working claim/source anchors. | Remain compact narrative links. |
| Original source / return to citation | Working exact fictional original-item URLs and citation anchors, including validated video `?t=72`. | Ordinary underlined links with 44px action-link target; titles and attribution remain visible. |
| Native video | Working local fixture playback with captions. | Native controls unchanged. No custom player. |
| Pretext lab | Existing isolated development comparison; typographic links, no competing product button family. | Unchanged. |
| Controls lab | Explicit development specimen; sample actions increment a local counter. Static disabled/loading/success/error examples are labeled as examples. | Four families, icon, reading group and long-label cases. Danger does not remove anything. |
| Accounts, save, search, staff publish/delete, evidence drawer | Unimplemented services or original Figma demonstrations. | No new public controls pretending to implement these. No disclosure/modal was introduced. |

Local component inventory: `ControlButton.vue` (native action, explicit emitted click and disabled/busy guard), `ControlIcon.vue` (original SVG), `ReadingControls.vue` (real links), `CopyArticleLink.vue` (actual async operation). Shared classes style anchors directly; there is no clickable-div wrapper or nested interactive content. Old Sources/variant button styling was removed from `main.css`.

Native inventory: [figma-controls-inventory.json](figma-controls-inventory.json). Thirty-one EditorialControl variants plus two ReadingLength variants; 71 total component masters and 246 instances on the working page. Six existing masthead masters propagate to all 18 existing newspaper frames; all 12 article frames have the new toolbar and evidence actions. Two focused SC05 contexts and two specimens were added, without duplicating the full screen matrix. All labels remain editable. Hover/press use interactive component transitions; the reading group changes Standard/Brief selection. Figma selection demonstrates state only, not rewritten article text; browser query navigation is authoritative. Figma's Copy instance links to the local article instead of pretending to access a clipboard.

## Verification and limitations

Passed: 10 policy/API tests, typecheck, lint, production build, worker check, SSR projection check; 36 existing browser cases plus 12 Pretext observations; 32 newspaper responsive/no-JS cases, 12 journeys and 4 media checks. One newspaper run observed history scroll before it settled; an unchanged repeat passed. No assertion or CI gate was weakened.

`./scripts/npm.ps1 run test:controls` adds eight reader width/theme contexts, 48 actual control-state contrast measurements and eight behavior groups. Results (local-only evidence: `../engineering/control-checks.json`), additional interaction checks (local-only evidence: `../engineering/control-interaction-checks.json`). Covers real clipboard write/read-back, held/rejected operation test doubles, duplicate Enter/Space/click input, retry, focus retention, stable pending geometry, 320px, doubled text, failed fonts, forced colors and reduced motion emulation, no-JS full bibliography and anchors. Additional checks verify no target overlap at 320/390/834/1440, evidence/back focus transfer and 200% long labels at 320. Product requests observed were local only; no dependency or lockfile additions.

Across applicable non-disabled measured states, minimum text contrast was **5.70:1 Light / 5.29:1 Dark**, visible edge to surrounding canvas **3.46:1 / 5.75:1**, focus **5.76:1 / 9.13:1**. Disabled states are recorded, not treated as active contrast conformance. Transparent faces are composited against the actual theme canvas; color-mix states are resolved by the browser. This does not certify all accessibility requirements.

Masthead, wordmark, H1 and lead-image rectangles match the saved browser baseline within 1px at 390/1440 in both themes (observed deltas zero). Native comparison with the detached snapshot also found zero masthead-height, wordmark-top and article-opening-position deltas for all 18 existing frames. Screenshots were visually inspected at desktop/mobile, including dark controls and both native specimens.

The review supplies an ordered screenshot filmstrip as equivalent interaction evidence. Playwright video capture could not start because its optional ffmpeg executable is absent; no extra dependency was installed. Press/selection/copy captures come from actual browser actions; clipboard success was independently read back. No manual screen reader, Safari, Firefox, physical touch device or native OS high-contrast session was tested. Browser emulation and automated assertions are not accessibility certification.

Existing 11 high transitive dependency findings and the CI audit gate remain. Real identity, permissions, persistence/concurrency, PG18, full WP02 coverage, deployment and release gates remain open. No real ingestion, external service, public deployment, remote push or publication was performed.

## Decisions awaiting owner review

Review the shallow 2px depth/1px press, the restrained dark primary, the check-mark reading group, the emphasis of the single Inspect evidence action, and mobile wrapping with Copy link on a separate row. All are implemented choices for review, not recorded approvals. The preceding newspaper composition also remains awaiting review.
