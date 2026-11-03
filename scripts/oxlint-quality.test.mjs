import common from '@st1ggy/linter-config/common-ox'
import formatter from '@st1ggy/linter-config/oxfmt-common'
import { ESLint } from 'eslint'
import assert from 'node:assert/strict'
import path from 'node:path'
import test from 'node:test'
import { format } from 'oxfmt'

import { OXFMT_STACKS } from '../src/oxlint/stacks.js'

import { temporaryProject } from './fixtures/oxlint-cases.mjs'
import { qualityRuleCases } from './fixtures/quality-rule-cases.mjs'
import { diagnosticCode } from './oxlint-corpus.mjs'
import { readCorpus } from './oxlint-parity.mjs'
import { ROOT, runOxlint } from './oxlint-tools.mjs'

const strictRuleNames = ['name-replacements', 'consistent-destructuring', 'no-unused-properties']

test('Opinionated Unicorn checks are disabled by default in every Ox scope', async () => {
  for (const stack of OXFMT_STACKS) {
    const { default: config } = await import(`@st1ggy/linter-config/${stack}-ox`)

    for (const override of config.overrides) {
      for (const name of strictRuleNames) {
        const value = override.rules?.[`unicorn-js/${name}`]

        assert.ok(value === undefined || value === 'off' || value[0] === 0, `${stack}: ${name}`)
      }
    }
  }
})

for (const name of strictRuleNames) {
  test(`Consumer can opt back into unicorn/${name} after generated overrides`, (context) => {
    const fixture = Object.values(readCorpus().cases).find((item) => item.sourceId === `unicorn/${name}`)

    assert.ok(fixture)
    const root = import.meta.resolve('@st1ggy/linter-config/common-ox')
    const directory = temporaryProject(context, {
      'oxlint.config.ts': `import config from ${JSON.stringify(root)}\nexport default { ...config, overrides: [...config.overrides, { files: ['**/*.{js,ts,tsx}'], rules: { ${JSON.stringify(fixture.targetId)}: ${JSON.stringify(fixture.targetValue)} } }] }\n`,
      [fixture.invalid.file]: fixture.invalid.code,
    })
    const result = runOxlint(['--format', 'json', fixture.invalid.file], { cwd: directory })

    assert.equal(result.status, 1, result.stdout + result.stderr)
    const { diagnostics } = JSON.parse(result.stdout)

    assert.ok(
      diagnostics.some((item) => item.code === diagnosticCode(fixture.targetId)),
      result.stdout,
    )
    assert.ok(
      diagnostics.every((item) => !item.message.includes('Error running JS plugin')),
      result.stdout,
    )
  })
}

for (const [id, pair] of Object.entries(qualityRuleCases)) {
  test(`Full common preset checks ${id} with native diagnostics`, (context) => {
    const file = import.meta.resolve('@st1ggy/linter-config/common-ox')
    const directory = temporaryProject(context, {
      'oxlint.config.ts': `export { default } from ${JSON.stringify(file)}\n`,
      'valid.ts': pair[0],
      'invalid.ts': pair[1],
    })
    const target = id.replace('@typescript-eslint/', 'typescript/')
    const code = diagnosticCode(target.includes('/') ? target : `eslint/${target}`)
    const result = runOxlint(['--format', 'json', 'valid.ts', 'invalid.ts'], { cwd: directory })

    assert.ok(result.status === 0 || result.status === 1, result.stdout + result.stderr)
    const { diagnostics } = JSON.parse(result.stdout)

    assert.ok(
      diagnostics.every((item) => !item.message.includes('Error running JS plugin')),
      result.stdout,
    )
    assert.ok(
      diagnostics.every((item) => !(item.filename === 'valid.ts' && item.code === code)),
      result.stdout,
    )
    assert.ok(
      diagnostics.some((item) => item.filename === 'invalid.ts' && item.code === code),
      result.stdout,
    )
    const errors = new Set([
      'eqeqeq',
      '@typescript-eslint/no-floating-promises',
      '@typescript-eslint/no-misused-promises',
      '@typescript-eslint/await-thenable',
    ])

    assert.equal(
      diagnostics.find((item) => item.filename === 'invalid.ts' && item.code === code).severity,
      errors.has(id) ? 'error' : 'warning',
    )
  })
}

