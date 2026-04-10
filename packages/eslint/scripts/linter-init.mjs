#!/usr/bin/env node
// Generates wrapper configs in a consumer project that depend on @st1ggy/linter-config subpath exports.
// Usage: linter-config <init|reinit|create> [--eslint] [--biome] [--common|--react|--next|--svelte] [--dir path]
// With --eslint: writes eslint.config.js, prettier.config.js, stylelint.config.js (one stack).
// With --biome: writes biome.json (same stack key).

import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { parseArgs } from 'node:util'

const PACKAGE = '@st1ggy/linter-config'

const STACK_KEYS = ['common', 'react', 'next', 'svelte']

const STACKS = {
  common: {
    eslint: 'eslint-common',
    prettier: 'prettier-common',
    stylelint: 'stylelint-scss',
    biome: 'biome-common',
  },
  react: {
    eslint: 'eslint-react',
    prettier: 'prettier-common',
    stylelint: 'stylelint-scss',
    biome: 'biome-react',
  },
  next: {
    eslint: 'eslint-next',
    prettier: 'prettier-common',
    stylelint: 'stylelint-scss',
    biome: 'biome-next',
  },
  svelte: {
    eslint: 'eslint-svelte',
    prettier: 'prettier-svelte',
    stylelint: 'stylelint-scss',
    biome: 'biome-svelte',
  },
}

const BIOME_SCHEMA = 'https://biomejs.dev/schemas/2.4.11/schema.json'

function printHelp() {
  process.stdout.write(`\
${PACKAGE} — generate local wrapper configs in a consumer project.

Commands:
  init     Create missing files only (skip existing).
  reinit   Overwrite selected files.
  create   Same as init.

Pick at least one toolchain:
  --eslint   Write eslint.config.js, prettier.config.js, and stylelint.config.js (same stack).
  --biome    Write biome.json.

Stack (at most one; default: common):
  --common | --react | --next | --svelte

Options:
  --dir, -d   Target directory (default: current working directory).

Examples:
  npx linter-config init --eslint --common
  npx linter-config init --biome --svelte
  npx linter-config init --eslint --biome --next
  npx linter-config reinit --eslint --biome --react --dir ./apps/web

Repo (paths from root):
  node packages/eslint/scripts/linter-init.mjs init --eslint --biome --common
`)
}

function jsReExport(subpath) {
  return `export { default } from '${PACKAGE}/${subpath}';\n`
}

function biomeJson(subpath) {
  const lines = [
    '{',
    `  "$schema": "${BIOME_SCHEMA}",`,
    '  "root": true,',
    `  "extends": ["${PACKAGE}/${subpath}"]`,
    '}',
    '',
  ]

  return lines.join('\n')
}

function resolveTargetDirectory(raw) {
  return path.resolve(raw)
}

function writeFile(targetDirectory, name, content, overwrite) {
  const filePath = path.join(targetDirectory, name)

  if (!overwrite && existsSync(filePath)) {
    process.stdout.write(`skip (exists): ${name}\n`)

    return false
  }

  mkdirSync(targetDirectory, { recursive: true })
  writeFileSync(filePath, content, 'utf8')
  process.stdout.write(`write: ${name}\n`)

  return true
}

function resolveStackKey(values) {
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

function run(mode, targetDirectory, wantEslint, wantBiome, stackKey) {
  const stack = STACKS[stackKey]

  if (!stack) {
    throw new Error(`Unknown stack "${stackKey}". Use: ${STACK_KEYS.join(', ')}`)
  }

  if (!wantEslint && !wantBiome) {
    throw new Error('Pick at least one of: --eslint, --biome')
  }

  const overwrite = mode === 'reinit'

  if (wantEslint) {
    writeFile(targetDirectory, 'eslint.config.js', jsReExport(stack.eslint), overwrite)
    writeFile(targetDirectory, 'prettier.config.js', jsReExport(stack.prettier), overwrite)
    writeFile(targetDirectory, 'stylelint.config.js', jsReExport(stack.stylelint), overwrite)
  }

  if (wantBiome) {
    writeFile(targetDirectory, 'biome.json', biomeJson(stack.biome), overwrite)
  }
}

function main() {
  const args = process.argv.slice(2)

  if (args.length === 0 || args[0] === '-h' || args[0] === '--help') {
    printHelp()
    process.exitCode = args.length === 0 ? 1 : 0

    return
  }

  const command = args[0]

  if (command !== 'init' && command !== 'reinit' && command !== 'create') {
    process.stderr.write(`Unknown command "${command}".\n\n`)
    printHelp()
    process.exitCode = 1

    return
  }

  const { values } = parseArgs({
    args: args.slice(1),
    options: {
      dir: { type: 'string', short: 'd', default: process.cwd() },
      eslint: { type: 'boolean' },
      biome: { type: 'boolean' },
      common: { type: 'boolean' },
      react: { type: 'boolean' },
      next: { type: 'boolean' },
      svelte: { type: 'boolean' },
    },
    strict: true,
  })

  const targetDirectory = resolveTargetDirectory(values.dir)
  const stackKey = resolveStackKey(values)
  const wantEslint = values.eslint === true
  const wantBiome = values.biome === true

  const cmd = command === 'create' ? 'init' : command

  try {
    run(cmd, targetDirectory, wantEslint, wantBiome, stackKey)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)

    process.stderr.write(`${message}\n`)
    process.exitCode = 1
  }
}

main()
