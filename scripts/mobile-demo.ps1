param([string]$Device = 'emulator-5554')
$ErrorActionPreference = 'Stop'
. "$PSScriptRoot/flutter-env.ps1"
& "$PSScriptRoot/mobile-loopback.ps1" -Device $Device
if ($LASTEXITCODE) { throw 'Selected device forwarding failed' }
Push-Location (Join-Path $PSScriptRoot '../apps/mobile')
try {
  & flutter build apk --debug --flavor localDemo --target lib/main.dart --dart-define=LOCAL_DEMO=true --no-pub
  if ($LASTEXITCODE) { throw 'Local-demo APK build failed' }
  $apk = (Resolve-Path -LiteralPath 'build/app/outputs/flutter-apk/app-localdemo-debug.apk').Path
  & "$env:ANDROID_HOME/platform-tools/adb.exe" -s $Device install -r $apk
  if ($LASTEXITCODE) { throw 'APK install failed; no device data was reset' }
  & "$env:ANDROID_HOME/platform-tools/adb.exe" -s $Device shell am start -n test.example.aggregator.aggregator_mobile.localdemo/test.example.aggregator.aggregator_mobile.MainActivity
  if ($LASTEXITCODE) { throw 'Installed application launch failed' }
  Get-FileHash -LiteralPath $apk -Algorithm SHA256
} finally { Pop-Location }
