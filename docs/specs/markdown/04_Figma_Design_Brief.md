# The Aggregator
## Figma Design Brief

Version 1.0 | Evidence Editorial direction | 8 October 2026

## 1. Assignment and required outcome

Design the complete launch reader application and private editorial workspace in Figma. Produce an editable design system, responsive screens, interactive critical flows, state coverage and a developer handoff. This is a product interface, not only a marketing landing page. The article and its source-verification experience are the primary design work.

Use the PRD for scope, the App Flow document for behavior and the TRD for real data and runtime constraints. Do not invent publication states, fabricated reliability scores, unlicensed imagery, hidden source drawers as the only bibliography, or paid features that do not belong to launch. The supplied repositories are references and future runtime tools; they are not six Figma plugins. No existing Figma file is assumed or modified by this document.

The intended feeling is a contemporary evidence-led publication: editorial authority, calm reading, clear source provenance and precise interactive feedback. Use a distinctive serif/sans hierarchy, warm paper, deep forest interaction color and carefully separated amber, blue and purple accents. Avoid the generic AI dashboard aesthetic: giant gradients, glass surfaces, glowing orbs, repetitive equal-sized cards, excessively rounded controls and decorative charts without a question to answer.

## 2. Translate the six repositories into this project

**formkit/auto-animate.** This is a runtime transition utility, not a Figma layout engine. Use it later for small insertion/removal/reorder transitions in bookmark lists, filter chips and reviewer checklist rows. In Figma, document before/after variants and demonstrate with Smart Animate where appropriate. It must not animate an article's paragraphs or reorder a feed underneath someone reading. [R01]

**motiondivision/motion-vue.** Use Motion for Vue, whose package is motion-v, for explicitly orchestrated panels, navigation, presence and shared-element transitions during implementation. Define those transitions in Figma as state relationships and motion annotations. Do not load both Motion and AutoAnimate onto the same element's position/layout property. [R02]

**emilkowalski/skills.** Use as motion/design-engineering review guidance: purpose, timing, interruption, physical continuity and what not to animate. Translate the review into annotations and inspect the interactive prototype; do not assume React/Expo examples apply directly to Vue. [R03]

**Leonxlnx/taste-skill.** Use the design-language and hierarchy guidance to avoid generic composition. Inspect and pin a reviewed revision before adoption because repository defaults can change. Any framework, animation-library or aggressive-motion preference in a skill is subordinate to this project's Vue, Motion and accessibility decisions. Proposed interpretation: layout variance 6/10, reader motion 2/10, staff motion 1/10, home density 6/10, article density 3/10 and newsroom density 8/10. These are project art-direction settings, not a requirement to execute every skill verbatim. [R04]

**img2threejs/img2threejs.** This reconstructs procedural Three.js objects from reference imagery. It is not required on a news reading surface. Explore an optional, abstract layered-paper object for an About/brand study only, using an original approved reference. Place static renders or a small annotated sequence in Figma; record the code integration separately. No Three.js canvas, animated globe or 3D news photography on article pages. Launch must work without this experiment. [R05]

**pbakaus/impeccable.** Use its design critique and refinement approach for typography, consistency, responsiveness, clarity and robust states. Record findings in a Figma QA page and resolve them before handoff. Do not claim commands ran in Figma unless the chosen agent has a real supported way to execute them; the principles can be applied manually. [R06]

## 3. Figma file architecture

Create pages named 00 Readme and Decisions; 01 Foundations; 02 Components; 03 Reader Desktop; 04 Reader Tablet; 05 Reader Mobile; 06 Newsroom Desktop; 07 Newsroom Responsive; 08 Prototypes; 09 States and Accessibility; 10 Handoff; and 90 Future Concepts. Keep V1/V2 concepts in the last page and label them Not in launch.

Use section names containing the screen ID and workflow, for example SC04 / Article / Standard / Desktop. Frame names follow SC04.Article.Standard.Desktop.Light.Default. Keep stable semantic layer names for Smart Animate: Article/Header, Article/Body, Article/Sources, Evidence/Panel, Action/Save. Do not export one flattened screenshot as an editable screen.

