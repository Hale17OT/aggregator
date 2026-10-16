param(
  [ValidateSet('guest','endurance','member','reader','shortform','targeted')][string]$Suite = 'guest',
  [ValidateRange(1,3)][int]$Repeats = 1,
  [string]$Device = 'emulator-5554'
)
$ErrorActionPreference = 'Stop'
. "$PSScriptRoot/flutter-env.ps1"
& "$PSScriptRoot/mobile-loopback.ps1" -Device $Device
if ($LASTEXITCODE) { throw 'Selected device forwarding failed' }
$mobileRoot = Join-Path $PSScriptRoot '../apps/mobile'
$testFile = switch ($Suite) { 'guest' { 'guest_journeys_test.dart' } 'member' { 'member_handoff_test.dart' } 'reader' { 'reader_journeys_review_test.dart' } 'shortform' { 'shortform_test.dart' } 'targeted' { 'targeted_test.dart' } default { 'endurance_test.dart' } }
$target = (Resolve-Path -LiteralPath (Join-Path $mobileRoot "integration_test/$testFile")).Path.Replace('\','/')
# The installed Flutter Gradle parser requires a padded entry in this encoded list.
$nativeDefines = (@('LOCAL_DEMO=true','RUNNER=android') | ForEach-Object { [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($_)) }) -join ','
$evidence = Join-Path $PSScriptRoot ("../output/targeted-closeout-20261016/instrumentation/{0}-{1}" -f $Suite,(Get-Date -Format 'yyyyMMdd-HHmmss'))
New-Item -ItemType Directory -Path $evidence | Out-Null
$env:ANDROID_SERIAL = $Device
Push-Location (Join-Path $mobileRoot 'android')
try {
  for ($attempt = 1; $attempt -le $Repeats; $attempt++) {
    $helper = $null
    if ($Suite -eq 'member') {
      if ($Device -ne 'emulator-5554') { throw 'Assisted browser helper is scoped to emulator-5554' }
      $helper = Start-Process -FilePath $aggregatorNode -ArgumentList @('scripts/check-native-browser-handoff.mjs',(Join-Path $evidence "browser-$attempt.json")) -WorkingDirectory $aggregatorRoot -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $evidence "browser-$attempt.log") -RedirectStandardError (Join-Path $evidence "browser-$attempt.err")
    }
    & ./gradlew.bat app:connectedLocalDemoDebugAndroidTest "-Ptarget=$target" "-Pdart-defines=$nativeDefines" --console=plain *> (Join-Path $evidence "run-$attempt.log")
    $result = $LASTEXITCODE
    $instrumented = Join-Path $mobileRoot 'build/app/outputs/apk/localDemo/debug/app-localDemo-debug.apk'
    if (Test-Path -LiteralPath $instrumented) {
      [ordered]@{entrypoint=$target;mode='debug instrumentation';sha256=(Get-FileHash -LiteralPath $instrumented).Hash;attempt=$attempt;device=$Device;exitCode=$result} | ConvertTo-Json | Set-Content (Join-Path $evidence "artifact-$attempt.json")
    }
    $results = Join-Path $mobileRoot 'build/app/outputs/androidTest-results/connected'
    if (Test-Path -LiteralPath $results) { Copy-Item -LiteralPath $results -Destination (Join-Path $evidence "results-$attempt") -Recurse }
    if ($helper) {
      if (-not $helper.WaitForExit(30000)) { Stop-Process -Id $helper.Id; throw 'Owned assisted-browser runner did not finish; preserved evidence' }
      $helper.Refresh()
      if ($helper.ExitCode -ne 0) { throw "Assisted browser attempt $attempt failed" }
    }
    Get-Content -LiteralPath (Join-Path $evidence "run-$attempt.log") -Tail 20
    if ($result) { throw "Native $Suite attempt $attempt failed. Evidence: $evidence" }
  }
} finally { Pop-Location }
Write-Output "Native $Suite results: $evidence"
