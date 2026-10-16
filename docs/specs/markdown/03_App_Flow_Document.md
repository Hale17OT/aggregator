# The Aggregator
## App Flow Document

Version 1.0 | Interaction and state baseline | 8 October 2026

## 1. Navigation and access model

Public navigation contains Home, Topics, Sources, Search and a restrained Sign in action. Members additionally see Saved and an account menu. For you is a home-view choice, not a separate editorial truth. Methodology, Corrections policy, Privacy and Contact remain in the footer. No V1/V2 destination is visible before its release.

Staff navigation contains Newsroom, Clusters, Sources, Corrections, Operations, Analytics and Access. Visibility follows capability, but the server independently authorizes every action. Staff links do not appear in ordinary reader navigation. A direct staff URL by an unauthorized visitor returns a safe authentication/access state.

Article reading is the center of the public application. The complete bibliography is a document section, not an overlay-dependent feature. Overlays offer faster inspection without replacing the source section. An exact version and claim remain selected when a reader opens evidence or submits a report.

## 2. Screen and route inventory

### SC01 | Editorial home / For you

**Route / access:** / | Public.

Lead story, latest list, topic navigation, edition time, source-count labels. **Primary action:** Open article; change desk; authenticated For you. **Required states:** Loading, partial-feed failure, stale edition, no follows.

### SC02 | Topic hub and story trail

**Route / access:** /topics/:slug | Public.

Desk scope, follow control, ongoing-story grouping, filtered articles. **Primary action:** Open article or follow topic. **Required states:** Empty topic, not found, follow failure, renamed slug.

### SC03 | Search results

**Route / access:** /search | Public.

Query, topic/date/source-type filters, result count and snippets. **Primary action:** Search, refine, clear, open result. **Required states:** Typing, loading, zero results, invalid date range, unavailable search.

### SC04 | Canonical article

**Route / access:** /articles/:slug | Public.

Headline, deck, review/cutoff/version labels, variants, cited narrative, full bottom sources, history, related stories. **Primary action:** Read; inspect source; save; share; report. **Required states:** New-version notice, video unavailable, rights withdrawal, partial enhancements failure.

### SC05 | Evidence view

**Route / access:** Article + #claim-:id or #sources | Public.

Claim, sources, evidence-role labels, disagreement, permitted excerpt, source link and back-reference. **Primary action:** Open original or return to exact claim. **Required states:** Excerpt not licensed, missing author/date, unavailable original, disputed claim.

### SC06 | History and historical article

**Route / access:** /articles/:id/history | Public.

Chronological material changes, version details, correction notes. **Primary action:** Read current or safe previous version. **Required states:** Historical warning, redacted version, restored story, unavailable text.

### SC07 | Source directory

**Route / access:** /sources | Public.

Approved sources, topic/type filters and methodology link. **Primary action:** Inspect a source profile. **Required states:** Empty filter, source suspended, metadata unavailable.

### SC08 | Source profile

**Route / access:** /sources/:slug | Public.

Verified identity, review date, topic scope, ownership/limitations, recent public coverage. **Primary action:** Open original homepage or related synthesis. **Required states:** Suspended profile; missing ownership information explicitly disclosed.

### SC09 | Sign-in and verification

**Route / access:** /sign-in | Public.

Google and email choices, privacy links, return-action context. **Primary action:** Authenticate or request/resend link. **Required states:** Pending email, invalid/expired link, provider failure, throttled request.

### SC10 | Optional onboarding

**Route / access:** /onboarding | Member.

Topic choices, theme preference, skip control. **Primary action:** Follow topics and finish, or skip. **Required states:** No selection, save failure, already-completed onboarding.

### SC11 | Saved reading

**Route / access:** /saved | Member.

Private saved list, sort and correction/retraction labels. **Primary action:** Open or remove bookmark. **Required states:** Empty list, optimistic removal rollback, withdrawn saved item.

### SC12 | Account and reading settings

**Route / access:** /settings | Member.

