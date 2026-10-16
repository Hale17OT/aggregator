# The Aggregator — continuous product-completion run

Version 1.0 · 14 October 2026 · New owner-authorized local implementation scope

## Mission and what “complete” means in this run

Continue the existing Aggregator repository, not a new application. Finish an integrated reader-facing local product across Read, Radio, Newsroom and the new **Clips** format. Implement the new account-interest system, personalized discovery, newspaper page turning and the corrected dropdown affordance. Close safe, unblocked launch-experience gaps as part of the same run. Produce something the owner can use, not another collection of plans, disconnected components or demonstration-only buttons.

This instruction supersedes historical STOP/one-checkpoint boundaries for the work below. Work through the milestones in this active session; do not stop after the icon fix, a migration, a test helper, an initial render or a component specimen to request another prompt. Make reversible local decisions and record them. Resolve defects before extending the affected surface, and continue independent work when a genuine external prerequisite is blocked.

**Completion is not a licence to invent permission or results.** Staff assurance/MFA remains paused. Do not enable live scraping, external RSS polling, real-news synthesis, real editorial approval, public publication or deployment. The latest source-to-draft engine is private, fictional, deterministic/extractive and separate from the reader. It must stay that way during this run. A complete local reader is not a completed live publishing operation. Report those boundaries once clearly; do not use them as a reason to avoid the independently implementable features below.

Read this prompt and its companions `02_TAXONOMY_AND_PERSONALIZATION.md`, `03_ACCEPTANCE_MATRIX.md`, `04_RESEARCH_AND_DECISIONS.md`, and `taxonomy/interest_catalogue.seed.json`. Their proposed IDs and paths are contracts to map into the actual repository, not assertions that tables or routes already exist.

## 0. Establish actual starting state and execution safety

Inspect AGENTS.md, Git state, the canonical current PROJECT_STATUS summary, SOURCE_TO_DRAFT_ENGINE, the original six specifications, current screen/feature/work-package registers and relevant runtime code. Ignore old next-task paragraphs under historical summaries. Preserve unrelated modifications, original specifications, migration bytes, existing fixtures and retained member data. Do not rewrite the PRD or create a competing architecture.

The latest report states:
- The retained member/product cluster is on loopback 55441 with seven applied migrations and explicitly pinned startup; the private engine's disposable profile is 55442 with migration 0008. A stopped pipeline target manifest is not a product runtime target.
- Captured-mail sign-in, PostgreSQL member records, accepted newspaper, custom controls, actual Radio knobs and 17 existing programmes work. The private engine does not feed public APIs or the programme catalogue.
- The established unthrottled reference performance gate passed previously; CPU4 popup/list cost remains open after three reverted candidates. Native Figma is disconnected; real hidden-tab and physical-device results are not established.
- Current reported capacity is approximately C:101.41 GiB/E:236.20 GiB, not the historical 0.25 GiB warning. Measure again; do not ask the owner to clear space based on superseded history.

Confirm that state against code/ledgers/ports. Do not repeat completed account, database, broadcast or engine work. Do not target 55442 with the member app or assume the retained database already has 0008.

Use existing attested supervisor, preflight, E:-scoped TEMP/TMP/tool caches and bounded process ownership. No duplicate servers, global browser installs, arbitrary process killing, reset/reseed or unrelated file cleanup. Build to completion before an owned restart, and verify readiness before browser tests. Never run tests against a build being replaced. Run costly renders, installs, builds and performance measurements sequentially. Stop only heavy operations when capacity is unsafe and continue lightweight work.

Allowed: additive source changes, reviewed dependencies when indispensable, local original fictional assets, local speech/render tools already installed, safe additive migrations, public official documentation and taxonomy/entity-metadata research, local captured mail and tests. Metadata research is not permission to import news, logos, transcripts or copyrighted media.

Not allowed: paid API calls, external email, uploads, remote commits/pushes, public deployment, production access, new model downloads, real-publisher retrieval, automatic approval records, changing existing publication guards or administrator/reader privilege bypasses. Account membership has no billing/pricing/tier implementation or promotional pricing language.

Create `docs/execution/PRODUCT_COMPLETION_PLAN.md` with the milestones below and the acceptance IDs. Track NOT STARTED, IN PROGRESS, IMPLEMENTED, VERIFIED, BLOCKED and OWNER REVIEW PENDING separately. Maintain one canonical current summary. Do not promise elapsed completion time or claim work continues outside the actual active session.