Use nested Auto Layout for headers, navigation, article stacks, source lists, form fields, toolbars and cards. Specify Hug, Fill, fixed, minimum and maximum dimensions intentionally; use constraints for overlays. Content-driven article height is not a fixed long rectangle with text pasted over it. Figma auto layout is the layout reference, and variables/collections support the token system. [R13, R14]

Create semantic variable collections for Color with Light/Dark modes; Spacing; Radius; Type; and Motion. Use raw/palette variables only as primitives behind semantic aliases. Bind components to semantic variables rather than repeated literal colors. If the account does not support the desired modes or prototype variables, provide equivalent styles and explicit state frames and record the limitation; do not require a subscription upgrade as an unstated dependency. [R13, R15]

Deliver a component inventory with ownership, variant properties and usage notes. Shared component variants include size, state, emphasis, theme and density only when they genuinely alter behavior. Avoid a Cartesian explosion of hundreds of redundant variants. Prefer nested instances and component properties for text, icon visibility, status and optional slots.

## 4. Identity, color and content tone

Use a text-led wordmark, The Aggregator, with a restrained graphic concept of distinct lines converging into one editorial column. The mark must not resemble a publisher's logo or YouTube branding. The product line is “One story. Clear sources.” Treat this as proposed copy, not a registered tagline.

Light surfaces are warm paper with white lifted surfaces and deep green-black text. Dark mode is separately composed green-black, not mechanically inverted. Forest indicates primary actions and selected navigation. Burnt amber indicates editorial emphasis and developing status, not success. Blue identifies links and information. Purple is a secondary analytical series or category accent, not an all-purpose AI color. Red indicates errors, withdrawal and urgent correction. Status must always have text or an icon.

| Semantic token | Light | Dark | Usage |
|---|---|---|---|
| Canvas | #F6F3ED | #101715 | Main page background. |
| Surface | #FFFFFF | #19221F | Menus, dialogs, elevated source panels. |
| Subtle surface | #ECE7DD | #23312B | Quiet grouping, never low-contrast text. |
| Primary text | #18201E | #F1F3ED | Headlines and article body. |
| Secondary text | #4A5851 | #D1D9D0 | Supporting explanatory text. |
| Muted text | #626C65 | #AEBCAF | Metadata and timestamps. |
| Brand/action | #17634D | #83D8B2 | Primary actions, current navigation. |
| On brand | #FFFFFF | #10271D | Text/icons on brand fill. |
| Editorial accent | #A85422 | #F0B66D | Limited emphasis and developing labels. |
| Information/link | #315CB0 | #98B7FF | Links and focus outline. |
| Data purple | #7651A8 | #C2A5ED | Secondary chart series. |
| Danger | #B02E35 | #FFADB1 | Error and withdrawal labels. |
| Control border | #79857E | #80968A | Interactive boundaries on surfaces. |
| Subtle divider | #D4D9D3 | #35453D | Decorative separators only. |

The provided design/design_tokens.json is a portable token proposal for mapping into Figma and code, not a native .fig file or guaranteed direct import. design/contrast_checks.json contains calculated solid-color ratios for key pairs. Check actual rendered states, opacity, images and focus combinations separately. Subtle dividers intentionally do not serve as the sole visual boundary of an input.

## 5. Typography, spacing and responsive grid

Use Newsreader for the wordmark, editorial headlines and article body; Manrope for navigation, forms, labels and supporting copy; IBM Plex Mono only for technical IDs or compact operational figures. Verify font licensing/availability in the actual Figma and web environments and use compatible fallbacks. Do not distribute font files in the design handoff. Avoid using monospaced type for ordinary article paragraphs.

Type scale: desktop lead 58/62, article title 52/56, mobile article title 34/38, section heading 28/34, card title 24/30, article body 20/32 desktop and 18/29 mobile, interface body 15/22, labels 13/18 and metadata 12/18. Limit long-form measure to approximately 60-70 characters, with a 720 px maximum article column. Do not shrink typography to force headlines or source titles onto one line. Use tabular figures for time/cost/counts.

Spacing scale is 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80 and 96 px. Control radius is 6 px, card 10 px and modal 16 px; pills are reserved for chips/badges. Use 1 px dividers and restrained shadows only for actual elevation. Primary standalone controls have at least a 44 x 44 px hit area; dense tables can have visually smaller controls within equivalent targets. WCAG's AA target-size rule has a 24 px minimum with exceptions; the project intentionally chooses larger standalone controls. [R24]

