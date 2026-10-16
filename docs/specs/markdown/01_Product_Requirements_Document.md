# The Aggregator
## Product Requirements Document

Version 1.0 | Planning baseline | 8 October 2026

### Product promise
Understand one developing story through one coherent, evidence-linked article, then inspect the original reporting and videos yourself. The Aggregator is an editorial synthesis product, not a full-text republishing service, a generic RSS reader, a video downloader or a claim that AI can decide truth.

## 1. Status, decisions and boundaries

This package proposes a buildable product from the supplied concept. It does not imply that a company, content license, Figma file, software deployment or publisher partnership already exists. Launch market, business entity, operating budget and initial source contracts require owner approval. The working name is The Aggregator; trademark and domain availability have not been checked.

The working baseline is an English-language responsive website for a general adult audience, covering World, Business, Technology, Science, Climate and Culture. The reading experience is public; accounts are optional for saving and explicit topic follows. The staff workspace is private. No native mobile application is required at launch. No inference about the reader's political views is used for personalization.

“Background Schema” is interpreted as the backend and database schema, including content provenance, identity, workflow, rights and retention. The Design Brief defines a Figma deliverable, not a claim that the six supplied code repositories can be installed inside Figma.

**Decision precedence:** PRD owns scope and editorial rules; TRD owns runtime contracts and operational targets; Backend Schema owns data integrity; App Flow owns interaction behavior; Design Brief owns visual specification. The Implementation Plan consumes these decisions. Conflicts are recorded and resolved before implementation, not silently inherited from a repository or a model.

## 2. Users, needs and success

**Time-constrained reader.** Needs the important developments and context without opening ten repetitive links. Success means understanding what is known, what remains uncertain and where the evidence came from. A reader may browse anonymously and must not be forced into registration to verify a claim.

**Evidence-oriented reader.** Wants original documents, source-specific claims, publication dates, timestamped video segments and visible corrections. Success means tracing a sentence back to a precise item, not merely seeing reputable logos below a summary.

**Editor and publisher.** Need a queue of coherent story candidates, a defensible evidence pack and an efficient review workflow. Success means approving supported text without manually reconstructing how the AI arrived at it. The person who operates ingestion is not automatically allowed to publish.

**Source curator and rights reviewer.** Need to manage source identity, suitability by subject, licensing and retention. A source can be editorially suitable but not licensed for model processing. An accessible item can still be unusable for synthesis.

**Operator and administrator.** Need controlled retries, cost ceilings, safe releases, incident response and accountable permissions. A generation outage should not interrupt reading of safe approved articles.

The proposed north-star measure is weekly readers who complete an engaged article session and return in a subsequent week. An engaged session means at least 45 active foreground seconds and either 50% article-body progress or a source exploration. This is an engagement proxy, not evidence of comprehension. Report anonymous and authenticated cohorts separately where consent and measurement permit.

The launch quality bar is stricter than growth goals: 100% of published variants have a visible bibliography; zero broken internal citation targets; every material factual claim has reviewed support; zero unauthorized body-to-model transfers; all launch publications have valid human approval. A reviewed 200-claim launch sample must have zero critical unsupported claims and at least 98% supported-or-correctly-attributed claims. That aggregate threshold never excuses knowingly publishing any unsupported claim.

Proposed research gates are eight representative reader tests, at least seven successful source-verification tasks, and five editor tests with no unrecognized publish blocker. These are planning targets, not research already conducted. Instrument median editorial review time, return readership and source exploration before setting commercial targets.

## 3. Editorial model and article contract

One article belongs to one principal event or tightly bounded question. Related events may link into a story trail but are not forced into one sprawling column. A normal published synthesis requires at least three eligible evidence items across at least two independently established reporting origins. Reprints of one wire report do not satisfy independence. Prefer a primary document when it genuinely contributes; its absence must not lead to an invented primary source.

When the evidence threshold is not met, the candidate remains in the newsroom with a clear reason. Launch does not have a publisher override to create a falsely multi-sourced story. A single-source product would need a separately approved, visibly differentiated format later.

Every article has: an accurate headline and deck; a small set of key developments; the narrative and context; clearly attributed disagreements; important limitations; publication/update/evidence-cutoff times; AI-assistance and human-review disclosure; a full Sources and evidence section; a corrections/history link; and only then related coverage. Empty sections are omitted when genuinely unnecessary, but the bibliography is never omitted.

The standard and brief variants share one approved evidence cutoff and version. A claim contained only in the brief still needs validation. Source numbering is fixed across the version: one source has the same number wherever it appears. Both variants render all version-wide evidence/context source entries at the bottom with stable numbering; indicate per-view usage such as “Cited in this view” or “Used in the full article.” Related links stay separate and never count as evidence. The product distinguishes a supporting source, contextual reference, disputed source and merely related watch/read link.

