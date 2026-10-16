$aggregatorRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
if ($aggregatorRoot -ne 'E:\Hale\Coding\Personal\aggregator') { throw 'Unexpected workspace' }
$aggregatorCapacity = @(Get-PSDrive C,E | ForEach-Object { @{drive=$_.Name; freeGiB=[math]::Round($_.Free/1GB,3)} })
if ((Get-PSDrive C).Free -lt 10GB -or (Get-PSDrive E).Free -lt 20GB) { throw 'Project reserve requires 10 GiB C: and 20 GiB E: before heavy work' }
foreach ($relative in @('.cache/stability-tmp','.cache/stability-browsers','output/playwright/stability')) {
  $target = [IO.Path]::GetFullPath((Join-Path $aggregatorRoot $relative))
  if (!$target.StartsWith($aggregatorRoot+'\')) { throw 'Unsafe output path' }
  $parent = $target
  while ($parent) { if ((Test-Path -LiteralPath $parent) -and ((Get-Item -LiteralPath $parent).Attributes -band [IO.FileAttributes]::ReparsePoint)) { throw 'Reparse point refused' }; $parent=Split-Path $parent; if (!$parent -or $parent -eq 'E:\') { break } }
  New-Item -ItemType Directory -Path $target -Force | Out-Null
}
$env:TEMP=Join-Path $aggregatorRoot '.cache/stability-tmp'
$env:TMP=$env:TEMP
$env:PLAYWRIGHT_BROWSERS_PATH=Join-Path $aggregatorRoot '.cache/stability-browsers'
$env:PLAYWRIGHT_SKIP_BROWSER_GC='1'
$aggregatorNode=Join-Path $aggregatorRoot '.cache/runtime/node-v22.22.3-win-x64/node.exe'
@{at=(Get-Date).ToUniversalTime().ToString('o');capacity=$aggregatorCapacity;policy='Project operating reserve, not a universal Windows requirement: C 10 GiB; E 20 GiB';estimatedScratchGiB=6;temporary=$env:TEMP;browsers=$env:PLAYWRIGHT_BROWSERS_PATH;output=(Join-Path $aggregatorRoot 'output/playwright/stability');scope='Child-process environment only; no deletion or global changes'} | ConvertTo-Json -Depth 5 | Set-Content (Join-Path $aggregatorRoot 'docs/engineering/stability-capacity.json')
