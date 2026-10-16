param([Parameter(Mandatory=$true)][string]$Apk,[Parameter(Mandatory=$true)][ValidateSet('before','after')][string]$Phase,[ValidateSet('debug','profile')][string]$Mode='debug')
$ErrorActionPreference='Stop'
$adb='C:/Android/Sdk/platform-tools/adb.exe'
$device='emulator-5554'
$package='test.example.aggregator.aggregator_mobile.localdemo'
$directory=Join-Path (Get-Location) "output/shortform-rebuild/performance/$(if($Mode -eq 'profile'){'profile-'})$Phase"
New-Item -ItemType Directory -Force $directory | Out-Null
& $adb -s $device install -r $Apk | Set-Content (Join-Path $directory 'install.txt')
if ($LASTEXITCODE) { throw 'Install failed; no data cleared' }
& $adb -s $device shell am force-stop $package
& $adb -s $device shell am start -n "$package/test.example.aggregator.aggregator_mobile.MainActivity" | Out-Null
function Find-Control([string]$Pattern) {
  for ($try=0; $try -lt 10; $try++) {
    Start-Sleep -Seconds 1
    $dump = & $adb -s $device shell uiautomator dump /sdcard/Download/shortform-perf.xml
    if ($LASTEXITCODE -or "$dump" -notmatch 'dumped to') { continue }
    & $adb -s $device pull /sdcard/Download/shortform-perf.xml (Join-Path $directory 'ui.xml') | Out-Null
    [xml]$tree=Get-Content (Join-Path $directory 'ui.xml')
    $found=$tree.SelectNodes('//node') | Where-Object { $_.'content-desc' -match $Pattern } | Select-Object -First 1
    if ($found) { return $found }
  }
}
$clips=Find-Control '^Clips\s+Tab'
if (!$clips) { throw 'Actual Clips destination missing' }
$navBounds=[regex]::Matches($clips.bounds,'\d+') | ForEach-Object { [int]$_.Value }
& $adb -s $device shell input tap ([int](($navBounds[0]+$navBounds[2])/2)) ([int](($navBounds[1]+$navBounds[3])/2))
Start-Sleep -Seconds 2
& $adb -s $device shell input tap ([int](($navBounds[0]+$navBounds[2])/2)) ([int](($navBounds[1]+$navBounds[3])/2))
$play=Find-Control '^Play video$'
if (!$play) { throw 'Actual Play control not found; measurement not started' }
$b=[regex]::Matches($play.bounds,'\d+') | ForEach-Object { [int]$_.Value }
& $adb -s $device shell dumpsys gfxinfo $package reset | Set-Content (Join-Path $directory 'reset.txt')
& $adb -s $device shell input tap ([int](($b[0]+$b[2])/2)) ([int](($b[1]+$b[3])/2))
if ($Mode -eq 'profile') { Start-Sleep -Seconds 50 } else { Start-Sleep -Seconds 12 }
& $adb -s $device shell dumpsys gfxinfo $package framestats | Set-Content (Join-Path $directory 'framestats.txt')
$appProcess = (& $adb -s $device shell pidof $package).Trim()
if ($Mode -eq 'profile') {
  & $adb -s $device logcat -d "--pid=$appProcess" -s flutter:I | Select-String 'AGG_PROFILE' | ForEach-Object { $_.Line } | Set-Content (Join-Path $directory 'flutter-timings.txt')
}
& $adb -s $device shell am force-stop $package
[ordered]@{at=(Get-Date).ToUniversalTime().ToString('o');apk=(Resolve-Path $Apk).Path;sha256=(Get-FileHash $Apk).Hash;mode=$Mode;entrypoint=$(if($Mode -eq 'profile'){'lib/profile_main.dart'}else{'lib/main.dart'});device='Aggregator_Local Android36 emulator-5554 1080x2424 density420';scenario="Cold launch, Clips, actual accessible Play control, $(if($Mode -eq 'profile'){50}else{12})s first recording playback; no recording/browser/build concurrent";limitations='Android gfxinfo returned zero app frames and cannot establish a timing pass. Profile mode separately records actual Flutter UI/raster timing samples. Emulator diagnostics, not physical-device certification; original mixed-workload profile failure remains distinct.'} | ConvertTo-Json | Set-Content (Join-Path $directory 'identity.json')
Get-Content (Join-Path $directory 'framestats.txt') | Select-String 'Total frames|Janky frames|percentile'
