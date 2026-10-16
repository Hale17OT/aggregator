# The Aggregator — morning acceptance matrix

**Status:** proposed acceptance criteria, not test results. **Research snapshot:** 13 October 2026.

Codex must replace no criterion with an unsupported completion claim. Record PASS / FAIL / NOT RUN / BLOCKED against actual commands and evidence. A mocked provider success does not prove remote generation; browser emulation does not prove physical-device background playback.

## A. Ten increment gates

| Increment | The owner can actually do this | Verification gate |
|---|---|---|
| 1 — Persistence | Restart the API and find saved member data intact. | Same retained DB without reseeding; two processes and pool-size-one identity isolation; runtime roles restricted. |
| 2 — Design/contracts | See coherent Radio, Newsroom and Member additions without a new brand. | Actual native frames if tooling worked; code and IDs consistent; new design review still recorded as pending. |
| 3 — Reader | Search/topic-browse and open distinct stories with sources. | At least 12 original fictional items, three desks, safe pagination and withdrawal filtering; SSR still complete. |
| 4 — Programme pipeline | Open an eligible prebuilt programme linked to the article version. | Persistent status, hashes, citations, timing and rights; stale/failed output cannot become ready. |
| 5 — Narration | Play understandable actual audio, not a fake waveform. | Three story files; one measured 4–6 minute edition target; solo/duo programme targets; decode/duration/caption checks. |
| 6 — Radio | Listen, navigate inside the app, seek and inspect sources. | Single root player, actual media events, truthful controls and observed background test. |
| 7 — Newsroom | Choose one or two visible speaking anchors and watch relevant media. | Separate scripts/audio; speaker/mouth/caption/media timing follows seeking and rate changes; no double audio. |
| 8 — Sign-in | Request a link, open local mail, confirm and reach the member account. | Real API/token/session path; replay/expiry/CSRF/races rejected; no staff enrollment. |
| 9 — Member area | Save stories, reorder queue, resume and change next programme's preferences. | Data actually persists; owner checks; clear history; no silent guest-history upload. |
| 10 — Integration | Follow a working walkthrough and restart the supervised demo. | Regression checks, accurate status, real captures/assets, exact commands and remaining owner actions. |

## B. Specific tests

### Persistence and security

| ID | Check | Evidence needed |
|---|---|---|
| DB01 | Fresh and populated additive migrations preserve expected records. | Migration results and schema versions; originals unchanged. |
| DB02 | API restart does not recreate/reseed the member data. | Process IDs/restart logs and before/after record checks without secrets. |
| DB03 | A/B concurrent calls remain isolated on reused connections. | Actual runtime-role tests, including commit and rollback paths. |
| DB04 | Revocation is observed by a second API instance. | Real requests before/after committed invalidation. |
| DB05 | Configured database failure does not select memory. | Bounded failure response and unchanged adapter identity. |
| DB06 | Default demo startup does not erase retained data. | Two start/stop cycles and preserved preferences/queue/progress. |
| SEC01 | Reader enrollment cannot create staff capabilities. | API attempts with injected role/assurance/owner fields denied. |
| SEC02 | Session/token credentials never enter user-visible logs or review assets. | Redaction/secret-scan checks; browser storage and rendered-state inspection. |
| SEC03 | Old audit gates remain enforced. | Current baseline and any new dependency impact distinguished. |

### Articles, source integrity and generated assets

| ID | Check | Evidence needed |
|---|---|---|
| SRC01 | Search and related stories exclude drafts/withdrawn text. | Safe projection assertions and actual browser results. |
| SRC02 | Every factual programme statement references its vetted article content. | Segment-to-block/claim/citation validation. |
| SRC03 | Sources appear as complete HTML under article and programme transcript. | Initial HTML with JavaScript disabled. |
| SRC04 | Permission to display an image does not imply permission to remix a video. | Distinct grant validations, denied fixture and expected blocking result. |
| SRC05 | Article/rights revision change invalidates old renditions. | Stale/withdrawn state test plus rejected new asset requests. |
| SRC06 | Media endpoint uses asset IDs, not arbitrary remote URLs/paths. | SSRF/path traversal/unavailable asset tests. |
| SRC07 | Seeking works through actual audio range requests. | Valid/invalid Range responses and browser seek progress. |
| SRC08 | Repeated job requests do not produce duplicate logical renditions. | Concurrent claim/idempotency checks; asset hashes and state transitions. |
| SRC09 | Programme sources preserve original attribution and disputed claims. | Solo/duo/full/brief fixtures with qualifiers and source references. |
| SRC10 | No forbidden YouTube transformation/background path exists. | No extraction code or media requests; intact-provider boundary documented. |

### Narration and Radio

