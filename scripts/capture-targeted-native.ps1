param([Parameter(Mandatory=$true)][ValidateSet('before','after')][string]$Phase,[switch]$LayoutOnly,[ValidatePattern("^r[2-9][0-9]*$")][string]$Revision)
$ErrorActionPreference='Stop'
$suffix=if($Revision){"-$Revision"}else{''}
$adb='C:/Android/Sdk/platform-tools/adb.exe'
$device='emulator-5554'
$package='test.example.aggregator.aggregator_mobile.localdemo'
$dir=Join-Path (Get-Location) "output/targeted-closeout-20261016/evidence/native-$Phase$suffix"
if(Test-Path -LiteralPath $dir){throw "Immutable capture destination occupied"}; New-Item -ItemType Directory $dir | Out-Null
$apk=if($Phase -eq 'before'){'output/shortform-rebuild/aggregator-shortform-local-demo.apk'}else{"output/targeted-closeout-20261016/main/aggregator-targeted-local-demo$suffix.apk"}
@{phase=$Phase;apk=$apk;sha256=(Get-FileHash $apk).Hash;viewport=(& $adb -s $device shell wm size);density=(& $adb -s $device shell wm density)} | ConvertTo-Json | Set-Content (Join-Path $dir 'identity.json')
function Shot([string]$name) {
 & $adb -s $device shell screencap -p /sdcard/Download/shortform.png
 & $adb -s $device pull /sdcard/Download/shortform.png (Join-Path $dir "$name.png") | Out-Null
}
function Tap([string]$pattern,[switch]$Observe,[switch]$Cached) {
 for($i=0;$i -lt 5;$i++) {
  if(!$Cached){
   $dump=& $adb -s $device shell uiautomator dump /sdcard/Download/shortform.xml
   if("$dump" -notmatch 'dumped to'){Start-Sleep -Seconds 1;continue}
   & $adb -s $device pull /sdcard/Download/shortform.xml (Join-Path $dir 'ui.xml') | Out-Null
  }
  [xml]$tree=Get-Content (Join-Path $dir 'ui.xml')
  $node=$tree.SelectNodes('//node') | Where-Object {$_.'content-desc' -match $pattern} | Select-Object -First 1
  if($node){if($Observe){return};$b=[regex]::Matches($node.bounds,'\d+') | ForEach-Object {[int]$_.Value}; & $adb -s $device shell input tap ([int](($b[0]+$b[2])/2)) ([int](($b[1]+$b[3])/2));return}
 }
 throw "Control not found: $pattern"
}
function LayoutShots([bool]$advance) {
 if($advance) { Tap '^Next clip$'; Start-Sleep -Seconds 1 }
 # Pointer seek on the actual progress region of the observed 1080x2424 canvas.
 & $adb -s $device shell input tap 930 2130
 Start-Sleep -Seconds 2; Shot 'long-caption-final'
 try {
  & $adb -s $device shell wm size 640x1136
  & $adb -s $device shell wm density 320
  Start-Sleep -Seconds 2; Shot 'compact-paused'
  & $adb -s $device shell settings put system font_scale 2
  Start-Sleep -Seconds 2; Shot 'compact-2x'
  & $adb -s $device shell input swipe 320 650 320 490 500
  Shot 'compact-2x-caption-scroll'
  Tap '^More$'; Start-Sleep -Seconds 2; Shot 'compact-2x-more'
  & $adb -s $device shell input swipe 320 900 320 550 500
  & $adb -s $device shell input swipe 320 900 320 550 500
  Shot 'compact-2x-transcript'
  & $adb -s $device shell input keyevent 4
  Start-Sleep -Seconds 1
  & $adb -s $device shell settings put system font_scale 1
  & $adb -s $device shell wm size 1280x720
  Start-Sleep -Seconds 2; Shot 'landscape-paused'
  & $adb -s $device shell input swipe 300 420 300 330 500
  Shot 'landscape-caption-scroll'
 } finally {
  & $adb -s $device shell wm size reset
  & $adb -s $device shell wm density reset
  & $adb -s $device shell settings put system font_scale 1
 }
}
& $adb -s $device install -r $apk | Set-Content (Join-Path $dir 'install.txt')
if($LASTEXITCODE){throw 'Install failed'}
& $adb -s $device shell am force-stop $package
& $adb -s $device shell am start -n "$package/test.example.aggregator.aggregator_mobile.MainActivity"
Start-Sleep -Seconds 4
Tap '^Clips\s+Tab'; Start-Sleep -Seconds 2
Tap '^Clips\s+Tab'; Start-Sleep -Seconds 2
Tap '^Play video$' -Observe
Shot 'tall-paused'
if($LayoutOnly) { LayoutShots $true; exit }
$record=Start-Process -FilePath $adb -ArgumentList '-s',$device,'shell','screenrecord','--time-limit','120','/sdcard/Download/shortform-interaction.mp4' -WindowStyle Hidden -PassThru
Tap '^Play video$'; Start-Sleep -Seconds 3; Shot 'tall-playing'
& $adb -s $device shell input tap 540 850
Start-Sleep -Seconds 1; Shot 'picture-paused'
& $adb -s $device shell input swipe 540 1250 540 650 350
Start-Sleep -Seconds 2; Shot 'next-paused'
Tap '^Play video$'; Start-Sleep -Seconds 2
# Actual thin progress hit area, below metadata and above bottom destinations.
& $adb -s $device shell input swipe 300 2150 700 2150 800
Shot 'seek'
# Sources bounds came from this same item's ready paused tree before Play/seek;
# avoid UIAutomator's idle timeout while video moves. Input remains an actual tap.
Tap '^Sources$' -Cached; Start-Sleep -Seconds 1; Shot 'sources'
& $adb -s $device shell input keyevent 4
Start-Sleep -Seconds 1; Shot 'sources-return-paused'
Tap '^More$'; Start-Sleep -Seconds 2; Shot 'more'
& $adb -s $device shell input keyevent 4
Tap '^Share$'; Start-Sleep -Seconds 2; Shot 'share-chooser'
& $adb -s $device shell input keyevent 4
Start-Sleep -Seconds 1; Shot 'share-return-paused'
$record.WaitForExit()
& $adb -s $device pull /sdcard/Download/shortform-interaction.mp4 (Join-Path $dir 'interaction-uncut.mp4') | Out-Null
$installed=(& $adb -s $device shell pm path $package).Trim().Replace('package:','')
& $adb -s $device pull $installed (Join-Path $dir 'installed-main.apk') | Out-Null
Get-FileHash (Join-Path $dir 'installed-main.apk') | ConvertTo-Json | Set-Content (Join-Path $dir 'installed-identity.json')
LayoutShots $false

