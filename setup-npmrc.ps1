[CmdletBinding()]
param(
  [string]$WorkspaceRoot = $PSScriptRoot
)

# Load .env from workspace root — existing env vars win (non-destructive)
$envFilePath = Join-Path $WorkspaceRoot '.env'
if (Test-Path $envFilePath) {
  Get-Content $envFilePath | ForEach-Object {
    # Skip blank lines and comments
    if ($_ -match '^\s*$' -or $_ -match '^\s*#') { return }

    if ($_ -match '^\s*([^=]+?)\s*=\s*(.*?)\s*$') {
      $key   = $Matches[1]
      # Strip surrounding quotes from value if present
      $value = $Matches[2] -replace '^["'']|["'']$'

      if (-not [System.Environment]::GetEnvironmentVariable($key)) {
        [System.Environment]::SetEnvironmentVariable($key, $value, 'Process')
      }
    }
  }

  Write-Host "✔ .env loaded → $envFilePath"
} else {
  Write-Host "· No .env found at $envFilePath — relying on shell environment. Exiting..."
  Exit-PSSession
}

$npmToken = $env:NPM_TOKEN
$npmPackageScope = $env:NPM_PACKAGE_SCOPE
$npmRegistry = $env:NPM_REGISTRY
$npmRegistryUrl = $env:NPM_REGISTRY_URL

if (-not $npmToken) {
  Write-Error "NPM_TOKEN is not set. Add it to .env or export it before running this script."
  exit 1
}

if (-not $npmPackageScope) {
  Write-Error "NPM_PACKAGE_SCOPE is not set. Add it to .env or export it before running this script."
  exit 1
}

if (-not $npmRegistry) {
  Write-Error "NPM_REGISTRy is not set. Add it to .env or export it before running this script."
  exit 1
}

if (-not $npmRegistryUrl) {
  Write-Error "NPM_REGISTRY_URL is not set. Add it to .env or export it before running this script."
  exit 1
}

$template = @'
# @babadeluxe:registry=https://npflared.simonwaiblinger.workers.dev
$NPM_PACKAGE_SCOPE:registry=$NPM_REGISTRY_URL
//$NPM_REGISTRY/:_authToken=$NPM_TOKEN
legacy-peer-deps=true
'@

$npmrcContent = $template
while($npmrcContent.Contains('$NPM_TOKEN')) {
  $npmrcContent = $npmrcContent.Replace('$NPM_TOKEN', $npmToken)
}
while($npmrcContent.Contains('$NPM_REGISTRY_URL')) {
  $npmrcContent = $npmrcContent.Replace('$NPM_REGISTRY_URL', $npmRegistryUrl)
}
while($npmrcContent.Contains('$NPM_REGISTRY')) {
  $npmrcContent = $npmrcContent.Replace('$NPM_REGISTRY', $npmRegistry)
}
while($npmrcContent.Contains('$NPM_PACKAGE_SCOPE')) {
  $npmrcContent = $npmrcContent.Replace('$NPM_PACKAGE_SCOPE', $npmPackageScope)
}

$npmrcPath = Join-Path $WorkspaceRoot '.npmrc'

Set-Content -Path $npmrcPath -Value $npmrcContent -Encoding UTF8 -NoNewline:$false
Write-Host "✔ .npmrc written → $npmrcPath"