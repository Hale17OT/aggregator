$ErrorActionPreference = 'Stop'
. "$PSScriptRoot/stability-env.ps1"
$results = @()
foreach ($task in @('test','typecheck','lint','build','worker:check','check:secrets','check:ci')) {
  $log = Join-Path $aggregatorRoot ('.cache/flutter-root-' + $task.Replace(':','-') + '.log')
  $started = (Get-Date).ToUniversalTime().ToString('o')
  & "$PSScriptRoot/npm.ps1" run $task *> $log
  $code = $LASTEXITCODE
  $results += [ordered]@{task=$task;started=$started;ended=(Get-Date).ToUniversalTime().ToString('o');exitCode=$code;log=$log}
  $results | ConvertTo-Json -Depth 4 | Set-Content (Join-Path $aggregatorRoot 'docs/engineering/flutter-closeout/root-final-checks.json')
  Get-Content -LiteralPath $log -Tail 5
  if ($code) { throw "Root check failed: $task; preserved $log" }
}
