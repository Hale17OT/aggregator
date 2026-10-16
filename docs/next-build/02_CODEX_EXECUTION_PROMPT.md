# The Aggregator — ten-increment local product build

**Research snapshot:** 13 October 2026. **Instruction type:** execute, not plan-only. **Starting point:** the actual repository after the latest WP04 task; do not assume the last requested PostgreSQL integration has finished. Read `01_RESEARCH_AND_DECISIONS.md` and `03_ACCEPTANCE_MATRIX.md` alongside this instruction.

## Owner brief and authorization

Continue The Aggregator. I want a substantially more complete, usable local product when I next review it. Work through the ten increments below during this run without stopping for approval after every increment. Produce running features, not another series of plans or screenshots of nonfunctional controls.

Retain the accepted newspaper identity: centered blackletter masthead; warm paper/forest and deliberate dark theme; Newsreader/Manrope hierarchy; newspaper Home composition; article name, headline, then impactful relevant image; inline media; complete bottom bibliography; custom tactile controls. Buttons are accepted sufficiently to continue. Do not reopen their review or packaging task.

Add these reader experiences:

- **Radio:** article and edition narration, background listening where the platform permits it, presented in an original tabletop-radio interface inspired by the craft and physical interaction of `https://www.dqnamo.com/experiments/cassette-player`. Build a radio, not a cassette player.
- **Newsroom:** a reader-facing, on-demand news programme with a selectable one- or two-anchor format. Presenters explain the article while the programme shows relevant images, documentary figures and permitted video. Support narration over eligible footage and clip-then-commentary sequencing.
- **Membership:** self-service account creation/sign-in and a member area for saved stories, listening queue, progress and preferences. Use neutral labels such as Sign in, Create account, Member, My library and Preferences. Do not introduce billing, payment processors, checkout, plan comparisons, pricing labels, tier identifiers, upgrade prompts, trial clocks, or pricing-related flags/comments. Do not construct a subscription model for this increment.

The reader-facing Newsroom is distinct from the private editorial workspace already described in the specifications. Preserve existing staff route IDs and contracts. Use `broadcast` in new internal names and an unambiguous public `/newsroom` route; refer to the staff interface as Editorial desk in new copy only after checking existing navigation. Do not rename staff resources casually.

This message supersedes the earlier instruction to stop after one bounded checkpoint, and the earlier restriction against implementing a reader sign-in interface. It authorizes the ten local increments, local reader email-token authentication against a captured mailbox, reviewed workspace-local dependencies/model assets, and relevant edits in the existing dedicated Aggregator Figma file. It does not authorize elevated installation, changing system services, remote pushes, commits, deleting unrelated files, deploying, live publication, real-news ingestion, real email delivery, creating paid accounts, or consuming provider credits. Finding an API key is not permission to use it.

Existing source-use, evidence, editorial-review, security and release gates remain binding. Use clearly fictional content and original/permitted assets. Real operation is still subject to WP01 and later release decisions. Never expose a route that impersonates an arbitrary account, and never let reader registration grant staff privileges.

## Definition of a successful morning review

The owner should be able to start the local stack with one documented command, open a populated fictional newspaper, search and open stories, listen to a real narrated edition while navigating within the app, watch a genuine animated one-/two-anchor programme with timed media, create/sign into a member account via the local captured mailbox, save a story, change playback/presenter preferences, and find the changes after an API restart.

Without an explicitly authorized avatar service, the delivered presenters are **original animated presenters**, not a claim of photorealistic human video. Produce a complete animated programme rather than two static portraits over unrelated audio. Preserve the provider boundary for rendered presenters. A unavailable premium-quality rendering path must not stop the local version. Do not claim either rendering quality or external integration was verified when it was not.

If an essential function does not work, label it PARTIAL or BLOCKED and explain exactly why. Do not substitute a decorative UI and call the feature complete.

## Execution rules