Desktop reference is 1440 px with a 1200 px content area, 12 columns and 24 px gutters. Tablet reference is 834 px with 32 px side margins, eight columns and 20 px gutters. Mobile reference is 390 px with 20 px side margins, four columns and 16 px gutters. Validate 360, 390, 768/834, 1024, 1440 and 1920 widths; also test reflow at a 320 CSS-pixel viewport. These are content-driven breakpoints, not fixed device assumptions.

At desktop, Home uses an asymmetric 8/4 lead-and-briefs layout. Article uses a 720 px body plus a roughly 280 px contextual rail when space permits. The rail collapses into inline metadata on tablet and mobile; it never duplicates or replaces the bottom sources. Newsroom uses a persistent navigation rail, a resizable evidence pane and a draft pane; at narrow widths these become labeled tabs without losing review context.

## 6. Screen-by-screen layout direction

### SC01 Home
Use a compact masthead, edition/date line, topic navigation and one lead article with a substantial serif headline. Place three compact briefs in the right rail and a varied latest-story list below. Cards show desk, updated time, evidence count and reading length with understated labels. A selected For you view includes an explanation and Reset/Manage topics. No giant welcome hero or central search box consumes the first screen. A new edition is announced; the feed does not jump.

### SC02 Topic hub
Use a desk title, two-sentence scope, Follow action and a compact filter row. Ongoing-story trails receive a linear timeline treatment; newest articles remain visually distinct from background explainers. Follow status is separate from filter selection. Use an honest empty state and selected-topic label rather than filler content.

### SC03 Search
Place the query prominently at the top with a clear search button. Filters use accessible custom popovers/selects that preserve native keyboard behavior; date selection has a typed alternative. Results are text-led rows with matching context and relevant source-type labels. On mobile, use a Filters sheet with Apply/Clear, while applied filters remain visible as removable chips. Separate zero results from unavailable search.

### SC04 Article
Design this first. Stack desk/status, headline, deck, byline/review disclosure, publication/update/cutoff metadata, variant controls, key developments and narrative. Citation markers are visually discoverable but do not interrupt every word. Place a visible “Sources (n)” jump link near the top. Keep the article body on a quiet surface; optional imagery must be licensed and clearly captioned.

At the bottom, show the Sources and evidence heading, a plain explanation of counts, and every exact item as a numbered row/card. Then show related watch/read links under their own heading, corrections/history and up to three related Aggregator stories. Never put a “show all” control between the reader and required bibliography entries. A correction banner is visible near the title and linked to details; a developing label does not imply live verification.

### SC05 Evidence drawer / mobile sheet
The heading repeats the exact claim under inspection. Show its status in words, the supporting or contradicting items, origin relationship where useful, permitted excerpt/locator, and Open original. A diagram is optional; a readable list is mandatory. A disputed claim uses parallel attributed statements, not a left/right political spectrum or an arbitrary confidence percentage. Missing excerpt rights yield a link and provenance explanation, not an empty-looking card.

### SC06 History
Use a chronological list with version, timestamp, change type and concise public reason. The current version is obvious. A historical view has a persistent “Historical version” warning and a Read current action. Redacted text is replaced with a lawful reasoned state. Do not show deleted material in a comparison tooltip or screenshot.

### SC07-08 Source directory and profile
Directory cards are understated: source name, medium, subject scope and review date. Text is the baseline when logo rights are absent. Profiles disclose selection rationale, limitations and verified ownership links; a “reputable” badge is not a substitute for explanation. Public profiles never expose contracts, private risk notes or confidential contact details.

### SC09-10 Authentication and onboarding
Use a centered, warm-surface form with Google and email choices, the original Save/Follow intent and a clear Cancel/Continue reading action. Avoid asking for name, job, country or interests that are not necessary. The email-sent state explains expiry/resend. Onboarding shows the six topics and an equally visible Skip. No newsletter opt-in is preselected.

### SC11-12 Saved and settings
Saved is a compact editorial list, with status for corrected or withdrawn items. Do not add folders or collaboration in launch. Settings use clear groups: Reading, Followed topics, Account/identities, Sessions and Privacy. Theme preview uses small sample cards; reduced motion and text size have immediate previews. Destructive actions are separated and use specific confirmation copy.

