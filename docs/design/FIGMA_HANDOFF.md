# WP02 first review batch

Historical first-batch record. The current SC01/SC04 composition is superseded by the owner-requested [newspaper refinement](NEWSPAPER_REFINEMENT.md); these original 30 review frames remain preserved.

Authority: `../specs/markdown/04_Figma_Design_Brief.md`, PRD F01/F04–F10/F22–F24, FL01/FL04–FL06/FL13. Selected file: https://www.figma.com/design/cU1bmSQP5Nh5PX0WayfEpT/Aggregator . Bridge probe verified native Plugin API read/write and screenshot export on 2026-10-12. Initial file was blank; no unrelated design will be modified. Font inventory includes Newsreader, Manrope and IBM Plex Mono.

Create SC04 Article first, SC05 claim inspection, SC01 Home, then SC20 Evidence and article workbench. Use exact token names from `../specs/design/design_tokens.json`. Reference frames 1440, 834, 390; QA widths 320, 360, 768, 1024, 1920 plus 200% text. Desktop article measure ≤720, contextual rail about 280; mobile margins 20, tablet 32. Home is an asymmetric 8/4 lead/brief composition.

Use named sections; nested Auto Layout; content-driven text; reusable source, citation, badge, button and validation components. Semantic variables with Light/Dark modes or documented style fallback. Standard and brief preserve version/cutoff and full source numbering. Provide long headline/source title, disputed numeric evidence, correction, unavailable original, transcript locator and loading/empty/error cases. No real publisher marks or news images.

Prototype: Home → Article → Brief → disputed claim inspection → exact mock original; Sources jumps to complete bottom bibliography, each citation resolves with return link. Modal focus moves to heading/Close, traps while open, Escape closes and restores invoking citation. No-JS implementation uses anchors and full bibliography. Evidence motion 240ms owned by Motion for Vue; reduced motion immediate/≤100ms opacity. AutoAnimate owns only small list insertion/removal; never article body layout.

SC20 shows evidence/origin counts separately, both variant review, exact digest changes, validation blockers, distinct reviewers, and state/capability-specific actions. No Publish anyway. Stale approvals invalidate on content/evidence edits; high-risk needs two identities. Mobile is triage/read, not compressed two-pane editing.

First review acceptance: editable layouts and components, legible sources in both themes, real states and annotations, linked core prototype, no clipping at reference widths, clearly fictional content. Owner accepted the visual direction on 2026-10-12 and asked to keep and improve it. Full WP02 additionally needs SC01–SC06 and SC16–SC21 plus all required launch screen/state coverage and the four full Design Brief flows; this batch does not complete it.

See `PRETEXT_INTEGRATION.md` for the separate runtime experiment. Actual frame IDs and coverage are recorded below.

## Native artifacts actually created

File: [Aggregator](https://www.figma.com/design/cU1bmSQP5Nh5PX0WayfEpT/Aggregator). Page `0:1`, named `08 Prototypes — First review`. The first canvas uses named sections instead of creating empty placeholder pages. The full prescribed page architecture remains a follow-on task. [Machine-readable inventory](figma-inventory.json) records 30 screen frames and the native components.

| Review target | Frame | Coverage |
|---|---|---|
| [SC04 Standard desktop](https://www.figma.com/design/cU1bmSQP5Nh5PX0WayfEpT/Aggregator?node-id=1-71) | 1:71 | Standard/Brief × 1440/834/390 × Light/Dark (12 frames) |
| [SC05 Evidence desktop](https://www.figma.com/design/cU1bmSQP5Nh5PX0WayfEpT/Aggregator?node-id=1-977) | 1:977 | Desktop side panel; tablet/mobile inspection; both themes (6) |
| [SC01 Home](https://www.figma.com/design/cU1bmSQP5Nh5PX0WayfEpT/Aggregator?node-id=1-1169) | 1:1169 | 1440/834/390, both themes (6) |
| [SC20 Workbench](https://www.figma.com/design/cU1bmSQP5Nh5PX0WayfEpT/Aggregator?node-id=1-1355) | 1:1355 | Desktop/mobile, both themes; deliberate unsupported draft and stale approvals (4) |
| [SC04 correction stress](https://www.figma.com/design/cU1bmSQP5Nh5PX0WayfEpT/Aggregator?node-id=5-626) | 5:553 / 5:626 | Desktop/mobile long title, correction and unavailable original (2) |

Color collection has actual Light/Dark modes and bound semantic paints. Spacing/Radius/Type/Motion collections and named text styles exist; remaining numeric/style bindings are incomplete. Button variants Default/Focus/Disabled/Selected, SourceEntry instances and StatusBadge are reusable. Core reader navigation and bibliography returns are linked; correction stress frames currently stand alone.

Visual QA: fixed horizontal-container content height and source-instance height, tightened excessive top spacing, kept source titles wrapping, replaced the newsroom's contradictory example with explicitly unsupported draft text. Selected final screenshots verified desktop Home/Article/Evidence/Workbench and mobile dark Evidence/correction. Full-frame exhaustive visual regression and all control hover/loading/error variants remain pending.

Remaining first-batch details: selected-length styling across variants, fully native overlay/back focus behavior, missing date/zero-source variants, prototype links for correction stress, no-mouse/reduced-motion prototype walkthrough, true 320/200% Figma stress layouts and remaining screen/component inventory. Browser reflow evidence belongs to the local implementation and is not a claim that every Figma state was checked. Figma links open mock example-domain originals, not real articles.

## Current controls increment

The 12 October SC01/SC04/SC05 controls pass adds editable Light/Dark variants and updates the current newspaper frames on 8:693. It preserves this original 0:1 review batch and a detached snapshot of the newspaper checkpoint on 12:1522. Hover/press and selected-length component prototypes now exist; clipboard outcomes are static Figma examples and real browser behavior. This resolves the focused controls subset, not the remaining first-batch/full-WP02 coverage. [Current handoff and evidence](CONTROLS_REFINEMENT.md), [native component inventory](figma-controls-inventory.json). Owner review remains pending.