1. Inspect the workspace and Git state before changing anything. Preserve unrelated work. Resolve `docs/specs/` versus `specs/` from actual files. Read AGENTS.md, current status, newest identity/database checkpoints, relevant PRD/TRD/flows/schema/backlog, and this addendum. Older reports are historical; requested work is not proof of implementation.
2. Preserve original specification and Word files. Make an additive `docs/product/RADIO_NEWSROOM_MEMBERSHIP_ADDENDUM.md`, assigning new IDs without colliding with the existing F/SC/FL/WP registry. Map these increments to existing packages. The new reader broadcast mode is added scope, not proof that the old newsroom/publication backlog is complete.
3. Maintain `docs/execution/OVERNIGHT_PLAN.md` with the ten milestones, acceptance conditions, evidence, decisions, blockers and current next action. Merge a concise pointer into AGENTS.md. Keep this a working execution record, not a rewritten implementation plan.
4. Start implementing after orientation. Do not consume the run auditing unchanged infrastructure or producing exhaustive alternate designs. Complete a thin end-to-end experience, then fill its states. After two attempts at the same environment/tool problem without new evidence, record it and advance independent work. Never bypass a security or correctness failure to claim completion.
5. Run focused checks after each change; repair regressions before integrating. Run the full existing suite at integration checkpoints and at the end. Keep old unresolved audit findings visible, but do not repeatedly rediscover the same report unless dependencies changed or a compatible fix is available. A blocked release gate does not prevent safe local fixture development.
6. Use available parallel agents only for bounded disjoint work. One integrator owns schema/contracts and migration ordering. Do not have several agents overwrite the same files, launch competing migrations, or create separate design systems.
7. Record missing credentials, approval or Figma capability in `docs/execution/OWNER_ACTIONS.md`. Do not keep asking me to approve routine local steps. Continue independent authorized work. Never bypass a tool permission prompt. The final report should list precisely what needs me.
8. Keep all servers loopback-only and supervised by the project scripts. No provider/network calls in ordinary demo playback. Development downloads require reviewed licenses and trusted origins; pin revisions and record hashes. Keep large model weights out of source control and the client bundle. Do not install unrelated software or change machine-wide security settings.
9. Use Vue 3/Nuxt + TypeScript, Express, the existing worker and PostgreSQL. Do not introduce React, Next.js, Remotion, a new UI framework, a second identity system or a large 3D engine for this task. Use existing Motion for Vue only for useful transitions; do not double-animate with AutoAnimate. Pretext remains a measured optional enhancement, not a media clock or article renderer.
10. At intermediate checkpoints continue to the next unblocked increment. At the final checkpoint stop with actual results and a reproducible walkthrough. No promise of future work after the session has ended.

## Increment 1 — finish or verify durable sessions and member repositories

Inspect whether the previously requested PostgreSQL-backed `IdentityRepository` and `MemberRepository` task is already present. Run its focused verification and reuse it when verified. Do not repeat or overwrite completed work.

If unfinished, complete the narrow durable member/session path before relying on it for member features. Preserve ordered migrations; add the next unused migration number only for missing fields. Keep opaque bearer verifiers, durable CSRF state, account/session versioning, current assurance classification, expiry, revocation, strict preference patches and bookmark semantics.

Use the established verified disposable PostgreSQL 18 harness for tests. Runtime roles must be genuine non-owner roles without BYPASSRLS, broad private-table access or publication privileges. The trusted session lookup boundary cannot depend on an identity supplied by the browser. Set transaction-local member identity only after server verification and use the same checked-out connection for the entire transaction. Preserve authorization revalidation, role-change invalidation and failure propagation.

Verify an API process restart against the same database without reseeding, two API instances, pool-size-one A/B isolation after commit/rollback, conflicting preference writes, duplicate bookmark saves, revocation visibility and no fallback to memory when PostgreSQL fails.

Add a separate **retained local-demo database profile** for the morning product demonstration. It must be created by a verified workspace harness, bound to loopback, use restricted runtime credentials and survive normal stop/start. Test clusters remain disposable. The first-start seed must be explicit and idempotent; subsequent startup must not erase accounts, preferences or progress. Never auto-adopt an ambient DATABASE_URL or existing unknown database. An explicit reset must verify ownership and require a deliberate separate command.

**Exit:** member/session storage genuinely survives restart; isolated test targets are cleaned up, while an explicitly identified retained demo target can be stopped and restarted without reseeding. If blocked, continue public UI/media work but keep durable membership incomplete; do not silently use memory and relabel it.

## Increment 2 — establish the new experience contracts and native design slice

Inspect the current Figma file, tokens and components. Create a recoverable new section for Radio, reader Newsroom and Membership. Do not alter historical accepted frames. Work natively with Auto Layout, variants and semantic variables where editing is supported. A Figma outage does not block code; document an unexecuted design task rather than claiming frames exist.

Create representative 1440, 834 and 390 layouts, light and dark, and validate 320 reflow. Keep additions consistent with the existing article/masthead rather than replacing them.

**Radio art direction:** an original compact tabletop receiver: forest enamel face, warm-paper station display, fine speaker grille, restrained amber tuning indicator, tactile transport keys, and a volume control. Use existing control geometry. The radio should look crafted and functional, not like a giant retro prop occupying the entire page. No cassette reels, gratuitous wear, fake frequencies, decorative nonfunctional knobs, autoplay static, loud switch sounds or brand imitation. A stylized dial selects actual edition/topic presets; a native select/list alternative exposes the same choices. A flat global mini-player carries the same visual identity without shrinking the entire radio illustration.

