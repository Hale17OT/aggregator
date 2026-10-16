# Source checkpoint review — 17 October 2026

Owner explicitly authorized source cleanup, one initial commit and a push to `https://github.com/Hale17OT/aggregator.git`. This supersedes historical no-commit/no-push instructions only for this operation. It does not authorize deployment, package/release publication, asset upload, real ingestion or unpausing staff/MFA.

## Scope and exclusions

The existing repository had no commits, no remote, an unborn master branch and an existing Git author identity. Remote access succeeded with no advertised refs. No nested clone, reset, stash, history rewrite or global configuration change was used. Source checkpoint targets main; verify the remote head and workflow result separately from this pre-push record.

Included: web/API/worker/Flutter source, contracts and guarded services, original specifications, fictional fixtures, migrations, application locks, Android/iOS project files, Gradle bootstrap, brand/launcher/splash/preview assets, tests, scripts and existing third-party notices. No new project license is assigned.

Excluded while retained locally: output/, .cache/, node_modules, Nuxt/Flutter/platform build products, Pods/generated plugin links, real environment files and local.properties, signing keys, APKs, rendered video, logs, captures, traces, screenshots, private drafts, database targets/backups/data, captured mailbox and browser state. Generated engineering JSON/evidence directories are excluded; the reviewed dependency-license inventory and third-party notice bundle remain source handoff material. Original Word files are retained, with archive contents inspected. Local-only Markdown evidence links are labelled; prior document copies remain in the local review folder.

`.gitattributes` preserves source bytes rather than applying workstation CRLF conversion. Checksum-bound migrations/reference SQL and guarded patch source are compared between disk and staged blobs. The Gradle POSIX wrapper already uses LF; its staged executable bit is set. No LFS or media upload workaround is used.

## Actual local checks

From repository root, each wrapper ran in its own PowerShell process:

- `pwsh -NoProfile -File scripts/npm.ps1 test`: PASS41 tests.
- `pwsh -NoProfile -File scripts/npm.ps1 run lint`: PASS.
- `pwsh -NoProfile -File scripts/npm.ps1 run typecheck`: PASS.
- `pwsh -NoProfile -File scripts/npm.ps1 run worker:check`: PASS.
- `pwsh -NoProfile -File scripts/npm.ps1 run check:licenses`: PASS861 locked records reviewed;22 installed records have metadata-only notices, not blanket redistribution approval.
- `pwsh -NoProfile -File scripts/npm.ps1 run check:ci`: PASS static actionlint/configuration check; no hosted result inferred.
- `pwsh -NoProfile -File scripts/npm.ps1 run check:secrets`: raw workspace FAIL8; canary rejection/redaction PASS. All8 are current, individually verified file SHA256 fingerprints in excluded artifact reports. Raw failures remain local; scanner rules are unchanged.
- After dot-sourcing `scripts/flutter-env.ps1`, `C:/flutter/bin/flutter.bat test` and `analyze` from apps/mobile: PASS59 tests and clean analyzer.
- `pwsh -NoProfile -File scripts/npm.ps1 run check:repro`: PASS isolated source-only npm ci, lint, typecheck, tests, build and worker; lock unchanged. Existing running build was not replaced. This checks root/web bootstrap, not a fresh Android/iOS machine.

Source export scanning uses pinned Gitleaks8.30.1 project rules, redaction100 and archive depth2. The first scan given a path beneath .cache scanned zero bytes due to the existing exclusion and was rejected as non-evidence. Running from the export root scanned6.24MB and passed; exact staged export and initial Git history are checked separately before push. No broad exemptions, hook skipping or push-protection bypass is authorized.

Seven binary archives (six original Word documents and Gradle wrapper) were inspected: no embedded macro/package objects or sensitive-query links found. Text address review found example fixtures, public upstream attribution and filename matches, not retained member records. Runtime code requires no maintained helper stranded in .cache: speech dependencies/models and historical experiment snapshots there remain separate preparation inputs.

Local raw review/logs: `.cache/source-checkpoint-20261017/` (excluded). A stopped bounded address-review attempt and zero-byte scanner attempt remain documented; successful checks do not erase them. Builds and focused checks did not render media, touch the retained database, install an app or start services.

## Known gates and handoff

The original unexplained media-load incident, intermittent account lock timeout, historical mixed native raster/web callback/CPU4 failures, dependency audit findings and owner/device/TalkBack/listening/Figma/iOS gaps remain documented in PROJECT_STATUS and the targeted repair ledger. Current source work does not fix or close them. Normal CI contains read-only verification/database-test jobs only; no deploy, release, Pages, package or artifact-upload step. Its audit may fail on existing dependencies; retain the gate.

This is a source checkpoint only. Media and retained accounts are intentionally absent from a fresh clone. No production readiness or owner visual approval is claimed. Stop after push/head verification; staff/MFA stays paused.

## Staged review notes

The reviewed index contains source only. `git diff --cached --check` remains FAIL for pre-existing trailing spaces/blank EOF lines in 95 files, including original specification SQL and upstream license text. No wholesale reformatting or checksum-bound byte change was made to manufacture a pass. The CRLF-aware whitespace attribute recognizes existing line endings while retaining ordinary whitespace checks. This is a documented formatting limitation, separate from secret/private-data clearance.

The source-only metadata manifest at `docs/product/prepared-media-manifest.json` preserves23 rendition identities and93 asset references/hashes; it contains no media bytes, member records or permission grant.

Exact staged-export review passed:682 files, about11.2MB, every exported staged blob equals its working-file bytes, including17 SQL/guarded-patch files. Required Gradle bootstrap and application locks are included; APK, retained target and machine-local Android properties are ignored. Gitleaks scanned6.27MB of the staged export with archive depth2 and found no leaks. The initial repository had no earlier history to expose; the new commit is scanned before push. The largest included file is the fictional article illustration, about3.08MB. No APK, programme recording or private runtime directory is in the index.
