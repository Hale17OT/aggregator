# Independent security review R4 —17 October2026

Read-only source/evidence follow-up for0018/0019, native-code HTTP, member export, importer/cache/lock behavior and source role provisioning. No implementation or retained data changed; no test, provider credential, Console/account, browser or device access. Live Google remains owner-blocked. Saved evidence is not an independently executed pass.

## R3 repair status

- **Provider deletion resurrection:**0018 retains provider/subject mapping to the deleted users tombstone while clearing provider email claims. The existing Google finish path resolves that user and rejects deleted status instead of creating another. The updated isolated identity test opens a sign-in attempt before deletion and verifies subsequent finish is false, user count is unchanged and provider email claim is removed. This addresses the demonstrated sequential restoration case. Concurrent deletion/sign-in was not tested by this reviewer; provider mapping remains stable while account locking serializes status changes. Explicit future recreation/recovery remains unsupported and must not be implied.
- **Native-code commit handling:** the router now registers a checked-out client error listener, tracks committing, marks ambiguous COMMIT as broken even if rollback succeeds, removes listener and releases with discard. It still commits false verification counters and does not retry uncertain writes. Source repair confirmed; no transport fault injection observed here.
- **Native account/challenge order:**0018 performs a nonlocking challenge precheck, obtains account lock before final challenge FOR UPDATE and revalidates challenge afterward. This removes the previously identified challenge-row-first native redemption edge. Legacy web local-auth ordering and concurrent privacy actions still deserve explicit tests; no old503 is declared explained.
- **Export cost:** exportData now selects only fixed member-owned tables, at most101 rows each, rejects collections above100 and no longer traverses every live source body. Consent export uses the same101 sentinel. These materially bound the earlier large-export path. Reads still occur inside the authenticated account-lock UoW; with these limits it is a small snapshot, not a separate unlocked large-export design. Byte-size and contention tests are still absent.
- **Role inheritance:** provisioning now rejects inherited memberships on agg_live_source as well as unexpected login-role membership. This is a source validation improvement; no current role query was performed.

## Remaining concrete issues

### R4-01 — Changed unreviewed source leaves old public projection available

LiveRepository.importPublisherItem returns denied immediately when liveDecision fails, before looking up an existing source item or recording an observation. If a previously approved item appears in a newly fetched feed with changed raw content hash, exact-review policy correctly refuses the new body, but the old approved observation remains latest/available. reader_source_items can continue presenting it until grant/retention expiry, despite the importer knowing that the original has changed. This can retain superseded or corrected reporting and does not meet the correction-impact gate.

For a known stable item, record a bounded rights-safe superseding/unreviewed-change observation or tombstone sufficient to exclude/label the stale projection without storing/displaying the unreviewed body. Distinguish a changed known item from ordinary RSS disappearance: absence from a finite feed alone is not proof of withdrawal. Test approved A → changed unreviewed B → no misleading available A → reviewed B, including saved/search/edition views. Current whole-grant revocation and malicious-body tests do not cover this path. No source withdrawal was fabricated or executed by this reviewer.

### R4-02 — Export silently truncates active sessions

0019 reader_profile caps sessions at100 without a101 sentinel or truncated indicator; exportData embeds that profile. The export note says larger collections are refused without truncation, but a member with101 active sessions receives an incomplete sessions list and a successful export. Use a bounded export-specific session query with overflow rejection or truthful pagination/truncation semantics. Profile UI may intentionally show a limited recent-session list, but should label it rather than imply completeness. The connected test has only a small account and does not establish this limit behavior.

### R4-03 — Native redemption can commit a user insertion after failed final challenge check

0018 may insert a users row before acquiring/revalidating the challenge row. If a concurrent account deletion removes the challenge while redemption waits at the account/email uniqueness boundary, the final c.id check returns false after a possible new user insertion. The HTTP router intentionally commits false results to preserve rate counters, so preparatory user insertion is not rolled back. This does not issue a session, but can leave an unintended account row after a rejected redemption. Separate rate-counter persistence from account-creation rollback or defer/create within a safely serialized final validation path. Cover deletion/redemption with controlled concurrent transactions; this is a source-identified race, not an executed reproduction.

## Importer and conditional retrieval scope

scripts/live-news.mjs uses an exclusive project-owned wx lock to prevent overlapping invocations, persists a15-minute per-source nextAfter before fetching, preserves bounded429 backoff, caches200 bodies/validators and refuses304 without a cache. Reparsed304 content still passes current exact rights checks; grant expiry is not extended by304. Fetch happens outside source-governance transactions. These are source observations, not proof of crash recovery or concurrent execution. A crash can leave import.lock requiring verified owner recovery; do not delete it merely because another process is slow. Cache/validator state is local and not atomic across crash; retained pending/failed output must remain truthful. Repeated304 imports create observations, not new reviewed reporting.

## Evidence read

connected-http.json contains three passed actual local HTTP runs: native captured-code session, same captured-mail member through web confirmation, CSRF denial, Profile/revision409 synchronization, preferences, science live edition, typed source bookmark, small export and logout. Read check-reader-connected.mjs: its export assertion checks200 and absence of the issued bearer string; it is not a100/101 overflow, exhaustive secret-field or concurrent-export test. These runs use test members and do not exercise retained deletion, live Google, native chooser or physical device.

identity-db.json records the new provider tombstone scenario but explicitly uses fabricated verified-subject SQL input. native-code-db.json records sequential disposable deletion/binding/limits tests, not concurrent deletion/redemption. Earlier R2-01 exact representation protection and isolated forged-body evidence remain relevant; no further public-policy authorization is inferred. Owner Google action, live provider identity, concurrency/fault coverage, final artifact review and human acceptance remain separate open gates.
