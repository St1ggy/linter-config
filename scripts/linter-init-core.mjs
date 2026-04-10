// Shared logic for @st1ggy/linter-config CLI (no prompts).

import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

export const PACKAGE = '@st1ggy/linter-config'

export const STACK_KEYS = ['common', 'react', 'next', 'svelte']

export const STACKS = {
  common: {
    eslint: 'eslint-common',
    prettier: 'prettier-common',
    stylelint: 'stylelint-scss',
  },
  react: {
    eslint: 'eslint-react',
    prettier: 'prettier-common',
    stylelint: 'stylelint-scss',
  },
  next: {
    eslint: 'eslint-next',
    prettier: 'prettier-common',
    stylelint: 'stylelint-scss',
  },
  svelte: {
    eslint: 'eslint-svelte',
    prettier: 'prettier-svelte',
    stylelint: 'stylelint-scss',
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

export function mergedDeps(packageJson) {
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

export function hasResolvablePackage(startDirectory) {
  let currentDirectory = path.resolve(startDirectory)

  while (true) {
    const marker = path.join(currentDirectory, 'node_modules', '@st1ggy', 'linter-config', 'package.json')

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
export function ensureDevDependency(targetDirectory, skipInstall, options = {}) {
  const { quiet = false } = options

  if (skipInstall) {
    return
  }

  const directory = path.resolve(targetDirectory)

  const packageJsonPath = path.join(directory, 'package.json')

  if (!existsSync(packageJsonPath)) {
    if (!quiet) {
      process.stderr.write(
        `warning: no package.json in ${directory}; add the dependency manually: npm i -D ${PACKAGE}\n`,
      )
    }

    return
  }

  if (hasResolvablePackage(directory)) {
    return
  }

  const packageJson = readPackageJson(directory)

  if (!packageJson) {
    return
  }

  const pm = detectPackageManager(directory)
  const listed = Boolean(mergedDeps(packageJson)[PACKAGE])

  if (listed) {
    if (!quiet) {
      process.stdout.write(`install: ${pm} install (${directory}) — dependency already listed\n`)
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
    process.stdout.write(`install: ${pm} add -D ${PACKAGE} (${directory})\n`)
  }

  const add = {
    npm: () => runPmSync('npm', ['install', '-D', PACKAGE], directory),
    pnpm: () => runPmSync('pnpm', ['add', '-D', PACKAGE], directory),
    yarn: () => runPmSync('yarn', ['add', '-D', PACKAGE], directory),
    bun: () => runPmSync('bun', ['add', '-d', PACKAGE], directory),
  }

  add[pm]()
}

export function printHelp() {
  process.stdout.write(`\
${PACKAGE} — generate local wrapper configs in a consumer project.

With no command in an interactive terminal, opens a guided menu (or pass -i / --interactive).

Commands:
  init     Create missing files only (skip existing).
  reinit   Overwrite selected files.
  create   Same as init.

Writes (each command):
  eslint.config.js, prettier.config.js, stylelint.config.js — re-exports for one stack.

Unless --skip-install: if package.json exists and ${PACKAGE} is not yet resolvable from node_modules
(walking up to the filesystem root), runs the detected package manager to add or sync the dependency.

Stack (at most one; default: common):
  --common | --react | --next | --svelte

Options:
  --dir, -d       Target directory (default: current working directory).
  --skip-install  Do not run npm/pnpm/yarn/bun (only write wrapper files).
  -i, --interactive  Open the menu even when a command is passed (experimental).

Examples (after: npm i -D ${PACKAGE}):
  npx ${PACKAGE}
  npx ${PACKAGE} init
  npx ${PACKAGE} init --react
  npx ${PACKAGE} reinit --svelte --dir ./apps/web
  npm exec ${PACKAGE} -- init --common

Without prior install (downloads this package; then runs the same CLI):
  npx --yes ${PACKAGE} init --common

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

  const overwrite = mode === 'reinit'

  writeFile(targetDirectory, 'eslint.config.js', jsReExport(stack.eslint), overwrite, { quiet })
  writeFile(targetDirectory, 'prettier.config.js', jsReExport(stack.prettier), overwrite, { quiet })
  writeFile(targetDirectory, 'stylelint.config.js', jsReExport(stack.stylelint), overwrite, { quiet })
}
