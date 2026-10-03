import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { pathToFileURL } from 'node:url'
import { format } from 'oxfmt'

import formatter from '@st1ggy/linter-config/oxfmt-common'

import { OXFMT_STACKS, OXFMT_VERSION } from '../src/oxlint/stacks.js'

import { temporaryProject } from './fixtures/oxlint-cases.mjs'
import { run, stackPackageSpecs, stackPackages, wrapperFileNames } from './linter-init-core.mjs'
import { compareFormatters } from './oxfmt-compare.mjs'
import { ROOT, runOxfmt, runOxlint } from './oxlint-tools.mjs'

function formatProject(context, files = {}) {
  const module = pathToFileURL(path.join(ROOT, 'src/oxfmt/oxfmt.config.common.js')).href

  return temporaryProject(context, { 'oxfmt.config.ts': `export { default } from '${module}'\n`, ...files })
}

test('Oxfmt checks and fixes style using the automatically discovered shared config', (context) => {
  const directory = formatProject(context, { 'probe.ts': 'export const value="hello";\n' })
  const checked = runOxfmt(['--check', 'probe.ts'], { cwd: directory })

  assert.equal(checked.status, 1, checked.stdout + checked.stderr)
  const fixed = runOxfmt(['--write', 'probe.ts'], { cwd: directory })

  assert.equal(fixed.status, 0, fixed.stdout + fixed.stderr)
  assert.equal(readFileSync(path.join(directory, 'probe.ts'), 'utf8'), "export const value = 'hello'\n")
  assert.equal(runOxfmt(['--check', 'probe.ts'], { cwd: directory }).status, 0)
})

test('Native formatter retains import and package-property order', async () => {
  const input = '{"zeta":true,"name":"example","alpha":1}'
  const json = await format('package.json', input, formatter)

  assert.deepEqual(Object.keys(JSON.parse(json.code)), ['zeta', 'name', 'alpha'])
  const code = "import z from './z'\nimport a from './a'\nexport { z, a }\n"
  const js = await format('probe.js', code, formatter)

  assert.equal(js.code, code)
})

test('Oxfmt honors gitignore, prettierignore and caller overrides', (context) => {
  const directory = formatProject(context, {
    '.gitignore': 'ignored.ts\n',
    '.prettierignore': 'skipped.ts\n',
    'ignored.ts': 'export const value="hello";\n',
    'skipped.ts': 'export const value="hello";\n',
    'probe.ts': "export const value = 'hello'\n",
  })
  const formatted = runOxfmt(['--write', '.'], { cwd: directory })

  assert.equal(formatted.status, 0, formatted.stdout + formatted.stderr)
  const ignored = runOxfmt(['--check', '.'], { cwd: directory })

  assert.equal(ignored.status, 0, ignored.stdout + ignored.stderr)
  assert.equal(readFileSync(path.join(directory, 'ignored.ts'), 'utf8'), 'export const value="hello";\n')
  assert.equal(readFileSync(path.join(directory, 'skipped.ts'), 'utf8'), 'export const value="hello";\n')
  const module = pathToFileURL(path.join(ROOT, 'src/oxfmt/oxfmt.config.common.js')).href

  writeFileSync(
    path.join(directory, 'oxfmt.config.ts'),
    `import config from '${module}'; export default {...config,singleQuote:false}\n`,
  )
  const fixed = runOxfmt(['--write', 'probe.ts'], { cwd: directory })

  assert.equal(fixed.status, 0, fixed.stdout + fixed.stderr)
  assert.equal(readFileSync(path.join(directory, 'probe.ts'), 'utf8'), 'export const value = "hello"\n')
})

test('The four native stacks use Oxfmt and never execute the Prettier lint rule', async (context) => {
  for (const stack of OXFMT_STACKS) {
    const { default: config } = await import(
      pathToFileURL(path.join(ROOT, `src/oxlint/oxlint.config.${stack}.js`)).href
    )

    assert.ok(config.jsPlugins.every((plugin) => plugin.name !== 'prettier'))
    assert.ok(config.overrides.every((entry) => !Object.hasOwn(entry.rules, 'prettier/prettier')))
    assert.ok(stackPackages(`${stack}-ox`).includes('oxfmt'))
    assert.equal(stackPackageSpecs(`${stack}-ox`).oxfmt, `oxfmt@${OXFMT_VERSION}`)
    const directory = temporaryProject(context)

    run('init', directory, `${stack}-ox`, { quiet: true })
    assert.deepEqual(wrapperFileNames(`${stack}-ox`), ['oxlint.config.ts', 'oxfmt.config.ts', 'stylelint.config.js'])
    assert.ok(readFileSync(path.join(directory, 'oxfmt.config.ts'), 'utf8').includes('oxfmt-common'))
    writeFileSync(path.join(directory, 'probe.ts'), 'export const value="hello";\n')
    const linted = runOxlint(['probe.ts'], { cwd: directory })

    assert.ok(!linted.stdout.includes('prettier'), linted.stdout)
  }
})

test('Svelte, Astro and original ESLint stacks retain their Prettier wrappers', () => {
  for (const stack of ['svelte-ox', 'astro-ox', 'common', 'react', 'solid', 'next', 'svelte', 'astro']) {
    assert.ok(wrapperFileNames(stack).includes('prettier.config.js'))
    assert.ok(!stackPackages(stack).includes('oxfmt'))
  }
})

test('Oxfmt and source Prettier options agree on sources and the reviewed corpus', async () => {
  const comparison = await compareFormatters()

  assert.equal(comparison.counts.sources.skipped, 0)
  assert.ok(comparison.counts.corpus.equal >= 1400)
  assert.deepEqual(comparison.differences, [], JSON.stringify(comparison))
})