### SC14-15 Reporting and methodology
Reporting is a short form tied to the article/version and optionally the claim. Show the issue categories, explanation field, optional evidence/contact and a truthful receipt state. Methodology reads like a transparent editorial policy, with anchors and diagrams only when useful. Keep the rights/contact path easy to find, not buried behind account creation.

### SC16 Newsroom queue
Design an efficient dense table/list with story title, desk, risk, evidence/origin counts, status, assigned reviewer, last change and blockers. Provide useful saved filters such as Needs review, Insufficient evidence and Ready to publish. Surface blockers as meaningful text; a green dot does not mean publishable. The primary row action resumes the next valid task.

### SC17-18 Source governance
Use a source list with status and permission-expiry indicators, then a detail page with tabs for Identity and scope, Editorial reviews, Rights, Endpoints and Intake history. The rights form shows separate use flags and expiry, not one “permission granted” switch. Safe test intake displays the requested/final URL, type, extraction result and denial reason. Secret references are masked identifiers, never editable plaintext tokens.

### SC19 Cluster review
Present the bounded event summary, time window and source items. Show exact duplicates and shared reporting origins with clear grouping. Provide a timeline and a plain list alternative. Split/Merge actions preview affected items and stale drafts before confirmation. Unknown origin is a visible warning; it is not colored as independent evidence.

### SC20 Editorial workbench
At desktop, use evidence/claims on the left and article editing/preview on the right, with a fixed status toolbar. A bottom or side validation panel lists blockers linked to exact claims/blocks. Tabs switch Standard/Brief without hiding the requirement to review both. Show current content digest, review state and distinct approvers in plain language, not an overwhelming raw hash. Raw hash is available in details.

Separate Save draft, Validate, Submit for review, Approve and Publish according to role/state. Publish opens a compact final gate summary with evidence sources, independent origins, current rights and approvals. A stale approval error shows what changed and routes back to review. There is no disabled button without an explanation and no “Publish anyway.” Mobile staff views support triage and reading; complex two-pane editing can request a wider viewport while preserving access to urgent withdrawal.

### SC21 Corrections and withdrawals
Show issue severity, affected article/version, evidence, private report and proposed public change note in separate blocks. Withdrawal is visually destructive and includes a clear scope preview: reader page, brief, search, previews and derivatives. Show purge/retention progress after confirmation. A report marked resolved is not evidence that all caches were successfully suppressed.

### SC22-24 Operations, analytics and access
Operations uses exception-first panels for unavailable connectors, overdue jobs, budget limits and deletion failures, then a searchable job table. Analytics uses simple line/bar charts for questions such as generation cost by day and review bottlenecks; every chart has definitions, sample size, last refresh and a tabular alternative. Do not draw a decorative “trust score.” Access uses an auditable role matrix with reauthentication and a clear diff of changes.

### SC25-26 Privacy and system states
Show a plain timeline for queued/processing/ready/expired requests. Explain what deletion does before the irreversible confirmation. Export links include expiry and never reveal other users' data. Design distinct 403, 404, withdrawn/410, offline, retryable error and maintenance states. A withdrawn article can retain a permitted correction explanation; it must not suggest the story never existed.

### SC13 and SC27-29 Future pages
Keep digest settings and source suggestions as V1 reference frames. Collections and paid products remain V2 concept placeholders with no connected launch navigation. Additional languages require stress/RTL frames later. The design is not accepted by rendering future screens while leaving launch error states incomplete.

## 7. Reusable components and behavior

Required component families are Masthead, DesktopNav, MobileNav, TopicTabs, StoryCard (lead/compact/list), MetadataRow, StatusBadge, ArticleHeader, VariantToggle, ArticleBlock, CitationMarker, SourceEntry, VideoReference, EvidencePanel, DisagreementGroup, VersionNotice, HistoryEntry, SaveButton, ShareMenu, FilterChip, SearchField, SelectPopover, DateRangeField, FormField, Checkbox, RadioGroup, Button, IconButton, Tooltip, Toast, Dialog, Sheet, EmptyState, ErrorState, Skeleton, DataTable, Pagination, ValidationFinding, PermissionFlag, ApprovalSummary, JobStatus, MetricCard and AccessibleChart.

