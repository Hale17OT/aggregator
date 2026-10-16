# Product-completion acceptance matrix

Version 1.0 · 14 October 2026

These are proposed acceptance criteria, not passing results. Maintain a separate results file with exact command, input/catalogue revision, source/build identity, outcome and evidence. Primary owner requests are ICON, TAX, ONB, PERS, PAGE and CLIPS; BASE/DB/JOURNEY/FINAL protect the integrated product.

A failed or unavailable check stays FAILED/BLOCKED/NOT RUN. Sampled visual review and subjective listening are separate from automated checks. Do not edit criteria after execution simply to label a result successful.

## BASE

| ID | Criterion | Required behaviour/evidence |
|---|---|---|
| BASE01 | Latest state | Canonical 14 October engine summary is used; old STOP, disk warning and incomplete-auth paragraphs are not treated as current. |
| BASE02 | Scope | All new reader milestones execute continuously; staff/MFA, real ingestion, live-model calls and publication remain gated. |
| BASE03 | Owned execution | Actual capacity/ports/target profile are checked; no duplicate supervisor, unrelated process kill or reset/reseed. |
| BASE04 | Working-tree preservation | Unrelated edits, original specs, old fixtures and programme assets remain; no commit/push/upload. |
| BASE05 | Reproducibility | Exact install/build/start/test commands and current source/catalogue identities are recorded; tests are not run during build replacement. |

## ICON

| ID | Criterion | Required behaviour/evidence |
|---|---|---|
| ICON01 | Actual defect | The shared trigger is inspected in page context; reported cause is supported rather than guessed. |
| ICON02 | One affordance | Exactly one decorative chevron is rendered; no Unicode/default/native/pseudo-element duplicate. |
| ICON03 | Visual centre | Painted mark and reserved slot remain centred closed/open and with multiline values; screenshot inspection supplements box measurements. |
| ICON04 | State/size | Light/Dark, focus/disabled/error, failed fonts, 200% text and 320/390/834/1440 widths pass without label truncation or focus loss. |
| ICON05 | No semantic regression | Select/combobox keyboard, focus, selection and portals remain functional; icon is not independently focusable. |

## DB

| ID | Criterion | Required behaviour/evidence |
|---|---|---|
| DB01 | Profile plan | Retained seven-migration and pipeline-eight-migration profiles are mapped explicitly; no skipped or falsified ledger entries. |
| DB02 | Backup and clone | Private retained backup restores into a separate attested clone; backup is not in public review assets. |
| DB03 | Upgrade | Populated retained upgrade, fresh install, repeat/no-op, checksum and failed-migration rollback are verified before retained mutation. |
| DB04 | Data preservation | Old sessions/bookmarks/queue/progress/preferences and checksums remain semantically intact through the approved upgrade; no reseeding. |
| DB05 | Least privilege | Member API does not gain pipeline raw-payload, grant, approval or publication privileges. |
| DB06 | Ownership/concurrency | Real API requests enforce per-user rules, session/CSRF, expected revision, unknown IDs and 409 draft preservation. |
| DB07 | Restart | Interests/onboarding and existing member data survive real API and owned full-demo restart without fresh data provisioning. |

## TAX

| ID | Criterion | Required behaviour/evidence |
|---|---|---|
| TAX01 | Breadth | All 24 authored browse groups and 390 topic concepts import or map with a precise coverage report; no list is represented as every global entity. |
| TAX02 | Provenance | Original authored labels, verified mappings and any actual IPTC import/CC BY attribution are distinguished. No fake official IDs/import claims. |
| TAX03 | Graph | Typed edges validate endpoints, self-links, cycles and limits transactionally. Topic closure does not traverse arbitrary entity relations. |
| TAX04 | Exact requested path | Sports > Football > Premier League > Manchester City men is searchable and selectable with stable IDs and accurate labels. |
| TAX05 | Entity scopes | Team across competitions differs from league-follow and team-AND-league; no ancestor/sibling auto-subscription. |
| TAX06 | Aliases/retirement | Man City alias disambiguation, renamed/retired saved concepts and missing coverage are handled without silent loss. |
| TAX07 | Responsive browse | Expansion/search do not render the full graph; loading, empty, keyboard, back, query cancellation and large catalogues work. |
| TAX08 | Fictional separation | Positive news fixtures use labelled fictional entities; real teams are not given invented reporting or unlicensed logos. |