Reporting is separate from analysis. Words such as “proves,” “confirmed,” “caused” and “will” require evidence appropriate to the claim. Do not convert a forecast into an outcome, a preprint into established scientific consensus, an allegation into a finding or a company's claim into an independent fact. Do not average conflicting counts. Attribute differences with dates, definitions and unresolved limitations. Date of event, date of source publication and date of retrieval are separate fields.

High-risk stories include elections, active conflicts, public-health claims, legal allegations, market-moving claims and serious claims about identifiable people. They require two distinct human approvers and explicit risk review. No personalized medical, legal or investment advice is offered. Warnings, names and graphic imagery are minimized to what is justified for the story. Accuracy and transparent correction principles are informed by established newsroom standards, without implying affiliation. [R11, R12]

## 4. Scope and prioritization

Launch contains the complete reader-to-editor publishing loop, not just a landing page. Features labeled Launch below are mandatory. V1 adds opt-in communication, quarantined reader suggestions and separately validated additional languages. V2 ideas are intentionally not implementation commitments: collaboration, monetization, audio, limited automation and article-scoped questions need their own release decisions. No unfinished navigation or “coming soon” controls appear in the launch product.

### Feature specifications

### F01 | Editorial home and discovery | Launch

**Primary actor:** Visitor.

Show an editor-ranked lead, latest published syntheses, desk navigation and a clear edition timestamp. Cards disclose story state, updated time, reading length and evidence-source count. Default order is editorial significance plus freshness, not predicted outrage. Use explicit Load more with URL-restorable pagination.

**Exceptions and boundaries:** Never label a cached feed as live. A partially failed feed retains usable sections with last successful refresh; no promotional card may masquerade as editorial news.

**Acceptance:** AT-F01-1: A visitor can open a complete article and its sources without signing in. AT-F01-2: Returning from an article restores the same feed position and filters.

**Trace:** SC01; FL01; P05.

### F02 | Topic hubs and story trails | Launch

**Primary actor:** Visitor.

Provide World, Business, Technology, Science, Climate and Culture desks. Each hub has a concise scope, latest stories and related ongoing-story trails. Editors can tag multiple topics but designate one primary desk. Follow is separate from browsing.

**Exceptions and boundaries:** An empty desk explains that no synthesis is ready; it must not fill space with unreviewed items. Rename redirects preserve old topic URLs.

**Acceptance:** AT-F02-1: A published article appears under every assigned topic without duplicate cards in one list. AT-F02-2: A multi-event story trail distinguishes dates and links each article.

**Trace:** SC02; FL02; P05.

### F03 | Search and meaningful filters | Launch

**Primary actor:** Visitor.

Search only public published title, deck and article text, with topic, date range and source-type filters. Offer relevance and newest sort; preserve query in the URL. Source-type means a cited evidence source, not an uncited related video. Search results show matching context and current publication state.

**Exceptions and boundaries:** Zero results give a clear-filter action. Typos may receive a suggestion, never a silently substituted query. Retracted text and unpublished drafts must not leak in snippets.

**Acceptance:** AT-F03-1: A video-evidence filter excludes articles containing only a related video link. AT-F03-2: An unauthorized search never returns drafts, private annotations or raw licensed text.

**Trace:** SC03; FL03; P05.

### F04 | One coherent, versioned article | Launch

**Primary actor:** Visitor.

Publish a neutral headline, explanatory deck, key developments, coherent narrative, context, evidence gaps and bottom bibliography. Standard reading mode targets 650-950 words; Brief targets 150-250. These are editorial guides, not padding quotas. Both are pre-generated, reviewed variants of the same immutable version.

**Exceptions and boundaries:** Switching length changes neither factual stance nor evidence cutoff. Small stories may be shorter. Analysis is labeled separately from reporting; the system does not invent an opinion columnist.

**Acceptance:** AT-F04-1: Both variants show the same version, cutoff and correction status. AT-F04-2: Every factual statement, including the headline, deck and key points, has reviewed evidence linkage.

**Trace:** SC04; FL04; P05.

### F05 | Inline citations and mandatory bottom sources | Launch

**Primary actor:** Visitor.

Place linked citation markers at claim or paragraph boundaries. The end-of-article Sources and evidence section is rendered in full in initial HTML, never hidden behind login, a drawer or an accordion. Each entry names the exact article/document/video, publisher or channel, canonical link, available author, publication time, access-check time and evidence role.

**Exceptions and boundaries:** Missing author/date is explicitly unavailable. Do not invent metadata, use homepages instead of exact items, or claim a linked page was read when it was not. Related links appear in a separately labeled section.