Reading preferences, follows, linked identities, sessions, privacy actions. **Primary action:** Save preferences, revoke session, begin export/deletion. **Required states:** Unsaved changes, conflict, storage unavailable, reauthentication required.

### SC13 | Digest and alert settings

**Route / access:** /settings/notifications | Member / V1.

Opt-in channels, cadence, timezone, quiet hours, preview, unsubscribe. **Primary action:** Confirm subscription or stop messages. **Required states:** Unverified email, invalid timezone, delivery suppression.

### SC14 | Report an issue

**Route / access:** Article report dialog or /report | Public.

Issue type, article/version/claim context, description, optional evidence URL/contact. **Primary action:** Submit report. **Required states:** Invalid input, duplicate, throttled, receipt, offline failure.

### SC15 | Methodology and editorial policy

**Route / access:** /methodology | Public.

Sourcing, independence, AI role, review policy, corrections and rights contact. **Primary action:** Open source directory or report an issue. **Required states:** Readable without scripting; anchor navigation.

### SC16 | Newsroom queue

**Route / access:** /staff/newsroom | Editor / Publisher.

Assignments, candidate status, risk, blockers, ready-to-review and scheduled work. **Primary action:** Open a candidate or resume assignment. **Required states:** Empty queue, stale assignment, insufficient evidence, service outage.

### SC17 | Source management

**Route / access:** /staff/sources | Curator / Rights reviewer.

Sources, endpoint state, approval/rights expiry and health. **Primary action:** Add source or open governance record. **Required states:** Pending review, expired rights, suspended identity, missing credentials.

### SC18 | Source governance / intake

**Route / access:** /staff/sources/:id | Curator / Rights reviewer.

Identity, scope, review log, grants, endpoint settings, permissioned input test. **Primary action:** Approve scope, add grant, run safe intake test, suspend. **Required states:** Denied processing, test failure, conflict, required review, secret reference invalid.

### SC19 | Cluster and origin review

**Route / access:** /staff/clusters/:id | Editor.

Event timeline, item versions, duplicates, origins and candidate links. **Primary action:** Split/merge, adjust origins, build evidence pack. **Required states:** Possible duplicate event, unknown origin, conflicting dates, stale pack.

### SC20 | Evidence and article workbench

**Route / access:** /staff/versions/:id | Editor / Publisher.

Sources/claims pane, draft variants, checks, risk, diff, approvals and preview. **Primary action:** Edit, validate, submit, approve or publish according to role. **Required states:** Unsaved changes, validation failure, stale approval, lock conflict, lost connection.

### SC21 | Reports, corrections and withdrawal

**Route / access:** /staff/corrections | Editor / Publisher / Rights reviewer.

Triage queue, affected versions/claims, public change note, purge/deletion state. **Primary action:** Investigate, correct, withdraw or close report. **Required states:** Urgent issue, pending remediation, failed purge, duplicate report, disputed claim.

### SC22 | Operations and jobs

**Route / access:** /staff/operations | Operator.

Adapter status, queue age, jobs, dead letters, quotas, kill switches. **Primary action:** Pause, inspect failure or replay safely. **Required states:** Provider outage, quota limit, poison item, deletion overdue.

### SC23 | Product and quality analytics

**Route / access:** /staff/analytics | Product / Editor / Operator.

Quality, engagement, source coverage, cost, review time and denominators. **Primary action:** Filter interval or inspect a metric definition. **Required states:** Low sample, no data, delayed pipeline, incomplete interval.

### SC24 | Staff access and policy controls

**Route / access:** /staff/access | Administrator.

Role assignments, session revocation, policy versions, audited feature flags. **Primary action:** Change role or disable feature after reauthentication. **Required states:** Forbidden action, missing MFA, stale record, audit failure.

### SC25 | Privacy request status

**Route / access:** /settings/privacy/:id | Member.

Export/deletion state, expiry, consequences and secure action. **Primary action:** Retrieve own export or confirm deletion. **Required states:** Pending, ready, expired, failed, canceled before execution.

### SC26 | System states