**Newsroom art direction:** a restrained contemporary studio in the publication palette, with real presenter figures, a desk, clear active-speaker composition, a large media area, legible lower-third, source credit, caption region and transport bar. Build solo, duo, figure-with-presenter and full-media layouts. No fake LIVE badge, running market ticker, unrelated charts, holographic dashboards or fabricated human bylines. Label the programme as generated presentation of a specific edition/version.

**Member design:** compact centered sign-in/create-account/check-email/confirm/expired-link forms; My library with saved items and queue; Preferences with reader, Radio and presenter settings. No marketing pricing cards, account upsell or billing screens. Reuse existing form and button primitives.

Add distinct `Read`, `Radio` and `Newsroom` reader navigation without disturbing the centered masthead. On an eligible article, provide `Listen` and `Watch briefing` actions that open the corresponding prebuilt edition. Do not show a ready action for missing/failed media; show an honest status or omit the action where clearer.

**Exit:** one coherent native design slice where possible, corresponding component contracts, a route map, and additive requirement IDs. Do not require owner design sign-off between the subsequent local implementation increments; mark new aesthetics awaiting later review.

## Increment 3 — make the newspaper feel like a usable product

Complete the bounded reader gaps required for a convincing demo: topic pages, search, restorable filters/pagination, source/evidence inspection, safe history/correction presentation, and working navigation. Respect existing route conventions and feature IDs rather than duplicating implemented services.

Create at least **12 distinct clearly fictional articles across three existing or explicitly added desks**, with realistic varied titles and text lengths. At least three must support the media demonstration; others may be shorter dispatches. Build upon the existing fictional town/publisher world. Do not fabricate reporting by actual news brands. Every story has its own slug, public projection, version, source entries and image decision, not twelve cards pointing to one article. Existing threshold/origin rules apply to every item presented as eligible synthesized content.

Use the existing database schema for a minimal seeded public article index when feasible. Populate it through trusted local fixtures only, not a new publishing endpoint. Search only safe published projections, parameterize input, cap query length/page size and use stable pagination. Unavailable/withdrawn items cannot survive as search snippets, counts that expose restricted data, or related-story excerpts. Do not claim real ingestion or ranking is implemented.

Keep full article text and bibliography in SSR without JavaScript. Reader navigation can use progressive Nuxt client routing with real hrefs so global playback survives in-app navigation. Direct URLs and no-JavaScript navigation must still work. Ordinary full reloads are allowed to interrupt playback; provide resume rather than promise uninterrupted audio across a replaced document.

Complete an evidence panel with correct focus management only where it adds value; retain direct source/claim anchors and a no-JavaScript inline fallback. Keep corrected/unavailable examples honest and preserve original exact-source links. Anonymous content must not acquire a membership gate.

**Exit:** Home → topic/search → distinct article → evidence/source → back navigation is real and coherent, with empty/error/withdrawn states and enough content to exercise listening queues.

## Increment 4 — implement one version-bound media programme pipeline

Radio and Newsroom are presentations of the same vetted article, not independent news-writing agents. Build a small reusable programme contract and worker path. Reuse existing asset/job tables where suitable; add narrowly scoped migrations where absent. Do not regenerate the entire 54-table model or attempt the complete live publishing system.

A programme belongs to a specific article version or immutable ordered edition manifest. Model at least:

- `programmeId`, kind, status, schemaVersion, language, scriptDigest and article/evidence/rights revision references.
- Explicit variants: Radio full/brief; Newsroom solo/duo; clip treatment only where implemented. IDs must distinguish materially different scripts/timelines.
- `segments`: stable ID, article/version/block/claim/citation references, speaker ID or none, exact spoken text, display text, segment role, and validated media cues.
- `assets`: internal storage key, type/MIME, content hash, dimensions or sample rate, measured duration, permissions/provenance, availability and generation engine/voice/model revision.
- Final timing derived from generated/decoded audio: start/end milliseconds, speaker spans, subtitle cues, image/video cut points and media source offsets.
- Credit/source entries derived from the same version-wide bibliography, with all programme-used sources visible at the bottom.
- `renditionKey`: a canonical hash of content/version, script, language, narration/anchor mode, voice/model revision, clip treatment, asset hashes and rights digest. Store the actual result as well as the recipe; do not assume a model seed guarantees identical bytes.

Treat uploaded and source text as data, not instructions. Only IDs from the vetted manifest can resolve to media or citations. No model may fetch arbitrary URLs, run tools, grant rights, publish, or invent source entries. For this local run, deterministic fixture scripts based on explicit article sections are preferable to an unapproved remote model.