## ONB

| ID | Criterion | Required behaviour/evidence |
|---|---|---|
| ONB01 | After confirmation | New signup enters setup only after actual session confirmation; token-preview GET cannot authenticate/complete setup. |
| ONB02 | Selections | Broad and deep interest choices work, expansion is separate from follow, selection preview reflects actual eligible content. |
| ONB03 | Skip/zero | Skip and intentional zero-selection completion are supported and durable; anonymous/source access is never blocked. |
| ONB04 | Return intent | Article/save/clip return context survives sign-in/setup with validated local redirects and no credential leakage. |
| ONB05 | Returning account | Legacy members retain old settings and receive an optional invitation; completed/skipped setup is not repeatedly forced. |
| ONB06 | Failure/retry | Slow/error/expired-session/conflicting saves preserve draft values and do not claim saved status before commit. |
| ONB07 | Edit later | Your interests is discoverable and updates the same durable model; reset interests does not clear bookmarks/history/account. |

## PERS

| ID | Criterion | Required behaviour/evidence |
|---|---|---|
| PERS01 | Matching | Two members receive correct different feeds through actual API/browser paths; football does not pull in unrelated sibling sports. |
| PERS02 | Entity specificity | Fictional team-only match excludes other league teams; competition-only excludes team non-competition news; explicit compound scope is AND. |
| PERS03 | Mutes/hides | Explicit mutes and canonical-story hides apply with clear scope/undo; a conflicting follow does not silently override a mute. |
| PERS04 | Determinism | Repeated same-input snapshots retain stable order, story deduplication and evidence-backed explanation labels. |
| PERS05 | Sparse matches | For you shows an honest empty/short inventory and separate Explore option rather than silently widening or inventing news. |
| PERS06 | Privacy | Personal caches/snapshot tokens are account-bound; preferences are not leaked in public URLs/logs/SSR or third-party requests. |
| PERS07 | Consent | Interest matching works with passive history off; no guest-history upload or inferred sensitive identity. |
| PERS08 | Revision | Updated follow/taxonomy/article versions create a new edition deliberately; current reading does not shuffle silently. |

## PAGE

| ID | Criterion | Required behaviour/evidence |
|---|---|---|
| PAGE01 | Real pagination | At least three distinct spreads display different eligible main stories from an adequately varied local corpus. |
| PAGE02 | Rightward turn | Actual normal-speed recording shows requested rightward paper movement for Next and reversed Previous; masthead/players do not rotate. |
| PAGE03 | Semantics | Only active headline content is accessible/interactive; transition-only layers have no duplicate IDs, tab stops, forms or players. |
| PAGE04 | URLs | Direct page load, reload, Back/Forward, new tab and no-JavaScript pagination work; page/URL/data remain consistent. |
| PAGE05 | Concurrency | Rapid next/back/reverse, resized viewport, route leave and preference changes cleanly cancel or settle state with no stuck overlay. |
| PAGE06 | Failure | Slow/failing next-page request keeps old readable content; expired snapshot is explained; withdrawn slots do not leak stale text. |
| PAGE07 | Control | Keyboard links, focus/announcements, text selection and vertical scroll remain usable; no automatic page turns. |
| PAGE08 | Motion | System/saved reduced motion bypasses 3D; a deliberate motion preference persists without disabling unrelated necessary feedback. |

## CLIPS

