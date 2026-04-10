[CmdletBinding()]
param(
  [string]$WorkspaceRoot = $PSScriptRoot
)

function Read-EnvFile {
  param([string]$Path)

  $values = @{}
  Get-Content $Path | ForEach-Object {
    if ($_ -match '^\s*$' -or $_ -match '^\s*#') { return }

    if ($_ -match '^\s*([^=]+?)\s*=\s*(.*?)\s*$') {
      $values[$Matches[1]] = ($Matches[2] -replace '^["'']|["'']$').Trim()
    }
  }
  return $values
}

# Cascade: .env (base) → .env.local (overrides) → shell env (wins over both)
$merged = @{}

$envFile      = Join-Path $WorkspaceRoot '.env'
$envLocalFile = Join-Path $WorkspaceRoot '.env.local'

if (Test-Path $envFile) {
  Read-EnvFile $envFile | ForEach-Object { $_.GetEnumerator() | ForEach-Object { $merged[$_.Key] = $_.Value } }
  Write-Host "✔ .env loaded → $envFile"
}

if (Test-Path $envLocalFile) {
  Read-EnvFile $envLocalFile | ForEach-Object { $_.GetEnumerator() | ForEach-Object { $merged[$_.Key] = $_.Value } }
  Write-Host "✔ .env.local loaded → $envLocalFile (overrides .env)"
}

if ($merged.Count -eq 0 -and -not (Test-Path $envFile) -and -not (Test-Path $envLocalFile)) {
  Write-Host "· No .env or .env.local found — relying on shell environment."
}

# Apply merged values — shell env always wins
foreach ($entry in $merged.GetEnumerator()) {
  if (-not [System.Environment]::GetEnvironmentVariable($entry.Key)) {
    [System.Environment]::SetEnvironmentVariable($entry.Key, $entry.Value, 'Process')
  }
}

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
  Write-Error "Missing required env vars: $($missing -join ', '). Add them to .env.local or export before running."
  exit 1
}

$template = @'
# @babadeluxe:registry=https://npflared.simonwaiblinger.workers.dev
$NPM_PACKAGE_SCOPE:registry=$NPM_REGISTRY_URL
//$NPM_REGISTRY/:_authToken=$NPM_TOKEN
legacy-peer-deps=true
'@

# $NPM_REGISTRY_URL must be replaced before $NPM_REGISTRY — it shares the same prefix
$npmrcContent = $template.
  Replace('$NPM_REGISTRY_URL',  $npmRegistryUrl.Trim()).
  Replace('$NPM_REGISTRY',      $npmRegistry.Trim()).
  Replace('$NPM_TOKEN',         $npmToken.Trim()).
  Replace('$NPM_PACKAGE_SCOPE', $npmPackageScope.Trim())

$npmrcPath = Join-Path $WorkspaceRoot '.npmrc'
Set-Content -Path $npmrcPath -Value $npmrcContent -Encoding UTF8
Write-Host "✔ .npmrc written → $npmrcPath"

$packageJsonPath = Join-Path $WorkspaceRoot 'package.json'
if (Test-Path $packageJsonPath) {
  $pkg = Get-Content $packageJsonPath -Raw | ConvertFrom-Json

  if (-not $pkg.PSObject.Properties['publishConfig']) {
    $pkg | Add-Member -MemberType NoteProperty -Name 'publishConfig' -Value ([PSCustomObject]@{
      registry = $npmRegistryUrl.Trim()
    })

    $pkg | ConvertTo-Json -Depth 10 | Set-Content -Path $packageJsonPath -Encoding UTF8
    Write-Host "✔ publishConfig injected into package.json → registry: $npmRegistryUrl"
  } else {
    Write-Host "· publishConfig already present in package.json — skipping"
  }
} else {
  Write-Host "· No package.json found at $packageJsonPath — skipping publishConfig injection"
}