## 1. Fix the dropdown indicator throughout the actual product

The owner specifically rejects the off-centre/weird dropdown affordance. Inspect rendered ControlSelect, ControlCombobox and other real selector triggers in Radio, Newsroom, Search, Sign in, Library, Preferences and new flows. Determine whether the visible mark is the Reka default glyph, duplicated icons, SVG whitespace, font baseline, flex shrink or a transform-origin problem. Do not claim a cause before inspection.

Keep the accepted button/field system. Replace the affordance with one shared original outline-chevron component. Prefer the existing SVG icon infrastructure, not an icon font, Unicode triangle, emoji, CSS-border triangle or a second icon library. Remove the default Reka SelectIcon glyph when providing custom children/asChild. Do not leave a native arrow, pseudo-element and SVG stacked together.

Starting geometry: 18px rendered SVG inside a fixed 20px square icon slot, viewBox `0 0 24 24`, no fill, currentColor stroke around 1.75–2, round caps/joins. A possible centred path is `M7 9.5 L12 14.5 L17 9.5`; inspect the actual visual result rather than accepting these numbers blindly. Use grid/flex alignment and explicit zero icon line-height; value area is `minmax(0,1fr)` and the icon must not shrink. Centre the painted chevron relative to the control face, including multiline labels. Do not add arbitrary per-page top offsets.

Rotate the same chevron 180 degrees on open around its centre, without moving its centre or resizing the trigger. Use a restrained 120–160ms transform or instantaneous reduced-motion state. Render it decorative, aria-hidden, focusable=false and pointer-events:none; the complete trigger owns interaction and aria-expanded. A long label, clear-query control or loading marker must have separate reserved space and must not shift the indicator.

Preserve Reka semantics, typeahead, portal positioning, escape/tab focus, selections and existing form behaviour. Do not fix layout by truncating essential values or replacing the custom select with a native-only product control. Verify closed/open/focus/disabled/error, Light/Dark, 320/390/834/1440px, 200% text and failed-font conditions. Compare both actual screenshots and bounding geometry; an SVG element centred while its painted path is visibly off-centre is not a pass. Apply the fix to real instances, not just a lab page.

## 2. Integrate durable subjects and member interests safely

First inspect existing topics, follows, preferences, article-version relationships and storage interfaces. Reuse them where sound. Add the smallest typed extension required for topic concepts, named entities, relationships, version-bound article subject assignments, explicit follow/mute rules and onboarding status. Do not introduce a second user table, authentication scheme, incompatible topic model or loosely constrained polymorphic references.

Canonical concepts need stable internal IDs, typed kind, preferred label, aliases, status, provenance/external ID mappings and revision information. Distinguish topic ancestry from entity membership and competition participation. Do not make a team's identity a child string permanently embedded in a league slug. Article-topic/entity associations refer to a particular article revision and material relevance, not arbitrary keyword matches or a incidental name in a citation.

Account interests require server-derived owner context, existing CSRF/Origin checks, strict payload limits, optimistic concurrency, durable timestamps and update semantics. Keep onboarding state and explicit selections consistent in one transaction when completing setup. Expired/revoked sessions, owner swaps, unknown IDs, cycles, retired nodes and conflicting updates must have safe deterministic outcomes. A taxonomy change must not silently erase a followed entity.

### Migration profiles — critical

Do not skip 0008 in a ledger, renumber it, edit 0001–0008, falsely mark a migration applied, or blindly run the newest migration set against retained members.

1. Inventory actual migration files and each profile's ledger.
2. Create a verified backup of retained data in a private workspace path and prove restoration into a separate attested clone. Do not include member records/secrets in review exports.
3. Test the complete retained-seven-migration upgrade on that clone, including 0008 if the migration system is one ordered chain, plus the new additive migration(s). Check grants, fixture seed compatibility, seven original checksums, existing users/sessions/bookmarks/queues/progress/preferences and programme prerequisites.
4. Pipeline-only login/provisioning remains absent from product runtime privileges even if its schema is shared. Product API must not acquire grant-mutation, raw payload, approval or publication access.
5. If profile incompatibility exists, implement a reviewed additive compatibility solution or explicit supported profile plan; no silent skipped migration or fake ledger entry. Document the choice.
6. Only after verification, perform the reversible upgrade of the exact owned retained local target, through its existing maintenance boundary. Update startup attestation/version expectations deliberately. No reset or automatic fallback to memory.
7. Verify restart persistence and a before/after non-sensitive integrity snapshot. On failure roll back the transaction where possible, preserve evidence and stop further mutations. Do not overwrite retained data with a blank seed or silently restore over new user activity.

