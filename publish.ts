import { execSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'

const bump = process.argv[2] ?? 'patch'

const npmrcPath = resolve(process.cwd(), '.npmrc')
const token = process.env['NPM_TOKEN']

if (!token) {
  throw new Error('Missing NPM_TOKEN in .env.local')
}

const originalNpmrc = readFileSync(npmrcPath, 'utf8')
const updatedNpmrc = originalNpmrc.replace(/(:_authToken=)(.*)/, `$1${token}`)

if (originalNpmrc === updatedNpmrc) {
  throw new Error('Could not replace auth token in .npmrc')
}

writeFileSync(npmrcPath, updatedNpmrc, 'utf8')

try {
  execSync('npm run build', { stdio: 'inherit' })
  execSync(`npm version ${bump}`, { stdio: 'inherit' })
  execSync('npm publish', {
    stdio: 'inherit',
    env: process.env,
  })
} finally {
  writeFileSync(npmrcPath, originalNpmrc, 'utf8')
}
