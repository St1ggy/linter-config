import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import process from 'node:process'
import test from 'node:test'

import { temporaryProject, toolchainFiles } from './fixtures/oxlint-cases.mjs'
import { packageExecutable, runOxlint } from './oxlint-tools.mjs'

test('Native TypeScript is 7.0.2 and checks correct and incorrect code', (context) => {
  const executable = packageExecutable('@typescript/native', 'bin/tsc')
  const version = spawnSync(process.execPath, [executable, '--version'], { encoding: 'utf8' })

  assert.equal(version.status, 0)
  assert.match(version.stdout, /Version 7\.0\.2/)
  const valid = temporaryProject(context, { 'probe.ts': 'export const value: string = "ok"\n' })
  const invalid = temporaryProject(context, { 'probe.ts': 'export const value: string = 42\n' })
  const success = spawnSync(process.execPath, [executable, '--noEmit'], { cwd: valid, encoding: 'utf8' })
  const failure = spawnSync(process.execPath, [executable, '--noEmit'], { cwd: invalid, encoding: 'utf8' })

  assert.equal(success.status, 0, success.stdout)
  assert.notEqual(failure.status, 0)
  assert.match(failure.stdout, /TS2322/)
})

test('Oxlint uses the native checker for cross-module unions and type errors', (context) => {
  const directory = temporaryProject(context, {
    ...toolchainFiles,
    'error.ts': 'export const value: string = 42\n',
    '.oxlintrc.json': JSON.stringify({
      plugins: ['typescript'],
      categories: { correctness: 'off' },
      options: { typeAware: true },
      rules: { 'typescript/switch-exhaustiveness-check': 'error' },
    }),
  })
  const linted = runOxlint(['probe.ts'], { cwd: directory })
  const checked = runOxlint(['--type-check', 'error.ts'], { cwd: directory })

  assert.equal(linted.status, 1, linted.stderr)
  assert.match(linted.stdout, /switch-exhaustiveness-check/)
  assert.match(linted.stdout, /done/)
  assert.notEqual(checked.status, 0)
  assert.match(checked.stdout + checked.stderr, /2322|not assignable/)
})
