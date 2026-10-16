$ErrorActionPreference = 'Stop'
. "$PSScriptRoot/flutter-env.ps1"
$snapshot = Join-Path $aggregatorRoot ('.cache/flutter-repro-' + (Get-Date -Format 'yyyyMMdd-HHmmss'))
if (Test-Path -LiteralPath $snapshot) { throw 'Reproducibility snapshot must be new' }
New-Item -ItemType Directory -Path $snapshot | Out-Null
$source = Join-Path $aggregatorRoot 'apps/mobile'
& robocopy $source $snapshot /E /XD build .dart_tool .gradle .idea ephemeral /XF local.properties '*.iml' /NFL /NDL /NJH /NJS *> (Join-Path $snapshot 'copy.log')
if ($LASTEXITCODE -gt 7) { throw 'Snapshot copy failed' }
$lockBefore = (Get-FileHash -LiteralPath (Join-Path $source 'pubspec.lock')).Hash
$manifest = Get-ChildItem -LiteralPath $snapshot -Recurse -File | Where-Object Name -ne 'copy.log' | Sort-Object FullName | ForEach-Object { [ordered]@{path=$_.FullName.Substring($snapshot.Length+1);sha256=(Get-FileHash -LiteralPath $_.FullName).Hash} }
$manifest | ConvertTo-Json -Depth 4 | Set-Content (Join-Path $snapshot 'source-manifest.json')
$started = (Get-Date).ToUniversalTime().ToString('o')
Push-Location $snapshot
try {
  & flutter pub get --offline *> pub-get.log
  if ($LASTEXITCODE) { throw 'Offline locked dependency resolution failed' }
  if ((Get-FileHash pubspec.lock).Hash -ne $lockBefore) { throw 'Copied lockfile changed' }
  & dart format --output=none --set-exit-if-changed lib test integration_test *> format.log
  if ($LASTEXITCODE) { throw 'Clean snapshot format check failed' }
  & flutter analyze *> analyze.log
  if ($LASTEXITCODE) { throw 'Clean snapshot analysis failed' }
  & flutter test *> test.log
  if ($LASTEXITCODE) { throw 'Clean snapshot tests failed' }
  & flutter build apk --debug --flavor localDemo --target lib/main.dart --dart-define=LOCAL_DEMO=true --no-pub *> build.log
  if ($LASTEXITCODE) { throw 'Clean project snapshot build failed' }
  $apk = Join-Path $snapshot 'build/app/outputs/flutter-apk/app-localdemo-debug.apk'
  [ordered]@{started=$started;ended=(Get-Date).ToUniversalTime().ToString('o');snapshot=$snapshot;sourceFiles=$manifest.Count;sourceManifestSha256=(Get-FileHash source-manifest.json).Hash;lockUnchanged=$true;pubResolution='offline installed cache';build='clean project directory, shared verified SDK/Gradle cache';apk=$apk;apkSha256=(Get-FileHash -LiteralPath $apk).Hash;installed=$false;limitations='Build reproducibility check, not a byte-identical or fresh-machine/hermetic guarantee'} | ConvertTo-Json | Set-Content (Join-Path $aggregatorRoot 'docs/engineering/flutter-closeout/native-repro.json')
  Get-Content build.log -Tail 5
} finally { Pop-Location }