New topic/fictional catalogue additions are additive and idempotent. They must not delete or replace existing records. Real engine drafts remain private; a subject-preference migration cannot promote them.

## 3. Build a comprehensive, maintainable interest catalogue

Use the accompanying authored seed: 24 browse groups, 390 subject concepts, a small researched football-entity example and clearly labelled test entities. Validate/import it through a repository adapter; do not paste JSON straight into every Vue screen or assume proposed IDs equal existing database IDs.

The catalogue must cover the complete 24-group breadth and detailed branches in the companion. Keep expandable architecture, not a hardcoded four-level wizard. Add a reviewed import/mapping path for IPTC Media Topics (the maintained upstream news-subject vocabulary, CC BY 4.0); preserve attribution, original identifiers and mappings. The full upstream payload is not bundled. Fetch only official metadata when possible, save its exact revision/hash/licence and validate it offline. If unavailable, ship the complete authored seed with honest provenance, not a claimed full IPTC import. Never invent external code mappings. Store only verified matches.

Browser navigation groups can simplify the full taxonomy without deleting specificity. Avoid showing all 390 concepts or the upstream catalogue in one dropdown. Query/expand children lazily and search names/aliases with breadcrumbs. Retired concepts remain resolvable for saved preferences with a visible replacement choice. Keep a lookup indexed/bounded; do not recalculate the entire graph on each playback frame or keystroke.

Implement the exact real navigation example:
`Sports → Football (soccer) → Premier League → Manchester City — men’s first team`.

Use official metadata and dated/season-scoped participation relationships; no guessed club rosters, transfers, scores or logos. The supplied seed only verifies a focused named-entity example, not every club in the current league. The complete league directory is a metadata-expansion task: add it only from verifiable current official records, recording coverage and source; unavailable entries must not be fabricated. The account path above must work regardless.

Preserve the distinction between the club organisation, men's team, women's team and youth teams when such entities are available. Searching “Man City” should resolve or disambiguate these intentional targets, never follow every matching label automatically. Support club-wide following separately when backed by real entity relationships.

The browsing path is not the subscription rule. Following a team means material team reporting across competitions; it does not follow all Premier League teams, and it does not restrict the team to that league. Following a league means league-related reporting; it does not mean every unrelated article about all participating clubs. An explicit “only in this competition” scope may be offered, but must be visibly distinct and stored as an AND scope, not inferred from clicking through the path.

Places, language, format and story type are separate dimensions. Do not treat Clips/Radio as sports subtopics. Provide optional places with explicit selection, not geolocation or inferred nationality. Separate fictional test taxonomy branches visually from researched real organisations.

## 4. Show first-account interest selection and make it editable afterward

Integrate with the EXISTING email-link confirmation/session flow. Do not rebuild sign-in, introduce passwords or force the owner to create another demo account.

After a genuinely new account completes successful sign-in confirmation, route it to the interest setup page. A token-preview GET does not confirm sign-in, create a completed onboarding state or choose preferences. Preserve a validated same-origin return path, including a saved article/Clips intent, through confirmation and onboarding. Reject open redirects.

Design a short, optional flow:
1. **Choose your news:** familiar category tiles/chips with search; any number of valid interests, including none through Skip.
2. **Get specific:** optional drill-down to subjects, competitions, teams, companies/places where supported; show chosen items and breadcrumbs. “Follow all Football” is a distinct action from expanding Football.
3. **Review your edition:** a preview of the actual available relevant stories, a summary of follows/mutes, and Save/Continue. Explain empty coverage honestly.

Do not require every user to complete three screens when one selection plus Continue is sufficient. The interface can progressively disclose step 2, but all behaviours must work. Do not require a minimum number of topics. Include Back and Skip for now. Skipping keeps the editorial edition and persists a skipped status without a repeated mandatory modal.

