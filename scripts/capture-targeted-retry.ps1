param([Parameter(Mandatory=$true)][ValidateSet('after')][string]$Phase,[ValidatePattern("^r[2-9][0-9]*$")][string]$Revision)
$ErrorActionPreference='Stop'
$suffix=if($Revision){"-$Revision"}else{''}
$adb='C:/Android/Sdk/platform-tools/adb.exe';$device='emulator-5554'
$dir=Join-Path (Get-Location) "output/targeted-closeout-20261016/evidence/native-retry-$Phase$suffix"
if(Test-Path -LiteralPath $dir){throw 'Immutable recording destination occupied'}
New-Item -ItemType Directory $dir | Out-Null
function Control([string]$pattern,[switch]$Observe){
 for($i=0;$i -lt 12;$i++){
  & $adb -s $device shell uiautomator dump /sdcard/Download/targeted-retry.xml | Out-Null
  & $adb -s $device pull /sdcard/Download/targeted-retry.xml (Join-Path $dir 'ui.xml') | Out-Null
  [xml]$tree=Get-Content (Join-Path $dir 'ui.xml')
  $n=$tree.SelectNodes('//node') | Where-Object {$_.'content-desc' -match $pattern} | Select-Object -First 1
  if($n){if(!$Observe){$b=[regex]::Matches($n.bounds,'\d+')|ForEach-Object{[int]$_.Value};& $adb -s $device shell input tap ([int](($b[0]+$b[2])/2)) ([int](($b[1]+$b[3])/2))};return}
  Start-Sleep -Seconds 1
 };throw "Control unavailable: $pattern"
}
function Shot([string]$name){& $adb -s $device shell screencap -p /sdcard/Download/targeted-retry.png;& $adb -s $device pull /sdcard/Download/targeted-retry.png (Join-Path $dir "$name.png") | Out-Null}
Control '^Clips\s+Tab';Control '^Play video$' -Observe
$record=Start-Process -FilePath $adb -ArgumentList '-s',$device,'shell','screenrecord','--time-limit','60','/sdcard/Download/targeted-retry.mp4' -WindowStyle Hidden -PassThru
try{
 & $adb -s $device reverse --remove tcp:4000
 Control '^Next clip$'
 Control '^Retry$' -Observe;Shot 'actual-network-failure'
 & "$PSScriptRoot/mobile-loopback.ps1" -Device $device
 Control '^Retry$';Control '^Play video$' -Observe;Shot 'recovered-paused'
 Control '^Play video$';Start-Sleep -Seconds 2;Shot 'recovered-playing';Start-Sleep -Seconds 2;Shot 'recovered-playing-later'
}finally{
 & "$PSScriptRoot/mobile-loopback.ps1" -Device $device
 $record.WaitForExit()
 & $adb -s $device pull /sdcard/Download/targeted-retry.mp4 (Join-Path $dir 'interaction-uncut.mp4') | Out-Null
 & $adb -s $device logcat -d -s flutter:I | Select-String 'AGG_VIDEO_LOAD' | ForEach-Object{$_.Line} | Set-Content (Join-Path $dir 'load-stages.log')
}
@{phase=$Phase;cause='Deliberately removed only the owned emulator API loopback forwarding, restored before explicit Retry. Separate reproduced network failure; not an explanation for the historical incident.';apkHash=(Get-FileHash "output/targeted-closeout-20261016/main/aggregator-targeted-local-demo$suffix.apk").Hash} | ConvertTo-Json | Set-Content (Join-Path $dir 'identity.json')