Every interactive component has default, hover where relevant, focus-visible, pressed, loading, disabled and error states; selected/checked states are explicit. Required sizes are compact and standard where necessary, not arbitrary five-size variants. Components must expose realistic long text, missing images, count of zero, large counts and translated-string stress cases. Use a consistent outlined icon family; an icon alone needs an accessible name.

SourceEntry anatomy: fixed number; source type; full item title; publisher/channel and author if known; source publication timestamp; access/availability state; evidence-role label; page/time locator when reliable; direct original link; and return-to-citation link. One item may support several claims; do not duplicate the entire entry just to assign another number. Long titles wrap. Related videos use a different label and cannot inflate evidence counts.

Forms show visible labels, instructions before submission and field-level errors after validation. Preserve input on server failure. Tables have keyboard-focusable actions and alternative compact layouts; horizontal table scrolling is scoped to the table region, never the entire page. Destructive actions use an explicit verb and object.

## 8. Motion system and prototype mapping

Motion communicates a state change, not the importance of the publication. Default durations: feedback 120 ms; controls 180 ms; panels 240 ms; list layout 260 ms. Entry easing is cubic-bezier(0.22,1,0.36,1); exit is cubic-bezier(0.4,0,1,1). Springs are reserved for direct manipulation and not used for reading text. All interactions are interruptible; repeated taps do not queue a backlog of animations.

| Interaction | Figma demonstration | Runtime owner | Reduced-motion behavior |
|---|---|---|---|
| Save state | Two icon/button variants, 120 ms dissolve | CSS or Motion, not both | Instant label/icon change. |
| Evidence open/close | Overlay plus 240 ms state transition | Motion for Vue | Instant or <=100 ms opacity; identical focus handling. |
| Filter chip insertion | Before/after Auto Layout frames | AutoAnimate on chip list only | Instant layout update. |
| Saved-list removal | Matched list layers, 260 ms | AutoAnimate on list container | Immediate removal with focus moved safely. |
| Standard/Brief switch | Explicit frames, minimal dissolve | CSS/Motion content boundary | Instant replacement at logical anchor. |
| Validation finding reveal | Panel variant with highlighted item | Motion for Vue | Instant reveal; no flashing. |
| Article/source anchor | Prototype navigate/scroll target | Browser anchor; no decorative library | Immediate anchor jump. |
| Edition updates | New-items banner | No automatic reordering | Same behavior in all modes. |

Do not animate paragraphs into view, count source totals upward, pulse developing badges indefinitely, use parallax imagery, scroll-jack the page or autoplay source videos. AutoAnimate and Motion must have explicit non-overlapping ownership. Runtime reduced-motion behavior is verified even if a Figma prototype cannot emulate the operating-system setting; create a separately linked Reduced Motion flow. [R02, R23]

## 9. Accessibility, imagery and editorial realism

Target WCAG 2.2 AA. Check text contrast, focus visibility and order, keyboard operation, meaningful landmarks, heading hierarchy, reflow, 200% text enlargement, accessible names and error associations. Do not rely on color alone. Reserve sufficient contrast for interactive borders while keeping decorative rules quiet. Check source markers with screen readers; their accessible name can read “Source 2, publisher, item title.” [R16]

Figma contrast checks are not implementation certification. Handoff annotations must identify semantic heading levels, tab order, modal focus behavior, live-region messages and icon labels. Include no-mouse and reduced-motion prototype walkthroughs. A toast must not be the sole location of a critical publish failure.

Use fictional editorial fixtures clearly marked as demo content in the design file, not fabricated current news presented as real. Build at least four article fixtures: a multi-source normal story, a disputed numeric claim, a licensed transcript/document story and a corrected/withdrawn story. Use varied headline lengths, named fictional sources, missing-author metadata and long URLs/titles. Decorative placeholders must not resemble factual photographic evidence.

Real publisher logos and photographs require permission appropriate to their use. Plain source names are the safe design baseline. Clearly distinguish YouTube attribution from The Aggregator's own branding and do not obscure player controls or source identity. Follow current provider branding and supported embed behavior during implementation. [R26, R27]

## 10. Prototype deliverables and acceptance