State: not_started/in_progress/completed/skipped, plus a deliberate legacy-user treatment or equivalent. Returning members with old preferences keep their choices and see a dismissible setup invitation, not an interrupting forced re-onboarding. Do not mark everyone completed merely by migration. Interrupted new setup can resume, but anonymous article/source access must remain available.

Selections are account data only after explicit save. Mark pending/failure accurately and preserve the draft after 409/network/expiry errors. A failed save must not pretend success; allow retry or deliberate skip without losing the authenticated session. Do not repeatedly submit on expansion/focus. A zero-selection completion is valid when explicit.

Add a discoverable **Your interests** section in Preferences and My library/account navigation, plus Manage interests from the personalized Home. Use the same components and canonical state, not a second local-only copy. Support follows, explicit exclusions/mutes, search, removal and reset with clear consequences. Resetting interests does not delete bookmarks, queue, history, account or media settings. Persist across reload and real API restart; test two users and stale writes.

Real sports names in the taxonomy do not authorise fabricated reporting about them. In the current fictional news corpus, a Man City selection can honestly have no matching news. Demonstrate positive deep personalization with separately marked fictional teams/stories; demonstrate the exact real selection and its empty coverage too. Never mis-tag an unrelated local library story as Manchester City to make the preview look populated.

## 5. Use interests in feeds, not merely store them

Build one server-side relevance/explanation service used by Home, topic hubs and Clips. Reuse existing `homeMode` contracts: use the product's current enum and map labels rather than silently renaming stored values. Present a clear **Top stories / For you** switch; anonymous and skipped users get Top stories. Saving topics can set the user's chosen home mode when they explicitly confirm that behaviour.

Use the precise matching rules in the taxonomy companion:
- eligibility and current public/fixture projection first;
- explicit exclusions before personalized ranking;
- topic following includes genuine topic descendants;
- entity/competition matches use material article associations and typed rules, not transitive traversal of every relationship;
- duplicates collapse by canonical story where variants/formats share the same reporting;
- prefer specific explicit matches, then broader followed topics, with recency/editorial order as transparent tie-breakers;
- same inputs/revisions produce deterministic order and explanations.

Do not train a recommendation model, fetch a ranking API, infer sensitive attributes, or optimize for outrage/watch time. Explicit interests are private preferences, not political/health/religious identity labels. Passive history remains governed by the existing opt-in; interests must work with history disabled. No guest history is silently uploaded after login.

Provide **Why this story?** with factual reasons such as “You follow Football”, not fabricated confidence percentages. Add **Hide this story** and **Mute this topic/team** with a clear scope and undo. Hiding one story is not a global category mute. Make actions real and durable for signed-in users; give guests an explicitly session-local version where appropriate.

If there are too few matches, show “No new stories for these interests” and a clearly separated Explore/Top stories option. Do not silently broaden For you or include excluded subjects as supposedly personalized recommendations. A separately labelled general editorial section can be offered without changing stored interests. Sparse coverage is not a reason to invent stories, popularity scores or unread counts.

Do not use interest IDs or personal search terms in third-party analytics, share links, public pages or logs. Personalized API/SSR responses are request-scoped and private/no-store. Public caches and one member's edition tokens must never expose another member's follows or rankings.

## 6. Give Home a real rightward newspaper page turn

Implement this as pagination of the **headline spread below the masthead**, not rotation of the entire document, navbar, article body, footer or persistent media player. Preserve the accepted newspaper grid, lead-image hierarchy, typography, colors and first-story DOM order. The owner wants more headline pages, not an auto-advancing hero carousel.

Provide visible Next headlines on the right, Previous on the left and a clear page/edition indicator. Next visually turns the outgoing paper surface **toward the right** to reveal the next spread; Previous reverses it. Make the direction visually correct in the recording rather than inferring that a positive rotation angle guarantees it. A subtle paper edge/shadow and hinge are appropriate. No page-flap sound, wobble, decorative curl loop or repeated headline entrance effects.

Use existing Motion for Vue or small CSS/WAAPI transforms, not a flipbook/canvas/Three.js library. Normal transition target 360–460ms with controlled ease. Transform/opacity should do the animation work; do not animate the whole newspaper's width/height or force per-frame layout. A stationary next spread behind one outgoing leaf is sufficient. No screenshot rasterization, copied live video elements or hidden full-app clone.