| ID | Check | Evidence needed |
|---|---|---|
| AUD01 | Generated files decode and contain speech-length nonempty audio. | Input-script hashes, sample counts, duration, amplitude/silence results. |
| AUD02 | Captions match actual phrase/turn boundaries. | Timing from generation/alignment, not evenly guessed intervals. |
| AUD03 | A continuous edition advances through measured story chapters. | Real playback events and chapter seek assertions. |
| AUD04 | In-app navigation preserves player identity and position. | Navigate between at least two routes; no restart or second audio host. |
| AUD05 | Play rejection is not displayed as playing. | Controlled rejection test and usable Tap to play state. |
| AUD06 | Rewind/forward/seek/speed/queue controls change actual playback. | Media properties and observed state, not only button classes. |
| AUD07 | Hidden-tab desktop playback advances appropriately. | Observed media clock/events; physical mobile tests listed separately. |
| AUD08 | Media Session has safe per-action feature fallback. | Supported and unsupported handler paths; stale metadata removed. |
| AUD09 | Sleep timer/end-of-story behavior has explicit semantics. | Deadline/event tests and honest suspended-process limit. |
| AUD10 | Starting another mode does not create overlapping speech. | Radio → Newsroom → foreground clip transitions. |
| AUD11 | Storage denial and hard reload have usable behavior. | No crash; resume offered without unauthorized autoplay. |
| AUD12 | User can inspect transcript and source list during playback. | Actual navigation and accessibility state without obscured controls. |

### Newsroom

| ID | Check | Evidence needed |
|---|---|---|
| TV01 | Solo and duo use distinct prepared programmes. | Different script/audio/variant keys and actual observed voices. |
| TV02 | Both presenters are original figures, with clear synthetic identity. | Actual screenshots and provenance, not stock anchor impersonation. |
| TV03 | Mouth cues follow speech and close on pause/silence. | Seek into speaking/silent intervals and cue state assertions. |
| TV04 | Seeking updates presenter, caption, image/clip and lower third together. | Direct seek at multiple boundaries; measured foreground cue delay. |
| TV05 | Rate changes and buffering do not decouple scene and speech. | 0.75/1/1.5 tests and delayed essential-clip test. |
| TV06 | Narration-over-visual and clip-then-commentary both work on eligible local assets. | Actual audio sequencing and no concurrent intelligible narration. |
| TV07 | Displayed credit/source ID matches the current figure/video. | Manifest-to-DOM checks across shots. |
| TV08 | Small-screen stage remains legible. | 320/390 screenshots, enlarged text and caption boundaries. |
| TV09 | Transcript includes anchor dialogue and meaningful clip sound/visual context. | Readable SSR transcript and accurate caption track. |
| TV10 | Mode switching does not reuse an invalid timestamp. | Solo/duo switch maps to a shared story boundary with explicit pause. |
| TV11 | Missing media or renderer produces an honest state. | Not a success poster; declared fallback or partial status. |
| TV12 | Hosted rendering remains disabled without permission. | Provider call counter zero, no automatic key discovery activation. |

### Sign-in and member features

| ID | Check | Evidence needed |
|---|---|---|
| MEM01 | New member completes captured-email sign-in through real browser UI. | Request → Mailpit → explicit confirm → session/member API. |
| MEM02 | Link-preview GET does not consume token or issue session. | GET followed by successful explicit POST; safe pre-auth policy. |
| MEM03 | Replay, expiry and simultaneous redemption cannot bypass single use. | Real token-store concurrency tests without logged token values. |
| MEM04 | Login callbacks/return paths cannot redirect off site. | Unsafe scheme/host/path test cases. |
| MEM05 | Email capture stays loopback and cannot relay outside. | Effective runtime configuration and no external SMTP events. |
| MEM06 | Stored preferences actually control the next Radio/Newsroom session. | Fresh page/process state and observed selected rendition. |
| MEM07 | Bookmark/queue/progress isolation includes updates and deletion. | A/B API and UI tests with tampered IDs. |
| MEM08 | Logout clears account-specific UI/local state and revokes the session. | Second request fails; next user sees no prior queue/history. |
| MEM09 | Clear-history removes persisted progress and relevant local copies. | DB/API/local-cache assertions, not just hidden rows. |
| MEM10 | Guest history is not imported automatically. | Sign-in flow choice and untouched member history without consent. |
| MEM11 | No billing/tier model or pricing copy was added. | Diff/search of project-owned additions, without altering third-party legal notices. |

## C. Quality and final review

Include actual new-screen browser captures in light/dark at desktop/mobile. Include native Figma links only for created frames. Record the selected local voices, model/asset revisions, actual audio durations, rendering method, URLs, commands and test environment. The design presentation should never say a local animated show is photorealistic.

Existing negative tests are not to be weakened. Automated Chromium testing does not certify all accessibility or every mobile background behavior. A sampled recording and an explicitly pending owner listening/visual review are compatible with reporting functional automated checks; pretending that review occurred is not.

## D. Suggested owner walkthrough

Start the retained demo stack, open Home, search, and inspect one article and its source list. Start Radio, leave its page, and confirm it keeps speaking. Open Newsroom, select solo and duo, seek into a clip and inspect captions/sources. Create a fictional account via the captured mailbox, save the story and presenter preference, restart the API without resetting the database, and verify persistence. End by checking MORNING_REVIEW.md for features that remain partial and any provider/rights/production actions needed.