Prototype A is the anonymous reader journey from Home to article, Brief, disputed claim, exact original, complete bibliography, Save/sign-in, Saved and correction report. Prototype B is source governance through failed rights test, eligible intake, cluster review, generation, validation failure, revised draft, approvals and publish. Prototype C is update/correction/withdrawal, including a stale approval and public tombstone. Prototype D is settings/privacy, showing theme, text size, export and deletion confirmation.

Produce light and dark key frames for Home, Article, Evidence, Search, Saved, Newsroom and Workbench. Other screens must use fully mode-bound components and receive a theme pass. Produce desktop and mobile reader frames for every launch reader screen; tablet at least Home/Article/Search/Evidence/Settings. Staff desktop covers every launch staff screen; responsive triage covers Newsroom, Corrections and Operations plus workbench reading. Provide a viewport/state coverage checklist rather than claiming all screens are responsive from one screenshot.

The handoff includes editable file access, foundations/components, annotated screen IDs, prototype entry links, exportable owned assets, mapped tokens, icon/font license register, state inventory, motion ownership, content fixtures and a QA issue log with resolved/blocking status. Capture the actual Figma file/version only after it exists. The acceptance review rejects flattened-only frames, missing sources, lorem ipsum replacing a full article, inaccessible focus, unexplained disabled actions, unlicensed imagery and unresolved launch blockers.

## 11. Instruction to the Figma design agent

Create the Figma application described here using the PRD and App Flow as constraints. Begin with Foundations and the Article/Evidence components, then complete Home/Search, accounts, source governance and the editorial workbench. Apply the six repositories only in the roles assigned above. Read their selected revisions; do not execute unreviewed installation scripts or switch the Vue/Motion stack because a skill suggests it. Build real Auto Layout components and complete the normal, empty, error, loading, permission-denied and correction states. Connect the four required prototype flows. Keep all sources visible at the article bottom. Use the named color and type tokens. End with a screen/state coverage report and unresolved issues, not a claim of production readiness.


## References

External references were checked on 8 October 2026. Requirements, thresholds, architecture and visual choices are project proposals, not claims of measured performance. Recheck changeable provider terms before implementation.

[R01] AutoAnimate repository. Vue-compatible automatic layout transitions; implementation reference. [Open source](https://github.com/formkit/auto-animate).

[R02] Motion for Vue repository. Vue animation library; published package is motion-v. [Open source](https://github.com/motiondivision/motion-vue).

[R03] Emil Kowalski design and animation skills. Design-engineering and animation review guidance. [Open source](https://github.com/emilkowalski/skills).

[R04] Taste Skill repository. Portable design skills; inspect and pin a reviewed revision. [Open source](https://github.com/Leonxlnx/taste-skill).

[R05] img2threejs repository. Procedural Three.js reconstruction from reference imagery; optional exploration only. [Open source](https://github.com/img2threejs/img2threejs).

[R06] Impeccable repository. Design critique, audit, refinement and hardening guidance. [Open source](https://github.com/pbakaus/impeccable).

[R13] Figma variables, collections and modes. Variable-based systems; capabilities and mode counts depend on current plan. [Open source](https://help.figma.com/hc/en-us/articles/14506821864087-Overview-of-variables-collections-and-modes).

[R14] Figma auto layout guide. Responsive component and layout construction reference. [Open source](https://help.figma.com/hc/en-us/articles/360040451373-Guide-to-auto-layout-in-Figma).

[R15] Figma variables in prototypes. Stateful prototyping reference; use frame alternatives when unavailable. [Open source](https://help.figma.com/hc/en-us/articles/14506587589399-Use-variables-in-prototypes).

[R16] WCAG 2.2. Accessibility conformance reference; this project targets AA. [Open source](https://www.w3.org/TR/WCAG22/).

[R23] AutoAnimate documentation. Runtime behavior and reduced-motion integration reference. [Open source](https://auto-animate.formkit.com/).

[R24] WCAG target-size minimum explanation. AA minimum and exceptions; project uses larger standalone controls. [Open source](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum).

[R26] YouTube branding guidelines. Per-item attribution and branding requirements. [Open source](https://developers.google.com/youtube/terms/branding-guidelines).

[R27] YouTube embedded player parameters. Supported embed and playback parameters. [Open source](https://developers.google.com/youtube/player_parameters).