**Acceptance:** AT-F05-1: Every citation marker resolves to a bibliography entry and every cited item has a safe direct URL. AT-F05-2: With JavaScript disabled, all source links remain visible and operable at the article bottom.

**Trace:** SC04, SC05; FL05; P05.

### F06 | Video-supported synthesis and timestamp links | Launch

**Primary actor:** Visitor / Editor.

Support YouTube links and eligible embeds, plus evidence from independently permissioned publisher transcripts. Name the video and channel, identify transcript provenance and add a timestamp only where reliable segment alignment exists. A related video without permitted evidence remains a watch link, not support for a factual claim.

**Exceptions and boundaries:** No arbitrary public-video transcript promise. API captions, cross-channel API-data synthesis and downstream uses require a reviewed permission path. Video removal preserves an availability notice, not an unauthorized cached copy.

**Acceptance:** AT-F06-1: A supplied, licensed transcript can support a claim with a validated timestamp. AT-F06-2: An unpermissioned video cannot enter the evidence corpus or be counted as a supporting source.

**Trace:** SC04, SC05, SC20; FL06; P03.

### F07 | Agreement, disagreement and source independence | Launch

**Primary actor:** Visitor / Editor.

Offer an evidence view organized by specific claims: corroborated, attributed, disputed or unresolved. Explain concrete differences in dates, units, definitions and reporting. Count independent reporting origins, not URLs; owner relationships and syndication are visible to reviewers. Do not create a numeric truth score.

**Exceptions and boundaries:** Several outlets repeating one wire report count as one origin. Conflicting numbers are attributed with time and scope, not averaged. More viewpoints do not imply equal evidential strength.

**Acceptance:** AT-F07-1: A three-URL syndication fixture displays one reporting origin. AT-F07-2: A disagreement retains both supported positions with appropriate attribution and uncertainty.

**Trace:** SC05, SC19, SC20; FL05; P04.

### F08 | Version history and visible corrections | Launch

**Primary actor:** Visitor.

Display published time, substantive update time, evidence cutoff and revision number separately. A history page explains material changes and corrections. Older safe versions may be viewed with a prominent historical banner; unsafe or rights-withdrawn text is unavailable with an explanatory tombstone.

**Exceptions and boundaries:** Do not silently replace a material fact or refresh timestamps merely for SEO. An already open article offers an update banner rather than replacing text mid-read.

**Acceptance:** AT-F08-1: Changing an approved fact produces a new version and a public change note. AT-F08-2: A saved old-version URL remains meaningful after a correction or redaction.

**Trace:** SC06, SC04; FL10; P06.

### F09 | Related coverage and sharing | Launch

**Primary actor:** Visitor.

Recommend up to three contextually related published stories after the complete bibliography. Provide Copy link and native-share fallback, with optional claim-anchor links. An ongoing-story link is explicitly different from another source used in the current article.

**Exceptions and boundaries:** No infinite article scroll or source section displaced by recommendations. Copy failure exposes a selectable URL. Shared links point to public canonical pages, never admin previews.

**Acceptance:** AT-F09-1: A share link opens the same public article on a fresh session. AT-F09-2: Recommendations appear after all bibliography entries on mobile and desktop.

**Trace:** SC04; FL04; P05.

### F10 | Reading controls and accessibility | Launch

**Primary actor:** Visitor / Member.

Support Light, Dark and System themes; small/standard/large reading type; reduced motion; keyboard navigation and readable narrow layouts. Save anonymous presentation preferences locally where available and member preferences to the account. Reading content is never dependent on animation.

**Exceptions and boundaries:** Blocked storage falls back to session defaults. Reduced-motion operating-system preference wins over decorative animation; source anchors move instantly. Sticky controls must not obscure focus.

**Acceptance:** AT-F10-1: Article, citation and settings flows work at 200% zoom and narrow reflow. AT-F10-2: Reduced-motion mode removes movement without hiding information or actions.

**Trace:** SC04, SC12; FL04; P05.

### F11 | Accounts and secure sign-in | Launch

**Primary actor:** Visitor / Member.

Offer Google OIDC and email magic-link sign-in without requiring YouTube permissions. Verify email ownership, link identities only after reauthentication, and restore the original save/follow action. Staff use separate authorization and mandatory multifactor authentication.

**Exceptions and boundaries:** Expired/used links can be resent subject to throttling. Email responses do not reveal whether an account exists. Reader sign-in never grants editorial privileges.

**Acceptance:** AT-F11-1: A saved-action intent survives sign-in and executes once. AT-F11-2: Replayed magic links fail safely and external return URLs are rejected.

**Trace:** SC09, SC10, SC11, SC12; FL07; P02.

### F12 | Saved reading list | Launch

**Primary actor:** Member.