Only one spread is the semantic interactive content. Any transition-only duplicate is inert/aria-hidden, has no duplicate IDs/forms/tab stops/players/listeners, and is removed on finish/cancel/navigation. Keep no more than current and next spread layers during a turn. Preserve text selection and link clicks on the active content. Inapplicable transform support gets a functional fallback.

### Pagination is a data contract, not just an animation

Use stable edition/snapshot identity, ordering and page information. An edition is a view over eligible article revisions at a known point, tied to applicable personalization version. Do not randomize cards each time or repeat the same headline on successive pages. Keep story grouping consistent across article formats.

Page URLs must support direct loading, reload, browser Back/Forward, new tabs and JavaScript-disabled anchor navigation. Signed/personal snapshot tokens must be opaque, bounded, account-scoped and re-authorized; never expose a raw user ID or private interest list. Public and personalized snapshots cannot share a cache accidentally. Bind tokens to their query/filter context and expiry. Use the actual repository's pagination shape rather than bolting on incompatible cursors.

Recheck current publication/permission/withdrawal eligibility on every page response. A frozen snapshot is not an access grant. Preserve slot identity with a safe unavailable state when an item is withdrawn; do not leak its old title or silently fill the hole with a duplicate from another page. Make “new edition available” explicit; do not reorder while someone reads. Snapshot expiry offers a clear refreshed edition, not the wrong page under an old URL.

Fetch/validate the target before committing the turn. Slow requests keep the present spread readable and show pending progress; failure offers retry without changing URL/page. Rapid input, reverse, resize, preference changes, route leave and browser Back must not strand an overlay or misalign content and URL. Never wait indefinitely for animationend; have an owned completion/cancel path. Do not globally lock the page or media controls while fetching.

Keyboard-operable real pagination links are mandatory; horizontal swipe within the headline region is optional enhancement. Do not hijack vertical page scroll or interfere with selecting text/controls. Keep focus logical: after explicit page navigation focus/announce the new headline-region heading, or preserve a pagination control where appropriate; browser Back should restore prior context without a surprise focus jump. Do not trap focus in a decorative leaf.

Reduced motion must remove the 3D turn and provide immediate or minimal-opacity content replacement. Add a discoverable page-turn motion preference using the existing motion model, with system reduced-motion taking precedence. This is not permission to disable all other animation globally.

Demonstrate at least three nonduplicated spreads in Top stories (default target six main story slots per spread; adapt editorial layout sensibly), including mixed image/text stories. Expand the existing original fictional demo corpus only as needed to at least 24 distinct stories across at least eight subject areas. Additive fixture catalogue changes are allowed, not bulk DB reseeding or release of the private engine outputs. Complete each new fixture's source/rights metadata and disclosure; do not fill the count with renamed copies.

## 7. Add Clips: an original vertical news format

Use **Clips** as the product label and `/clips` as the primary route (plus stable single-clip routes). It is the shorter name for the requested “Aggregates”. Do not use Briefs because brief articles already exist. This is a naming choice, not trademark/domain clearance.

A Clip is an original **30–120-second** narrated news highlight bound to an eligible article revision. It needs actual video/audio, intentional portrait composition, captions, source mapping and a full-story link. It is not a silent poster slideshow, a portrait crop of unreadable 16:9 presenters, an externally embedded TikTok, or an arbitrary 30-second cut that removes the qualifications from a longer report.

### Reader experience

Desktop: place a proportionate 9:16 viewer inside the current publication shell, with restrained story/source information alongside when space permits. Mobile: an immersive vertical feed using available viewport height and safe areas, a compact header, reachable controls and a clear exit. Do not remove all navigation or trap the reader. Adapt to 320px and text enlargement; expand information in a sheet/page instead of making captions microscopic.

Each item offers Play/Pause, seek/progress where feasible, mute/unmute, captions, duration, topic/status, headline, Save story, Read full story, Sources/transcript and a safe share link. Follow-topic and Hide/Not interested may reuse the relevance controls. No fake likes, views, trending rankings or comments. No mandatory account for playback, captions or sources. Saving/Following can carry a safe intent through sign-in/onboarding and return.

Use scroll-snap and intersection-based active-item selection with a keyboard alternative. Wheel, touch and PageUp/PageDown/previous-next controls must work without globally intercepting keys or hijacking scrolling in caption/source panels. At most one item plays. Use a bounded media pool/window (target current plus adjacent posters/metadata; at most three mounted video elements, at most one decoding/playing). Do not eagerly preload every video in the feed, retain offscreen decoded players indefinitely or mount the whole catalogue.