**Route / access:** Reusable across routes | All.

403, 404, withdrawn/410, offline, retryable error and maintenance. **Primary action:** Retry, navigate safely or read explanation. **Required states:** No disclosure of private resource existence; avoid retry loops.

### SC27 | Suggest a source

**Route / access:** /suggest | Member / V1.

URL, reason and optional related article. **Primary action:** Send suggestion to quarantine. **Required states:** Duplicate, unsupported URL, submission receipt.

### SC28 | Collaborative collections

**Route / access:** /collections | Member / V2.

Private collections, invited collaborators and access settings. **Primary action:** Create or open collection. **Required states:** Invite revoked, expired invite, access denied.

### SC29 | Paid products

**Route / access:** /plans | Public / V2.

Future entitlement offer and transparent pricing, only after separate approval. **Primary action:** No launch action. **Required states:** Not included in launch navigation or prototype critical paths.

## 3. Interaction contracts

Every asynchronous control has idle, loading, success and failure states. A loading state retains sufficient context to explain what is happening; spinners do not replace all content. Disable only the submitting control where possible and preserve entered data. Buttons say what they do: Save article, Open original, Submit for review, Publish version 3, Withdraw article.

A reader can use browser Back/Forward, direct links and refresh without losing meaning. Filters live in URL parameters; article variant/language and selected version are linkable. A citation anchor targets the selected version, never an unrelated current claim with a reused number. The server resolves old slugs safely while preserving version/claim context.

For a drawer or sheet, focus moves to its heading/close control, remains within it while modal, and returns to the invoking element. Escape dismisses unless an explicit irreversible operation is in progress. Clicking outside may close a read-only drawer but never discard an unsaved editor form without confirmation. Nested evidence, report and auth modals are replaced by a single active layer rather than stacking inaccessible dialogs.

On mobile, reading actions stay compact and do not cover text or the source footer. Evidence is a sheet or full-height panel with an obvious Close and Open original action. Long bibliography entries wrap without horizontal page scrolling. Opening external links is explicit; preserve the article tab when the user chooses a new tab.

Private previews have a visible Draft banner, no indexing and no public share action. They use signed, expiring links scoped to authorized staff or a specifically granted reviewer. A screenshot or copied preview URL is not publication.

## 4. End-to-end flows

### FL01 | Discover and read

**Entry:** Visitor lands on / or a shared link.

**Path:** Home -> select story -> canonical article -> read Sources and evidence -> optional related coverage.

**Gate / success:** No account is required. Article and sources render before client hydration.

**Recovery / return:** Back restores feed filters, page and scroll position. A missing article shows 404; a withdrawn article has a reasoned tombstone, not an unrelated redirect.

**Data effects:** Read-only events are optional/minimized; no personal profile is inferred. **Requirements:** F01, F09, F17.

### FL02 | Browse a desk or ongoing story

**Entry:** Visitor chooses a desk.

**Path:** Topic hub -> date/topic filters -> story trail -> article.

**Gate / success:** Filtering applies to public versions only; duplicate cards collapse by article identity.

**Recovery / return:** Browser Back restores the hub. An empty desk offers other desks, never unreviewed content.

**Data effects:** Authenticated Follow invokes FL09 but browsing remains public. **Requirements:** F02.

### FL03 | Search, filter and recover

**Entry:** Visitor opens search or submits a query.

**Path:** Search input -> validated query -> result list -> refine -> article.

**Gate / success:** URL records query, range, sort and filters; explicit submission also works without autocomplete.

**Recovery / return:** Cancel stale requests. Invalid ranges identify both fields. Zero results exposes Clear filters; outage keeps typed query for retry.

**Data effects:** Search snippets use the current safe public version; raw queries are not logged by default. **Requirements:** F03.

### FL04 | Read, change length and adjust presentation

**Entry:** Visitor is on an article.

**Path:** Read standard -> choose Brief -> inspect same-version citations -> adjust type/theme -> share or continue.

**Gate / success:** Both variants retain accurate version/cutoff labels; no on-demand model call occurs.