**Script rules:** Radio full reads the substantive article with spoken publisher attribution where needed; brief is explicitly a shorter edition and preserves key qualifiers. Newsroom uses a separately authored script for solo and duo. The second anchor adds context or evidence, not filler, false balance or invented opinions. Preserve dates, names, numbers, uncertainty, allegations and attribution. Visual-only facts need narration or descriptive transcript context. Never use a synthetic voice to impersonate a quoted real speaker.

Implement bounded worker states such as queued, rendering, validating, ready, failed, stale and withdrawn using existing naming conventions. Use claim/lease/idempotency handling so two workers cannot create duplicate logical renditions; tolerate retries without duplicate visible jobs. Persist state, hashes, error categories and generated files across restart. Atomically make a rendition ready only after validation and a fresh source/version/rights check. An earlier ready result must never be served as if it covers a newer article version.

Generation is a trusted local worker/bootstrap action, not an anonymous public endpoint that accepts arbitrary text or triggers spending. Public GETs read existing eligible renditions. Add no billing business model.

Generated media files requiring withdrawal must not be placed behind permanently open static URLs. Serve them by internal asset ID through an eligibility-checked local endpoint, with safe MIME, path traversal protection, bounded range requests and compatible seeking. Use an explicit revalidation/no-store policy for revocable demo media. Stop new requests for withdrawn assets; invalidate queued editions, manifests and source projections. Do not claim bytes already downloaded can be recalled. On eligibility/rights validation failure, fail closed; never use stale positive permission indefinitely.

**Exit:** a reproducible command creates a persisted immutable programme from fictional eligible article versions, detects missing rights and bad citations, and cannot make incomplete or stale output ready.

## Increment 5 — generate real narration and timed speech assets

Use `01_RESEARCH_AND_DECISIONS.md` for the provider rationale. The default run uses local speech generation, not a paid API.

First preference: reviewed `kokoro-js` with the official Kokoro/ONNX model path documented by its maintainers, using Node CPU in the existing worker or a bounded subprocess. Pin the resolved package/model/voice revisions and record individual license/provenance. Use the available CPU path rather than requiring a GPU or fetching large new machine-learning stacks blindly. Keep inference out of the SSR server and away from the client critical path.

Start by generating and decoding a 10–20 second sample. Confirm an actual WAV is emitted, not just a resolved promise. Then generate bounded paragraphs/turns and assemble a complete story/edition audio file. Preserve a reproducible build command and a manifest of input text to output files.

Suggested local resource limits: one generation worker, a reviewed capped download budget of 1.5 GB total new model/tool assets, explicit per-job timeout, bounded retries, and no admin installation. Refuse unexpectedly larger assets rather than fetching arbitrary models. Model downloads come from allowlisted canonical origins; application content is not sent to a cloud speech service. Do not fetch models again on every startup.

Select two distinguishable neutral English voices after examining available licensed voices; use the same stable selection across articles. Public presenter names are original fictional identities, not the name of a real anchor. Do not promise an accent or voice that was not generated. Keep voice/speaking-rate choices bounded to prepared supported renditions; speed controls may use media playback rate without regenerating content.

Produce at least:

- Three individually playable article narrations.
- One continuous **4–6 minute Radio edition** assembled from those stories with measured chapter boundaries and spoken transitions. Shorten content only honestly; never pad with silence to hit a duration.
- One **90–180 second Newsroom solo programme** and a separate **90–180 second duo programme** covering the same central story, including relevant source attribution.

These are target lengths for a useful demo, not hardcoded claimed metadata. Report actual durations. Tune generated text to fit without changing factual meaning.

Measure sample counts and actual decoded duration. Obtain caption timing from provider alignment or from independently synthesized sentence/turn boundaries; do not divide total time evenly and call it word-level alignment. Use accurate sentence/turn captions if precise word alignment is unavailable. Track intentional silence separately. Validate no empty audio, gross truncation, clipping or unintended long gaps. Report automated audio-quality checks as automated; do not claim a human listening review unless performed.

Generate real mouth-cue timing for local animated anchors using a reviewed workspace-local Rhubarb Lip Sync release (Windows supported), the exact speech WAV and matching dialogue file, with bounded thread count. Map its mouth-shape timeline to the presenter art. This is estimated 2D lip animation, not photorealistic lip synchronization. If that tool is blocked, use time-bound audio-derived mouth activity only as a declared degraded mode; never run a continuously looping talking animation through silence and call it verified lip sync.

