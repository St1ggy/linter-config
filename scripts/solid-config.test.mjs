/* eslint-disable unicorn/no-incorrect-template-string-interpolation -- Fixtures contain literal JSX expressions. */

import { ESLint } from 'eslint'
import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import test from 'node:test'

import solidConfig from '@st1ggy/linter-config/eslint-solid'

import prettierConfig from '../src/prettier/prettier.config.common.js'

import { resolveStackKey, run, stackPackages } from './linter-init-core.mjs'

function createProject(context) {
  const prefix = path.join(tmpdir(), 'linter-solid-')
  const directory = realpathSync(mkdtempSync(prefix))

  context.after(() => rmSync(directory, { recursive: true, force: true }))
  writeFileSync(
    path.join(directory, 'tsconfig.json'),
    JSON.stringify({ compilerOptions: { allowJs: true, jsx: 'preserve', noEmit: true }, include: ['*.jsx', '*.tsx'] }),
  )
  writeFileSync(path.join(directory, '.prettierrc.json'), JSON.stringify(prettierConfig))

  return directory
}

async function lintSource(context, extension, source) {
  const directory = createProject(context)
  const filePath = path.join(directory, `component.${extension}`)

  writeFileSync(filePath, source)
  const eslint = new ESLint({
    cwd: directory,
    overrideConfigFile: true,
    overrideConfig: [...solidConfig, { languageOptions: { parserOptions: { tsconfigRootDir: directory } } }],
  })
  const [result] = await eslint.lintFiles([filePath])

  assert.equal(result.fatalErrorCount, 0, JSON.stringify(result.messages))

  return result.messages
}

test('Solid preset is available through both public exports', async () => {
  const { eslintSolid } = await import('@st1ggy/linter-config')

  assert.equal(eslintSolid, solidConfig)
})

for (const extension of ['jsx', 'tsx']) {
  const annotation = extension === 'tsx' ? ': { name: string }' : ''

  test(`Solid preset accepts reactive props in ${extension}`, async (context) => {
    const messages = await lintSource(
      context,
      extension,
      `export const Greeting = (props${annotation}) => <p>{props.name}</p>\n`,
    )

    assert.deepEqual(messages, [])
  })

  test(`Solid preset reports destructured props in ${extension}`, async (context) => {
    const messages = await lintSource(
      context,
      extension,
      `export const Greeting = ({ name }${annotation}) => <p>{name}</p>\n`,
    )

    assert.ok(messages.some((message) => message.ruleId === 'solid/no-destructure' && message.severity === 2))
  })

  test(`Solid preset reports lost reactivity in ${extension}`, async (context) => {
    const messages = await lintSource(
      context,
      extension,
      `export const Greeting = (props${annotation}) => {
  const name = props.name

  return <p>{name}</p>
}
`,
    )

    assert.ok(messages.some((message) => message.ruleId === 'solid/reactivity' && message.severity === 1))
  })

  test(`Solid preset recognizes components used in ${extension}`, async (context) => {
    const messages = await lintSource(
      context,
      extension,
      'const Greeting = () => <p>Hello</p>\n\nexport const App = () => <Greeting />\n',
    )

    assert.deepEqual(messages, [])
  })
}

test('Solid stack generates wrappers, preserves them on init and replaces them on migrate', (context) => {
  const directory = createProject(context)
  const expected = {
    'eslint.config.js': "export { default } from '@st1ggy/linter-config/eslint-solid';\n",
    'prettier.config.js': "export { default } from '@st1ggy/linter-config/prettier-common';\n",
    'stylelint.config.js': "export { default } from '@st1ggy/linter-config/stylelint-scss';\n",
  }

  run('init', directory, 'solid', { quiet: true })

  for (const [file, content] of Object.entries(expected)) {
    assert.equal(readFileSync(path.join(directory, file), 'utf8'), content)
    writeFileSync(path.join(directory, file), '// existing config\n')
  }

  run('init', directory, 'solid', { quiet: true })

  for (const file of Object.keys(expected)) {
    assert.equal(readFileSync(path.join(directory, file), 'utf8'), '// existing config\n')
  }

  run('migrate', directory, 'solid', { quiet: true })

  for (const [file, content] of Object.entries(expected)) {
    assert.equal(readFileSync(path.join(directory, file), 'utf8'), content)
  }
})

test('Solid stack selects its integration plugin and rejects conflicting flags', () => {
  assert.equal(resolveStackKey({ solid: true }), 'solid')
  assert.deepEqual(stackPackages('solid'), ['@st1ggy/linter-config', 'eslint-plugin-solid'])
  assert.throws(() => resolveStackKey({ solid: true, react: true }), /Pick at most one stack flag/)
})
