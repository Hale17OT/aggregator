# Independent source/security sweep 2

Reviewed 2026-10-16, during the integrator's endurance run. This reviewer performed read-only source and saved-log inspection; no emulator commands, Gradle tasks, build, database mutation, full secret scan or authentication journey was run in this sweep. Exact source hashes and baseline checks are in `docs/engineering/flutter-closeout/security-sweep2-source.json`. This is a separate reviewer pass, not owner acceptance or a claim about the final unchanged APK.

## Narrow scanner exception

The new `.gitleaks.toml` allowlist uses `condition = "AND"`: the anchored path must be exactly `docs/engineering/flutter-closeout/baseline.json`, and the detected match must contain a `storageKey` JSON value of 64 lowercase hex characters plus an enumerated media extension. It does not exclude the whole baseline file, all JSON, all hashes, or source credentials. Existing default rules remain enabled.

Independently parsed the actual baseline: **93 asset entries, zero invalid names**. Every storage filename prefix equals its sibling `sha256`, with an allowed extension. This supports treating these current matches as content addresses rather than credentials. The scanner itself does not enforce sibling-hash equality; that assertion belongs to this evidence check, so a future baseline change requires renewed validation. An actual secret deliberately placed in this exact filename-shaped field could be suppressed; the narrow reviewed data context is the justification, not a general claim that high-entropy text is harmless.

Inspected `.cache/flutter-root-secrets-repaired.log`: actual scanner canary rejection and output redaction are reported, followed by a worktree scan with no findings. The helper source creates a fresh synthetic token in `.env.secret-scan-canary`, requires scanner exit 1 and verifies no raw token in output, then removes it. This tests ordinary source-secret detection, not a malicious secret disguised as an allowed media filename. Generated/cache exclusions remain separate pre-existing coverage limitations. No Git history exists to scan.

Inspected `.cache/flutter-root-ci-final.log`: **CI static validation passed; hosted execution not performed**. This review does not relabel either saved execution as independently rerun.

## API and native source review

Re-read native handoff HTTP routes, native/web member transport separation, migration 0012, native member state, bounded API transport, listening synchronization, preferences and startup ordering. No new source-demonstrated **P0/P1** defect was identified in that bounded review.

The reviewed code retains strict registered client/redirect and input schemas; disallows browser-cookie/Origin transport on native exchange; binds browser approval to exact Origin, CSRF, browser token and authenticated web session; hashes exchange secrets; commits before response; discards a connection on ambiguous commit. Member routes authenticate the transport and native client before protected operations, reject mixed credential transport and retain capability checks. SQL consumes one-use handoffs under account/session/handoff locks and checks account version and originating session state. These observations supplement, rather than replace, the earlier isolated adversarial tests.

Native requests capture both credential and generation before asynchronous socket opening, abort stale requests before sending and reject stale responses. Callback state, verifier and handoff are consumed locally; secure-storage writes/deletes are serialized with auth epochs. Logout clears memory immediately and uses separate retirement transport. Startup awaits secure restore before constructing routes and link listeners, so the unguarded restore method is not currently exposed concurrently through normal UI startup. Listening clear suppresses writes/refresh during deletion and validates identity before sending the delete. Video lifecycle and exact-rendition repairs remain covered only by the previously recorded scoped tests unless a later run explicitly re-verifies them.

### Lower-priority contention observation, untested

`exchange_native_handoff` initializes `moment` before acquiring account/session/handoff row locks. Expiration and idle checks therefore use function-entry time if lock acquisition is delayed. A sufficiently long transaction could cause an otherwise valid exchange to complete after its wall-clock expiry. This requires valid code/proof and lock contention; no cross-account bypass or exploit was demonstrated. A future additive migration could refresh the timestamp after acquiring locks, with a deterministic contention-expiry regression test. Do not silently rewrite the already applied migration or claim that this edge was exercised here.

## Limits and verdict