Prefer existing encoding tooling; a WAV rendition plus proper HTTP seeking is an acceptable local first implementation. Do not turn missing ffmpeg into a global blocker. Any added encoder must be reviewed and locally scoped. No browser download of giant model weights just to press Play.

**Provider extension:** define a small speech provider interface and a presenter-renderer interface. Reference OpenAI speech, ElevenLabs dialogue-with-timestamps, and HeyGen audio-driven avatar rendering in documentation. Implement at most one useful disabled hosted adapter per boundary after local acceptance, not three half-finished integrations. Hosted execution requires separate explicit authorization, scoped credentials, approved assets, retention policy and a spend cap. Zero unauthorized calls is the default. A discovered key never enables a provider automatically.

If local file generation genuinely fails, keep the media work unblocked with owned/permitted existing spoken assets if available. Browser speech may be an explicitly labelled limited-preview fallback with local voices selected deliberately; it does not satisfy the real-media/background/audio-file acceptance gate. Never ship empty audio, beep tracks, system tones or nonfunctional play buttons as news narration.

**Exit:** actual playable and seekable speech files, provenance, measured durations, sentence/turn captions and mouth cues exist for the required demo paths.

## Increment 6 — build Radio and the persistent listening experience

Implement `/radio` with the original radio component and a global `AppAudioHost` or equivalent mounted outside keyed page components. One controller owns the active audio element, queue, position, intent and media-session metadata. Components subscribe to it rather than creating their own players.

Required working controls: explicit Play/Pause; previous/next chapter or story; rewind/forward 15 seconds; elapsed/remaining time; seek; supported speed choices (for example 0.75, 1, 1.25, 1.5); volume/mute where the platform permits; edition/topic selection; queue add/remove/reorder with accessible non-drag controls; expandable transcript/source list; and sleep timer (off, 15, 30, 60 minutes, end of story). If a platform controls volume externally, show an appropriate state rather than a falsely working knob.

The tuning control selects real available presets, never random unseen content. A needle/level meter may use genuine precomputed audio-energy samples or explicit playback state; it stops when paused and is not claimed as live frequency data. Decorative motion is reduced or removed for reduced-motion users. Native button/range/select semantics are mandatory under custom visuals.

Keep playback running through in-app Home/article/topic navigation by keeping the audio host mounted and progressively enhancing existing href navigation. Switching Standard/Brief or theme must not accidentally create two players or reset the current track. Hard reload, browser termination and OS suspension are not seamless-continuity guarantees. Persist safe position and offer Resume after those events; never resume audibly without permitted user intent.

Integrate Media Session with feature detection and individually guarded action handlers for play/pause/seek/track controls. Set correct title, edition, source art and measured duration/position. Remove stale actions when changing modes. Handle a rejected play() promise and display Tap to play rather than a playing state with no sound. Do not rely on autoplay.

For background reliability, use the full pre-rendered edition as a continuous media resource with chapters rather than scheduling the next sentence using JavaScript timers. The media clock is authoritative. Use timeupdate/seek/ended/waiting/ratechange events; rendering animation frames only decorate visible UI. Timers may be throttled in background tabs. Sleep timing must use an absolute deadline and recheck during media events/resume; describe any platform limit honestly rather than claim exact stopping while a process is suspended.

Only one sound-producing mode may own playback. Starting Newsroom pauses Radio; starting Radio stops other programme narration. An explicit foreground clip in an article pauses programme speech. Coordinate multiple app tabs on a best-effort basis using a small browser mechanism such as BroadcastChannel, without pretending it provides cross-device exclusivity. No hidden YouTube player, service-worker audio engine, wake-lock workaround or audio-extraction behavior.

Guest queues/progress are local and anonymous with clear-history support and a storage-disabled fallback. Account synchronization arrives in increment 9; do not store session credentials in browser storage. Do not import guest listening history into an account without a clear choice. The global mini-player must not cover bibliography controls, focus targets or mobile safe areas.

**Exit:** start the edition, navigate to two different articles, seek/change speed, pause/resume, inspect sources, and return to Radio without restarting it or producing double audio. Verify background desktop playback and record untested mobile lock-screen behavior separately.

## Increment 7 — build the one-/two-anchor reader Newsroom

Implement `/newsroom` and programme-specific navigation using the common programme contract. This is an on-demand programme, not a real-time chat agent or a private editorial tool.

The user can choose one or two anchors before playing. Persist the preference later. Implement separate ready scripts/audio/timelines for solo and duo; changing a label or hiding the second face is not mode support. Switching mode during playback pauses the current rendition and starts the chosen mode at its corresponding story boundary after a clear action. Do not reuse an incompatible timestamp as though the two timelines were identical.

