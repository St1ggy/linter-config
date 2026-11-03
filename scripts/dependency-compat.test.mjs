import stylelintScss from '@st1ggy/linter-config/stylelint-scss'
import assert from 'node:assert/strict'
import path from 'node:path'
import test from 'node:test'
import { format, resolveConfig } from 'prettier'
import stylelint from 'stylelint'

import { temporaryProject } from './fixtures/oxlint-cases.mjs'
import { ROOT } from './oxlint-tools.mjs'

test('Published Stylelint preset accepts SCSS and reports incorrect property order', async () => {
  const options = {
    config: stylelintScss,
    configBasedir: ROOT,
    codeFilename: path.join(ROOT, 'compat.scss'),
  }
  const valid = await stylelint.lint({
    ...options,
    code: '$color: #fff;\n\n.example {\n  display: block;\n\n  color: $color;\n}\n',
  })

  assert.equal(valid.errored, false, JSON.stringify(valid.results[0].warnings))
  assert.equal(valid.results.length, 1)
  assert.deepEqual(valid.results[0].warnings, [])
  assert.deepEqual(valid.results[0].invalidOptionWarnings, [])
  const invalid = await stylelint.lint({
    ...options,
    code: '$color: #fff;\n\n.example {\n  color: $color;\n\n  display: block;\n}\n',
  })

  assert.equal(invalid.errored, true)
  assert.ok(invalid.results[0].warnings.some((warning) => warning.rule === 'order/properties-order'))
})

const formatterCases = [
  { preset: 'prettier-common', file: 'probe.js', code: 'export const value="hello";\n' },
  { preset: 'prettier-common', file: 'probe.ts', code: 'export const value:string="hello";\n' },
  {
    preset: 'prettier-svelte',
    file: 'probe.svelte',
    code: '<script>const text="hello";</script><p>{text}</p>',
  },
  { preset: 'prettier-astro', file: 'probe.astro', code: '---\nconst text="hello";\n---\n<p>{text}</p>' },
]

for (const { preset, file, code } of formatterCases) {
  test(`Published ${preset} formats ${file} idempotently`, async (context) => {
    const module = import.meta.resolve(`@st1ggy/linter-config/${preset}`)
    const directory = temporaryProject(context, {
      'prettier.config.js': `export { default } from ${JSON.stringify(module)}\n`,
      [file]: code,
    })
    const filepath = path.join(directory, file)
    const config = await resolveConfig(filepath)

    assert.ok(config)
    const options = { ...config, filepath }
    const formatted = await format(code, options)

    assert.notEqual(formatted, code)
    assert.match(formatted, /'hello'/)
    assert.equal(await format(formatted, options), formatted)

    if (file.endsWith('.js')) {
      assert.equal(formatted, "export const value = 'hello'\n")
    }
  })
}
