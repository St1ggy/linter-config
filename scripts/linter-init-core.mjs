// Shared logic for @st1ggy/linter-config CLI (no prompts).

import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import { OXFMT_STACKS, OX_FRAMEWORK_PACKAGES, oxStackToolVersions } from '../src/oxlint/stacks.js'

export const PACKAGE = '@st1ggy/linter-config'

const BASE_STACK_KEYS = ['common', 'react', 'solid', 'next', 'svelte', 'astro']

export const STACK_KEYS = [...BASE_STACK_KEYS, ...BASE_STACK_KEYS.map((key) => `${key}-ox`)]

export const STACKS = {
  common: {
    eslint: 'eslint-common',
    prettier: 'prettier-common',
    stylelint: 'stylelint-scss',
    packages: [],
  },
  react: {
    eslint: 'eslint-react',
    prettier: 'prettier-common',
    stylelint: 'stylelint-scss',
    packages: ['eslint-plugin-react', 'eslint-plugin-react-hooks'],
  },
  solid: {
    eslint: 'eslint-solid',
    prettier: 'prettier-common',
    stylelint: 'stylelint-scss',
    packages: ['eslint-plugin-solid'],
  },
  next: {
    eslint: 'eslint-next',
    prettier: 'prettier-common',
    stylelint: 'stylelint-scss',
    packages: ['@next/eslint-plugin-next', 'eslint-plugin-react', 'eslint-plugin-react-hooks'],
  },
  svelte: {
    eslint: 'eslint-svelte',
    prettier: 'prettier-svelte',
    stylelint: 'stylelint-scss',
    packages: ['eslint-plugin-svelte', 'prettier-plugin-svelte'],
  },
  astro: {
    eslint: 'eslint-astro',
    prettier: 'prettier-astro',
    stylelint: 'stylelint-scss',
    packages: ['eslint-plugin-astro', 'eslint-plugin-jsx-a11y', 'prettier-plugin-astro'],
  },
}

export const STACK_CHOICES = [
  {
    value: 'common',
    name: 'common — TypeScript/JS base + Stylelint (default)',
  },
  {
    value: 'react',
    name: 'react — React + hooks on top of common',
  },
  {
    value: 'solid',
    name: 'solid — SolidJS + reactivity rules on top of common',
  },
  {
    value: 'next',
    name: 'next — Next.js App Router on top of react',
  },
  {
    value: 'svelte',
    name: 'svelte — Svelte + Prettier plugin for Svelte',
  },
  {
    value: 'astro',
    name: 'astro — Astro + Prettier plugin for Astro',
  },
]

for (const key of BASE_STACK_KEYS) {
  const base = STACKS[key]

  base.linterFile = 'eslint.config.js'
  base.linterPreset = base.eslint
  base.formatterFile = 'prettier.config.js'
  base.formatterPreset = base.prettier
  const hasOxfmt = OXFMT_STACKS.includes(key)

  STACKS[`${key}-ox`] = {
    linterFile: 'oxlint.config.ts',
    linterPreset: `${key}-ox`,
    prettier: base.prettier,
    formatterFile: hasOxfmt ? 'oxfmt.config.ts' : 'prettier.config.js',
    formatterPreset: hasOxfmt ? 'oxfmt-common' : base.prettier,
    stylelint: base.stylelint,
    packages: [...Object.keys(oxStackToolVersions(key)), ...OX_FRAMEWORK_PACKAGES[key]],
  }
  STACK_CHOICES.push({
    value: `${key}-ox`,
    name: `${key}-ox — Oxlint + native TypeScript 7 + ${hasOxfmt ? 'Oxfmt' : 'Prettier'}`,
  })
}

export function readPackageJson(directory) {
  const filePath = path.join(directory, 'package.json')

  if (!existsSync(filePath)) {
    return null
  }

  try {
    return JSON.parse(readFileSync(filePath, 'utf8'))
  } catch {
    return null
  }
}

export function mergedDependencies(packageJson) {
  return {
    ...packageJson.optionalDependencies,
    ...packageJson.peerDependencies,
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  }
}

export function isSelfPackageRoot(directory) {
  const packageJson = readPackageJson(directory)

  return packageJson?.name === PACKAGE
}

function packageManifestPath(startDirectory, packageName) {
  let currentDirectory = path.resolve(startDirectory)
  const packageParts = packageName.split('/')

  while (true) {
    const marker = path.join(currentDirectory, 'node_modules', ...packageParts, 'package.json')

    if (existsSync(marker)) {
      return marker
    }

    const parentDirectory = path.dirname(currentDirectory)

    if (parentDirectory === currentDirectory) {
      break
    }

    currentDirectory = parentDirectory
  }

  return null
}

export function hasResolvablePackage(startDirectory, packageName = PACKAGE) {
  return packageManifestPath(startDirectory, packageName) !== null
}

