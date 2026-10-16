$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
Push-Location $projectRoot
try {
  New-Item -ItemType Directory -Force .cache/speech-runtime,.cache/speech-model/onnx,.cache/tools/rhubarb | Out-Null
  Copy-Item -LiteralPath packages/programme/runtime-package.json -Destination .cache/speech-runtime/package.json
  Copy-Item -LiteralPath packages/programme/runtime-lock.json -Destination .cache/speech-runtime/package-lock.json
  & ./scripts/npm.ps1 ci --prefix .cache/speech-runtime --ignore-scripts
  if ($LASTEXITCODE -ne 0) { throw 'Speech dependency installation failed' }
  $modelBase = 'https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX/resolve/1939ad2a8e416c0acfeecc08a694d14ef25f2231'
  foreach ($modelFile in @('config.json','tokenizer.json','tokenizer_config.json','onnx/model_quantized.onnx')) {
    if (-not (Test-Path -LiteralPath ".cache/speech-model/$modelFile")) { Invoke-WebRequest "$modelBase/$modelFile" -OutFile ".cache/speech-model/$modelFile" }
  }
  if ((Get-FileHash -LiteralPath .cache/speech-model/onnx/model_quantized.onnx).Hash -ne 'FBAE9257E1E05FFC727E951EF9B9C98418E6D79F1C9B6B13BD59F5C9028A1478') { throw 'Model checksum mismatch' }
  if (-not (Test-Path -LiteralPath .cache/tools/rhubarb/release.zip)) { Invoke-WebRequest 'https://github.com/DanielSWolf/rhubarb-lip-sync/releases/download/v1.14.0/Rhubarb-Lip-Sync-1.14.0-Windows.zip' -OutFile .cache/tools/rhubarb/release.zip }
  if ((Get-FileHash -LiteralPath .cache/tools/rhubarb/release.zip).Hash -ne '62FA416A8D5E382A3828EE4BEF358CE520D0B4CABDEAEA75A7AC266D098D1FE3') { throw 'Lip-sync tool checksum mismatch' }
  Expand-Archive -LiteralPath .cache/tools/rhubarb/release.zip -DestinationPath .cache/tools/rhubarb -Force
  Write-Host 'Pinned workspace-local speech and lip-sync tools ready. Ordinary generation/playback is offline.'
} finally { Pop-Location }
