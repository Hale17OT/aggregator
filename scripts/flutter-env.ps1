$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'stability-env.ps1')
$env:PUB_CACHE = Join-Path $aggregatorRoot '.cache/flutter-pub'
$env:GRADLE_USER_HOME = Join-Path $aggregatorRoot '.cache/flutter-gradle'
$env:ANDROID_HOME = 'C:\Android\Sdk'
$env:JAVA_HOME = 'C:\Program Files\Android\Android Studio\jbr'
foreach ($target in @($env:PUB_CACHE,$env:GRADLE_USER_HOME)) { New-Item -ItemType Directory -Force -Path $target | Out-Null }
