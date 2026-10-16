# The Aggregator — repository cleanup, commit and GitHub push

Continue in the existing Aggregator workspace. Do not recreate or clone an empty project over it.

Target repository:
https://github.com/Hale17OT/aggregator.git

This task explicitly authorizes preparing the existing project for Git, creating the appropriate commit, and pushing the reviewed source to this exact repository. It supersedes historical “no commit/no push/no source upload” restrictions only for this operation. Do the work, not just provide commands for me to execute.

This is a source-code checkpoint, NOT a production release. Staff/MFA stays paused. Do not deploy, publish news, upload APKs/media as release assets, enable Pages, change repository visibility, or configure production services.

## 1. Inspect before changing anything

- Read AGENTS.md and the latest canonical project status/targeted-closeout report. Inspect the actual working tree, index, branches, recent history, remotes and configured push URLs. Do not assume there are no commits because an older report said so.
- Confirm the workspace root; the expected Windows location is E:\Hale\Coding\Personal\aggregator. Do not initialize a nested repository.
- Record the initial staged/unstaged state and respect unrelated work. Do not silently overwrite concurrent edits, stage unrelated files, or discard existing changes.
- Verify access, repository identity, visibility and current remote refs through the available Git/GitHub credentials. The remote was observed empty, but recheck. An authentication failure is not proof of an empty repository.
- Reuse a correctly configured remote. If origin is absent, add the target as origin. If origin points elsewhere, preserve it and use a clearly named additional remote for this task. Ensure its fetch and sole push destination are the intended Hale17OT/aggregator repository; never push to multiple configured URLs accidentally.
- Use the existing configured author name/email. If missing or ambiguous, ask for the required identity; do not invent an email or derive a private address from the username. Do not change global Git settings.
- Use an existing secure credential helper or GitHub CLI session. Ask for interactive sign-in only when necessary. Never request a token pasted into chat, embed credentials in a remote URL, or print them.

## 2. Clean repository contents, not the running machine

Make the repository organized and maintainable without changing product behavior. Prefer ignoring generated material over deleting it.

PRESERVE LOCALLY, BYTE-FOR-BYTE:
- The retained PostgreSQL database and member records.
- All 23 programme renditions and 93 original media assets, unless the actual inventory has legitimately changed since the checkpoint.
- Existing APKs, including the final targeted local-demo r2 artifact and preserved prior candidates.
- Immutable migration files/checksums, historical evidence, original specifications, required guarded dependency patches, and installed local toolchains.
- Existing supervised services. Do not start duplicate servers, reset/reseed a database, regenerate media, or rebuild/install an APK for repository cleanup.

INCLUDE AFTER REVIEW:
- apps/web, apps/api, apps/worker and apps/mobile source, including required Android/iOS project files.
- Shared packages, contracts, database migrations, tests, required fixtures, tooling and build/configuration sources.
- Package manifests and application lockfiles, including npm and Flutter/Pub locks used for reproducible builds.
- Required checked-in wrapper files such as the Gradle wrapper; do not blanket-ignore every JAR or platform-project file.
- Original compact brand assets: the A mark, launcher/splash resources, favicon and website-preview assets, with the applicable provenance/notices.
- Safe example environment files, setup documentation, original specifications and relevant maintained engineering/design documentation.
- Required third-party notices and the source/provenance of reviewed patches.

EXCLUDE FROM GIT, WITHOUT DELETING LOCAL COPIES:
- node_modules, dependency/tool/model caches, .cache, Nuxt output, Flutter .dart_tool/build outputs, platform build caches, Pods and ephemeral plugin links.
- Generated APK/AAB/IPA files, rendered programme media, recordings, trace archives, screenshots from test runs, coverage, logs and generated review output.
- PostgreSQL data directories/dumps/backups, captured mail, retained user data, browser profiles, session storage-state exports, authentication links/tokens and private draft exports.
- Real .env/config secrets, signing keystores, private keys, provisioning credentials, key.properties and machine-specific local.properties.
- Temporary worktrees/source snapshots, generated acceptance evidence and machine-bound runtime/target manifests.

