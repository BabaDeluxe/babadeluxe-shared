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

const isSubpathKey = (key: string): boolean => key !== '.' && !key.includes('*')

const toSrcDir = (exportTarget: PackageJsonExportsTarget): string => {
  const importPath = exportTarget.import ?? exportTarget.require ?? exportTarget.types
  if (!importPath) {
    throw new Error('Export target without import/require/types is not supported for mkdist')
  }

  const fileFromDist = importPath.replace(/^\.\/dist/, './src')
  const dirFromDist = path.dirname(fileFromDist)

  // If it points directly to a file that exists (with .ts extension), we use that directory
  // But mkdist works on directories, so we return the directory.
  return dirFromDist
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

  const entries: MkdistBuildEntry[] = []
  const processedDirs = new Set<string>()

  for (const [key, target] of Object.entries(packageJson.exports)) {
    if (isSubpathKey(key)) {
      const srcDir = toSrcDir(target)
      const outDir = toOutDir(target)
      const dirKey = `${srcDir}->${outDir}`

      if (processedDirs.has(dirKey)) continue
      processedDirs.add(dirKey)

      // Add ESM entry
      entries.push(
        {
          builder: 'mkdist',
          input: srcDir,
          outDir,
          format: 'esm',
          ext: 'mjs',
          declaration: true,
        },
        {
          builder: 'mkdist',
          input: srcDir,
          outDir,
          format: 'cjs',
          ext: 'cjs',
          declaration: false,
        }
      )
    }
  }

  return entries
}

const mkdistEntries = createMkdistEntriesFromExports()

export default defineBuildConfig({
  entries: [
    // Main entry ESM
    {
      builder: 'mkdist',
      input: './src',
      outDir: './dist',
      format: 'esm',
      ext: 'mjs',
      declaration: true,
    },
    // Main entry CJS
    {
      builder: 'mkdist',
      input: './src',
      outDir: './dist',
      format: 'cjs',
      ext: 'cjs',
      declaration: false,
    },
    ...mkdistEntries,
  ],

  outDir: 'dist',
  declaration: true,

  rollup: {
    emitCJS: true,
    inlineDependencies: false,
    esbuild: {
      minify: false,
      keepNames: true,
    },
  },

  clean: true,
})
