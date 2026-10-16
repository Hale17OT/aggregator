param(
 [Parameter(Mandatory=$true)][string]$Apk,
 [string]$Report='docs/engineering/flutter-closeout/apk-security-sweep1.json'
)
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$resolvedApk=(Resolve-Path -LiteralPath $Apk).Path
$identity=(Get-FileHash -LiteralPath $resolvedApk -Algorithm SHA256).Hash.ToLowerInvariant()
$archive=[IO.Compression.ZipFile]::OpenRead($resolvedApk)
$patterns=@{
 'opaque-session-literal'='[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\.[a-f0-9]{64}'
 'private-key-header'='-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----'
 'credentialed-postgres-url'='postgres(?:ql)?://[^\s:/]+:[^\s@]+@'
}
$hits=@();$entries=@();$media=@();$notices=@();$scanned=0L
try {
 foreach($entry in $archive.Entries){
  $entries+=@{path=$entry.FullName;bytes=$entry.Length}
  if($entry.FullName -match '\.(mp4|webm|wav|mp3|m4a|aac|vtt)$'){$media+=$entry.FullName}
  if($entry.FullName -match '(?i)license|notice|guava'){$notices+=$entry.FullName}
  if($entry.Length -eq 0){continue}
  $stream=$entry.Open();$buffer=New-Object byte[] 262144;$tail='';$seen=@{}
  try {
   while(($count=$stream.Read($buffer,0,$buffer.Length)) -gt 0){
    $scanned+=$count;$text=$tail+[Text.Encoding]::Latin1.GetString($buffer,0,$count)
    foreach($name in $patterns.Keys){if(!$seen[$name] -and [regex]::IsMatch($text,$patterns[$name])){$hits+=@{path=$entry.FullName;pattern=$name};$seen[$name]=$true}}
    $tail=$text.Substring([Math]::Max(0,$text.Length-512))
   }
  } finally {$stream.Dispose()}
 }
} finally {$archive.Dispose()}
$result=@{at=[DateTime]::UtcNow.ToString('o');apk=@{path=$resolvedApk;sha256=$identity;bytes=(Get-Item -LiteralPath $resolvedApk).Length};entries=$entries;notices=$notices;bundledProgrammeMedia=$media;patternCandidates=$hits;scannedUncompressedBytes=$scanned;scope='All ZIP entry bytes streamed read-only. Limited credential-pattern scan; absence is not comprehensive secret or decompilation proof. Candidate values never printed. Media extension check is not full content recognition.'}
$result | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $Report
@{sha256=$identity;entries=$entries.Count;notices=$notices;mediaCount=$media.Count;candidateCount=$hits.Count;bytesScanned=$scanned} | ConvertTo-Json -Depth 4