test('Oxfmt owns declaration order; native sort-imports retains named-specifier sorting', async () => {
  const source =
    "import type { Kind } from './types'\nimport z from './z'\nimport a from './a'\nimport local from '@/local'\nimport fs from 'node:fs'\nimport { zoo, alpha } from 'lib'\n\nexport { a, z, local, fs, zoo, alpha }\n"
  const result = await format('probe.ts', source, formatter)

  assert.deepEqual(result.errors, [])
  assert.ok(result.code.indexOf("from 'lib'") < result.code.indexOf("from 'node:fs'"), result.code)
  assert.ok(result.code.indexOf("from 'node:fs'") < result.code.indexOf("from '@/local'"), result.code)
  assert.ok(result.code.indexOf("from '@/local'") < result.code.indexOf("from './a'"), result.code)
  assert.ok(result.code.indexOf("from './a'") < result.code.indexOf("from './z'"), result.code)
  assert.ok(result.code.indexOf("from './z'") < result.code.indexOf('import type'), result.code)
  assert.ok(result.code.includes('{ zoo, alpha }'), 'Oxfmt 0.75 does not sort named specifiers')
  const repeated = await format('probe.ts', result.code, formatter)

  assert.equal(repeated.code, result.code)
  for (const entry of [common, ...common.overrides]) {
    assert.ok(!entry.rules?.['import-x-js/order'], 'No import-order lint fixer may compete with Oxfmt')
  }
  assert.ok(common.overrides.some((entry) => entry.rules['eslint/sort-imports']?.[1]?.ignoreDeclarationSort))
})

test('Oxfmt preserves explicit side-effect partitions and does not sort runtime objects or JSX props', async () => {
  const source =
    "import z from './z'\n// Initialize z before loading a.\nimport './polyfill-z'\n// The next dependency must follow initialization.\nimport a from './a'\n// Initialize a last.\nimport './polyfill-a'\nconst value = { z: 1, a: 2 }\nexport const View = () => <Item z={z} a={a} value={value} />\n"
  const result = await format('probe.tsx', source, formatter)

  assert.deepEqual(result.errors, [])
  assert.ok(result.code.indexOf("from './z'") < result.code.indexOf("import './polyfill-z'"), result.code)
  assert.ok(result.code.indexOf("import './polyfill-z'") < result.code.indexOf("from './a'"), result.code)
  assert.ok(result.code.indexOf("from './a'") < result.code.indexOf("import './polyfill-a'"), result.code)
  assert.ok(result.code.includes('{ z: 1, a: 2 }'), result.code)
  assert.ok(result.code.includes('<Item z={z} a={a} value={value} />'), result.code)
  const repeated = await format('probe.tsx', result.code, formatter)

  assert.equal(repeated.code, result.code)
})

test('Oxfmt preserves relative bare-import order but bare imports alone are not sorting barriers', async () => {
  const source =
    "import z from './z'\nimport './polyfill-z'\nimport a from './a'\nimport './polyfill-a'\nexport { z, a }\n"
  const result = await format('probe.ts', source, formatter)

  assert.deepEqual(result.errors, [])
  assert.ok(result.code.indexOf("import './polyfill-z'") < result.code.indexOf("import './polyfill-a'"), result.code)
  // Document the engine limitation instead of claiming semantic order preservation.
  assert.ok(result.code.indexOf("from './a'") < result.code.indexOf("from './z'"), result.code)
  const unsorted = await format('probe.ts', source, { ...formatter, sortImports: false })

  assert.equal(unsorted.code, source)
})

test('Source presets contain no active deprecated rules', async () => {
  for (const stack of ['common', 'react', 'solid', 'next', 'svelte', 'astro']) {
    const module = stack === 'svelte' ? 'eslint-svelte.config.js' : `eslint.config.${stack}.js`
    const { default: config } = await import(`../src/eslint/${module}`)
    const eslint = new ESLint({ overrideConfigFile: true, overrideConfig: config })
    const extension = { svelte: 'svelte', astro: 'astro' }[stack] ?? 'ts'
    const code = extension === 'ts' ? 'export const value = true\n' : '<p>Hello</p>\n'
    const results = await eslint.lintText(code, { filePath: path.join(ROOT, `src/examples/example.${extension}`) })

    for (const result of results) {
      assert.equal(result.fatalErrorCount, 0, JSON.stringify(result.messages))
      assert.deepEqual(result.usedDeprecatedRules, [], `${stack}: active deprecated rules`)
    }
  }
})