Do not use a browser's visible-intersection result as proof of a visible document. Pause Clips when document visibility actually becomes hidden; Radio's separate background contract stays unchanged. Keep the old unresolved physical-device limitation accurately recorded.

### Playback ownership and autoplay

Reuse/extend the existing single media-owner coordinator. Radio, full Newsroom and Clips must not play competing soundtracks. Merely opening a clip detail/source sheet must not restart another medium.

On first arrival, show a poster and explicit Start/Play when another medium is active or autoplay is unavailable. A deliberate play action transfers ownership and pauses Radio/Newsroom; do not steal audio just because a clip thumbnail becomes visible. Once Clips owns playback, the newly settled active item may play under the user's current session playback intent. Support muted playback where permitted and handle play() rejection. Never force audible autoplay or fake playback by animating a progress bar.

Preserve a user-paused state across incidental intersection changes; scrolling to a new item may follow the explicit browsing-play intent but do not restart the same paused item. Define the state machine in code/tests, including manual pause, active-item change, seek, source sheet, buffering, unmount and stale media. Do not unmute on hard reload solely because a stored value says the prior session was audible.

No auto-loop by default and no unrequested timed advance to the next clip. At the end show replay/next/full story. A finite feed displays an honest end-of-edition state with refresh/change interests options. Do not make infinite repeat of the same six clips look like new content. Keep direct URLs and browser Back restoration predictable; use replaceState appropriately during incidental scrolling rather than polluting history on every intersection change.

## 8. Produce real portrait media and use the existing secure delivery pipeline

Extend existing programme contracts/renderer/importer with a short-video format. Reuse local Kokoro/FFmpeg/original artwork, versioned scripts, programme eligibility, captions and source-map conventions. Do not create a parallel public asset directory, generation HTTP endpoint, unbounded background service or new external video dependency.

Proposed initial output: 720×1280, actual 30fps, H.264/yuv420p with AAC, fast-start MP4, measured duration within 30–120 seconds. Store immutable video/poster/VTT/transcript/source-map/render metadata with exact code/input hashes. Validate actual decoded duration; test just-below-minimum and just-above-maximum rejection. A frame-duration rounding tolerance must not permit a 121-second clip.

Create at least six distinct watchable clips across at least four eligible fictional stories and three topic areas. Include roughly short (30–45s), medium (50–80s) and long (100–120s) examples. These are target bands, not permission to pad silence or repeat words to hit a duration. Use multiple angles of a story only when independently useful; do not count trivial duplicates as six clips.

Compose explicitly for portrait: a concise opening, clear headline/context, two or three meaningful evidence/visual beats, necessary uncertainty, and a calm full-story/source close. Use presenters only when they improve the piece; an original evidence-led graphic sequence with clear narration is also valid. Preserve full document/figure context and focal points. Do not stretch wide studio frames, crop off faces, cover important evidence with social controls, or fill the whole clip with a static title over audio.

Captions default visible, readable on a narrow screen and manually toggleable. Use actual sentence/segment timing from generation; do not claim word alignment if estimated. Keep a screen-reader-accessible transcript with material visual descriptions and meaningful sound cues. Burned-in text must not create doubled captions; prefer separate timed captions where the player supports them, with suitable native/fullscreen fallback. Do not rely solely on tiny names burnt into a bottom corner for attribution.

Before expanding all six, render and inspect one 30–60s portrait pilot at desktop and mobile. Repair layout/narrative defects, then complete the catalogue without asking for another prompt. Agent pilot inspection is not owner approval or subjective listening. Reuse unchanged valid assets; do not re-render all 17 old programmes. Use one bounded render process at a time with watchdogs, owned cleanup and E: scratch limits.

A ready Clip requires current eligible article and source/use permissions, completed render validation, poster, captions/transcript and exact source associations. Every clip part retains the source/claim relationships it depends on; exact article/video URLs and timestamps where supported are present on the full Sources surface. Keep the article's full bibliography unchanged. A quote used as an allegation stays attributed, not converted into a headline assertion.

At `/clips/:id`, render headline, status, transcript/summary and complete clip-used source entries in initial HTML below the media, with links to the full article and its full bibliography. The immersive feed can open the same information in a sheet, but the dedicated permalink must expose it without a login and without relying on JavaScript. Default stack/links remain usable if the immersive interaction cannot load.

