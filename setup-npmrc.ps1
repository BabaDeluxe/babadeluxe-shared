[CmdletBinding()]
param(
  [string]$WorkspaceRoot = $PSScriptRoot
)

$envFilePath = Join-Path $WorkspaceRoot '.env'
if (-not (Test-Path $envFilePath)) {
  Write-Host "· No .env found at $envFilePath — relying on shell environment."
  exit 0
}

Get-Content $envFilePath | ForEach-Object {
  if ($_ -match '^\s*$' -or $_ -match '^\s*#') { return }

  if ($_ -match '^\s*([^=]+?)\s*=\s*(.*?)\s*$') {
    $key   = $Matches[1]
    $value = $Matches[2] -replace '^["'']|["'']$'

    if (-not [System.Environment]::GetEnvironmentVariable($key)) {
      [System.Environment]::SetEnvironmentVariable($key, $value, 'Process')
    }
  }
}

Write-Host "✔ .env loaded → $envFilePath"

$npmToken        = $env:NPM_TOKEN
$npmPackageScope = $env:NPM_PACKAGE_SCOPE
$npmRegistry     = $env:NPM_REGISTRY
$npmRegistryUrl  = $env:NPM_REGISTRY_URL

$missing = @()
if (-not $npmToken)        { $missing += 'NPM_TOKEN' }
if (-not $npmPackageScope) { $missing += 'NPM_PACKAGE_SCOPE' }
if (-not $npmRegistry)     { $missing += 'NPM_REGISTRY' }
if (-not $npmRegistryUrl)  { $missing += 'NPM_REGISTRY_URL' }

if ($missing.Count -gt 0) {
  Write-Error "Missing required env vars: $($missing -join ', '). Add them to .env or export before running."
  exit 1
}

$template = @'
# @babadeluxe:registry=https://npflared.simonwaiblinger.workers.dev
$NPM_PACKAGE_SCOPE:registry=$NPM_REGISTRY_URL
//$NPM_REGISTRY/:_authToken=$NPM_TOKEN
legacy-peer-deps=true
'@

# $NPM_REGISTRY_URL must be replaced before $NPM_REGISTRY — it shares the same prefix
$npmrcContent = $template
  .Replace('$NPM_REGISTRY_URL',  $npmRegistryUrl)
  .Replace('$NPM_REGISTRY',      $npmRegistry)
  .Replace('$NPM_TOKEN',         $npmToken)
  .Replace('$NPM_PACKAGE_SCOPE', $npmPackageScope)

$npmrcPath = Join-Path $WorkspaceRoot '.npmrc'
Set-Content -Path $npmrcPath -Value $npmrcContent -Encoding UTF8
Write-Host "✔ .npmrc written → $npmrcPath"