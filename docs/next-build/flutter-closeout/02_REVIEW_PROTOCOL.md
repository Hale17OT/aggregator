# Review protocol — build, challenge, repair, prove

This protocol is a required part of the master prompt. It reduces avoidable errors and makes unresolved risks visible; it does not promise zero defects or manufacture human approval.

## 1. Separate the deliverable from the evidence

Maintain four independent records:

1. **Parity/acceptance register:** required behavior and whether it actually works on web, Android, and iOS.
2. **Defect ledger:** every reproduced problem, including failed candidates and regressions.
3. **Evidence manifest:** exact source/build/device/test identity and the files that substantiate a claim.
4. **Human/platform gate register:** owner design, subjective listening, screen reader, physical device, Figma and signing/release decisions.

A successful build changes only the build row. It cannot close a media-quality, ownership, physical-background, owner-approval or iOS row. Missing evidence does not become a pass. Existing reports are historical until their relevant source/build identities are confirmed.

## 2. Roles and independence

Use separate agent instances when actually supported. Otherwise perform explicitly separated self-review passes and say so.

| Role | Review responsibility | Prohibited shortcut |
|---|---|---|
| Integrator | Implement, own shared contracts, coordinate snapshots and fixes | Merge simultaneous changes to auth, database, or supervisor without reconciliation |
| Functional/security reviewer | Real API/data behavior, native bridge, rights, races, invalidation, configuration | Accept mocked UI success as durable API behavior |
| Visual/accessibility reviewer | Actual frames/interaction, typography, focus, semantics, caption clearance, scaling | Approve only a component gallery or infer spoken usability from labels alone |
| Media/performance reviewer | Player ownership, lifecycle, background behavior, traces, resource limits | Infer performance from debug emulator smoothness or a promotional montage |
| Final reviewer | Read final artifact/evidence independently and rerun critical journeys | Mark every earlier row passed because the final unit suite passes |

Reviewers receive requirements, the current exact build and access to raw evidence. They must not rely only on the implementer's success summary. Parallel reviewers should be read-only; assign one editor per shared surface. Do not claim multiple human reviewers from multiple AI roles.

## 3. Per-increment loop

### A. Define

Map the increment to acceptance IDs. Write concrete Given/When/Then cases, affected existing journeys, expected API/state transitions, and measurable layout/performance invariants. Freeze the test profile before trying fixes. State what is intentionally native, unavailable, or out of scope.

### B. Reproduce and baseline

For a reported defect, reproduce it with the real input path. A dial test drags the knob; a selector test opens and commits an option; a sign-in test uses confirmation and exchange; a save test reads the record back. Capture initial failure and environment. Failure to reproduce is an unresolved report, not a repaired defect.

### C. Implement and test locally

Make a bounded change. Add unit/contract tests where appropriate and a real integration test for the crossing between layers. Run adjacent regressions. Use deterministic clocks/barriers for races, not long arbitrary sleeps. Network stubs and fake clocks must be identified as such.

### D. Inspect actual output

Inspect screenshots and interaction recordings at their actual intended size and normal speed. Inspect open menus, intermediate page-turn frames, captions, loading and error states—not just resting pages. Confirm that the recorded build matches the proposed source. A code reading cannot replace visual inspection of a custom radio or paper fold.

### E. Challenge

A review pass tries rapid Back/Next, selection while audio plays, wrong-user data, stale responses, expired sessions, deep-link replay, delayed media ownership changes, text enlargement, interruptions and offline recovery. It examines likely failure paths specific to the change, not random activity without assertions.

### F. Repair and revalidate

For each finding: preserve reproduction, state cause/hypothesis, repair, rerun the exact failure, run related regressions, and have the review pass confirm closure. Fixing source without rerunning behavior leaves the finding open. If a change creates another problem, preserve that linkage in the ledger.

### G. Integrate

Update status/evidence and proceed to the next unblocked milestone. Do not stop after every pass to request another user prompt. Revisit only impacted rows when source changes. Use controlled snapshots rather than committing when commits are unauthorized.

## 4. Defect severity and exit rules

**P0 — safety/data/security:** credential disclosure, cross-account access, unintended data destruction, public exposure of private drafts, permission/assurance bypass, source-rights bypass, or production/local boundary failure. Stop affected operations immediately; preserve private evidence; fix and rerun the attack/nearby invariants. Never average this away with a design score.

**P1 — core product failure:** reproducible crash, inaccessible main journey, silent lost save, duplicate audio, broken signup, absent bibliography/captions, inability to stop playback, severe readable-content clipping, or a repeatable substantial regression. The affected deliverable cannot be called ready while open.

**P2 — material nonblocking defect:** awkward but usable layout, secondary state inconsistency, bounded performance issue, missing noncritical feedback. Fix in scope when practical; any remaining item must be visible with impact. Only the owner can accept a visual deviation on their behalf.