Revalidate current rights/withdrawal at catalogue, metadata and every protected asset/range request, including posters/captions. Preserve bounded streaming/integrity-cache improvements; a cached digest is not permission. Removing an article or permission makes affected clips unavailable, including saved entries and snapshotted feeds. Already downloaded bytes cannot be recalled; never claim otherwise. Corrected article revisions require a new/revalidated rendition, not a silent source-map swap under the old hash.

## 9. Complete the cross-format and member journeys

Add discoverable Clips navigation without crowding the newspaper masthead or replacing core desks. Article pages expose only formats actually available for the current story/revision: Read, Listen, Watch, Clips. Radio/full Newsroom/catalogue/Library may offer related available clips using the same safe projection.

Never send a story with no clip to an unrelated default clip. Keep unavailable combinations honest. Preserve existing section-aware Read↔Listen↔Watch handoffs. Clips have their own short script/timeline: map an article section/claim when supported, not raw seconds from a full programme. Back from an article/source to Clips should retain clip ID and safe position/paused intent without replaying over Radio.

Save story reuses article bookmarks; do not duplicate bookmarks merely because a user discovered the same story in a clip. A clips-only saved-filter derives from current format availability. Separate clip progress from full-programme progress by exact rendition; persist it only under existing history consent. Clear history clears all relevant progress, not follows/bookmarks unless explicitly requested. Guest progress/follows do not silently upload after sign-in.

Build one availability resolver and one media-owner path across formats. Maintain account preferences and programme preferences as separate concerns with shared durable concurrency rules. Theme, text size, reduced motion and autoplay policy propagate without reloading media or changing the currently selected topic unexpectedly.

## 10. Add only the small improvements that make these features coherent

These additions are part of this run because they close the new journeys rather than introduce unrelated products:

**Your interests hubs.** Each followed topic/team resolves to a real page with canonical name, breadcrumb/relationships, Follow state, current eligible stories and available formats. Empty coverage has a clear explanation. Source names are not endorsement scores. Do not add an unverified logo.

**Why this story and control of the feed.** Implement the explanation, hide/mute and undo described above on Home and Clips. Keep it small; no profile analytics dashboard, external trackers or artificial engagement metrics.

**Edition/caught-up state.** Identify the current edition and its cutoff, show a finite end to its pages/clips, and offer Refresh or Explore. Do not say “You have read everything” unless the user explicitly enabled history and the evidence supports it; “End of this edition” does not require tracking.

**Correction and provenance visibility.** Carry existing correction/withdrawal/version states across article, clips and saved items. Add a straightforward Methodology/Source directory link from the reading/source experience, using current actual fixture/governance descriptions. Never claim real editorial verification, live sources or scoring that does not exist. Close any existing broken source/profile links through truthful empty/detail states.

After these are implemented, inspect remaining reader-facing launch requirements in the original PRD/App Flow/traceability and finish small safe gaps reachable under this scope: real navigation, expected loading/empty/error/retry states, print/article links, form confirmation, source/history discoverability. Do not add comments, messaging, ads, notifications, billing, live sports odds, native mobile apps, offline media caching or another feature family. Do not turn “complete most of the product” into an unlimited backlog or a hidden relaxation of source/publication controls.

## 11. Preserve performance while integrating new features

Do not reopen the failed three-candidate CPU4 optimization campaign or replace Reka/Vue. Fix the icon and new concrete regressions. Preserve the exact-hash guarded AutoAnimate lifecycle patch and verify it still applies in clean installation. Do not run overlapping AutoAnimate/Motion transforms on the same element. Pretext stays targeted; no full article/caption renderer based on manual positioned lines.

At runtime keep:
- one persistent root audio element;
- one active media owner and at most one playing clip/video;
- bounded feed DOM/player/data windows and bounded edition cache;
- no all-taxonomy render in a dropdown;
- observer/callback/TextTrack/portal cleanup on unmount;
- no per-frame account writes, full deep-watched graph or page rerender from video currentTime;
- only current/next headline surfaces during a turn;
- stale fetch/request/selection results ignored safely.

Run the existing reference workloads under their original documented conditions and new matched workloads with the actual expanded catalogue. Separate functional checks, callback proxies, painted smoothness, decoded/dropped video frames, CPU-throttled diagnostics and subjective judgements. Keep original thresholds; define any new workload budget before changing its code. Do not claim CPU4 or physical mobile is fixed because unthrottled desktop passes.

