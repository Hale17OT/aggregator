$ErrorActionPreference = 'Stop'
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$dataPath = [IO.Path]::GetFullPath((Join-Path $repoRoot '.cache/pg17-disposable'))
if (-not $dataPath.StartsWith($repoRoot + [IO.Path]::DirectorySeparatorChar)) { throw 'Cluster outside workspace' }
if (Test-Path $dataPath) { throw 'Disposable cluster already exists; inspect it before rerunning' }
if (Get-NetTCPConnection -LocalPort 55439 -State Listen -ErrorAction SilentlyContinue) { throw 'Fixture port in use' }
$pgBin = 'C:/Program Files/PostgreSQL/17/bin'
& "$pgBin/initdb.exe" -D $dataPath -U aggregator_fixture -A trust --no-locale -E UTF8
if ($LASTEXITCODE) { throw 'initdb failed' }
& "$pgBin/pg_ctl.exe" -D $dataPath -l (Join-Path $repoRoot '.cache/pg17.log') -o '-h 127.0.0.1 -p 55439' -w start
if ($LASTEXITCODE) { throw 'fixture cluster start failed' }
try {
  & "$pgBin/createdb.exe" -h 127.0.0.1 -p 55439 -U aggregator_fixture aggregator_disposable
  if ($LASTEXITCODE) { throw 'createdb failed' }
  $actualDir = & "$pgBin/psql.exe" -h 127.0.0.1 -p 55439 -U aggregator_fixture -d aggregator_disposable -Atc 'SHOW data_directory'
  if ([IO.Path]::GetFullPath($actualDir.Trim()) -ne $dataPath) { throw 'Unexpected data directory' }
  $identity = & "$pgBin/psql.exe" -h 127.0.0.1 -p 55439 -U aggregator_fixture -d aggregator_disposable -Atc "SELECT current_database(), inet_server_addr(), inet_server_port(), version()"
  $identity | Set-Content (Join-Path $repoRoot 'docs/engineering/database-target.txt')
  & "$pgBin/psql.exe" -X -h 127.0.0.1 -p 55439 -U aggregator_fixture -d aggregator_disposable -v ON_ERROR_STOP=1 -f (Join-Path $repoRoot 'docs/specs/engineering/001_launch_schema.sql')
  if ($LASTEXITCODE) { throw 'reference DDL failed' }
  & "$pgBin/psql.exe" -X -h 127.0.0.1 -p 55439 -U aggregator_fixture -d aggregator_disposable -v ON_ERROR_STOP=1 -f (Join-Path $repoRoot 'tests/reference-db.sql')
  if ($LASTEXITCODE) { throw 'constraint test failed' }
} finally {
  & "$pgBin/pg_ctl.exe" -D $dataPath -m fast -w stop
}