Inspect the actual paths before writing scoped .gitignore rules. Do not exclude all SQL, JSON, images, SVG, Markdown or binary files indiscriminately. Keep required source fixtures and small runtime assets eligible for review.

If a required authored helper exists only in a cache/output directory, recover a maintained source copy into the appropriate scripts/package location, preserve the original, and verify its references. Do not accidentally distribute a repository that depends on untracked implementation code.

.gitignore is not sufficient for already tracked/staged files: remove only specifically reviewed generated/private paths from the index using an index-only operation, preserving disk contents. Never run a blanket “git rm -r --cached .”, git clean, destructive reset, force checkout or automatic stash.

Inspect .gitattributes/content filters and executable bits. Do not normalize line endings or modify content bytes of immutable migrations, hash-bound scripts/patches or assets. Verify the staged blobs preserve required checksum-bound bytes, not only that working files are unchanged.

## 3. Treat secret and privacy review as a publication gate

The latest report records eight raw scanner findings classified as SHA256 fingerprints in generated artifact metadata/baselines. That is NOT a clean raw-scan pass, and this task must not repeat an older PASS claim.

- Inspect current findings privately with the installed scanner and retain redacted evidence.
- Prefer excluding raw generated reports and exporting a sanitized source-checkpoint summary. Preserve the original local reports and their failures.
- Scan the exact outgoing staged content, plus every existing commit/history object that this push will newly expose. Inspect nested repositories/submodules and unexpected binary files; a clean current tree does not establish clean history.
- Check credentials, cookies, bearer/CSRF values, mail-confirmation links, signing material, account records, personal/local machine details and sensitive URLs in docs, images and archives—not just obvious .env names.
- Resolve false positives with evidence and narrowly scoped review. Do not globally exempt SHA256-like values, weaken scanner rules, disable push protection, skip hooks, or use --no-verify.
- If a real secret, private record, unclassified finding or unsafe outgoing history remains, STOP before pushing and report the affected path safely. Never echo the secret. Do not rewrite existing history or assume deleting the latest copy removes it from earlier commits. Credential revocation/rotation and any history rewrite require an explicit next decision.
- Keep scanner scope/result distinctions accurate: a clean outgoing source scan does not turn a failing scan of preserved local evidence into a whole-workspace PASS.

Check staged and outgoing-history file sizes. Exclude unexpected large binaries; do not enable Git LFS, pay for storage, create Releases or upload the media catalogue as a workaround.

## 4. Prepare a useful README and source handoff

Refine the root README without inventing completed capabilities. Include:
- What The Aggregator does and the current local-demo status.
- The web/Express/worker/Flutter architecture and a short directory map.
- Verified prerequisites and commands for the supported local workflows.
- Environment-template locations and how credentials remain local.
- How to run focused web/native checks, and how full demo/media setup differs from source-only installation.
- Where migrations, current documentation and known limitations live.

Preserve fictional-content labels, paused staff/MFA, private drafts, remaining performance/reliability issues, dependency/security findings and unverified owner/device/Figma/iOS gates. Do not describe the project as production-ready or security-certified.

Explain that generated programmes, databases, mail, APKs and test evidence are not included in the Git repository. Keep safe media manifests/provenance and existing preparation instructions where appropriate. Do not claim a fresh clone immediately contains all playable renditions, or guarantees byte-identical regeneration. Do not generate or upload missing media during this task.

Keep historical source documents intact. Leave private raw evidence local; provide concise sanitized summaries and repair public documentation links so GitHub readers are not sent to E:\ paths or nonexistent tracked review files. Label local-only references explicitly where needed.

Retain existing licensing decisions and third-party notices. Do not assign the project MIT, Apache or another new license without my authorization. Repository visibility is not permission to choose a license for my code.

## 5. Run proportionate verification