**Recovery / return:** Returning to Standard restores a logical block position, not a random pixel. Share failure exposes Copy/select link. New versions produce a passive notice with user-controlled update.

**Data effects:** Preference updates are local for guests or private account data for members. **Requirements:** F04, F09, F10.

### FL05 | Verify a claim and trace a disagreement

**Entry:** Reader activates [n], a claim evidence action or Sources.

**Path:** Claim -> evidence drawer on desktop / sheet on mobile -> exact bibliography entry -> original source.

**Gate / success:** At all times a visible direct link can open the exact source. Public excerpts appear only if permitted.

**Recovery / return:** Escape/Close returns focus to the invoking citation. On deep link, load the correct version and claim before focusing. An unavailable original retains lawful citation metadata and status.

**Data effects:** No modal is needed to reach the full bottom bibliography. Do not count merely related links as evidence. **Requirements:** F05, F07.

### FL06 | Inspect a video or document source

**Entry:** Reader or reviewer chooses a video/document evidence item.

**Path:** Source card -> disclosure of evidence provenance -> open original video at validated time or document page context.

**Gate / success:** Aligned licensed transcript supports timestamped citation. Unaligned transcript has a video link without an invented time.

**Recovery / return:** Blocked embed offers Open on YouTube. Without player/privacy permission, show a plain link. Missing transcript is a related watch link only.

**Data effects:** No video download, audio extraction or unapproved transcript API. A private evidence excerpt never becomes public automatically. **Requirements:** F06, F20.

### FL07 | Authenticate and resume an intended action

**Entry:** Anonymous visitor selects Save or Follow.

**Path:** Capture safe local return path and intended action -> sign-in -> verified identity -> optional onboarding -> resume action once.

**Gate / success:** User can cancel and keep reading. Google sign-in requests identity scopes only.

**Recovery / return:** Expired links offer resend; provider cancellation returns to sign-in. Never trust arbitrary return_url or unverified email for account linking.

**Data effects:** Create/rotate session; record consent version; an action nonce prevents double execution. **Requirements:** F11.

### FL08 | Save, revisit and remove

**Entry:** Member saves an article.

**Path:** Save feedback -> Saved list -> open current safe article -> optional inspect saved historical version -> remove.

**Gate / success:** Bookmark is unique per member/article; private to that member.

**Recovery / return:** Failed save reverts icon and gives Retry. Removed entries can be re-saved; no fictitious offline copy. Withdrawn entries retain a clear status.

**Data effects:** Idempotent PUT/DELETE; bookmark stores article identity and original viewed version. V2 collections are a distinct extension. **Requirements:** F12, F34.

### FL09 | Follow topics and control For you

**Entry:** Member selects Follow or enters onboarding/settings.

**Path:** Choose topics -> save -> For you with reason labels -> adjust or reset.

**Gate / success:** No follows defaults to Editorial home. Skip onboarding is always visible.

**Recovery / return:** A failed write preserves the old confirmed state and offers Retry. Returning from settings retains reading context.

**Data effects:** Store explicit topic choices only; resetting removes them. No sensitive inferred-interest model. **Requirements:** F13.

### FL10 | Report, correct or withdraw

**Entry:** Reader reports a problem, or staff detect a material issue.

**Path:** Exact version/claim report -> receipt -> private triage -> evidence investigation -> corrected draft or immediate withdrawal -> validation/review -> new publication event -> public correction note.

**Gate / success:** Urgent harmful/rights content can be suppressed immediately. A correction never edits the old approved narrative in place.

**Recovery / return:** Duplicate reports link internally. Failure to purge escalates an incident; affected content remains denied at serving layer. Contact data never appears publicly.

**Data effects:** Bind report to original version; invalidate derived brief/search/share/digest content; append audit and deletion events. **Requirements:** F08, F16, F25.

### FL11 | Understand source selection

**Entry:** Visitor opens methodology or source directory.

**Path:** Methodology -> filter directory -> source profile -> inspect review scope/limitations -> open original or related synthesis.