Save and unsave an article idempotently; show a private list with saved date and current correction/retraction state. Save the first-seen version identifier for context but open the current safe version by default. Basic list sorting is newest-saved or latest-updated.

**Exceptions and boundaries:** Optimistic save rolls back on failure. Deleted or retracted articles remain clearly marked list entries until removed. Saving does not create an offline copy of source materials.

**Acceptance:** AT-F12-1: Two concurrent save requests produce one bookmark. AT-F12-2: Another user cannot discover, enumerate or modify the list.

**Trace:** SC11, SC04; FL08; P05.

### F13 | Explicit follows and a personal feed | Launch

**Primary actor:** Member.

Let members follow topics and choose For you or Editorial home. Personal ranking is deterministic topic matching plus editorial priority and recency. Show why a story appears and provide reset. Default to a balanced editorial feed for new accounts.

**Exceptions and boundaries:** No inferred political, religious, health or other sensitive profile; do not infer interests from private reading history. No-follow state remains useful.

**Acceptance:** AT-F13-1: Changing follows affects For you without altering published article text. AT-F13-2: Reset deletes follows and returns to the editorial default.

**Trace:** SC01, SC02, SC10, SC12; FL09; P05.

### F14 | Opt-in digests and story alerts | V1

**Primary actor:** Member.

Provide daily or weekly topic digests and explicit story-update alerts with timezone, quiet hours, frequency caps and one-click unsubscribe. A digest groups published articles and preserves exact version and source links. It is a separate release, not a hidden launch dependency.

**Exceptions and boundaries:** Corrections may merit a clearly identified follow-up; prevent duplicate deliveries. Suppressed, retracted or unsent versions are excluded at send time.

**Acceptance:** AT-F14-1: Repeated delivery jobs send one message per user, edition and channel. AT-F14-2: Unsubscribe immediately suppresses queued nonessential messages.

**Trace:** SC13; FL14; P08.

### F15 | Source directory and methodology | Launch

**Primary actor:** Visitor.

Publish a directory of approved source organizations and channels, topic scope, ownership disclosures where verified, selection rationale, limitations and last review date. Explain evidence-source versus related-link status, AI assistance and human review. Inclusion is not a blanket accuracy guarantee.

**Exceptions and boundaries:** No unverified prestige badges or paid rankings. Suspensions affect future sourcing while historical attribution remains accurate where retention is permitted.

**Acceptance:** AT-F15-1: Every active evidence source has a reviewed profile and rights record. AT-F15-2: A visitor can understand how sources and independent origins are counted.

**Trace:** SC07, SC08, SC15; FL11; P03.

### F16 | Report an issue and request a correction | Launch

**Primary actor:** Visitor / Member.

Allow an article/version/claim-specific report for factual error, misleading synthesis, broken attribution, harmful content or rights concern. Optional contact email, evidence URL and short explanation; acknowledge receipt with a non-enumerable tracking token. Staff triage by severity.

**Exceptions and boundaries:** Rate-limit abuse without preventing urgent rights reports. No promise of anonymous secrecy if contact details are provided. Never expose reporter email in public correction notes.

**Acceptance:** AT-F16-1: A report retains the exact version and claim the visitor saw. AT-F16-2: A resolved correction links its private report to a public, non-identifying change note.

**Trace:** SC14, SC21; FL10; P06.

### F17 | Public discovery, metadata and machine-readable sharing | Launch

**Primary actor:** Visitor / Operator.

Serve complete public article HTML, stable canonicals, sitemaps and original social previews. Structured metadata must reflect the visible article, genuine byline and material timestamps. Drafts, internal source bodies, filtered search variants and previews are not indexable.

**Exceptions and boundaries:** Do not imitate source-publisher authorship or reuse unlicensed news imagery. A source link is direct; outbound measurement must not break it.

**Acceptance:** AT-F17-1: The social preview identifies The Aggregator, not a source outlet. AT-F17-2: A crawler without JavaScript reads the article and its full bibliography.

**Trace:** SC01, SC04; FL01; P05.

### F18 | Source onboarding and credibility governance | Launch

**Primary actor:** Source curator / Rights reviewer.

Verify exact domain/channel identity; assess corrections, named responsibility, original reporting, topic expertise, conflicts and ownership. Approve per topic and access method. Review every 90 days or sooner after a material incident. Record reasoned decisions rather than an opaque reputation score.

**Exceptions and boundaries:** A famous organization still needs item-level verification. A publisher-owned channel is not automatically an independent corroborator. Rights approval and editorial approval are separate decisions.

**Acceptance:** AT-F18-1: An expired or suspended approval blocks new evidence intake. AT-F18-2: A changed channel identity triggers review rather than silent reassignment.

**Trace:** SC17, SC18; FL12; P03.

