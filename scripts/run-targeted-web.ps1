$ErrorActionPreference='Stop'
. "$PSScriptRoot/stability-env.ps1"
foreach($task in @('test','typecheck','lint','build')) {
  & "$PSScriptRoot/npm.ps1" run $task *> ".cache/targeted-root-$task.log"
  if($LASTEXITCODE){throw "Root $task failed; preserved log"}
}
& "$PSScriptRoot/npm.ps1" run demo:restart-web
if($LASTEXITCODE){throw 'Owned web restart failed'}
& $aggregatorNode scripts/check-targeted-newsroom.mjs 1 *> .cache/targeted-newsroom-extra.log
if($LASTEXITCODE){throw 'Extended Newsroom failed'}
foreach($check in @('check-broadcast-video-ui.mjs','check-shortform.mjs','check-shortform-failures.mjs','check-shortform-member.mjs','check-browser.mjs','check-enhanced-controls.mjs','check-radio-dials.mjs','check-programme-handoff.mjs')) {
  & $aggregatorNode scripts/run-targeted-check.mjs $check 1
  if($LASTEXITCODE){throw "Regression $check failed; preserved run folder"}
}
