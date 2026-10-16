param([Parameter(Mandatory=$true)][string]$Device,[switch]$Remove)
$ErrorActionPreference='Stop'
if($Device -notmatch '^[A-Za-z0-9._:-]+$'){throw 'Invalid selected device'}
foreach($port in @(3000,4000,8025)) {
 if($Remove){ & adb -s $Device reverse --remove "tcp:$port" }
 else { & adb -s $Device reverse "tcp:$port" "tcp:$port" }
 if($LASTEXITCODE -ne 0){throw 'Scoped forwarding failed'}
}
Write-Output 'Selected-device application and mailbox forwarding configured; database not forwarded.'