**P3 — polish:** minor cosmetic imperfection that does not compromise behavior, reading, accessibility or a specifically requested acceptance criterion. Still record it; “polish” must not downgrade a real gate failure.

The local candidate requires no new/unresolved reproducible in-scope P0/P1, complete mandatory functional rows, and explicit human/platform pending rows. Historical high-severity dependency findings remain release blockers under the original gate. Packaging a candidate is not waiving them.

## 5. Goldens and test-integrity rules

- Do not create a golden from current output and automatically declare the design approved. Inspect it against the design requirements first; distinguish agent baseline review from owner acceptance.
- For a failing golden, keep expected, actual and diff. Approve baseline changes only with a recorded intentional design difference and reviewer identity.
- Never remove an option, shrink the catalogue, make the player silent, disable all motion, skip the failed assertion, or lengthen a timeout indefinitely merely to pass.
- Any assertion change must be reviewed against the source contract and original failure. Keep bad assertions documented separately from product defects.
- Capture all repeated runs, not only the last passing attempt. An unexplained intermittent critical failure is still a failure.
- The final test harness must intentionally detect controlled failures: wrong API owner, missing source/caption, rejected media, and an expired/replayed auth token. Canaries run only in isolated tests and are removed; no destructive changes to retained data.

## 6. Whole-product journey set

Run these against the actual local backend with dedicated test accounts:

J01 Guest cold-start → Home → category + search → page two → story → Back to exact context.

J02 Article → citation → source → return; compare standard/brief bibliography and full source titles.

J03 New native account → captured-mail explicit browser confirmation → app exchange → first-use interest tiles → matching/empty feed.

J04 Existing member web → mobile signup/login for the same account → no duplicate onboarding or duplicate account; account identity remains correct.

J05 Edit interests on mobile → web refetch → edit on web → mobile refetch; provoke and recover one real version conflict.

J06 Mobile Save → web Library → remove on web → mobile refetch; repeat with two independent users and unavailable tombstones.

J07 Radio play → navigate Home/article/Library → adjust visible knob → notification pause/resume → return. No new root player or chapter reset.

J08 Radio → Newsroom → Clips → Radio; single audible owner, correct stop/resume rules and one coordinated session.

J09 Watch solo/duo → change prepared treatment → seek transcript/evidence → sources → return paused to exact revision; never map unrelated raw seconds.

J10 Scroll all six Clips → sources/save/read → Back paused → finite ending; no unbounded player accumulation.

J11 Headphone disconnect/interruption/screen lock while Radio plays; real device or explicitly labelled emulator/system simulation.

J12 Background/process restart → safe paused restoration; API restart → valid session/data retained; expiry remains expiry.

J13 Lose network during save/media load → truthful error → reconnect → deliberate recovery without duplicate writes or unexpected sound.

J14 Clear history or logout while progress/save is in flight → no later resurrection and no cross-account replay.

J15 Largest text/reduced motion → menu/dialog/interests/page navigation → captions; no trapped focus, hidden labels or clipped core content.

J16 Malformed/stale/cross-client deep link, wrong verifier, replay and cancelled browser flow → safe rejection and preserved valid session.

Use generated/state-machine tests additionally for media owner, routing cancellation and auth transitions. They supplement—not replace—these actual journeys.

## 7. Evidence identity and final sweeps

Every record includes: criterion IDs; source fingerprint; app/API/web build fingerprint; APK SHA256 when relevant; SDK/package lock identity; environment, screen size/text scale/theme; device/OS/build mode; start/end timestamps; command or manual procedure; expected versus actual result; output paths; reviewer; and limitation.

Private logs are redacted before review packaging. Never include auth confirmation URLs, session credentials, PKCE verifiers, database backups, signing keys or full device serials. Secret scanning must cover the evidence/artifact directory, not only source. Clearly label local clip source capture as not proof of physical loudness.

After implementation and repairs:

1. Run a clean reproducibility build from a source snapshot without replacing a currently tested build directory.
2. Freeze the candidate; fingerprint its source, dependency locks and actual installable APK.
3. Run the final regression and three fresh repetitions of core authentication, ownership, navigation and media handoff journeys.
4. Perform two separated final review sweeps on the unchanged product build, using different scenarios and at least one clean application launch. A reviewer/agent cannot invent an owner approval.
5. A product change resets affected rows and the final sweep status. Evidence-only updates do not require a new APK.
6. If the same defect survives three evidence-backed repair attempts, stop speculative edits, preserve the safest working version, write the exact unresolved cause/options, and continue independent tasks. It stays FAILED/BLOCKED; the candidate does not receive a fake pass.

## 8. Useful final verdict

Report separate outcomes for web, Android source, Android APK/install, native API/auth, media/data preservation, physical device, accessibility, listening, Figma, iOS source/build/device, and release security. No “100% complete” claim when a required device or person was unavailable.

The final owner task is one compact review session with the APK/working routes and selected real evidence. It is not an invitation to approve thousands of logs or redo automated QA manually. Use the provided owner-review script and record actual responses.