function hasRequestedVersion(directory, packageName, spec) {
  const marker = packageManifestPath(directory, packageName)

  if (!marker) {
    return false
  }

  try {
    return JSON.parse(readFileSync(marker, 'utf8')).version === spec.split('@').at(-1)
  } catch {
    return false
  }
}

export function detectPackageManager(startDirectory) {
  let currentDirectory = path.resolve(startDirectory)

  while (true) {
    if (existsSync(path.join(currentDirectory, 'pnpm-lock.yaml'))) {
      return 'pnpm'
    }

    if (existsSync(path.join(currentDirectory, 'yarn.lock'))) {
      return 'yarn'
    }

    if (existsSync(path.join(currentDirectory, 'bun.lock'))) {
      return 'bun'
    }

    if (existsSync(path.join(currentDirectory, 'package-lock.json'))) {
      return 'npm'
    }

    const parentDirectory = path.dirname(currentDirectory)

    if (parentDirectory === currentDirectory) {
      return 'npm'
    }

    currentDirectory = parentDirectory
  }
}

export function runPmSync(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, env: process.env, stdio: 'inherit' })

  if (result.error) {
    throw result.error
  }

  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} exited with ${result.status}`)
  }
}

// skipInstall: skip npm install; options.quiet: suppress stderr warnings
export function ensureDevDependencies(targetDirectory, packages, shouldSkipInstall, options = {}) {
  const { quiet = false, specs = {} } = options

  if (shouldSkipInstall) {
    return
  }

  const directory = path.resolve(targetDirectory)

  const packageJsonPath = path.join(directory, 'package.json')

  if (!existsSync(packageJsonPath)) {
    if (!quiet) {
      process.stderr.write(
        `warning: no package.json in ${directory}; add the packages manually: npm i -D ${packages.join(' ')}\n`,
      )
    }

    return
  }

  const packageJson = readPackageJson(directory)

  if (!packageJson) {
    return
  }

  const dependencies = mergedDependencies(packageJson)
  const packagesToAdd = packages.filter(
    (packageName) =>
      !Object.hasOwn(dependencies, packageName) ||
      (specs[packageName] && !hasRequestedVersion(directory, packageName, specs[packageName])),
  )
  const hasUnresolvedPackage = packages.some((packageName) => !hasResolvablePackage(directory, packageName))

  if (!hasUnresolvedPackage && packagesToAdd.length === 0) {
    return
  }

  const pm = detectPackageManager(directory)

  if (packagesToAdd.length === 0) {
    if (!quiet) {
      process.stdout.write(`install: ${pm} install (${directory}) — selected packages already listed\n`)
    }

    const sync = {
      npm: () => runPmSync('npm', ['install'], directory),
      pnpm: () => runPmSync('pnpm', ['install'], directory),
      yarn: () => runPmSync('yarn', ['install'], directory),
      bun: () => runPmSync('bun', ['install'], directory),
    }

    sync[pm]()

    return
  }

  const requested = packagesToAdd.map((name) => specs[name] ?? name)
  const shouldPin = requested.some((name, index) => name !== packagesToAdd[index])

  if (!quiet) {
    process.stdout.write(`install: ${pm} add -D ${requested.join(' ')} (${directory})\n`)
  }

  const add = {
    npm: () => runPmSync('npm', ['install', '-D', ...(shouldPin ? ['--save-exact'] : []), ...requested], directory),
    pnpm: () => runPmSync('pnpm', ['add', '-D', ...(shouldPin ? ['--save-exact'] : []), ...requested], directory),
    yarn: () => runPmSync('yarn', ['add', '-D', ...(shouldPin ? ['--exact'] : []), ...requested], directory),
    bun: () => runPmSync('bun', ['add', '-d', ...(shouldPin ? ['--exact'] : []), ...requested], directory),
  }

  add[pm]()
}

export function ensureDevDependency(targetDirectory, shouldSkipInstall, options = {}) {
  ensureDevDependencies(targetDirectory, [PACKAGE], shouldSkipInstall, options)
}

export function stackPackages(stackKey) {
  const stack = STACKS[stackKey]

  if (!stack) {
    throw new Error(`Unknown stack "${stackKey}". Use: ${STACK_KEYS.join(', ')}`)
  }

  return [PACKAGE, ...stack.packages]
}

export function stackPackageSpecs(stackKey) {
  stackPackages(stackKey)

  if (!stackKey.endsWith('-ox')) {
    return {}
  }

  const versions = oxStackToolVersions(stackKey.slice(0, -3))

  return Object.fromEntries(Object.entries(versions).map(([name, version]) => [name, `${name}@${version}`]))
}

export function printHelp() {
  process.stdout.write(`\
${PACKAGE} — generate local wrapper configs in a consumer project.

Always opens a guided menu in an interactive terminal. Stack flags preselect a choice.