### F19 | Permission-aware ingestion | Launch

**Primary actor:** Operator.

Discover via approved RSS/Atom, licensed APIs, approved publisher pages and licensed document inputs. Apply independent permissions for discovery, fetch, retention, model processing, excerpt display, synthesis and media. Retain immutable provenance and source-provided dates separately from retrieval time.

**Exceptions and boundaries:** RSS availability, robots access, a subscription or citation alone does not establish reuse rights. Denied items become metadata-only or rejected; never bypass authentication or a paywall.

**Acceptance:** AT-F19-1: No body reaches a model without an active, scoped processing and synthesis grant. AT-F19-2: An adapter failure cannot create a publishable empty article.

**Trace:** SC18, SC22; FL12; P03.

### F20 | Documents and permissioned transcripts | Launch

**Primary actor:** Editor / Operator.

Accept authorized text/PDF documents and publisher-supplied transcripts with original location, issuer, license, language, checksum and page/segment locators. Separate original content from extraction and translation outputs. Review extraction quality before evidence use.

**Exceptions and boundaries:** Scanned or corrupt documents require review or rejection; unsupported OCR cannot silently create facts. Transcripts lacking time alignment receive video links without fabricated timestamps.

**Acceptance:** AT-F20-1: A PDF claim retains the original page locator. AT-F20-2: A speaker change or unreadable number is surfaced as a review issue.

**Trace:** SC18, SC20; FL06; P03.

### F21 | Deduplication and event clustering | Launch

**Primary actor:** Editor / Operator.

Normalize URLs conservatively; deduplicate exact content separately from event clustering. Group reports by entity, event, location and time, retaining revisions and independent reporting origins. Editors can split and merge clusters with an audit trail and stale-draft invalidation.

**Exceptions and boundaries:** Same entity does not imply same event; recycled old stories remain dated. Similarity thresholds are calibrated against a labeled set, not presented as universal truths.

**Acceptance:** AT-F21-1: A recurring-announcement fixture does not merge different dates into one event. AT-F21-2: A cluster merge preserves all source histories and marks existing drafts for revalidation.

**Trace:** SC19; FL13; P04.

### F22 | Evidence extraction and claim provenance | Launch

**Primary actor:** Editor.

Create atomic claims with subject, proposition, date/time, units, attribution and risk. Link to exact source versions and evidence spans; mark supports, contradicts or context. Preserve quote boundaries and original language. Claim edits invalidate prior validation.

**Exceptions and boundaries:** Text existence is not proof of support. Headlines and video descriptions cannot substitute for unseen reporting. Documents making allegations are evidence of the allegation, not automatically of its truth.

**Acceptance:** AT-F22-1: An unsupported numeric/date/entity claim blocks publication. AT-F22-2: A reviewer can navigate from every factual block to the exact supporting span.

**Trace:** SC20, SC05; FL13; P04.

### F23 | Grounded synthesis and quality checks | Launch

**Primary actor:** Editor.

Generate structured drafts from an approved evidence pack only. Resolve citation IDs to URLs server-side. Check material-claim coverage, factual entailment, quotations, contradiction handling, date consistency, duplication and excessive text overlap. Show AI assistance and human reviewer on published output.

**Exceptions and boundaries:** No model browsing, tools, arbitrary URL generation or source-driven instructions. Failed checks produce a reviewable failure, never a best-effort auto-publication.

**Acceptance:** AT-F23-1: An injected instruction in a source cannot alter the workflow or access secrets. AT-F23-2: Re-running the same evidence/prompt/model request is traceable and cannot create duplicate published versions.

**Trace:** SC20; FL13; P04.

### F24 | Editorial workbench and publication | Launch

**Primary actor:** Editor / Publisher.

Provide source/evidence and draft panes, validation findings, version diff, assignment, preview and approve/publish actions. Publish requires at least three eligible evidence items across at least two independent reporting origins and one human approval. High-risk stories require two distinct human approvers. No exception bypass at launch.

**Exceptions and boundaries:** Approval is bound to an exact content-and-evidence hash and expires on edits. Provider outages or missing rights hold publication. Two reviewers may share a desk but not an identity.

**Acceptance:** AT-F24-1: A stale approval cannot publish an edited draft. AT-F24-2: Publish atomically makes exactly one version current and emits an invalidation event.

**Trace:** SC16, SC20; FL13; P06.

### F25 | Updates, retractions and rights withdrawal | Launch

**Primary actor:** Publisher / Rights reviewer.

Re-ingestion can propose an update but never silently overwrite a published version. Distinguish normal update, correction, withdrawal and legal redaction. Revalidate all dependent claims when a source changes or rights expire; suspend affected text and purge caches when required.

