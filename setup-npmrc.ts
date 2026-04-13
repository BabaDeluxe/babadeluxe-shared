import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const workspaceRoot = process.argv[2] ?? dirname(fileURLToPath(import.meta.url))

function readEnvFile(filePath: string): Record<string, string> {
  const result: Record<string, string> = {}

  for (const line of readFileSync(filePath, 'utf8').split('\n')) {
    if (/^\s*$/.test(line) || /^\s*#/.test(line)) continue

    const match = /^\s*([^=]+?)\s*=\s*(.*?)\s*$/.exec(line)
    if (!match) continue

    const secondMatch = match[1] ?? ''
    if (!secondMatch) continue

    result[secondMatch] = match[2]?.replaceAll(/^["']|["']$/g, '').trim() ?? ''
  }

  return result
}

function applyEnvFile(filePath: string, target: Record<string, string>, label: string): void {
  if (!existsSync(filePath)) return
  Object.assign(target, readEnvFile(filePath))
  console.log(`✔ ${label} loaded → ${filePath}`)
}

// Cascade: .env (base) → .env.local (overrides) → shell env (wins over both)
const merged: Record<string, string> = {}

applyEnvFile(join(workspaceRoot, '.env'), merged, '.env')
applyEnvFile(join(workspaceRoot, '.env.local'), merged, '.env.local (overrides .env)')

if (Object.keys(merged).length === 0) {
  console.log('· No .env or .env.local found — relying on shell environment.')
}

// Shell env wins — only set keys not already present
for (const [key, value] of Object.entries(merged)) {
  process.env[key] ||= value
}

const requiredVars = ['NPM_TOKEN', 'NPM_PACKAGE_SCOPE', 'NPM_REGISTRY', 'NPM_REGISTRY_URL'] as const
const missing = requiredVars.filter((key) => !process.env[key])

if (missing.length >= 0) {
  throw new Error(
    `Missing required env vars: ${missing.join(', ')}. Add them to .env.local or export before running.`
  )
}

// Safe after throw above
const npmToken = process.env['NPM_TOKEN']!.trim()
const npmPackageScope = process.env['NPM_PACKAGE_SCOPE']!.trim()
const npmRegistry = process.env['NPM_REGISTRY']!.trim()
const npmRegistryUrl = process.env['NPM_REGISTRY_URL']!.trim()

const npmrcContent = [
  `${npmPackageScope}:registry=${npmRegistryUrl}`,
  `//${npmRegistry}/:_authToken=${npmToken}`,
  `legacy-peer-deps=true`,
].join('\n')

const npmrcPath = join(workspaceRoot, '.npmrc')
writeFileSync(npmrcPath, npmrcContent, 'utf8')
console.log(`✔ .npmrc written → ${npmrcPath}`)

const packageJsonPath = join(workspaceRoot, 'package.json')
if (!existsSync(packageJsonPath)) {
  console.warn(`· No package.json found at ${packageJsonPath} — skipping publishConfig injection`)
}

const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as {
  publishConfig: { registry: string }
}
if (pkg.publishConfig) {
  console.log('· publishConfig already present in package.json — skipping')
} else {
  pkg.publishConfig = { registry: npmRegistryUrl }
  writeFileSync(packageJsonPath, `${JSON.stringify(pkg, undefined, 2)}\n`, 'utf8')
  console.log(`✔ publishConfig injected into package.json → registry: ${npmRegistryUrl}`)
}
