import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { parseEnv } from 'node:util'
import { BaseError } from './src/utils/base-error.js'

const workspaceRoot = process.argv[2] ?? dirname(fileURLToPath(import.meta.url))
console.log('Workspace root:', workspaceRoot)

class SetupError extends BaseError {}

function applyEnvFile(
  filePath: string,
  target: Record<string, string>,
  label: string
): Record<string, string> {
  if (!existsSync(filePath)) {
    console.error('No env file found. Please create one.')
    throw new SetupError('Missing env file')
  }

  const myEnv = parseEnv(readFileSync(filePath).toString())

  const finalEnv: Record<string, string> = {}
  for (const [key, value] of Object.entries(target)) if (value) finalEnv[key] = value
  for (const [key, value] of Object.entries(myEnv)) if (value) finalEnv[key] = value

  console.log(`✔ ${label} loaded → ${filePath}`)

  return finalEnv
}

// Cascade: .env (base) → .env.local (overrides) → shell env (wins over both)
let merged: Record<string, string> = {}

const envPath = join(workspaceRoot, '.env')
const envLocalPath = join(workspaceRoot, '.env.local')

merged = applyEnvFile(envPath, merged, '.env')
merged = applyEnvFile(envLocalPath, merged, '.env.local (overrides .env)')

// Shell env wins — only set keys not already present
for (const [key, value] of Object.entries(merged)) {
  process.env[key] ||= value
  // console.log(`process.env[${key}] = ${value}`)
}

const requiredVars = ['NPM_TOKEN', 'NPM_PACKAGE_SCOPE', 'NPM_REGISTRY', 'NPM_REGISTRY_URL'] as const
const missing = requiredVars.filter((key) => !process.env[key])

if (missing.length > 0) {
  throw new SetupError(
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