| ID | Criterion | Required behaviour/evidence |
|---|---|---|
| CLIPS01 | Actual catalogue | At least six distinct real portrait clips from four eligible stories/three topics exist; posters alone are not counted. |
| CLIPS02 | Duration/codec | Decoded duration is 30–120s inclusive; below/above-boundary rejection tested; format/dimensions/audio and fast-start metadata verified. |
| CLIPS03 | Quality | One portrait pilot was inspected at phone/desktop sizes before expansion; narration/context/evidence fit portrait rather than cropped tiny studio shots. |
| CLIPS04 | Accessible media | Captions, transcript/visual description, seek/pause/audio controls and readable safe-area layout are present; no doubled captions. |
| CLIPS05 | Feed | Real wheel/touch-emulated/keyboard/next navigation selects the right active item; nested panels and text inputs are not hijacked. |
| CLIPS06 | Ownership | Radio/full Newsroom/Clips never have competing soundtracks; merely entering with other media active does not steal playback. |
| CLIPS07 | Autoplay | Rejected play(), explicit play, mute/unmute, user pause, item change and first-session behaviour are handled honestly. |
| CLIPS08 | Bounded lifecycle | At most one playing item; bounded mounted players/preloads/windows; no lingering TextTracks/observers/callbacks after leaving. |
| CLIPS09 | Detail/source | Dedicated clip URL has source entries/full-article link and readable initial HTML; sources never require login or hidden-only UI. |
| CLIPS10 | Availability | Catalogue, MP4 ranges, captions/posters and saved items enforce current eligibility; revisions revoke stale media access. |
| CLIPS11 | Failure/recovery | Actual unavailable/corrupt media gives usable retry/alternative; buffering does not play wrong narration or advance fake progress. |
| CLIPS12 | End/history | Finite edition end, replay/next and Back restoration work; no forced infinite repetition or history entry for every incidental visibility change. |

## JOURNEY

| ID | Criterion | Required behaviour/evidence |
|---|---|---|
| JOURNEY01 | Formats | Same-story Read/Radio/Newsroom/Clips links resolve actual available revisions, not a default unrelated programme. |
| JOURNEY02 | Position | Short-form and full-form position mapping uses section/claim/rendition identity, not raw seconds from another script. |
| JOURNEY03 | Bookmarks | Saving via a clip creates/reuses the article bookmark; no duplicates per presentation format. |
| JOURNEY04 | Progress | Clip progress is exact-rendition and consent-gated; clear history and clear interests operate independently. |
| JOURNEY05 | Hubs | Followed-topic/entity hubs, actual coverage, explanation and manage links work; no fabricated badges, counts or logos. |
| JOURNEY06 | Trust | Methodology/source/history links and correction states reflect current actual capabilities; private engine routes still inaccessible. |

## FINAL

| ID | Criterion | Required behaviour/evidence |
|---|---|---|
| FINAL01 | Regression | Relevant existing member/auth/reader/media/engine-denial/control suites and fresh lint/types/tests/build/worker checks pass or retain explicit failures. |
| FINAL02 | Performance | Original reference thresholds remain; expanded-catalogue workloads are matched and identified; new paging/clips do not erase CPU4 limitation. |
| FINAL03 | Long session | 20+ mixed-format/page/interest journeys show bounded warmed lifecycle rather than ever-growing players/listeners/nodes. |
| FINAL04 | Compatibility | Available matched browser engines, 320/390/834/1440, 200% text/reduced motion are checked; physical devices/subjective listening not claimed if unrun. |
| FINAL05 | Security/licences | Changed dependencies are audited/licensed; known findings/notice tasks remain; no gate suppression or raw account/session data in artifacts. |
| FINAL06 | Morning use | Correct supervised build is running, direct routes and one new-feature runner are documented, and all primary deliverables are linked. |
| FINAL07 | Truthful completion | Feature-by-feature implementation/verification/owner review are separate; no production readiness, live AI synthesis, human approval or real-news permission claim. |

## Morning walkthrough

Open the existing supervised reader. Inspect a corrected dropdown; sign in through captured mail with a new fictional account; select Football and a specific team; confirm the real-team coverage state and the separate positive fictional-team example. Skip onboarding with a second account and confirm an editorial edition. Reopen Your interests and make a durable change.

Turn Home to pages 2 and 3; open a story and return to the same edition/page. Enable reduced motion and repeat the navigation without the 3D turn. Open Clips, play a real portrait highlight, navigate to another, inspect captions and sources, save its story and read the full article. Move through Radio/Newsroom/Clips and confirm only one soundtrack.

Restart the API without reseeding. Confirm that both accounts, interests, bookmarks and applicable consented progress survive. Finish by opening a previously private source-to-draft output URL through the public reader and confirming that it remains unavailable. None of the walkthrough authorises publishing it.