**Gate / success:** Public rationale is distinct from private licensing records.

**Recovery / return:** Suspended source gets an accurate status; historical attribution is not silently removed when retention is permitted.

**Data effects:** Read-only projection; no publication authority is implied by listing. **Requirements:** F15.

### FL12 | Approve a source and intake content

**Entry:** Curator proposes an exact source identity.

**Path:** Create identity -> verify scope -> editorial source review -> separate rights approval -> configure endpoint/secret reference -> safe test fetch -> inspect result -> activate schedule.

**Gate / success:** Unknown permissions, expired grants or unsafe URLs fail closed. Discovery-only approval never permits model processing.

**Recovery / return:** Fix source identity, rights or adapter errors in place with new audit events; do not reroute to an unapproved mirror. Quarantine malformed files.

**Data effects:** Create source/endpoints/grants and intake jobs; every retrieved version has immutable provenance. **Requirements:** F18, F19, F30.

### FL13 | Turn sources into a published synthesis

**Entry:** Enough eligible items exist for a bounded event.

**Path:** Review cluster/origins -> freeze evidence -> generate variants -> validate -> edit -> revalidate -> submit -> human approval(s) -> publisher commit -> cache/search propagation.

**Gate / success:** Three eligible evidence items and two established origins minimum. High-risk stories require two distinct approvers. Every approval matches exact digest.

**Recovery / return:** Edit after approval invalidates it. Stale publish returns 409 and a diff. Missing evidence holds the candidate. Model failure leaves it private.

**Data effects:** Atomic current-version switch and outbox event; retries are idempotent. No auto-publication at launch. **Requirements:** F21, F22, F23, F24, F37.

### FL14 | Receive and stop a digest

**Entry:** V1 member explicitly opts into delivery.

**Path:** Choose cadence/timezone -> confirm email -> preview -> scheduled send eligibility check -> message -> article/source link -> unsubscribe.

**Gate / success:** No opt-in is inferred from account creation. Recheck publication and subscription at send time.

**Recovery / return:** Ambiguous provider timeout is reconciled before retry. A withdrawn article is removed. Quiet-hour logic uses IANA timezone rules.

**Data effects:** Delivery deduplicated by user/channel/edition; immediate suppression on unsubscribe. **Requirements:** F14.

### FL15 | Operate and investigate

**Entry:** Operator sees an alert or opens operations.

**Path:** Inspect health/queue/cost -> drill into correlation/job -> diagnose -> pause/replay if allowed -> verify outcome.

**Gate / success:** Role-gated actions; replay retains the original idempotency key and requires a reason.

**Recovery / return:** Poison items stay quarantined; provider outage does not cause infinite retries. Budget exhaustion pauses generation, not reading.

**Data effects:** Audit action; update durable job state; dashboards report denominators and freshness. **Requirements:** F26, F29.

### FL16 | Manage staff access safely

**Entry:** Administrator changes staff capability.

**Path:** Reauthenticate with MFA -> inspect existing roles -> choose change -> confirm scope/reason -> commit -> invalidate affected privileged sessions.

**Gate / success:** No self-service promotion or publish bypass. Keep an emergency recovery process outside ordinary reader access.

**Recovery / return:** Stale role versions require refresh. Failure to append required audit blocks the privilege mutation.

**Data effects:** Role assignment and audit are transactional; session revocation follows durably. **Requirements:** F27.

### FL17 | Export or delete an account

**Entry:** Member enters privacy settings.

**Path:** Reauthenticate -> explain scope -> confirm request -> queued status -> secure export or completed deletion.

**Gate / success:** Only the owner sees status/export. Deletion blocks future sessions and optional messages immediately after confirmation.

**Recovery / return:** An export expires after 24 hours and can be regenerated. Request cancellation is allowed only before irreversible deletion starts. Failures show a truthful pending state.

**Data effects:** Private account data purged by policy; legally justified audit minimized; backup restore replays deletion tombstones. **Requirements:** F28.

