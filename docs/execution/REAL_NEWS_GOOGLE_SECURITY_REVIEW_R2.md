# Independent security review R2 —17 October2026

Scope: current Google verifier/router, migrations0013/0014, live fetch/feed/policy/repository/registry, source role provisioning, publisher projection callsites, and saved identity/live/upgrade test evidence. Source and evidence inspection only. No product edit, database connection/mutation, Console/account access, test execution or live Google verification. Owner contact/test-user action remains pending; no provider integration pass is inferred.

## Blocking publisher projection finding

**R2-01 — High: runtime source writer can bypass item-specific reviewed text at the public boundary.** In0014 reader_source_items(), the projection checks grant-wide provenance/readerText, version eligibility and runtime-supplied readerLane/itemRightsReviewed flags. Unlike liveDecision(), it never requires the exact scope.items URL/contentHash/decision. An unreviewed item/version stamped with those flags can therefore satisfy the SQL predicate under an active reviewed grant. Removing only one item from a grant's scope does not remove it from this projection. Whole-grant revocation tests do not cover this.

The role model makes this concrete: provision-live-source-role.sql grants agg_live_source INSERT on source_items, source_item_versions, source_payloads and source_observations, while withholding grant modification and editorial publication. The older pipeline role also has source inserts. These roles can declare an approved raw content_hash while inserting arbitrary normalized_text. Merely adding a comparison to the version's declared content_hash or normalized_hash does not prove the body is the reviewed text. A writer can supply both values.

Repair the trusted read boundary with exact item/version review matching plus a reviewed normalized-representation digest recomputed from the actual projected text (and reviewed attribution/headline fields as applicable), or an equivalent narrowly trusted normalization/write path. Keep item metadata from assigning itself publication trust. Ensure reviewed endpoint/source scope is enforced. Add adversarial non-owner tests: unlisted URL/hash, arbitrary normalized body with approved raw hash, forged headline/byline, item-only rights removal and expired/superseded grant. None were executed by this reviewer.

Saved retained-upgrade.json now reports migration0014 applied. Preserve recorded checksums; use an additive migration for SQL repair rather than modifying already-applied history. This finding is not an instruction to mutate the retained database before clone/upgrade verification.

## Google repairs confirmed in source

-0013 start/finish now require Google/provider-verified authorization for link/reauthentication, denying captured-mail/fixture elevation. This narrows supported linking: local-only account recovery remains unavailable, rather than silently merging.
- Reauthentication no longer requires the old session to be under15 minutes; linking retains recentness.
- Finish refreshes clock time after account/session locks and checks idle/absolute expiry, account version and proof. Final attempt consumption remains rechecked under lock. Keep boundary/concurrency tests; source inspection alone is not atomicity proof.
- Profile session list excludes idle-expired and old account-version sessions. Native non-sign-in start now requires exactly one raw Authorization header.
- Provider+sub account resolution, no email upsert, reader-only/null MFA, per-attempt server nonce, nonce verification, pre-auth web CSRF and separated native transport remain. Google cryptographic/network work occurs outside the write transaction. No new demonstrated authentication bypass was identified in this bounded pass.

Remaining authentication evidence gaps: SQL harness directly supplies a fabricated verified subject. It does not exercise signature/JWK verification, HTTP CSRF, concurrent first registration/exchange, live chooser nonce propagation, cancellation/account-switch races, external Google consent or final secure-storage lifecycle. Invalid-credential exchange has no observed per-attempt failure quota in the inspected router; start quotas limit new attempts but do not cap repeated verification against one pending attempt. Review bounded verification concurrency/rate limiting before broader exposure; local loopback operation reduces current exposure but is not a rate-limit test.

## Fetch and role follow-up

Prior IPv6 holes are addressed by denying2001::/23 and3fff::/20 as well as earlier exclusions. fetchSource now enforces exact host/path feed/robots/policy combinations without query strings, checks socket remote address against the vetted resolution, clears DNS timer, rejects disallowed MIME before buffering and returns bounded Retry-After metadata for429. Fixed headers contain no member/Google credentials. These are source observations, not controlled SSRF/TLS/truncation test passes. In-flight DNS itself is not cancelled by the race; concurrency remains a caller responsibility. Redirects still discard validators; conditional/retry/poller behavior needs integration evidence.

Source role grants appropriately omit users/sessions/preferences/articles and grant editing. However provisioning validates unexpected memberships only for agg_live_source_login, not inherited memberships of an already-existing agg_live_source role. Harden repeated provisioning/attestation to reject elevated transitive memberships on both roles; do not describe NOLOGIN/NOBYPASSRLS flags alone as proof of least privilege. No unexpected live role membership was observed because this reviewer did not query the database.

The reader function is SECURITY DEFINER with fixed pg_catalog search_path and qualified objects, PUBLIC execution revoked. New source_bookmarks uses owner RLS and composite saved-version/item FK. This is useful isolation but does not repair R2-01 or prove source permission at each saved/public projection.

## Saved evidence inspected and exact limits

- identity-db.json: passed sequential SQL tests for transport binding, one-use exchange, provider-sub continuity/no email population, older-session reauthentication start, local-mail linking denial, cancellation and direct-table denial. Read the corresponding test-google-identity-db.mjs: no concurrent process/token cryptography/HTTP/device execution is present. Older-session test initiates reauth; it does not complete the entire proof refresh.
- live-db.json and test-live-source-db.mjs: saved actual feed responses, isolated database;13 of25 items imported,12 denied; full grant revocation removes8 and leaves5; no synthesized article_versions; outsider/limited-role access checks. Public counts are queried using the admin connection, not a complete reader HTTP or native journey. Item-level projection tampering is not tested.
- upgrade.json/retained-upgrade.json: reports backup/clone/fresh/idempotent/rollback/preservation and retained upgrade. These were inspected as saved evidence; no independent current target attestation was performed. Original migration checksum preservation remains required for further changes.

Still blocked/not demonstrated here: live Google owner-assisted web/native same-account flow, second/cancelled native attempt in one process, current full acceptance journeys, controlled DNS/redirect/body fault tests, item-specific public projection integrity, correction/withdrawal and polling behavior, final artifact credential scan and owner/human approval. No new rights approval, factual endorsement, synthesis publication permission or release authorization is supplied by this review.