**Exceptions and boundaries:** Remove restricted raw text and derivatives according to the applicable grant; provenance hashes do not justify keeping prohibited text. Public tombstones expose only lawful minimal information.

**Acceptance:** AT-F25-1: A withdrawn sole supporting source prevents continued publication of the unsupported claim. AT-F25-2: The same withdrawal affects brief, standard, preview, search and queued digest representations.

**Trace:** SC21, SC06; FL10; P06.

### F26 | Operations and cost controls | Launch

**Primary actor:** Operator.

Show connector health, queue age, dead letters, failure reasons, evidence throughput, model tokens/cost, publication lag and deletion work. Retry with bounded backoff; allow safe replay, pause and per-source/global generation kill switches. Jobs and budgets are visible separately.

**Exceptions and boundaries:** Provider quota exhaustion pauses that provider without destroying the queue. Replay requires an audit reason and preserves idempotency. Budget figures are measured usage, not model estimates.

**Acceptance:** AT-F26-1: A poison item is quarantined after bounded retries while other work continues. AT-F26-2: An operator can stop generation without taking down public reading.

**Trace:** SC22, SC23; FL15; P07.

### F27 | Staff roles, permissions and audit | Launch

**Primary actor:** Administrator.

Separate Reader, Editor, Publisher, Source curator, Rights reviewer, Operator and Administrator capabilities. Require staff MFA, least privilege, reasoned sensitive actions and an append-only application audit trail. Administrator is not a shortcut around editorial gates.

**Exceptions and boundaries:** Role changes invalidate privileged sessions. Audit log does not include credentials or unnecessary source bodies. Emergency withdrawal may be immediate and must be reviewed afterward.

**Acceptance:** AT-F27-1: An operator cannot publish and an editor cannot grant themselves a role. AT-F27-2: Every rights change, approval, publication and deletion has actor, timestamp and correlation ID.

**Trace:** SC24; FL16; P02.

### F28 | Privacy, export and retention | Launch

**Primary actor:** Member / Rights reviewer.

Collect minimum account and explicit preference data. Offer account export and deletion, session revocation, optional analytics consent where applicable and a readable policy. Separate account retention from source-license retention; delete derived restricted content as well as original blobs.

**Exceptions and boundaries:** Deletion can retain minimally necessary lawful audit records after identity minimization. Do not promise one worldwide legal deadline; jurisdictional counsel determines obligations. Backups replay deletion tombstones on restore.

**Acceptance:** AT-F28-1: A deleted account cannot sign in or receive future optional messages. AT-F28-2: Export contains only that member’s information and expires after 24 hours.

**Trace:** SC12, SC25; FL17; P07.

### F29 | Product and editorial-quality analytics | Launch

**Primary actor:** Product owner / Editor.

Track engaged reading, source exploration, save/follow use, correction severity, claim-support audits, failed sourcing and editorial time. Use minimal first-party events and aggregate reporting. Define each metric and denominator before interpreting dashboards.

**Exceptions and boundaries:** A long page view is not comprehension; clicks are not truth. Exclude staff/bots where reliably identified and do not store raw search queries by default.

**Acceptance:** AT-F29-1: Metric dashboards show sample sizes and event definitions. AT-F29-2: No ranking or source-approval decision is based solely on clicks or popularity.

**Trace:** SC23; FL15; P07.

### F30 | Security and abuse resistance | Launch

**Primary actor:** All roles.

Protect URL ingestion against SSRF, parsers against hostile files, article rendering against XSS, auth against replay and endpoints against abuse. Isolate model inputs and credentialed tools. Allowlist schemes/domains by adapter; recheck DNS and redirects at connection time.

**Exceptions and boundaries:** Manual editor URLs are also untrusted. No arbitrary public upload or URL-fetch endpoint at launch. Suspicious inputs are quarantined without reflecting executable HTML.

**Acceptance:** AT-F30-1: Private-network and cloud-metadata URLs remain unreachable through redirects and DNS changes. AT-F30-2: Cross-user authorization and malicious-source regression tests pass before release.

**Trace:** SC14, SC18, SC22; FL12; P07.

### F31 | Reliability, performance and inclusive delivery | Launch

**Primary actor:** All roles.

Target 99.9% monthly public-read availability, p75 LCP <=2.5s, INP <=200ms and CLS <=0.1 on measured supported traffic. Target WCAG 2.2 AA, keyboard and screen-reader usability. Serve stale safe published content during non-critical outages and preserve attribution.

**Exceptions and boundaries:** These are acceptance targets, not existing measurements. Rights withdrawal and retractions override stale-content availability. Launch cannot claim accessibility certification from automated scans alone.

