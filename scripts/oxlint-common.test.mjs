import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { pathToFileURL } from 'node:url'

import { temporaryProject, toolchainFiles } from './fixtures/oxlint-cases.mjs'
import { ROOT, runOxlint } from './oxlint-tools.mjs'

function consumer(context, files = {}) {
  const config = pathToFileURL(path.join(ROOT, 'src/oxlint/oxlint.config.common.js')).href

  return temporaryProject(context, {
    'oxlint.config.ts': `export { default } from ${JSON.stringify(config)}\n`,
    '.prettierrc.json': JSON.stringify({ semi: false, singleQuote: true, printWidth: 120 }),
    ...files,
  })
}

test('Common preset auto-loads, preserves restrictions and fixes formatting', (context) => {
  const directory = consumer(context, { 'probe.ts': 'export const message="hello";\n' })
  const initial = runOxlint(['probe.ts'], { cwd: directory })

  assert.match(initial.stdout, /prettier/)
  const fixed = runOxlint(['--fix', 'probe.ts'], { cwd: directory })

  assert.equal(fixed.status, 0, fixed.stdout + fixed.stderr)
  assert.equal(readFileSync(path.join(directory, 'probe.ts'), 'utf8'), "export const message = 'hello'\n")
  writeFileSync(path.join(directory, 'probe.ts'), 'export enum State { Pending }\n')
  const restricted = runOxlint(['probe.ts'], { cwd: directory })

  assert.equal(restricted.status, 1)
  assert.match(restricted.stdout, /no-restricted-syntax/)
})

test('Common preset preserves typed checking and TS/core unused-variable precedence', (context) => {
  const directory = consumer(context, { ...toolchainFiles, 'unused.ts': 'const unusedValue = 42\nexport {}\n' })
  const result = runOxlint(['probe.ts', 'unused.ts'], { cwd: directory })

  assert.match(result.stdout, /switch-exhaustiveness-check/)
  assert.match(result.stdout, /no-unused-vars/)
})

test('Common preset honors consumer gitignore without enabling default categories', (context) => {
  const directory = consumer(context, {
    '.gitignore': 'ignored.ts\n',
    'ignored.ts': 'export enum State { Pending }\n',
    'probe.ts': 'export const isExample = true\n',
  })
  const result = runOxlint(['.'], { cwd: directory })

  assert.ok(!result.stdout.includes('ignored.ts'), result.stdout)
  const clean = runOxlint(['probe.ts'], { cwd: directory })

  assert.equal(clean.status, 0, clean.stdout + clean.stderr)
})

test('Common preset preserves custom selectors, rest siblings and allowed abbreviations', (context) => {
  const directory = consumer(context, {
    'selectors.ts': "for (const key in object) { use(key) }\nReact.useState()\n'abc'.replaceAll(/a/, '')\n",
    'rest.ts': 'const { ignored, ...rest } = { ignored: 1, kept: 2 }\nexport { rest }\n',
    'names.ts': 'export const props = true\nexport const dev = true\nexport const str = true\n',
  })
  const selectors = runOxlint(['--format', 'json', 'selectors.ts'], { cwd: directory })
  const selectorDiagnostics = JSON.parse(selectors.stdout).diagnostics.filter(
    (item) => item.code === 'eslint-js(no-restricted-syntax)',
  )

  assert.equal(selectorDiagnostics.length, 3)
  const rest = runOxlint(['--format', 'json', 'rest.ts'], { cwd: directory })

  assert.ok(JSON.parse(rest.stdout).diagnostics.every((item) => !item.code?.includes('no-unused-vars')))
  const names = runOxlint(['--format', 'json', 'names.ts'], { cwd: directory })
  const nameDiagnostics = JSON.parse(names.stdout).diagnostics.filter((item) =>
    item.code?.includes('name-replacements'),
  )

  assert.equal(nameDiagnostics.length, 1)
  assert.match(nameDiagnostics[0].message, /str/)
})

test('Common preset fixes type-only imports inline and prefers type aliases', (context) => {
  const directory = consumer(context, {
    'types.ts': 'export type Props = { value: string }\n',
    'probe.ts': "import { Props } from './types'\n\nexport interface Shape {\n  value: Props\n}\n",
  })
  const result = runOxlint(['--fix', 'probe.ts'], { cwd: directory })

  assert.equal(result.status, 0, result.stdout + result.stderr)
  const fixed = readFileSync(path.join(directory, 'probe.ts'), 'utf8')

  assert.match(fixed, /import \{ type Props \}/)
  assert.match(fixed, /export type Shape/)
})
