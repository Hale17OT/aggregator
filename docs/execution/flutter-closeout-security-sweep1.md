# Independent security and dependency sweep 1

Reviewer: separate security-review agent. Date: 16 October 2026. This sweep inspected raw service/device-assisted reports and source, ran a read-only Gradle dependency task, fresh metadata audits and an existing APK payload scan. It is not owner approval, a physical-device test, a same-device browser journey, a release audit or the second unchanged-candidate sweep.

## Evidence identities and boundaries

- Source inspection fingerprints: `docs/engineering/flutter-closeout/security-sweep1-source.json`. This is an explicit source snapshot, not a claim that the historical APK was built from these later files.
- APK snapshot: `.cache/flutter-security-sweep1/app-localdemo-debug.apk`, **219,490,719 bytes**, SHA256 `10c2336ca082effe7995c4f50742fe75ea60dc282ecd3c268d714b3c28bb91a2`. It was copied before concurrent profile rebuilding so the scan had stable input.
- Payload report: `docs/engineering/flutter-closeout/apk-security-sweep1.json`. All 193 ZIP entries/228,737,766 uncompressed bytes were streamed. No MP4/WebM/WAV/MP3/M4A/AAC/VTT payload paths and no matches for the limited literal-session/private-key/credentialed-PostgreSQL patterns were found. This is not comprehensive secret detection, semantic media recognition or decompilation proof.
- Packaged notices actually observed include the three font licenses, Flutter NOTICES.Z, native Guava/Apache notices, accessible Flutter Guava asset and LICENSE-junit.txt. Accessible UI display was not inspected by this reviewer.

## Auth and account evidence review

Read `native-browser-assisted.json` and its actual runner `scripts/check-native-browser-handoff.mjs`. The passing report operates real Android proof initiation, desktop Chrome preflight/browser binding, captured-mail request/GET preview/explicit confirmation/approval, then ADB delivery of the actual one-use callback to Android. Android member completion and a browser refetch verify one Manchester City team follow and a saved story version. The script does not manufacture a bearer or fake browser Origin.

This is correctly labelled **assisted cross-device** evidence. It does not prove Chrome-on-Android approval, external mailbox ownership, physical hardware, iOS or owner acceptance. The runner uses scoped emulator commands and does not print callback credentials. Its reported completion marker is supplemented by real server readback of the saved interest/bookmark, although it is not a complete three-run account failure suite.

Independent earlier tests remain applicable only to their exact snapshots: seven actual two-process HTTP/PostgreSQL adversarial groups, three deterministic history-sync cases and six real-widget/fake-platform video lifecycle cases. Raw logs preserve test-fixture failures and repairs. Source review confirms the identified cross-account request, delayed logout, clear-history refresh and exact-video-key fixes remain present. No new source-demonstrated authentication bypass was identified in this sweep. Do not infer that every failure/platform scenario has been run.

## Dependency findings from the real runtime graph

Executed successfully, without any Gradle build task:

```powershell
# From apps/mobile/android
. ../../../scripts/flutter-env.ps1
./gradlew.bat :app:dependencies --configuration localDemoDebugRuntimeClasspath --console=plain --offline
```

Saved exact output `docs/engineering/flutter-closeout/gradle-localDemoDebug-runtime.txt`; queried its selected coordinates using `audit-native-maven.mjs --dependencies ... --output docs/engineering/flutter-closeout/native-maven-sweep1.json`. **82 Maven coordinates** were audited. This is broader than the prior AAR-manifest-only inventory and preserves its historical findings.

Two material results:

1. Guava resolved to the requested repaired **32.0.1-android**, with no OSV match, but the strict constraint also downgraded media3-common 1.9.2's request for **33.3.1-android**. This unexpected compatibility risk was reported immediately. The integrator subsequently selected 33.3.1-android to align with the real media dependency; that later graph must be verified separately.
2. The resolved graph included **JUnit 4.12 in the application runtime**, matching [CVE-2020-15250 / GHSA-269g-pwp5-87pp](https://osv.dev/vulnerability/GHSA-269g-pwp5-87pp), a TemporaryFolder information-disclosure issue. It was missed by the earlier AAR-only scan. Reachability/exploitation was not demonstrated, but it remains a real dependency match. The integrator subsequently selected 4.13.2; the final selected graph and runtime tests must confirm that repair.

`dependency-repair-candidates.json` records official Maven Central Guava 33.3.1-android POM equality with cache, no OSV matches for that coordinate or JUnit 4.13.2, and upstream Guava release-license equivalence to the bundled Apache text. Metadata and license equivalence do not establish binary compatibility. The original failed assumption that the newer Guava jar embeds META-INF/LICENSE is preserved in `dependency-repair-candidates-first.json`; the newer jar has no such entry, so parent POM plus official release-tag license were used instead.

Fresh Pub audit (`native-pub-sweep1.json`, prior result preserved) covers **110 package records**, with no returned OSV matches. Five SDK-package directories lack separate license files; root Flutter SDK license remains relevant. It is not correct to call those five unlicensed. Pub results do not cover Maven/iOS transitive artifacts. Root npm's 11 high findings remain an independent unresolved release gate.

## Notice repair provenance

At explicit integrator request, this reviewer added only JUnit license/notice assets under `apps/mobile/assets/licenses/` and Android `src/main/assets/native-notices/`. The exact EPL 1.0 text came from `LICENSE-junit.txt` in cached JUnit 4.13.2; its artifact SHA1 matched Maven Central's official checksum. `junit-notice-provenance.json` contains SHA256 and source details. The integrator owns Flutter asset/LicenseRegistry registration. Final APK packaging and actual notice screen remain to be verified after the next build.

## Sweep verdict

**Security repairs inspected; bounded automated evidence exists. Dependency final acceptance remains pending the newly repaired graph/artifact.** The reviewed historical debug APK does not contain programme media files or the specific credential patterns scanned. Old testing-library runtime inclusion, full native legal notice coverage, physical/same-device/owner/screen-reader/subjective listening gates and iOS remain distinct. No production release authorization or claim is made.

The integrator reported a newer profile APK SHA256 `9648085d01886411ab3bb655ee87a3e6bbd6ade58717474cd0dbb0f0a64e812a`; this sweep has not yet independently hashed or inspected that artifact. Its timing run was intentionally left undisturbed. A subsequent audit must use fresh reports and exact artifact fingerprints rather than relabel this historical sweep as the final unchanged-candidate result.

## Follow-up: repaired runtime graph, 2026-10-16 02:00 UTC

After the integrator released the timing window, the same offline dependency-only Gradle command completed successfully in 2.25 seconds. No build task ran. Exact selected output is `docs/engineering/flutter-closeout/gradle-localDemoDebug-runtime-final.txt`, SHA256 `6596345046dab9484bbecac9cafb107ca18a067a5be9145ea65aaa69931230d0`.

The graph now selects **Guava 33.3.1-android** (aligning with media3's request) and **JUnit 4.13.2**. `native-maven-final.json` queried all 82 selected Maven coordinates, returned no matching OSV advisories, and recorded no unresolved Gradle dependencies. Historical vulnerable/downgraded reports remain intact. This verifies dependency selection and metadata at the audit timestamp; it does not prove absence of undisclosed vulnerabilities, binary compatibility, or complete license compliance.

The helper also records existing DEX/manifest hashes, which may predate the new graph. They must not be treated as proof that a final delivered APK contains precisely this graph. Fresh APK identity, notices and payload inspection remain pending the integrator's final build. JUnit license assets and the current source LicenseRegistry registration were inspected; their appearance in that new APK is still a separate check. The reported profile performance failure remains a failure, outside this security repair.