**Original animated presenters:** create two carefully drawn original presenter figures with full head/shoulders/torso, distinct silhouettes, coherent expression/wardrobe, and a polished studio composition. Use SVG/layered art and validated mouth poses; no basic avatar circles, emoji, unrelated stock photographs, random bobbing, or a waveform substituted for a presenter. The speaker's mouth follows the actual speech timeline, closes on silence/pause, and the other anchor remains in a believable listening pose. Restrained eye/blink or posture motion is optional and subordinate to reduced motion. Credits and UI state explicitly identify synthetic presentation.

Do not fetch/clone a real anchor's likeness or voice. With no authorized hosted renderer, do not label the result photorealistic or a completed live-avatar integration. A high-quality still plus no lip movement is a fallback, not the successful anchor deliverable.

**Broadcast direction:** opening solo/two-shot, active-anchor close-up, figure/image with presenter inset, full relevant footage, and closing source recap. Choose shots based on segment meaning. Use a restrained lower third for topic/headline and separate creator/source credit. Do not cover evidence, publisher marks, captions or player controls. Keep all key information readable on mobile; prefer changing composition over shrinking a desktop studio into illegible pixels. On narrow screens the media can occupy its own full-width region with compact presenters and captions below.

**Two media treatments:**

1. `narration_over_visual`: only original or independently licensed media whose grant permits the display/edit/audio treatment. Use muted illustrative B-roll or approved low ambience and a clear narration track. Visually identify illustration versus evidence. Do not talk over another intelligible speaker by default.
2. `clip_then_comment`: introduce the clip, stop anchor speech, play its original permitted audio with captions, then resume commentary. The transcript must identify the clip speaker/context and distinguish it from the synthetic anchor.

For owned/permitted local fixtures, prefer a canonical programme audio track with the clip's authorized sound mixed at measured timeline positions; the matching local video element is muted to avoid double audio. Encode the chosen treatment in the variant key. Derive visual currentTime from programme time minus the cue offset, handle seek/buffering/ended explicitly, and define whether a stalled essential clip pauses the programme or transitions to an announced accessible fallback.

YouTube is a separate foreground provider case. Do not download clips, strip audio, dub narration over a YouTube API video, cover branding/controls or use it in background Radio. A future compliant iframe segment uses its intact visible player with separate explicit activation where required, pauses programme narration, and resumes only after a verified end/continue action. Do not include YouTube footage in the locally assembled soundtrack or exported video. For this run use original local clips so the complete programme plays without third-party dependencies. Include at least one clip with meaningful spoken content or meaningful natural sound plus an accurate caption track; a silent animation alone does not demonstrate clip-audio handoff. A fixture may deliberately demonstrate a speaker, but must be labelled fictional and never attributed to a real person.

**Transport and accessibility:** Play/Pause, seek, speed, fullscreen when supported, caption on/off, transcript, source list, current story and anchor-mode control. Captions include both anchor dialogue and meaningful clip speech/sound information. Include a descriptive transcript where visual facts matter. Transcript text and full original-source links are SSR content, not canvas-only text. Do not flood screen-reader live regions with every time tick.

**Timeline correctness:** use the actual media clock, not a wall-clock slideshow. Seeking directly into a segment must show the correct speaker, mouth cue, lower third, image/video offset and caption. Buffering, pause, resume and rate changes cannot let the scene run ahead of audio. Stop background decorative work and resynchronize on visibility return. Synchronize a video underlay with the master track and never let it play a second narration track. Caption/shot cues should resolve within 250 ms in the foreground local test; report measured values, not just the target.

A `Listen instead` action may hand over to the same programme audio and time where the audio is meaningful without visuals. If the Radio rendition has different wording or timing, map to a shared story/segment boundary and explain the transition rather than pretend exact continuation. Leaving the Newsroom route pauses by default unless the user explicitly selects audio-only continuation.

Optional photorealistic boundary: HeyGen's researched v3 audio-to-video path accepts audio and a permitted single-person avatar/image; render separate anchor turns and compose the programme explicitly. Do not assume one request stages two independent anchors with arbitrary evidence footage. Poll asynchronously, persist job IDs, verify asset rights/duration and handle errors. Never send fictional/real content to a paid endpoint without the separate authorization described above. A reference/test adapter alone is not a rendered presenter.

**Exit:** at least one complete solo and duo programme includes an opening presenter shot, contextual image, evidence figure, local clip with meaningful audio sequencing, and source recap. Speaker, media, captions and audio remain synchronized after seek/pause/speed changes. No static fake show or externally gated whole feature.

## Increment 8 — add functional reader sign-in and account creation

Build the member entry experience near the end of the visible product work, as requested. Reuse the existing session and capability service; do not replace it with a second auth cookie/store or add passwords unnecessarily.

