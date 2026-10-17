# Independent security review R3 —17 October2026

Read-only review of migrations0015–0017, current exact-representation policy/registry, native-code HTTP and SQL, member export/account actions, and saved tests. No database, device, Console or account action was performed. Retained state is reported at17 migrations; all repairs must preserve applied checksums and follow additive clone-tested upgrades. Live Google remains owner-blocked.

## Exact source representation repair

0015 now requires exact reviewed URL/raw hash/text-only decision and recomputes SHA256 from actual normalized_text in SQL. It additionally binds title, author, publication time and endpoint. Current policy proposal has8 GV and5 NASA reviewed items; each includes bodyHash/title/author/publishedAt. Registry supports explicit policyRevision and the live evaluator independently checks representation fields. No new rights or editorial approval is supplied by this review.

Read test-live-source-db.mjs and live-db.json: the adversarial case uses the restricted source client to insert a new version with an approved declared raw hash but arbitrary body, inserts an observation, commits, and then observes the public function omit the item. This meaningfully addresses the earlier R2-01 forged-body finding. Scope removal/hash mismatch and full-grant revocation are separately tested. These are saved isolated test results, not an independent rerun or proof of every title/date/endpoint failure case. The SQL read predicate, rather than runtime review flags, is now the key protection. Original source-policy/extraction limitations remain independent.

## New defects / required follow-up

### R3-01 — High: deleted Google identity can silently recreate a member

0017 delete-account deletes auth_identities. 0013 finish_google_attempt treats absent provider ownership as first registration and inserts a new user. Sign-in attempts have user_id NULL, so deletion's WHERE user_id=u.id does not retire them. A pending valid provider sign-in can complete after deletion and create a new account with the same subject; a later restored Google sign-in can do the same. This contradicts PROFILE-10 and is not covered by the captured-mail deletion test.

Preserve a minimal privacy-reviewed provider deletion tombstone or equivalent deny/recreation-intent contract; do not retain the deleted profile wholesale. Make provider restoration versus explicit account recreation distinguishable, and serialize/revalidate against concurrent sign-in/deletion using consistent lock order. Tests must cover pending attempts, concurrent sign-in, later SDK restore and explicit recovery/recreation policy. No race was executed here.

### R3-02 — Medium: native-code connection failure handling regresses established UoW protection

native-code-http.ts manually begins/commits and releases a checked-out client. It has no checked-out error listener, and broken becomes true only if ROLLBACK itself fails. On ambiguous COMMIT failure, a subsequent successful ROLLBACK can return that client as healthy. Existing PostgresMemberUnit/local-auth/native-auth paths explicitly track commit ambiguity and discard failed clients; reuse that protection while continuing to commit failed-code counters. Never automatically retry the uncertain code redemption. Verify transport failure before/during COMMIT and idle/checked-out client errors with isolated fault injection. No success is currently returned before COMMIT; the defect is connection/ambiguity handling, not a demonstrated duplicate session.

### R3-03 — Medium: export is unbounded inside the account-lock transaction

GET /me/export executes profile, preferences, interests, all bookmarks and all listening rows under unit.run after authentication acquired the users tuple lock. sourceBookmarks additionally computes reader_source_items for the whole current catalogue before mapping that member's saves. No explicit row/byte bound or pagination is present. This violates the brief's bounded export/no-large-export-under-account-lock requirement and can extend contention behind the already documented protected503 failures. Existing query timeout is a failure ceiling, not successful bounded export design.

Move expensive snapshot reads into an owner-authorized bounded path without holding the authentication write lock throughout, revalidate status/version as appropriate, paginate or cap explicit export dimensions and avoid loading all source bodies just to export bookmark identifiers. Preserve owner RLS and no-secret DTOs. Test a large disposable member and concurrent protected action. The current export appears to omit credentials/raw source payloads from its final DTO; that positive observation does not resolve resource/locking behavior.

### R3-04 — Lock-order risk to test

redeem_native_code locks its email advisory key and challenge before acquiring users; reader_account_action holds users before deleting auth_challenges. Concurrent redemption/deletion can therefore wait on each other's row locks. Existing local captured-mail flows have related challenge-first ordering. Add deterministic concurrency coverage and a consistent strategy rather than increasing lock_timeout. This is source-identified risk, not claimed attribution of the observed device503.

## Native code and privacy positive observations / evidence limits

Code requests are restricted to example.test and explicitly local assurance; random eight-digit code,32-byte server HMAC key and challenge/proof-bound verifier are used. Raw code is sent only to the captured mailbox, not returned to the requesting app or SQL. Request/confirm reject browser cookies, Origin and Authorization. SQL rate counters commit even on false redemption, per-email resend rotates previous challenges, and challenge locks provide single-use serialization. Captured code remains neither real mailbox ownership nor external delivery.

0017 requires an owner-bound current/recent non-fixture reader session, exact account version and no staff role; sensitive HTTP actions have explicit confirmation and existing CSRF/native transport checks. Deletion clears listed member tables and sessions while retaining an anonymized users tombstone. Revoke-other is owner-scoped. Unlink is not implemented by these functions. Export includes permitted provider email claims/session metadata but not bearer hashes/Google subjects in the inspected DTO.

native-code-db.json reports wrong-owner/stale deletion denial, local member deletion and preservation of another member, binding/single-use/attempt/expiry/resend checks. Its script is sequential SQL with generated verifier test values; it does not prove HTTP HMAC behavior, concurrency or Google restoration. native-code-http.json reports request202, exchange/session/profile/export200 and replay401 against captured-mail services. No device-completion proof is inferred from that report. Parent reports a device code exchange succeeded but later loading503 was mislabeled as bad code; UI repair is outside this source pass and the original failure must remain recorded.

No live Google acceptance, final APK inspection, normal-speed watching/listening, physical-device pass or production approval is claimed. No implementation or retained data was changed by this reviewer.
