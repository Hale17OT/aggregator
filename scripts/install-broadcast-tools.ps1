$ErrorActionPreference = 'Stop'
$taskRoot = Split-Path -Parent $PSScriptRoot
Push-Location $taskRoot
try {
  New-Item -ItemType Directory -Force .cache/tools/ffmpeg | Out-Null
  $taskArchive = '.cache/tools/ffmpeg/release.zip'
  if (-not (Test-Path -LiteralPath $taskArchive)) {
    # Gyan is a Windows build distributor linked by ffmpeg.org/download.html.
    Invoke-WebRequest 'https://github.com/GyanD/codexffmpeg/releases/download/9.0.2/ffmpeg-9.0.2-essentials_build.zip' -OutFile $taskArchive -TimeoutSec 180
  }
  if ((Get-Item -LiteralPath $taskArchive).Length -ne 114768076 -or (Get-FileHash -LiteralPath $taskArchive).Hash.ToLowerInvariant() -ne '60f467265b1e312373dbcd92200c2618a74850f98d3d078e94296bb3fa2047ba') { throw 'FFmpeg pinned archive verification failed' }
  if (-not (Test-Path -LiteralPath '.cache/tools/ffmpeg/ffmpeg-9.0.2-essentials_build/bin/ffmpeg.exe')) { Expand-Archive -LiteralPath $taskArchive -DestinationPath .cache/tools/ffmpeg }
  Write-Output 'Verified workspace FFmpeg/ffprobe ready. GPLv3 notices remain in extracted archive; local rendering only.'
} finally { Pop-Location }