Implement a controlled email-token flow consistent with the original specification: Create account, Sign in, Check your email, explicit confirmation, expired/already-used state and resend. A new account becomes an active reader only after successful token redemption. Existing emails follow the sign-in behavior without leaking account existence in public request responses. No public staff self-enrollment, role selector, fixture impersonation endpoint or browser-minted session.

Use a reviewed **Mailpit** binary in the retained local-demo stack for SMTP capture. Bind its UI, SMTP and API to loopback and disable relay/forwarding. It is an isolated test mailbox, not verified internet delivery. Restrict local-demo requests to clearly fictional addresses such as example.test. Show a modest environment banner explaining local mail capture and document the mailbox address. Do not put that banner or sink configuration into a production delivery claim. If Mailpit is genuinely unavailable, a same-purpose isolated local SMTP sink with the same boundary may substitute; do not return magic links from the public app API or echo them in logs.

Token implementation must reuse reviewed secure primitives: high-entropy random opaque secret, hashed verifier at rest, purpose/expiry binding, atomic single use, bounded request/verification attempts and generic responses. Keep this distinct from the long-lived session secret. A GET link preview must not consume the token or create a session; require explicit same-origin confirmation. Defend the pre-authentication flow against login CSRF and session fixation using a documented pre-auth challenge/origin policy; rotate into a fresh authenticated session after success. Do not mark a guessed email as verified.

Use safe configured callback origins and relative allowlisted return paths; reject open redirects. No-referrer and no-store on credential-bearing pages/responses; no third-party requests from token pages. Scrub tokens from visible URLs when safe and redact them in server, proxy, test and browser evidence. Keep token/cookie values out of screenshots, traces and committed artifacts. Do not perform provider-specific email dot/plus transformations; use a consistent documented normalization policy.

Atomically redeem the token, create/link only the intended reader account, set preferences, and issue the existing durable session. Rollback must not leave a partially activated account or consume a token without the corresponding recorded result. Concurrent redemption cannot create two independent successful new sessions for the same single-use credential. Keep revocation/session-version and CSRF behavior intact. Rate limits must not be defeated by routing requests through different local API instances.

All captured-mail identities remain explicitly local-demo assurance and cannot obtain staff/MFA privileges. External delivery, real mailbox ownership and staff MFA are separate later verification paths. A future SMTP/OIDC adapter must fail closed when unconfigured. Do not display a working-looking Google or other provider sign-in button unless its actual configured flow can execute; an optional documented OIDC authorization-code/PKCE boundary is sufficient for this run. Use an established OIDC client later, not handwritten token validation.

**Exit:** a new fictional reader requests a link, retrieves it from the loopback mailbox, explicitly confirms, receives a real server session, reaches My library and signs out. Replay, expired link, incorrect origin, resend flooding and staff escalation are rejected. This is self-service local sign-in, not test-harness-only cookie injection.

## Increment 9 — implement the member area and durable listening preferences

Add My library and Preferences to the actual account menu while keeping the public paper readable anonymously.

My library includes saved articles, listening queue and Continue listening. Controls operate on the real member API; no local-only mutations presented as saved to the account. Use the current bookmark semantics, retain originally saved dates/versions, and show safe unavailable tombstones without withdrawn text. Topic following may be included through the existing specification's contracts; do not invent a recommendation engine to support it.

Extend preferences minimally: existing theme/text/reduced-motion fields plus supported narration voice, default playback speed, default anchorCount 1 or 2, supported media-treatment preference, and listening-history preference. Enforce strict allowed values and optimistic concurrency. A setting selecting an unavailable rendition must show an honest fallback or make the choice unavailable; it cannot silently regenerate or charge a provider.

Persist queue order and playback progress behind ownership-checked services. Progress keys include programme/rendition/article version, seconds, duration or verified asset link, completion state, server timestamp and revision. Clamp to the actual asset duration, reject negative/nonfinite values, and do not treat client timestamps as an authorization or conflict-resolution authority.

Throttle progress writes (for example every 10–15 seconds plus meaningful pause/seek/end). Do not write on every animation frame. Provide an immediate local resume buffer when permitted, but clear user-associated local caches on logout. Avoid sending a csrf-less mutation from unload just to claim the final second was synchronized. Client revision checks, same-user multi-device conflicts and queue reorders require explicit semantics; do not merge two conflicting queues silently.

Offer a choice to add the guest queue to the account after sign-in. Do not automatically upload anonymous listening history. Guest storage must work gracefully when unavailable. Clear-history removes account progress and relevant local caches through an owner-scoped action; it does not merely hide the UI. Keep listening history private, minimally retained and excluded from public analytics, media cache keys and generation prompts.