The narrow allowlist is justified by the actual 93 reviewed content addresses and leaves default detection enabled. Existing security repairs remain present in the inspected source. This is not exhaustive penetration testing or a release certification. Native runtime test-library inclusion, root npm's unresolved high findings, full transitive notices, same-device browser flow, physical devices, iOS, screen-reader and subjective listening gates remain separately tracked. The final Android main APK is still pending the integrator's endurance/clean-build sequence; no artifact fingerprint or unchanged-build acceptance is claimed in this sweep.

## Pre-freeze follow-up: media preferences and reproducibility helpers

Read the current source again during the integrator's reader/member instrumentation. No device, browser, build or test was launched by this reviewer. `main.dart` installs the playback preference callback before secure restore; `MediaCoordinator` stores and applies the preferred Radio speed and reapplies it after loading. `ProgrammeVideo` applies its supplied initial speed after initialization. Default Newsroom selection uses explicit identity first, then anchor variant and media treatment, with no story-slug branching. The actual catalogue screen rejects a missing explicit recording rather than substituting the helper's fallback. Clips retains catalogue order and mounts a player only for the selected page; vertical gestures have cancellation/reset paths and bounded first/last navigation. These are source observations, not fresh motion/listening acceptance.

Sleep selection now lives on the coordinator and the Radio page observes it. End-of-story and timer completion reset the selection and pause Radio. Media changes cancel the story-specific target. Account-generation checks remain on progress writes and cached video positions. The review did not establish a new P0/P1 from these changes; rapid platform speed operations and player lifecycle still require actual regression evidence.

Current Gradle constraints and Guava notice label match the previously audited 33.3.1-android / 4.13.2 coordinates. Both JUnit notice copies remain present; registration includes JUnit and Guava. The prior Maven audit remains timestamped evidence, not a newly scanned candidate APK.

`scripts/mobile-repro.ps1` creates a new project-owned snapshot, excludes build/cache/local SDK paths, records copied source hashes, performs offline dependency resolution, rejects lockfile changes, then builds the actual main target. Its report correctly limits the result to a clean project directory using shared installed SDK/Gradle caches, not a hermetic fresh-machine or byte-identical build. Run only after source freeze; copying during edits cannot guarantee one coherent source snapshot. It does not install the resulting APK.

`scripts/fingerprint-flutter-candidate.mjs` hashes apps/packages source, root npm and mobile Pub locks, the web server entrypoint, the main debug APK, and all original baseline media bytes/sizes. It asserts 23 baseline renditions. This is useful preservation/identity evidence, not acceptance or proof of source-to-binary provenance. Its source fingerprint excludes `scripts/`, root configuration (including `.gitleaks.toml`) and the remainder of the built web directory. Final reporting must explicitly state that scope or add separate hashes for the relevant build/review scripts and configuration. Baseline asset checks prove the original assets remain intact; they do not independently assert the current catalogue contains exactly and only those renditions.

## Final review checklist — pending candidate freeze

- Receive final main APK path/hash and frozen source fingerprint from the integrator; independently hash the actual delivered APK before and after payload inspection.
- Scan that APK for the defined credential patterns and bundled programme media; inspect actual Guava/JUnit/font notice entries and hashes. Do not reuse the older APK result.
- Bind fresh test/review logs to this candidate. Preserve failed instrumentation, profile-performance failure, flaky attempts and any repair that invalidates the previous candidate.
- Verify three critical-journey repetitions and two final review sweeps identify the unchanged candidate, separating assisted browser approval from same-device and physical-device evidence.
- Check clean-snapshot reproduction report, unchanged lockfile and source manifest; identify its APK separately if bytes differ.
- Confirm the 23 original programme asset hashes and retained-data checks from actual reports, without asserting device playback of every byte.
- Preserve pending owner acceptance, physical-device, iOS, screen-reader, subjective listening, complete notices and production-release limitations. No final unchanged sweep has been completed by this reviewer yet.
