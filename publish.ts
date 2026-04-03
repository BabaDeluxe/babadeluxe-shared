import { execSync } from 'node:child_process'
import { chmodSync, existsSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import process from 'node:process'

const npmrcPath = join(homedir(), '.npmrc')
const registryHost = 'npflared.simonwaiblinger.workers.dev'
const scope = '@babadeluxe'
const token = process.env['NPM_TOKEN']

const authPrefix = `//${registryHost}/:_authToken=`
const scopeLine = `${scope}:registry=https://${registryHost}`

const existing = existsSync(npmrcPath) ? readFileSync(npmrcPath, 'utf8') : ''
const lines = existing.split(/\r?\n/)

const hasAuthLine = lines.some((line) => line.startsWith(authPrefix))
const hasScopeLine = lines.includes(scopeLine)

if (!hasAuthLine) {
  if (!token) {
    throw new Error(`Missing NPM_TOKEN in env and no existing auth token found in ${npmrcPath}`)
  }

  const filteredLines = lines
    .filter((line) => line.trim() !== '')
    .filter((line) => !line.startsWith(authPrefix))

  if (!hasScopeLine) {
    filteredLines.push(scopeLine)
  }

  filteredLines.push(`${authPrefix}${token}`)

  writeFileSync(npmrcPath, `${filteredLines.join('\n')}\n`, 'utf8')
  chmodSync(npmrcPath, 0o600)

  console.log(`Wrote auth token for ${scope} to ${npmrcPath}`)
} else if (hasScopeLine) {
  console.log(`Using existing auth config from ${npmrcPath}`)
} else {
  const filteredLines = lines.filter((line) => line.trim() !== '')
  filteredLines.push(scopeLine)

  writeFileSync(npmrcPath, `${filteredLines.join('\n')}\n`, 'utf8')
  chmodSync(npmrcPath, 0o600)

  console.log(`Added scope registry for ${scope} to ${npmrcPath}`)
}

const bump = process.argv[2] ?? 'patch'

execSync('npm run build', { stdio: 'inherit' })
execSync(`npm version ${bump}`, { stdio: 'inherit' })
execSync('npm publish', { stdio: 'inherit', env: process.env })