Inspect the existing command definitions and run the applicable checks, normally root tests/lint/typecheck/worker, Flutter tests/analyze, and repository secret/license/CI configuration checks. Use the existing PowerShell environment wrappers correctly; some npm wrapper invocations exit their calling shell.

Run fresh source builds only when cleanup affects build inputs/bootstrap/assets or a relevant check requires one. Use an isolated source-only export/checkout where practical to expose required ignored files; record missing prerequisites honestly. Do not launch a broad rendering, benchmarking, emulator-install or database-reset campaign.

Keep known dependency/performance/reliability failures visible. This source checkpoint does not require falsely claiming they are resolved. Do not introduce fresh regressions, disable an audit, bypass a rejecting commit hook, or change thresholds to make GitHub look green. Distinguish successful checks, pre-existing failures and checks not run.

Review push-triggered workflows before upload. Normal non-deploying verification CI is permitted. Ensure the push cannot trigger deployment, publication, Pages, package/release upload or disclosure of private artifacts. If those side effects cannot be safely excluded under the current configuration, stop before pushing and request the specific decision. Do not alter repository settings or disable verification silently.

## 6. Stage deliberately and commit

Use a reviewed path inventory—not a blind git add . or git add -A at the beginning.

Inspect the final staged name/status list, diff, size totals, ignore decisions and git diff --cached --check. Confirm required source files/brand assets/locks are present, no private/runtime files are staged, and checksum-sensitive staged bytes remain intact. Recheck if concurrent edits changed the candidate.

For a genuinely uncommitted project, create ONE coherent initial source commit:

feat: add Aggregator web and Flutter applications

Suggested commit body, adjusted only to match the actual included files:

- add the source-attributed newspaper reader and personalized interests
- include Radio, Newsroom and Clips with shared playback controls
- add Flutter member access, Library and cross-format navigation
- include PostgreSQL migrations and local source-to-draft services
- add the masthead-derived A brand, launcher and web preview assets
- include tests, guarded tooling, documentation and third-party notices
- exclude credentials, retained data, rendered media and build artifacts

Local implementation checkpoint; known defects and release gates remain documented.

If meaningful local history already exists, PRESERVE IT. Do not recreate an initial commit or manufacture a historical series. Use the truthful hygiene commit:

chore(repo): prepare Aggregator source for GitHub

Its body must describe the actual cleanup/documentation changes, not pretend existing features were introduced again. If no changes are needed, do not create an empty commit; publish only the already reviewed eligible history.

Use the existing valid author identity. Do not amend, squash, rebase or backdate history. If commit hooks or identity configuration block the operation, report the real blocker rather than bypassing it.

## 7. Push to the exact repository and verify

- Recheck remote refs immediately before push.
- If the remote remains empty and there is no conflicting local branch, use main as the initial branch. Do not forcibly rename over an existing local main branch.
- If the remote is no longer empty, preserve its commits and branch policy. Fetch/read first. Push only a valid fast-forward to the intended branch; stop for a safe integration decision if histories differ. Do not force a README/license merge or overwrite someone else's update.
- Push the one reviewed branch with an explicit destination and set its upstream. Never use --force, --force-with-lease, --mirror, --all, bulk tag pushes, branch deletion or a new release tag.
- Do not recreate the existing GitHub repository or change visibility/protection/settings. Ask for authentication only if actually blocked.
- Verify that the remote branch head equals the intended local commit and inspect the remote source tree/README when accessible. Confirm generated/private artifacts were not included.
- Report triggered CI accurately: queued/running/failed/passed/not observed. A successful push is not a passing hosted CI run or release approval.

## Final response

Return the target repository and branch, full commit SHA, exact commit subject, verified push result, cleanup summary, major intentionally excluded local directories, checks/results and any blockers. Report unexpected remaining source changes rather than hiding them to obtain a clean status.

Preserve the running demo and all excluded local assets. Finish after the source push and verification. Do not resume unrelated product work.
