import { chmodSync, existsSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import process from 'node:process'

const token = process.env['NPM_TOKEN']
if (!token) {
  throw new Error('Missing NPM_TOKEN in .env.local')
}

const npmrcPath = join(homedir(), '.npmrc')
const registryHost = 'npflared.simonwaiblinger.workers.dev'
const scope = '@babadeluxe'

const authLine = `//${registryHost}/:_authToken=${token}`
const scopeLine = `${scope}:registry=https://${registryHost}`

const existing = existsSync(npmrcPath) ? readFileSync(npmrcPath, 'utf8') : ''
const lines = existing
  .split(/\r?\n/)
  .filter(Boolean)
  .filter((line) => !line.startsWith(`//${registryHost}/:_authToken=`))
  .filter((line) => !line.startsWith(`${scope}:registry=`))

const next = [...lines, scopeLine, authLine, ''].join('\n')

writeFileSync(npmrcPath, next, 'utf8')
chmodSync(npmrcPath, 0o600)

console.log(`Wrote auth token for ${scope} to ${npmrcPath}`)
