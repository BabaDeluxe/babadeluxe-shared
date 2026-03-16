import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { defineBuildConfig, type MkdistBuildEntry } from 'unbuild'

const _filename = fileURLToPath(import.meta.url)
const _dirname = path.dirname(_filename)

type PackageJsonExportsTarget = {
  readonly types?: string
  readonly import?: string
  readonly require?: string
}

type PackageJson = {
  readonly exports?: Record<string, PackageJsonExportsTarget>
}

const packageJsonPath = path.join(_dirname, 'package.json')
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as PackageJson

const isSubpathKey = (key: string): boolean => key !== '.'

const toSrcDir = (exportTarget: PackageJsonExportsTarget): string => {
  const importPath = exportTarget.import ?? exportTarget.require ?? exportTarget.types
  if (!importPath) {
    throw new Error('Export target without import/require/types is not supported for mkdist')
  }

  const dirFromDist = path.dirname(importPath) // ./dist/utils
  const relativeDir = dirFromDist.replace(/^\.\/dist/, './src')
  return relativeDir
}

const toOutDir = (exportTarget: PackageJsonExportsTarget): string => {
  const importPath = exportTarget.import ?? exportTarget.require ?? exportTarget.types
  if (!importPath) {
    throw new Error('Export target without import/require/types is not supported for mkdist')
  }

  return path.dirname(importPath)
}

const createMkdistEntriesFromExports = (): MkdistBuildEntry[] => {
  if (!packageJson.exports) {
    return []
  }

  return Object.entries(packageJson.exports)
    .filter(([key]) => isSubpathKey(key))
    .map(([, target]) => ({
      builder: 'mkdist',
      input: toSrcDir(target),
      outDir: toOutDir(target),
      format: 'esm',
    }))
}

const mkdistEntries = createMkdistEntriesFromExports()

export default defineBuildConfig({
  entries: [
    // Main entry: mkdist the whole src so everything stays modular
    {
      builder: 'mkdist',
      input: './src',
      outDir: './dist',
      format: 'esm',
    },
    ...mkdistEntries,
  ],

  outDir: 'dist',
  declaration: true,

  rollup: {
    emitCJS: true,
    inlineDependencies: false,
  },

  clean: true,
})
