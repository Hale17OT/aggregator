# Native dependency and provenance review — 16 October 2026

Independent agent review of existing build/cache artifacts. No Gradle build, SDK/global edit, package upgrade, source upload or product edit was performed. Public OSV requests contained Maven package names and versions only. This is a partial native inventory and advisory review, not a release certification or exploit test.

## Actual findings

`scripts/audit-native-maven.mjs` queries 47 coordinates observed in the application manifest merger output, plus the installed integration_test Guava declaration and cache. `docs/engineering/flutter-closeout/native-maven-review.json` contains coordinates, cache artifact/POM hashes, license metadata and full returned advisory records. Maven AARs appear in the manifest; this is **not** a full Gradle-resolved JAR dependency graph or SBOM.

Two OSV advisories match `com.google.guava:guava:28.1-android`:

| Advisory | Affected behavior | Recorded remediation |
|---|---|---|
| [GHSA-5mg8-w23w-74h3](https://osv.dev/vulnerability/GHSA-5mg8-w23w-74h3), CVE-2020-8908 | Insecure temporary-directory permissions in `Files.createTempDir` | OSV marks 32.0.0-android as fixed; avoid the vulnerable method or move to a compatible patched dependency after testing |
| [GHSA-7g45-4rm6-3mm3](https://osv.dev/vulnerability/GHSA-7g45-4rm6-3mm3), CVE-2023-2976 | Temporary files in `FileBackedOutputStream` can disclose data to other local users/apps in affected environments | OSV marks 32.0.0-android fixed and notes maintainers recommend 32.0.1 because 32.0.0 has Windows regressions |

These are local-access vulnerability matches, not proof that the Aggregator invokes either vulnerable API or is exploitable on its tested modern Android image. Reachability was not established. Do not dismiss or suppress them merely because integration_test is listed in Pub dev_dependencies.

The current application external DEX (`build/app/intermediates/dex/localDemoDebug/mergeExtDexLocalDemoDebug/classes.dex`, SHA256 `405f74564439d726a831373af4eede569a7e690aafe27147c0688bb15c7b8956`) contains `com.google.common.io.Files`, `FileBackedOutputStream` and `androidx.test.runner.AndroidJUnitRunner` class symbols. The app manifest, not only the instrumentation manifest, merges AndroidX runner/rules/monitor 1.2.0 and Espresso 3.2.0. This proves inclusion in the observed app build inputs; it does not infer the contents of a future release artifact.

The installed SDK's `C:/flutter/packages/integration_test/android/build.gradle.kts` declares AndroidX test runner/rules `1.2+`, Espresso `3.2+` via `api`, and Guava 28.1-android via `implementation`. Its own TODO explicitly says these dependencies should not be added to release builds and links Flutter issue 56591. The app's `androidTestImplementation` pins alone do not remove the plugin's runtime dependency path. No AndroidX advisories were returned for the queried exact coordinates; that means no match in this query, not that these old libraries are validated safe or appropriate for release.

The earlier Pub report queries 104 package records and reports no displayed advisory matches. It cannot substitute for Maven/native auditing. The root npm report's 11 high findings remain a separate unresolved release gate.

## Compatible mitigation path

1. Preserve the currently installed SDK and passing instrumentation configuration while tests are running. Do not globally edit Flutter's integration_test package, auto-upgrade AndroidX, or add a broad Gradle `force` rule and call the risk resolved.
2. For the delivered non-instrumented candidate, produce a separate clean build configuration whose native dependency graph excludes integration_test and its testing-only runtime libraries. A reviewed separate test harness/package or controlled build manifest is preferable to editing the global SDK. Preserve lockfiles and show exact graph/artifact differences. This is a proposed isolation change, **not implemented or verified here**.
3. If Guava is still required by legitimate runtime code, use a narrowly scoped project dependency constraint on a reviewed patched **Android** flavor (at least the advisory's patched range; 32.0.1-android avoids the noted 32.0.0 Windows regression). Confirm API/SDK compatibility, instrumentation and media/auth regressions before adopting it. Do not substitute the JRE flavor blindly, suppress advisory records, or claim an untested override is compatible.
4. Once instrumentation is idle, capture `localDemoDebugRuntimeClasspath` and the intended deliverable/release runtime graph with `dependencyInsight` for Guava/AndroidX test. These Gradle commands were **not run in this review**. Inspect the final APK's DEX/manifest, with APK fingerprint, to prove that testing code was excluded or patched; a cache entry disappearing is not proof.
5. Retain these two advisory findings as open until that artifact evidence exists. No production signing/store submission is authorized. Existing server/runtime npm high findings still prevent production release even if native dependencies are repaired.

## License and notice availability

- 46 of 47 queried coordinates have direct cached POM license metadata. Guava's module POM lacks direct license metadata, but its cached `guava-parent:28.1-android` declares Apache License 2.0; parent POM SHA256 is recorded in the JSON report. This is inherited metadata, not a missing-license conclusion.
- Pub's two apparent per-directory license gaps are SDK packages `flutter_test` and `flutter_web_plugins`. The installed SDK root `C:/flutter/LICENSE` supplies Flutter's BSD-style terms; package-directory absence alone does not mean those components are unlicensed. Carry the SDK notice appropriately.
- Existing Flutter `NOTICES.Z` was decompressed read-only (1,422,071 decoded bytes). It contains the Flutter Authors notice; case-sensitive searches did not find `guava`, `androidx` or `integration_test`. This does **not** prove full APK license noncompliance: other APK resources/native artifacts may carry notices. It does show that Dart's generated notices file alone does not establish complete native notice coverage.
- Fonts have their three license files declared as bundled assets. Full legal approval, required NOTICE text preservation for transitive native libraries, final APK contents and an accessible in-app notices screen remain separate verification tasks. POM availability and SHA256 inventory are useful provenance, not completed legal review.

## Android and iOS release boundaries

Android source has `allowBackup=false`, cleartext denied in main and a loopback-only localDemo network-security overlay. Necessary network/wake-lock/media foreground-service permissions were observed, without microphone/location/contact permission. The media service/receiver are exported for system media integration; this review did not exercise hostile third-party intents or certify that boundary. The current product defines localDemo and production flavors, no configured production signing identity, and a Dart local-demo-only transport guard. A test/debug artifact is not a production signing or security claim.

iOS source currently includes audio background mode, disabled Flutter automatic deep linking and the custom callback scheme. The project targets iOS 13.0 and uses automatic signing placeholders. This Windows review has not produced an iOS dependency resolution, Podfile.lock/Package.resolved, linked native frameworks, entitlements/keychain proof, simulator/device binary, callback test or background audio test. The checked-in tree has no resolved iOS dependency lock in the inspected paths. The main plist includes the local callback scheme; verify local-demo versus production configuration explicitly on Mac instead of assuming Android flavors apply to iOS. Local loopback networking, secure-storage capability/backup behavior and actual current plugin deployment constraints must be tested with the installed Flutter-compatible Xcode workflow. No iOS completion claim is justified by source/configuration alone.

Verified read-only audit command from repository root:

```powershell
. ./scripts/stability-env.ps1
& $aggregatorNode scripts/audit-native-maven.mjs
```

Verdict: partial native provenance/advisory inventory completed; two Guava advisory matches and final native notices/release-graph gates remain OPEN. No package/security gate was disabled or automatically upgraded.

## Authorized scoped repair (not yet built)

At the integrator's explicit request, added strict project-local Guava `32.0.1-android` dependency constraints for `implementation` and `androidTestImplementation` in `apps/mobile/android/app/build.gradle.kts`. This does not edit the installed SDK, use a broad resolution force or substitute the JRE artifact. A conflicting incompatible runtime requirement will fail resolution rather than silently select a different version. The constraints do not themselves prove compatibility or eliminate the integration_test runtime inclusion concern.

Added Android-native packaged assets `app/src/main/assets/native-notices/APACHE-2.0.txt` and `GUAVA.txt`. The Apache license text was copied exactly from `META-INF/LICENSE` in the existing cached Guava 32.0.1-jre artifact solely as a license text source; no JRE bytecode is included by this step. The selected Android artifact's metadata and any additional NOTICE must still be compared after resolution. These native assets do not establish that an accessible in-app notice screen exposes them.

No Gradle resolution/build/instrumentation was run by the reviewer during this repair. Integrator verification must:

1. Resolve application and instrumentation runtime configurations and confirm **32.0.1-android**, no 28.1 or JRE substitution. Capture `dependencyInsight`/runtime graph with source identity.
2. Build the exact local-demo app and instrumentation against the installed SDK; rerun auth, media and existing critical journeys without changing gates.
3. Query OSV for the actual selected coordinate and compare the Android artifact license/NOTICE with the packaged texts; inspect final APK notice paths and DEX/dependency fingerprints.
4. Preserve the earlier two findings as historical evidence and change only the repaired artifact's status after fresh verification. Continue to report testing-library runtime inclusion, incomplete full native inventory, iOS gates and root npm findings separately.

## Resolved-graph audit helper update

`audit-native-maven.mjs` now requires `--dependencies PATH` pointing to an actual single-configuration Gradle runtime dependency report. It reads the **selected** version after `->` rather than the requested version, handles strict constraints and repeated subtrees, flags failed/unresolved rows, and rejects conflicting selected versions from mixed configurations. It no longer hardcodes Guava 28.1. Guava parent-license lookup uses the selected version. The output defaults to `native-maven-resolved-review.json`; overwriting historical `native-maven-review.json` is explicitly refused.

The reviewer executed `node scripts/audit-native-maven.mjs --self-test`: replacement, strict constraint, repeated subtree, failed-resolution and conflict parser cases passed. No Gradle graph/build or live audit of the newly constrained artifact was run during concurrent instrumentation. Once the integrator supplies a runtime graph, the intended command is:

```powershell
& $aggregatorNode scripts/audit-native-maven.mjs --dependencies docs/engineering/flutter-closeout/ACTUAL_RUNTIME_REPORT.txt
```

`ACTUAL_RUNTIME_REPORT.txt` is a placeholder to replace with the generated report path; that command is not yet claimed verified. Local project dependencies and Flutter/native engine binaries remain outside Maven advisory coverage even with this resolved graph.
# Final selected-runtime follow-up

The dependency-only Gradle read completed after the integrator's timing window. `gradle-localDemoDebug-runtime-final.txt` selects Guava 33.3.1-android and JUnit 4.13.2; `native-maven-final.json` queried all 82 selected Maven coordinates with no returned OSV matches and no unresolved dependencies. This repairs the two historical selected-version findings without overwriting their evidence. The existing DEX artifacts recorded by the helper are not asserted to come from the final delivered build. APK/notices verification remains separately required. The Guava native notice label was aligned to the verified selected 33.3.1-android coordinate; Apache license text remains identical to the official release license. JUnit EPL text provenance is recorded in `junit-notice-provenance.json`.