**Acceptance:** AT-F31-1: A simulated generation outage leaves approved articles readable. AT-F31-2: A restore drill meets 24-hour RPO and 4-hour RTO without resurrecting deleted content.

**Trace:** SC26; FL18; P07.

### F32 | Reader source suggestions | V1

**Primary actor:** Member.

Accept a suggested source URL into a quarantined editorial queue with reason and related story. Staff evaluate rights and credibility before fetching or using content; no user-triggered public synthesis.

**Exceptions and boundaries:** Unknown hosts remain untrusted. Repeated suggestions deduplicate and do not boost ranking.

**Acceptance:** AT-F32-1: A submitted URL is never automatically fetched by the public API. AT-F32-2: Rejection does not expose internal risk notes.

**Trace:** SC27; FL19; P08.

### F33 | Additional languages | V1

**Primary actor:** Visitor / Editor.

Add interface translation and separately reviewed translated article variants after language-specific evidence and QA evaluation. Store language, original evidence, translator/model provenance and separate version approval. Offer language fallback explicitly.

**Exceptions and boundaries:** Never imply machine translation was original reporting; ambiguous quotes retain the original and an identified translation. RTL needs its own validated layouts.

**Acceptance:** AT-F33-1: Changing language does not change article identity or silently mix evidence dates. AT-F33-2: Unavailable translations fall back with a clear notice.

**Trace:** SC04, SC12; FL04; P08.

### F34 | Collaborative collections | V2

**Primary actor:** Member.

Introduce named private collections and invite-based collaboration only after access-control design. Basic bookmarks remain the launch capability.

**Exceptions and boundaries:** No public reading history; revoking an invitation removes access.

**Acceptance:** AT-F34-1: Collection authorization tests include revoked and expired invitations.

**Trace:** SC28; FL08; P09.

### F35 | Paid products and sponsorship | V2

**Primary actor:** Product owner.

Evaluate paid research workflows, business digests or clearly separated sponsorship after validation. Source attribution and public methodology remain free. Pricing, billing provider, tax and entitlement models require a separate approved addendum.

**Exceptions and boundaries:** Payment must not influence source credibility or create unauthorized resale of provider data.

**Acceptance:** AT-F35-1: An entitlement cannot conceal required source citations or charge solely for an embedded YouTube video.

**Trace:** SC29; FL20; P09.

### F36 | Audio briefings | V2

**Primary actor:** Member.

Offer clearly labeled synthetic narration of the product’s own approved articles only after rights, pronunciation and accessible transcript checks. Keep visible source links with the audio edition.

**Exceptions and boundaries:** No voice cloning of journalists or extraction of YouTube audio. Corrections invalidate stale narration.

**Acceptance:** AT-F36-1: Audio is bound to a published version and has a complete text alternative.

**Trace:** SC04; FL04; P09.

### F37 | Constrained automatic publishing | V2

**Primary actor:** Publisher.

Consider automation only for explicitly approved low-risk desks after calibrated evidence-quality evaluation, shadow operation and a documented rollback decision. Launch remains human-approved.

**Exceptions and boundaries:** High-risk stories remain human-reviewed; automation never bypasses source independence, rights or citation gates.

**Acceptance:** AT-F37-1: The automation flag defaults off and can be stopped independently.

**Trace:** SC24; FL13; P09.

### F38 | Ask about this article | V2

**Primary actor:** Visitor / Member.

Explore article-scoped questions with answers grounded only in the selected safe published evidence pack, citations and refusal when evidence is insufficient. No open-web agent or personalized high-stakes advice.

**Exceptions and boundaries:** Rights-limited spans cannot be exposed by questions; article corrections invalidate cached answers.

**Acceptance:** AT-F38-1: An unanswerable question produces an evidence-gap message rather than a fabricated answer.

**Trace:** SC04; FL05; P09.

## 5. Source selection and sustainable use

Source suitability is a documented judgment, not a static list of universally reliable brands. Assess identity, editorial accountability, corrections, original reporting, domain expertise, disclosed interests, contextual track record and item-specific evidence. Revisit approval every 90 days and immediately after a significant concern. Review smaller regional or specialist outlets on the same criteria instead of excluding them because they lack global recognition.

An initial procurement shortlist may include Reuters, AP, BBC, AFP, established public-service broadcasters, domain-specialist publications and relevant primary institutions. These are candidates for evaluation, not approved feeds, confirmed licenses, endorsements or a claim that their content is available for commercial synthesis. The launch objective is 25 approved source organizations with no more than 50 endpoints, including up to 10 video channels. Actual coverage is constrained by permissions and editorial capacity.

Maintain separate grants for discovery, full-content retrieval, temporary storage, model processing, derivative synthesis, public excerpts and media display. A paywall subscription, feed or direct link is not used as a substitute for a grant. Legal review must address operating and target jurisdictions; the U.S. fair-use framework is case-specific and has no universally safe word-count formula. This package is a product specification, not jurisdiction-specific legal advice. [R10]

