/* eslint-disable unicorn/no-incorrect-template-string-interpolation -- Fixtures contain literal JSX expressions. */

import assert from 'node:assert/strict'
import path from 'node:path'
import test from 'node:test'
import { pathToFileURL } from 'node:url'

import { temporaryProject } from './fixtures/oxlint-cases.mjs'
import { ROOT, runOxlint } from './oxlint-tools.mjs'

function lintComponent(context, stack, code, extension = 'tsx') {
  const config = pathToFileURL(path.join(ROOT, `src/oxlint/oxlint.config.${stack}.js`)).href
  const directory = temporaryProject(context, {
    'oxlint.config.ts': `export { default } from ${JSON.stringify(config)}\n`,
    '.prettierrc.json': JSON.stringify({ semi: false, singleQuote: true, printWidth: 120 }),
    [`view.${extension}`]: code,
  })
  const result = runOxlint(['--format', 'json', `view.${extension}`], { cwd: directory })

  assert.ok(result.status === 0 || result.status === 1, result.stdout + result.stderr)
  const { diagnostics } = JSON.parse(result.stdout)

  assert.ok(
    diagnostics.every((diagnostic) => !diagnostic.message.includes('Error running JS plugin')),
    result.stdout,
  )

  return diagnostics
}

for (const stack of ['react', 'next', 'solid']) {
  test(`${stack}-ox accepts a valid JSX component`, (context) => {
    assert.deepEqual(lintComponent(context, stack, 'export const View = () => <p>Hello</p>\n'), [])
  })
}

for (const stack of ['react', 'solid']) {
  test(`${stack}-ox intrinsically marks JSX components as used`, (context) => {
    const used = lintComponent(
      context,
      stack,
      'const Child = () => <p>Hello</p>\n\nexport const View = () => <Child />\n',
    )

    assert.ok(
      used.every((item) => !item.code?.includes('no-unused-vars')),
      JSON.stringify(used),
    )
    const unused = lintComponent(
      context,
      stack,
      'const Child = () => <p>Hello</p>\n\nexport const View = () => <p>World</p>\n',
    )

    assert.ok(
      unused.some((item) => item.code?.includes('no-unused-vars')),
      JSON.stringify(unused),
    )
  })
}

test('React rules keep their configured component style and hooks checks', (context) => {
  const diagnostics = lintComponent(context, 'react', 'export function View() { return <button>Hello</button> }\n')

  assert.ok(diagnostics.some((item) => item.code?.includes('function-component-definition')))
  assert.ok(diagnostics.some((item) => item.code?.includes('button-has-type')))
})

test('Next rules are added to the React layer', (context) => {
  const diagnostics = lintComponent(
    context,
    'next',
    'export const View = () => <img src="/image.png" alt="Example" />\n',
  )

  assert.ok(diagnostics.some((item) => item.code?.includes('no-img-element')))
})

for (const extension of ['jsx', 'tsx']) {
  const annotation = extension === 'tsx' ? ': { name: string }' : ''

  test(`Solid reactive props work in ${extension}`, (context) => {
    const diagnostics = lintComponent(
      context,
      'solid',
      `export const View = (props${annotation}) => <p>{props.name}</p>\n`,
      extension,
    )

    assert.deepEqual(diagnostics, [])
  })

  test(`Solid detects destructuring and untracked reads in ${extension}`, (context) => {
    const destructured = lintComponent(
      context,
      'solid',
      `export const View = ({ name }${annotation}) => <p>{name}</p>\n`,
      extension,
    )
    const untracked = lintComponent(
      context,
      'solid',
      `export const View = (props${annotation}) => {\n  const name = props.name\n\n  return <p>{name}</p>\n}\n`,
      extension,
    )

    assert.ok(destructured.some((item) => item.code === 'solid(no-destructure)' && item.severity === 'error'))
    assert.ok(untracked.some((item) => item.code === 'solid(reactivity)' && item.severity === 'warning'))
  })
}