Commands:
  init     Create missing files only (skip existing).
  migrate  Optionally remove legacy configs, then overwrite wrapper files.
  reinit   Alias for migrate.
  create   Alias for init.

Writes (each command):
  ESLint stacks: eslint.config.js, prettier.config.js, stylelint.config.js.
  common/react/solid/next-ox: oxlint.config.ts, oxfmt.config.ts, stylelint.config.js.
  svelte/astro-ox: oxlint.config.ts, prettier.config.js, stylelint.config.js.

Unless --skip-install: if package.json exists, runs the detected package manager to add or sync
${PACKAGE} and the selected stack's integration plugins.

Stack (at most one; default: common):
  --common | --react | --solid | --next | --svelte | --astro
  --common-ox | --react-ox | --solid-ox | --next-ox | --svelte-ox | --astro-ox

Options:
  --dir, -d       Target directory (default: current working directory).
  --skip-install  Do not run npm/pnpm/yarn/bun (only write wrapper files).
  -i, --interactive  Accepted for compatibility; the menu is always interactive.

Examples (after: npm i -D ${PACKAGE}):
  npx ${PACKAGE}
  npx ${PACKAGE} init
  npx ${PACKAGE} init --react
  npx ${PACKAGE} init --solid
  npx ${PACKAGE} init --solid-ox
  npx ${PACKAGE} migrate --svelte --dir ./apps/web
  npx ${PACKAGE} init --astro
  npm exec ${PACKAGE} -- init --common

Without prior install (downloads this package; then runs the same CLI):
  npx --yes ${PACKAGE} init --astro

Repo (paths from root):
  node scripts/linter-init.mjs init --common
`)
}

export function jsReExport(subpath, hasSemicolon = true) {
  return `export { default } from '${PACKAGE}/${subpath}'${hasSemicolon ? ';' : ''}\n`
}

export function resolveTargetDirectory(raw) {
  return path.resolve(raw)
}

export function writeFile(targetDirectory, name, content, overwrite, options = {}) {
  const { quiet = false } = options
  const filePath = path.join(targetDirectory, name)

  if (!overwrite && existsSync(filePath)) {
    if (!quiet) {
      process.stdout.write(`skip (exists): ${name}\n`)
    }

    return false
  }

  mkdirSync(targetDirectory, { recursive: true })
  writeFileSync(filePath, content, 'utf8')

  if (!quiet) {
    process.stdout.write(`write: ${name}\n`)
  }

  return true
}

export function wrapperFileNames(stackKey = 'common') {
  stackPackages(stackKey)

  return [STACKS[stackKey].linterFile, STACKS[stackKey].formatterFile, 'stylelint.config.js']
}

export function existingWrapperFiles(targetDirectory, stackKey = 'common') {
  return wrapperFileNames(stackKey).filter((name) => existsSync(path.join(targetDirectory, name)))
}

export function legacyConfigFiles(targetDirectory, stackKey = 'common') {
  if (!existsSync(targetDirectory)) {
    return []
  }

  const wrappers = new Set(wrapperFileNames(stackKey))

  return readdirSync(targetDirectory, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isFile() && /(?:eslint|oxlint|oxfmt|prettier|stylelint)/i.test(entry.name) && !wrappers.has(entry.name),
    )
    .map((entry) => entry.name)
    .toSorted((left, right) => left.localeCompare(right))
}

export function removeFiles(targetDirectory, names) {
  for (const name of names) {
    rmSync(path.join(targetDirectory, name), { force: true })
  }
}

export function resolveStackKey(values) {
  const chosen = []

  for (const key of STACK_KEYS) {
    if (values[key] === true) {
      chosen.push(key)
    }
  }

  if (chosen.length === 0) {
    return 'common'
  }

  if (chosen.length > 1) {
    const flags = STACK_KEYS.map((key) => `--${key}`).join(', ')

    throw new Error(`Pick at most one stack flag: ${flags}`)
  }

  return chosen[0]
}

export function run(mode, targetDirectory, stackKey, options = {}) {
  const { quiet = false } = options
  const stack = STACKS[stackKey]

  if (!stack) {
    throw new Error(`Unknown stack "${stackKey}". Use: ${STACK_KEYS.join(', ')}`)
  }

  const shouldOverwrite = mode === 'migrate' || mode === 'reinit'

  const hasSemicolon = stack.formatterPreset !== 'oxfmt-common'

  writeFile(targetDirectory, stack.linterFile, jsReExport(stack.linterPreset, hasSemicolon), shouldOverwrite, { quiet })
  writeFile(targetDirectory, stack.formatterFile, jsReExport(stack.formatterPreset, hasSemicolon), shouldOverwrite, {
    quiet,
  })
  writeFile(targetDirectory, 'stylelint.config.js', jsReExport(stack.stylelint, hasSemicolon), shouldOverwrite, {
    quiet,
  })
}
