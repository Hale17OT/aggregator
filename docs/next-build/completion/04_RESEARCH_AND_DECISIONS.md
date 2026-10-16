# Research, source-derived baseline and new design decisions

Version 1.0 · 14 October 2026

## A. What the supplied reports actually establish

The latest attached SOURCE_TO_DRAFT_ENGINE checkpoint describes a connected local engine with imported original fictional documents, separate trusted permission declarations, immutable PostgreSQL versions, exact spans and supplied transcript intervals, reproducible evidence packages and private attributed standard/brief drafts. Its adapter is deterministic/extractive, not completed model synthesis. No new public article, human approval record or programme was created. See the supplied engine report lines 9–31, 56–93 and 192–219; canonical project summary lines 5–17.

Migration 0008 exists in the isolated pipeline profile on port 55442. The retained member profile on 55441 remains pinned to seven migrations. These are not interchangeable targets. Source runtime cannot mutate grants, members, approvals or public pointers. This is why the new runbook requires a tested retained-profile upgrade rather than assuming the highest migration filename is already applied everywhere.

Existing reader, Radio, member and prepared Newsroom work is preserved. The current catalogue remains 17 programmes. The CPU4 popup/list problem remains unresolved; the previous desktop reference pass is historical evidence, not a fresh measurement of the new features. Native Figma is pending. Current reported capacity is about C101.41/E236.20 GiB, so the old critically-low-C warning must not be reused as current fact. These are report-derived statements, not independent inspection of the user's running machine.

The report explicitly keeps staff/MFA, real-source acquisition, live-model evaluation, publication/outbox, external delivery and release approval gated. This package does not secretly reopen them. “Complete most of the product” is operationalised as a continuous reader-facing implementation with a truthful production-gap matrix.

## B. New decisions made for this request

**Name:** use Clips for the 30–120-second vertical-news format. It is short, clear and does not conflict with the existing brief article variant. No trademark or domain clearance is implied.

**Catalogue:** use a broad authored product seed immediately, with a reviewed path to IPTC Media Topics. The supplied 390 subject concepts are our proposed UI coverage, not a claim to reproduce IPTC. IPTC describes its maintained Media Topics vocabulary as more than 1,200 terms and publishes its catalogue under CC BY 4.0. Preserve attribution/mappings and do not import retired terms indiscriminately. [R01, R02, R21]

**Hierarchies and entities:** adopt stable concept IDs, labelled relationships and deliberate closure rather than slash-separated strings. SKOS offers useful distinctions among concepts, preferred/alternative labels and broader relations, but the application can implement those ideas with the current PostgreSQL model rather than adding RDF infrastructure. Teams and seasonal participation use separate typed edges. [R07]

**Football example:** the official Premier League Manchester City page and UEFA Champions League page ground a limited real-entity example. The selected team should persist across competition changes. The full Premier League roster was not available in the parsed official directory during preparation; the package therefore does not pretend to ship every club. No current match results, transfers, images or logos are needed for this feature. [R04–R06]

**Dropdown fix:** Reka documents a dedicated SelectIcon with a default triangle and supports replacement. That is a possible location for the defect, not proof of the actual code's cause. Supply one centred SVG icon and fix the shared trigger layout after inspection. SelectArrow is a different popup part. No library replacement is required just to align a chevron. [R08, R09, R20]

**Clips behaviour:** CSS scroll snap plus intersection observation is a practical implementation basis, with explicit media ownership and bounded players. Intersection alone is not proof that the document is visible. Handle actual play promises, first-gesture/autoplay restrictions, source panels, paused intent and clean teardown. Native mechanisms are a baseline, not a promise that every browser handles every policy identically. [R12–R15]

**Home:** the requested page turn is decorative enhancement over real, addressable pagination. Animate the spread, not the whole app, and keep only bounded layers. Use the existing Vue/CSS animation stack; no 3D engine or flipbook dependency is needed. Keyboard/announced navigation and a reduced-motion route remain available. [R10, R11, R16, R17, R20]

**Accessibility:** captions, transcripts, readable controls, focus behaviour and navigation fallbacks are requirements. Existing automated tests cannot establish full WCAG conformance. The animation-from-interactions criterion is AAA; the project can intentionally adopt it without mislabelling the conformance level. [R17, R18]

**Execution:** a durable milestone plan and implement/test/update loop are better suited to the requested long session than a command that creates one helper and stops. This does not guarantee overnight completion or give the model additional tool permissions. [R19]

## C. Deliberate non-goals and safeguards

