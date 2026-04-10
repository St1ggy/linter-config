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
  ensureDevDependency,
  isSelfPackageRoot,
  printHelp,
  resolveStackKey,
  resolveTargetDirectory,
  run,
} from './linter-init-core.mjs'

function parseArgv(argv) {
  return minimist(argv, {
    string: ['dir', 'd'],
    boolean: ['help', 'h', 'skip-install', 'eslint', 'biome', 'common', 'react', 'next', 'svelte', 'interactive', 'i'],
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
  }
}

async function runInteractive() {
  const command = await select({
    message: 'Command',
    choices: [
      {
        value: 'init',
        name: 'init — create eslint / prettier / stylelint wrappers (skip if files exist)',
      },
      {
        value: 'reinit',
        name: 'reinit — overwrite the three wrapper files',
      },
      {
        value: 'create',
        name: 'create — same as init',
      },
    ],
    default: 'init',
  })

  const stackKey = await select({
    message: 'Stack',
    choices: STACK_CHOICES,
    default: 'common',
  })

  const targetDirectory = await input({
    message: 'Target directory',
    default: process.cwd(),
  })

  const skipInstall = await confirm({
    message: `Skip installing ${PACKAGE} (only write config files)?`,
    default: false,
  })

  const resolved = resolveTargetDirectory(targetDirectory)

  process.stdout.write('\n')
  process.stdout.write(`  Command: ${command}\n`)
  process.stdout.write(`  Stack:   ${stackKey}\n`)
  process.stdout.write(`  Dir:     ${resolved}\n`)
  process.stdout.write(`  Skip install: ${skipInstall ? 'yes' : 'no'}\n`)
  process.stdout.write('\n')

  const proceed = await confirm({
    message: 'Proceed?',
    default: true,
  })

  if (!proceed) {
    process.stdout.write('Cancelled.\n')
    process.exitCode = 0

    return
  }

  if (isSelfPackageRoot(resolved)) {
    throw new Error(
      `Refusing to write consumer wrapper configs in the ${PACKAGE} source tree (that would replace this repository’s dev configs). Run from another project, or pass a different directory.`,
    )
  }

  const cmd = command === 'create' ? 'init' : command

  if (skipInstall) {
    ora({ color: 'gray' }).info(`Skipped installing ${PACKAGE} (--skip-install)`)
  } else {
    const spinner = ora({
      color: 'cyan',
      text: `Ensuring ${PACKAGE} is installed…`,
    }).start()

    try {
      ensureDevDependency(resolved, false, { quiet: true })
      spinner.succeed(`${PACKAGE} is available`)
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
    run(cmd, resolved, stackKey, { quiet: true })
    writeSpinner.succeed('Wrapper configs written')
  } catch (error) {
    writeSpinner.fail('Failed to write configs')
    throw error
  }
}

function runCli(command, values) {
  if (values.biome === true) {
    process.stderr.write(
      `warning: --biome is ignored; Biome presets were removed from ${PACKAGE}. Only ESLint, Prettier, and Stylelint wrappers are written.\n`,
    )
  }

  const targetDirectory = resolveTargetDirectory(values.dir)
  const stackKey = resolveStackKey(values)
  const skipInstall = values['skip-install'] === true

  if (isSelfPackageRoot(targetDirectory)) {
    throw new Error(
      `Refusing to write consumer wrapper configs in the ${PACKAGE} source tree (that would replace this repository’s dev configs). Run from another project, or pass --dir <path> to a folder with its own package.json.`,
    )
  }

  const cmd = command === 'create' ? 'init' : command

  ensureDevDependency(targetDirectory, skipInstall)
  run(cmd, targetDirectory, stackKey)
}

async function runInteractiveOrHandleErrors() {
  try {
    await runInteractive()
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

function runSubcommandCli(command, argv) {
  const values = argvToValues(argv)

  try {
    runCli(command, values)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)

    process.stderr.write(`${message}\n`)
    process.exitCode = 1
  }
}

async function main() {
  const raw = process.argv.slice(2)
  const argv = parseArgv(raw)
  const positional = argv._
  const first = positional[0]

  if (argv.help) {
    printHelp()
    process.exitCode = 0

    return
  }

  const tty = Boolean(process.stdin.isTTY && process.stdout.isTTY)
  const forceMenu = Boolean(argv.interactive || argv.i)
  const noSubcommand = positional.length === 0
  const useInteractiveMenu = noSubcommand && (forceMenu || tty)

  if (useInteractiveMenu) {
    await runInteractiveOrHandleErrors()

    return
  }

  if (noSubcommand) {
    printHelp()
    process.exitCode = 1

    return
  }

  const command = first

  if (command !== 'init' && command !== 'reinit' && command !== 'create') {
    process.stderr.write(`Unknown command "${String(command)}".\n\n`)
    printHelp()
    process.exitCode = 1

    return
  }

  runSubcommandCli(command, argv)
}

await main()
