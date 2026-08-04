// Shared logic for @st1ggy/linter-config CLI (no prompts).

import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'

export const PACKAGE = '@st1ggy/linter-config'

export const STACK_KEYS = ['common', 'react', 'next', 'svelte', 'astro']

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
    packages: ['eslint-plugin-astro', 'prettier-plugin-astro'],
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

export function hasResolvablePackage(startDirectory, packageName = PACKAGE) {
  let currentDirectory = path.resolve(startDirectory)
  const packageParts = packageName.split('/')

  while (true) {
    const marker = path.join(currentDirectory, 'node_modules', ...packageParts, 'package.json')

    if (existsSync(marker)) {
      return true
    }

    const parentDirectory = path.dirname(currentDirectory)

    if (parentDirectory === currentDirectory) {
      break
    }

    currentDirectory = parentDirectory
  }

  return false
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
  const { quiet = false } = options

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
  const packagesToAdd = packages.filter((packageName) => !Object.hasOwn(dependencies, packageName))
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

  if (!quiet) {
    process.stdout.write(`install: ${pm} add -D ${packagesToAdd.join(' ')} (${directory})\n`)
  }

  const add = {
    npm: () => runPmSync('npm', ['install', '-D', ...packagesToAdd], directory),
    pnpm: () => runPmSync('pnpm', ['add', '-D', ...packagesToAdd], directory),
    yarn: () => runPmSync('yarn', ['add', '-D', ...packagesToAdd], directory),
    bun: () => runPmSync('bun', ['add', '-d', ...packagesToAdd], directory),
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
  eslint.config.js, prettier.config.js, stylelint.config.js — re-exports for one stack.

Unless --skip-install: if package.json exists, runs the detected package manager to add or sync
${PACKAGE} and the selected stack's integration plugins.

Stack (at most one; default: common):
  --common | --react | --next | --svelte | --astro

Options:
  --dir, -d       Target directory (default: current working directory).
  --skip-install  Do not run npm/pnpm/yarn/bun (only write wrapper files).
  -i, --interactive  Accepted for compatibility; the menu is always interactive.

Examples (after: npm i -D ${PACKAGE}):
  npx ${PACKAGE}
  npx ${PACKAGE} init
  npx ${PACKAGE} init --react
  npx ${PACKAGE} migrate --svelte --dir ./apps/web
  npx ${PACKAGE} init --astro
  npm exec ${PACKAGE} -- init --common

Without prior install (downloads this package; then runs the same CLI):
  npx --yes ${PACKAGE} init --astro

Repo (paths from root):
  node scripts/linter-init.mjs init --common
`)
}

export function jsReExport(subpath) {
  return `export { default } from '${PACKAGE}/${subpath}';\n`
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

export function wrapperFileNames() {
  return ['eslint.config.js', 'prettier.config.js', 'stylelint.config.js']
}

export function existingWrapperFiles(targetDirectory) {
  return wrapperFileNames().filter((name) => existsSync(path.join(targetDirectory, name)))
}

export function legacyConfigFiles(targetDirectory) {
  if (!existsSync(targetDirectory)) {
    return []
  }

  const wrappers = new Set(wrapperFileNames())

  return readdirSync(targetDirectory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && /(?:eslint|prettier|stylelint)/i.test(entry.name) && !wrappers.has(entry.name))
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

  writeFile(targetDirectory, 'eslint.config.js', jsReExport(stack.eslint), shouldOverwrite, { quiet })
  writeFile(targetDirectory, 'prettier.config.js', jsReExport(stack.prettier), shouldOverwrite, { quiet })
  writeFile(targetDirectory, 'stylelint.config.js', jsReExport(stack.stylelint), shouldOverwrite, { quiet })
}