Measure 20+ journeys across Home pages, interests, Clips, full articles, Radio and Newsroom. Inspect resource counts after warm-up for abandoned players, text tracks, observers, listeners and overlays. Exercise long topic lists and successive feed windows. Watch a real active clip while opening its source sheet, changing interests, seeking and leaving the route; offscreen suppression and hidden-tab behaviour are not the same as visible video drops.

Retest after the final code and catalogue changes, not only before expansion. Use recordings separately from lightweight measurements. Missing subjective listening, physical device or genuine hidden-tab results remain NOT RUN/UNVERIFIED; do not keep rerunning a visibility setup known to report visible.

## 12. Verify the complete product and leave a usable result

Use the companion acceptance matrix as a checklist, not as expected-output fixtures embedded in production code. Unit contracts, real API/database operations and actual browser interactions are all necessary. Add machine-readable results with exact source/build/catalogue identities and commands. Do not weaken tests to fit new behaviour or label a failed suite passed after deleting its assertion.

Essential journeys:
1. New captured-mail account → explicit confirmation → interest selection → saved personalized Home → restart API → same interests and existing member data.
2. Skip setup → Top stories; later edit interests; existing member is not trapped in onboarding.
3. Sports/Football/Premier League/Man City selection resolves correct entity, does not subscribe to sibling teams and shows honest coverage. Positive personalized ranking is separately tested with fictional deep entities and two different users.
4. Home page 1→2→3 with actual rightward paper turn, no duplicate main stories; open an article; Back restores edition/page; slow/error/expired snapshot/corrected/withdrawn content stays safe.
5. Six real Clips with valid durations, captions, evidence links and full story; scroll/keyboard/next selects one active player; rejection/mute/pause/end states work.
6. Radio → Clips → article → full Newsroom → Radio without overlapping sound, abandoned players or unexpected auto-resume.
7. Change interests, hide/mute, undo, clear only interests or only history, and verify the specified durable records remain independent.
8. Anonymous and no-JavaScript article/source/clip-detail/pagination access remains available; private engine drafts, raw evidence and staff actions remain unavailable.

Run relevant migrations on disposable/clone targets, ownership and concurrency tests, existing sign-in/member/reader/control/media regression suites, lint/typecheck/tests/build/worker, secret scan and licence audit. Re-audit changed dependencies and label unchanged historical findings accurately. Native Figma edits are attempted only through actual write-capable tooling; otherwise leave an editable handoff and screenshots and keep Figma pending. Figma disconnection does not stop browser work.

Use matched installed browser engines; do not download/upgrade an unrelated global browser to force a result. Report WebKit/codec, mobile, screen-reader and physical audio limitations separately. Never store session tokens, confirmation links, member exports or sensitive preferences in public review assets.

Leave the exact existing local demo supervisor running only after successful build and owned restart. Do not require the owner to infer a dozen render commands. Add a verified single new-feature test runner and a concise morning walkthrough; continue using the existing startup where possible.

Deliver:
- one current completion matrix: owner feature → implemented behaviour → verified evidence → exact remaining gate;
- working routes for Home pages, first-account setup, Your interests, followed-topic hub, Clips feed/detail and existing media;
- actual chevron before/after crops across contexts;
- an uncut page-turn/interest/clip navigation recording and at least one playable portrait sample, plus all six rendition paths;
- exact catalogue counts/coverage, external metadata revision/licence/mappings and unmapped/retired conditions;
- migration/backup/restore/retained-integrity evidence without exposing member data;
- one short optional Brag showcase only after the product and verification are complete; do not let it consume time needed for actual features;
- truthful audit/security/real-source/staff/publishing/Figma/device limitations and no invented percentage of production readiness.

The minimum outcome is the complete requested reader feature set, not just a scaffold. Preserve a resumable canonical plan if an actual environment/session limit stops execution. Do not declare completion when Clips are posters, preferences are local-only, Home flips the same content, the icon is still wrong in another shared selector, or source rights were bypassed.

**START NOW:** inspect the current repo and target profiles, reproduce/fix the actual chevron, establish the migration plan and taxonomy contracts, then execute every unblocked milestone through the final integrated browser demonstration.