### FL18 | Recover from outages and missing content

**Entry:** Any route encounters unavailability or access denial.

**Path:** Preserve known-safe context -> show correct state -> offer bounded retry or safe navigation.

**Gate / success:** A generation outage can serve safe approved content. A safety/rights withdrawal cannot.

**Recovery / return:** 403 does not expose private object details. Offline is not mislabeled as no results. Never show fake success for an unsent report or failed save.

**Data effects:** Read cache only when publication policy permits; no hidden mutation on retry. **Requirements:** F31.

### FL19 | Suggest a source

**Entry:** V1 member sends a URL and reason.

**Path:** Submit -> quarantine receipt -> curator review -> approve only through FL12 or reject.

**Gate / success:** Suggestion endpoint stores input but does not fetch it in the request.

**Recovery / return:** Duplicate suggestions consolidate; unsafe/unsupported schemes reject clearly.

**Data effects:** Abuse limits and private moderation log; no automatic ranking benefit. **Requirements:** F32.

### FL20 | Purchase a future paid product

**Entry:** V2 only after a monetization addendum is approved.

**Path:** Plans -> explicit checkout -> verified payment event -> entitlements -> manage/cancel.

**Gate / success:** Not part of launch UI or API. Required citations remain accessible.

**Recovery / return:** Payment, tax, refund, webhook and entitlement rules require their own specification before implementation.

**Data effects:** No provider selection or price is assumed by this planning package. **Requirements:** F35.

## 5. State transitions that must not be simplified

Source: proposed -> identity_verified -> editorial_approved + rights_approved -> active. Either approval can expire or be suspended independently. A source may remain discovery_only while full-content intake is disabled. Reapproval produces a new decision record and does not rewrite history.

Item: discovered -> permission_checked -> fetched -> extracted -> eligible -> clustered. At each boundary it can become denied, needs_review, failed or quarantined. Retry is only appropriate for transient failure. Eligibility is revocable if rights or evidence validity changes.

Article candidate: queued -> generating -> draft -> in_review -> approved -> published. Changes during review return to draft with old approvals invalidated. A replacement version is independently reviewed. Publication state can become withdrawn; historical text may be redacted. “Superseded” means an older version exists, not that it is safe to keep displaying restricted content.

Report: received -> triaged -> investigating -> action_required or no_change -> resolved. Duplicate is a linked outcome, not deletion of a complainant's context. Rights and urgent safety queues receive separate severity handling. Public updates disclose the change, not internal legal advice or reporter identity.

Privacy request: requested -> confirmed -> queued -> processing -> completed or failed. Cancellation only before processing. A deletion confirmation immediately prevents normal access, while actual purge continues with a truthful visible status and auditable completion.

## 6. Acceptance walkthroughs

The critical reader prototype starts at Home on a 390 px mobile frame, opens a standard article, switches to Brief, opens a disputed claim, follows a timestamped video link, returns, reaches the complete sources section, saves through sign-in, finds the saved article and reports a correction. Repeat at desktop width and with keyboard-only navigation.

The critical staff prototype starts with an unapproved source, demonstrates a processing-rights denial, approves an eligible grant, inspects source versions and origins, generates a private draft, resolves a failed claim check, obtains the required reviews and publishes. Then change a material source fact, demonstrate stale-approval rejection, publish a correction and withdraw the article while observing public suppression.

Test at least these abnormal journeys: link expired; save failed; no search results; search unavailable; missing transcript; transcript without timing; inaccessible original; three reprints from one origin; source withdrawn after approval; simultaneous editor changes; quota exhaustion; insufficient high-risk approvals; consented player blocked; account deletion; and a restored backup containing data pending deletion.

## 7. Handoff and traceability

Screen identifiers map to design/screen_register.json. Features map to planning/feature_register.json, including the implementation phase and relevant data entities. The Mermaid file engineering/core_flows.mmd is an editable logical flow companion, not a substitute for the interactive Figma prototype. Interaction behavior in this document is binding even when a design repository suggests a more decorative transition.
