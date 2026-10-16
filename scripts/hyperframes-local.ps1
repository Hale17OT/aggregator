$ErrorActionPreference = 'Stop'
$env:HYPERFRAMES_NO_TELEMETRY = '1'
$env:DO_NOT_TRACK = '1'
$env:HYPERFRAMES_NO_UPDATE_CHECK = '1'
$env:HYPERFRAMES_NO_AUTO_INSTALL = '1'
$env:HYPERFRAMES_BROWSER_PATH = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
$env:HYPERFRAMES_FFMPEG_PATH = (Resolve-Path '.cache/tools/ffmpeg/ffmpeg-9.0.2-essentials_build/bin/ffmpeg.exe').Path
$env:PATH = (Split-Path $env:HYPERFRAMES_FFMPEG_PATH) + ';' + $env:PATH
New-Item -ItemType Directory -Force -Path '.cache/render-temp' | Out-Null
$env:TEMP = (Resolve-Path '.cache/render-temp').Path
$env:TMP = $env:TEMP
# This child shell supplies no provider credentials to the offline renderer.
foreach ($providerName in @('GEMINI_API_KEY','GOOGLE_API_KEY','OPENAI_API_KEY','OPENROUTER_API_KEY','HYPERFRAMES_API_KEY')) { Remove-Item -LiteralPath "Env:$providerName" -ErrorAction SilentlyContinue }
if ($args[0] -notin @('check','snapshot','render','info','timeline')) { throw 'Only local review/render commands are allowed by this wrapper.' }
& ./.cache/runtime/node-v22.22.3-win-x64/node.exe .cache/showcase-tools/node_modules/hyperframes/bin/hyperframes.mjs @args
exit $LASTEXITCODE
