import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

export const ROOT = fileURLToPath(new URL('..', import.meta.url))
export const OX_STACKS = ['common', 'react', 'solid', 'next', 'svelte', 'astro']

export function packageExecutable(packageName, executable, directory = ROOT) {
  const require = createRequire(path.join(directory, 'package.json'))
  // pnpm exposes its manifest as the package root instead of /package.json.
  const manifest = require.resolve(packageName === 'pnpm' ? packageName : `${packageName}/package.json`)

  return path.join(path.dirname(manifest), executable)
}

function runTool(packageName, args, options = {}) {
  const { cwd = ROOT, toolDirectory = ROOT } = options
  const executable = packageExecutable(packageName, `bin/${packageName}`, toolDirectory)

  return spawnSync(process.execPath, [executable, ...args], {
    cwd,
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
    timeout: 60_000,
    env: process.env,
  })
}

export function runOxlint(args, options = {}) {
  return runTool('oxlint', args, options)
}

export function runOxfmt(args, options = {}) {
  return runTool('oxfmt', args, options)
}

export function nativeRules() {
  const result = runOxlint(['--rules', '--format', 'json'])

  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout)
  }

  return JSON.parse(result.stdout)
}

export function engineVersions() {
  return Object.fromEntries(
    ['oxlint', 'oxlint-tsgolint', 'oxfmt', '@typescript/native'].map((name) => [
      name,
      JSON.parse(readFileSync(packageExecutable(name, 'package.json'), 'utf8')).version,
    ]),
  )
}

export function selectedStacks(args = process.argv.slice(2)) {
  const position = args.indexOf('--stacks')
  const stacks = position === -1 ? OX_STACKS : args[position + 1].split(',')

  for (const stack of stacks) {
    if (!OX_STACKS.includes(stack)) {
      throw new Error(`Unknown Oxlint stack: ${stack}`)
    }
  }

  return stacks
}