Return the reader to the safe intended page after sign-in without blindly executing a stored destructive action. Saving a pending bookmark may occur only through an explicit controlled member action with current CSRF protection. Keep read/listen/watch availability independent of account billing concepts.

**Exit:** preferences, bookmarks, queue and progress survive API/worker restart; A and B cannot read or change each other's data; logout clears personalized client state; a chosen duo/solo preference actually affects the next Newsroom programme.

## Increment 10 — integrate, repair and leave a verifiable local product

Run the full relevant existing suites plus new programme/Radio/Newsroom/auth/member tests. Add one aggregate demo check following project naming, but preserve separate test commands for focused repair.

Use the actual browser at 320/390/834/1440 in both themes, plus the established wider regression matrix as applicable. Verify keyboard/focus, text enlargement, reduced motion, captions, source links, account transitions, media errors, route continuity, no-JavaScript article/transcript/bibliography and absence of credentials in rendered state. Native media APIs and mobile lock screens require real-platform tests for claims; report Chromium emulation separately from physical iOS/Android, Safari and Firefox.

Required end-to-end owner journey:

1. Open the retained local demo and search for a fixture article.
2. Open the correct article, inspect evidence and follow a source anchor.
3. Start its Radio edition; navigate to another article without audio restarting.
4. Seek/change speed/pause; inspect the programme transcript and complete sources.
5. Start Newsroom solo, then duo at a valid boundary; confirm Radio stopped.
6. Watch the programme show images, evidence and a meaningful local clip without double audio.
7. Create a fictional account through the captured mailbox, confirm, save the article, choose a two-anchor preference and add a queue item.
8. Restart only the API against the same retained database, without seeding. Sign in again if session policy requires it; verify stored member data and any still-valid session.
9. Exercise a second member to verify isolation.
10. Trigger a trusted fixture withdrawal and prove new article/search/bookmark/programme/asset requests cannot return withdrawn content. Revert through a new explicit fictional version/seed action rather than resurrecting an invalid approval.

Add deterministic unit/integration checks for programme range/citation/rights validation; actual nonempty audio decode and duration; idempotent worker claims; corrupt/missing assets; HTTP Range seeking; unauthorized URLs/path traversal; stale renditions; synchronous/late media events; controller teardown; multiple players; seek/caption/speaker alignment; no member-data leaks; login-token races; and unchanged session guarantees.

Do not rely solely on screenshots or a green build. A waveform moving during silent playback is not evidence. A browser click to a mocked success toast is not a verified sign-in. A source link in an unrendered JSON object is not the required bottom bibliography.

Create the following final artifacts:

- `docs/execution/MORNING_REVIEW.md`: actual URLs/commands, feature status, concise walkthrough and known boundaries.
- `docs/execution/OWNER_ACTIONS.md`: only genuine credentials, budget, provider, rights or visual decisions needed next.
- `docs/execution/OVERNIGHT_PLAN.md`: accurate final milestone results; no fabricated whole-WP completion.
- Relevant updated Figma inventory/handoff and native links only where created.
- `output/review/product-review.html` with actual desktop/mobile/light/dark captures of new experiences and relative local assets; no screenshot-packaging approval loop.
- At least one short real playback capture or clear ordered interaction evidence, with a note if the recorder is unavailable. Include actual playable local media references; do not confuse Figma animation with audio playback.
- Machine-readable test results and provider/asset/license inventory with no secrets or downloaded font files.
- One supervised local startup/stop command for API, Nuxt, worker, retained PG target and captured mailbox, with port conflict handling that does not kill unrelated processes.

Tests must close their temporary servers and clusters. The demonstration stack may remain loopback-running when supported by the session; report actual state and PIDs under the supervisor, never claim a process stays alive after the environment terminates. Always provide a repeatable start command and explicit stop/reset boundaries. Do not change operating-system sleep settings; the owner controls their machine.

### Final report format

Give a compact ten-row milestone status table: VERIFIED, IMPLEMENTED/UNVERIFIED, PARTIAL or BLOCKED, with evidence and what the owner can actually do. Separately distinguish: native Figma work, local functional behavior, hosted adapters not executed, physical-browser checks not performed, and release gates still open. Include the exact latest commands tested.

The target is a credible, cohesive local product with real media and real local member flows. It is not authorization to declare production readiness, ingest unlicensed material, buy rendering capacity, pretend original animated presenters are photorealistic, or silently lower the original editorial safeguards.

**Start now. Inspect the current repository, verify rather than assume the last PostgreSQL increment, establish the execution record, and proceed through all ten authorized increments while the session remains active.**
