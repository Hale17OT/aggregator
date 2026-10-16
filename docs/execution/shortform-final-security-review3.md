# Caption/retry candidate: independent sweep 1

Read-only review, 2026-10-16. This is **sweep 1 of the new native candidate**; previous sweeps inspected different native bytes and are historical for that purpose. No product changes, build, device or browser actions were performed.

Independently hashed `output/shortform-rebuild/aggregator-shortform-local-demo.apk`: **360790112aa8d4e57b5cfc5705a400d237661dff2f197cc5c0d273841942a943**. Confirmed `candidate1-964c.apk` preserves the preceding **964c451e13625a464b989359f3b96eb02c3e8736e0b9c50223efcb2bfb28af78** artifact. The latest reviewed source identities are recorded in `docs/engineering/shortform-review3-source.json`.

Compared the previous review's six-file source set: only native `shortform.dart` differs. Web ClipFeed remains byte-identical to the preceding build6 review snapshot; so the owner-initialization/Save guards and CSS observations in review 2 remain applicable. This is a scoped file comparison, not a claim of exhaustive repository identity.

Read current native source: caption allocation is 84px normally and 176px at enlarged text, inside a retained scroll surface; metadata has its own allocation. A missing article identifier now displays an explicit unavailable/retry message and starts `readSaved()` rather than silently ignoring Save. Identity and operation epoch are still captured before pause and checked before mutation; missing metadata does not fabricate an article ID or authenticated operation. The scrub cancellation guard and actionable rail semantics remain present. Actual short-height/image fit and caption readability are visual gates, not established solely by this source read.

Decoded the actual APK binary manifest and network configuration to `shortform-review3-manifest.txt` / `shortform-review3-network.txt`. Network policy matches the previously reviewed exact-loopback exception and general cleartext denial. No newly demonstrated security regression was found in this bounded change. New full APK security report was not yet present at its expected path when this sweep inspected it; no full payload/credential-scan claim is made for this candidate here.

Read `.cache/shortform-unit-final7.log`: all **37 tests passed**. Read analyzer7 log: no issues. Parsed all three XML files under `output/flutter-closeout/android/shortform-20261016-155816`: each reports one mixed-journey test with zero failures/errors. These are inspected saved runs, not independently rerun tests or proof of byte-identical instrumented/main-entry APKs.

Native Share still reports only chooser opening and cannot distinguish cancellation/delivery. Native progress still rebuilds static metadata/action portions; performance acceptance remains pending. Owner, physical-device, screen-reader, subjective-listening, iOS and release gates remain separate. A second review on unchanged final candidate and its final artifact evidence remains necessary; this report does not combine historical candidates into that gate.
