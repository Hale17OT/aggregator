# Use the checksum-verified local runtime when installed; otherwise use supported PATH Node.
$localRuntime = Join-Path $PSScriptRoot '../.cache/runtime/node-v22.22.3-win-x64'
if (Test-Path (Join-Path $localRuntime 'node.exe')) {
  $env:Path = (Resolve-Path $localRuntime).Path + ';' + $env:Path
}
& npm.cmd @args
exit $LASTEXITCODE