For YouTube, the official caption-download path requires edit permission. Independently licensed publisher transcripts are the launch evidence path; the associated video can be linked or embedded when permitted. Google API data is not silently pooled across unrelated channels for synthesis. The permitted scope must be reviewed against API-data aggregation and downstream-use restrictions before enabling such a connector. An unavailable transcript produces a related watch link, never a claimed summary of unseen content. [R07, R08]

## 6. Planning envelope and operational ownership

The initial engineering envelope is 2,000 discovered metadata items per day, at most 500 permissioned full-content ingestions per day and approximately 20 reviewed published articles per day. Traffic testing assumes 2,000 daily readers and 16,000 page views per day, with a 50-request/second read burst. These are sizing assumptions, not forecasts. Editorial throughput and license costs must be validated before expanding desks.

The product owner approves scope and budget. The editorial lead owns sourcing, risk and correction policies. The technical lead owns architecture, security and release evidence. A named rights/privacy owner approves provider uses and retention; external legal advice is a launch dependency. A designer owns Figma and accessibility specifications; QA owns test evidence. One person may hold multiple responsibilities, but required distinct approvals must be performed by different people.

A launch day needs staff able to review urgent reports and suspend unsafe content. This document does not assume free around-the-clock editorial coverage. Outside staffed hours, generation may continue into a private queue but publication stays held. Urgent safety/rights reports trigger the designated incident channel; clearly state staffed support hours to readers.

## 7. Risks, tradeoffs and excluded behaviors

**Licensing shortfall:** enough links may exist but too little permitted evidence may be available. Mitigation is a small rights-cleared catalog, publisher-supplied transcripts and a no-evidence/no-publication gate, not unauthorized scraping.

**Persuasive hallucination:** fluent output may misstate source facts. Mitigation is atomic claim provenance, deterministic validators, adversarial evaluation and human review. A second model is a useful signal, not an independent guarantee of truth.

**False diversity:** several outlets may repeat one origin. Mitigation is explicit origin tracking, uncertainty when origin is unknown and reviewer-controlled independence counts.

**Cost and editorial bottleneck:** many candidates may not justify synthesis. Filter cheaply before body processing, cap generation, cache unchanged evidence and prioritize significance. Do not cut verification in response to an exhausted budget.

**Stale or unsafe copies:** corrections and rights withdrawals can leave text in caches or search. Use publication-state checks, purge events and retention lineage. Safety withdrawal overrides a stale-content availability fallback.

**Scope inflation:** do not add comments, public user publishing, social-network scraping, custom user feeds from arbitrary URLs, sports betting, financial recommendations, native applications, offline source mirroring, billing or advertising to launch. None is necessary to validate the core promise.

## 8. Release acceptance and unresolved decisions

Launch requires signed source permissions, named editorial owners, the completed Figma critical paths, a working end-to-end article with video and document evidence, passing claim/citation and role tests, measured accessibility/performance evidence, a correction drill and a restore/deletion drill. The implementation release checklist is authoritative for the proof required, not merely a checklist of screens built.

Owner decisions still required: operating entity and launch markets; initial content agreements; editorial staffing; approved AI/data-processing vendors and their retention settings; infrastructure region; budget ceilings; support and legal-contact addresses; and whether the proposed working name is retained. Until these are approved, development uses clearly labeled fictional fixtures or expressly permissioned source samples. No unresolved decision authorizes a public release.


## References

External references were checked on 8 October 2026. Requirements, thresholds, architecture and visual choices are project proposals, not claims of measured performance. Recheck changeable provider terms before implementation.

[R07] YouTube captions.download. Caption downloads require authorization and permission to edit the video. [Open source](https://developers.google.com/youtube/v3/docs/captions/download).

[R08] YouTube API Services Developer Policies. API-data use, aggregation, storage, attribution, playback and scraping restrictions. [Open source](https://developers.google.com/youtube/terms/developer-policies).

[R10] U.S. Copyright Office Fair Use Index. U.S.-specific, fact-dependent framework; attribution is not a universal permission rule. [Open source](https://www.copyright.gov/fair-use/).

[R11] AP news values introduction. Reference for sourcing, independence, accuracy and transparent correction principles. [Open source](https://www.ap.org/about/news-values-and-principles/news-values-introduction/).

[R12] Reuters journalistic standards. Reference for verification, accuracy, corrections and editorial accountability. [Open source](https://reutersagency.com/about/standards-values/).

[R16] WCAG 2.2. Accessibility conformance reference; this project targets AA. [Open source](https://www.w3.org/TR/WCAG22/).