No existing reader account is reset; no missing source permission is inferred; no private extractive draft becomes a public article. Local new fictional articles/Clips use the established transparent demo-catalogue path, with proper provenance and eligibility. Metadata lookup of a real football team does not authorise fictional current-events reporting about it.

No opaque recommendation model, passive behavioural profiling, third-party engagement service, payment/tier system, social comments or notification infrastructure is added. Extra value comes from understandable interest matching, editorial page continuity, source visibility and cross-format navigation.

The source-to-publication gap remains explicit. This package is not a production security certificate, law/licence opinion, current dependency audit, live model evaluation or human editorial approval. Public source permissions, staff assurance, provider selection and deployment still need their own authorisation and evidence.

## D. Primary references

- **R01 — IPTC Media Topics overview.** https://iptc.org/standards/media-topics/
  Maintained news-subject vocabulary; use instead of treating a short hand-authored menu as universal coverage.
- **R02 — IPTC NewsCodes Media Topics catalogue.** https://cv.iptc.org/newscodes/mediatopic/
  Official concept identifiers, hierarchy, machine-readable alternatives and CC BY 4.0 statement.
- **R03 — IPTC association football concept.** http://cv.iptc.org/newscodes/mediatopic/20001065
  Checked soccer/association-football concept; proposed exact mapping in seed.
- **R04 — Premier League clubs.** https://www.premierleague.com/en/clubs
  Official directory for a dated competition/entity expansion. Dynamic page did not expose a complete parsed club inventory in this preparation; no complete roster is bundled.
- **R05 — Manchester City — Premier League club page.** https://www.premierleague.com/en/clubs/43/manchester-city/overview
  Official named-club/competition reference for requested example; no logo or news reuse authorised.
- **R06 — Manchester City — UEFA Champions League.** https://www.uefa.com/uefachampionsleague/clubs/52919--man-city/
  Official second-competition example; supports separating persistent team identity from a competition browse path.
- **R07 — W3C SKOS Reference.** https://www.w3.org/TR/skos-reference/
  Concept IDs, labels, semantic relations and distinction between direct and transitive hierarchy. No RDF service required.
- **R08 — Reka UI Select.** https://reka-ui.com/docs/components/select
  SelectIcon customisation and separation from popup SelectArrow; preserve managed interaction.
- **R09 — Reka UI Dropdown Menu.** https://reka-ui.com/docs/components/dropdown-menu
  Action-menu primitive differs from value selection.
- **R10 — Motion for Vue.** https://motion.dev/docs/vue
  Use existing Vue animation stack, not a React/framework migration.
- **R11 — Motion animation performance guide.** https://motion.dev/docs/performance
  Rendering/compositing considerations for effects; no guarantee of a particular FPS on this app.
- **R12 — MDN CSS scroll snap.** https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll_snap
  Native scroll-based snapping for a vertical feed without wholesale wheel interception.
- **R13 — MDN Intersection Observer API.** https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
  Visible-region observation; combine with lifecycle, ownership and actual document visibility.
- **R14 — MDN Autoplay guide.** https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay
  Playback restrictions and explicit play/error handling; do not promise audible autoplay.
- **R15 — MDN Page Visibility API.** https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API
  Actual document visibility differs from element intersection; background scheduling limits.
- **R16 — WAI carousel tutorial.** https://www.w3.org/WAI/tutorials/carousels/
  User control, keyboard, focus and announcements; applied cautiously to user-triggered edition navigation.
- **R17 — WCAG animation from interactions.** https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html
  Disable nonessential interaction animation; this criterion is AAA, not a blanket claim of AA conformance.
- **R18 — WCAG 2.2.** https://www.w3.org/TR/WCAG22/
  Text alternatives, media captions, interaction and visual accessibility; automation is not full certification.
- **R19 — OpenAI long-horizon Codex execution.** https://developers.openai.com/blog/run-long-horizon-tasks-with-codex
  Milestone plan, scoped implementation, validation and maintained execution state.
- **R20 — MDN transform-origin.** https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/transform-origin
  Explicit transform pivot for chevrons and decorative paper layers.
- **R21 — IPTC NewsCodes Guidelines.** https://iptc.org/std/NewsCodes/guidelines/
  IPTC recommends Media Topics rather than the older Subject Codes vocabulary.
- **R22 — IPTC Media Topics JSON endpoint.** https://cv.iptc.org/newscodes/mediatopic/?format=json&lang=en-GB
  Official metadata import target. Full raw JSON not bundled; browser inspected the endpoint family, direct runtime download failed.
