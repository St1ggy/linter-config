#!/usr/bin/env node
// @st1ggy/linter-config — interactive menu (TTY) or minimist CLI.

import { CancelPromptError, ExitPromptError } from '@inquirer/core'
import { confirm, input, select } from '@inquirer/prompts'
import minimist from 'minimist'
import process from 'node:process'
import ora from 'ora'

import {
  PACKAGE,
  STACK_CHOICES,
  STACK_KEYS,
  ensureDevDependencies,
  existingWrapperFiles,
  isSelfPackageRoot,
  legacyConfigFiles,
  printHelp,
  removeFiles,
  resolveStackKey,
  resolveTargetDirectory,
  run,
  stackPackages,
} from './linter-init-core.mjs'

function parseArgv(argv) {
  return minimist(argv, {
    string: ['dir', 'd'],
    boolean: [
      'help',
      'h',
      'skip-install',
      'eslint',
      'biome',
      'common',
      'react',
      'next',
      'svelte',
      'astro',
      'interactive',
      'i',
    ],
    alias: {
      h: 'help',
      d: 'dir',
      i: 'interactive',
    },
    default: {},
  })
}

function argvToValues(argv) {
  const directory = argv.dir ?? argv.d ?? process.cwd()

  return {
    dir: directory,
    'skip-install': Boolean(argv['skip-install']),
    eslint: Boolean(argv.eslint),
    biome: Boolean(argv.biome),
    common: Boolean(argv.common),
    react: Boolean(argv.react),
    next: Boolean(argv.next),
    svelte: Boolean(argv.svelte),
    astro: Boolean(argv.astro),
  }
}

async function selectCommand(command) {
  if (command) {
    return command
  }

  return select({
    message: 'Action',
    choices: [
      {
        value: 'init',
        name: 'init — create missing ESLint, Prettier and Stylelint wrappers',
      },
      {
        value: 'migrate',
        name: 'migrate — remove selected legacy configs and replace wrappers',
      },
    ],
    default: 'init',
  })
}

async function selectStack(values) {
  const stackKey = resolveStackKey(values)

  if (STACK_KEYS.some((key) => values[key] === true)) {
    return stackKey
  }

  return select({
    message: 'Stack',
    choices: STACK_CHOICES,
    default: 'common',
  })
}

async function selectLegacyFiles(command, directory) {
  if (command !== 'migrate') {
    return []
  }

  const selected = []

  for (const file of legacyConfigFiles(directory)) {
    if (await confirm({ message: `Remove legacy config ${file}?`, default: false })) {
      selected.push(file)
    }
  }

  return selected
}

function printSummary(command, stack, directory, shouldSkipInstall, existing, filesToRemove, packages) {
  const wrapperFiles =
    command === 'init' && existing.length > 0
      ? `create missing; keep ${existing.join(', ')}`
      : 'write eslint.config.js, prettier.config.js, stylelint.config.js'

  process.stdout.write('\n')
  process.stdout.write(`  Action:  ${command}\n`)
  process.stdout.write(`  Stack:   ${stack}\n`)
  process.stdout.write(`  Dir:     ${directory}\n`)
  process.stdout.write(`  Install packages: ${shouldSkipInstall ? 'no (--skip-install)' : packages.join(', ')}\n`)
  process.stdout.write(`  Wrapper files: ${wrapperFiles}\n`)
  process.stdout.write(`  Legacy files to remove: ${filesToRemove.length > 0 ? filesToRemove.join(', ') : 'none'}\n`)
  process.stdout.write('\n')
}

async function runInteractive(command, values) {
  const selectedCommand = await selectCommand(command)
  const selectedStack = await selectStack(values)
  const targetDirectory = await input({ message: 'Target directory', default: values.dir ?? process.cwd() })

  const resolved = resolveTargetDirectory(targetDirectory)

  if (isSelfPackageRoot(resolved)) {
    throw new Error(
      `Refusing to write consumer wrapper configs in the ${PACKAGE} source tree (that would replace this repository’s dev configs). Run from another project, or pass a different directory.`,
    )
  }

  const shouldSkipInstall = values['skip-install'] === true
  const existing = existingWrapperFiles(resolved)
  const filesToRemove = await selectLegacyFiles(selectedCommand, resolved)
  const packages = stackPackages(selectedStack)

  printSummary(selectedCommand, selectedStack, resolved, shouldSkipInstall, existing, filesToRemove, packages)

  const shouldProceed = await confirm({
    message: 'Proceed?',
    default: true,
  })

  if (!shouldProceed) {
    process.stdout.write('Cancelled.\n')
    process.exitCode = 0

    return
  }

  if (shouldSkipInstall) {
    ora({ color: 'gray' }).info(`Skipped installing ${PACKAGE} (--skip-install)`)
  } else {
    const spinner = ora({
      color: 'cyan',
      text: `Installing ${selectedStack} linting packages…`,
    }).start()

    try {
      ensureDevDependencies(resolved, packages, false, { quiet: true })
      spinner.succeed(`${selectedStack} linting packages are available`)
    } catch (error) {
      spinner.fail('Dependency step failed')
      throw error
    }
  }

  const writeSpinner = ora({
    color: 'green',
    text: 'Writing eslint.config.js, prettier.config.js, stylelint.config.js…',
  }).start()

  try {
    removeFiles(resolved, filesToRemove)
    run(selectedCommand, resolved, selectedStack, { quiet: true })
    writeSpinner.succeed('Wrapper configs written')
  } catch (error) {
    writeSpinner.fail('Failed to write configs')
    throw error
  }
}

function normalizeCommand(command) {
  if (command === 'create') {
    return 'init'
  }

  if (command === 'reinit') {
    return 'migrate'
  }

  return command
}

function warnLegacyFlags(values) {
  if (values.biome === true) {
    process.stderr.write(
      `warning: --biome is ignored; Biome presets were removed from ${PACKAGE}. Only ESLint, Prettier, and Stylelint wrappers are written.\n`,
    )
  }
}

async function runInteractiveOrHandleErrors(command, values) {
  try {
    warnLegacyFlags(values)
    await runInteractive(command, values)
  } catch (error) {
    if (error instanceof ExitPromptError || error instanceof CancelPromptError) {
      process.stdout.write('\nCancelled.\n')
      process.exitCode = 0

      return
    }

    const message = error instanceof Error ? error.message : String(error)

    process.stderr.write(`${message}\n`)
    process.exitCode = 1
  }
}

async function main() {
  const argv = parseArgv(process.argv.slice(2))

  if (argv.help) {
    printHelp()
    process.exitCode = 0

    return
  }

  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    process.stderr.write('This command requires an interactive terminal.\n')
    process.exitCode = 1

    return
  }

  const first = argv._[0]

  if (first !== undefined && first !== 'init' && first !== 'migrate' && first !== 'reinit' && first !== 'create') {
    process.stderr.write(`Unknown command "${String(first)}".\n\n`)
    printHelp()
    process.exitCode = 1

    return
  }

  await runInteractiveOrHandleErrors(first === undefined ? undefined : normalizeCommand(first), argvToValues(argv))
}

await main()
