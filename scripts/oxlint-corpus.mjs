import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { writeOrCheck } from './oxlint-inventory.mjs'
import { ruleIdentity } from './oxlint-policy.mjs'
import { ROOT } from './oxlint-tools.mjs'
import { readInventory } from './oxlint-values.mjs'

export const CORPUS_FILE = path.join(ROOT, 'scripts/fixtures/oxlint-rule-cases.json')

export function diagnosticCode(ruleId) {
  const position = ruleId.lastIndexOf('/')
  const namespace = ruleId.slice(0, position)
  const name = ruleId.slice(position + 1)
  let diagnosticNamespace = namespace

  if (namespace === 'nextjs') {
    diagnosticNamespace = 'next'
  } else if (namespace === 'react' && ['rules-of-hooks', 'exhaustive-deps'].includes(name)) {
    diagnosticNamespace = 'react-hooks'
  }

  return `${diagnosticNamespace}(${name})`
}

export function isCompilerDiagnostic(diagnostic) {
  return (
    (!diagnostic.code && !diagnostic.message.includes('Error running JS plugin')) || diagnostic.code?.startsWith('TS(')
  )
}

function caseDiagnostics(record, candidate, kind, index, diagnostics) {
  const file = candidate.file ?? `${kind}-${index}.${candidate.ext}`

  return diagnostics.filter((diagnostic) => diagnostic.filename === `${record.hash}/${file}`)
}

function selectCase(record, kind, diagnostics) {
  const candidates = record[kind]

  for (const [index, candidate] of candidates.entries()) {
    const messages = caseDiagnostics(record, candidate, kind, index, diagnostics)
    const expected = diagnosticCode(record.targetId)
    const matches = messages.some((message) => message.code === expected)
    const errors = messages.some((message) => isCompilerDiagnostic(message))

    if ((kind === 'invalid' && matches) || (kind === 'valid' && !matches && !errors)) {
      return { file: candidate.file ?? `${kind}.${candidate.ext}`, code: candidate.code }
    }
  }
}

function parserCase(record) {
  if (record.sourceId === 'import-x/export') {
    return { file: 'invalid.js', code: 'export default 1;\nexport default 2;\n', targetParser: true }
  }

  const code = record.sourceId === 'no-octal' ? 'var value = 077;\n' : 'var value = "\\8";\n'

  return { file: 'invalid.cjs', code, sourceParser: true, targetParser: true }
}

function invalidCase(record, diagnostics) {
  if (record.limitation === 'conditional-configuration') {
    return {
      file: record.stack === 'svelte' ? 'control.svelte.ts' : 'control.tsx',
      code:
        record.stack === 'svelte'
          ? 'if (condition) { function inner() {} }\n'
          : 'export function Component() { return <p>Hello</p> }\n',
    }
  }

  if (['import-x/export', 'no-octal', 'no-nonoctal-decimal-escape'].includes(record.sourceId)) {
    return parserCase(record)
  }

  return selectCase(record, 'invalid', diagnostics)
}

export function importCorpus(directory) {
  const records = readInventory(path.join(directory, 'records.json'))
  const { diagnostics } = JSON.parse(readFileSync(path.join(directory, 'target-diagnostics.json'), 'utf8'))
  const source = readInventory(path.join(ROOT, 'data/oxlint-source-inventory.json'))
  const mapping = readInventory(path.join(ROOT, 'data/oxlint-rule-map.json'))
  const cases = {}

  for (const record of Object.values(records)) {
    const isConditional = record.limitation === 'conditional-configuration'
    const invalid = invalidCase(record, diagnostics)
    const valid = selectCase(record, 'valid', diagnostics)

    assert.ok(invalid && valid, `Missing behavioral evidence: ${record.sourceId}`)
    const id = ruleIdentity(record.sourceId, record.sourceValue, 'module')
    const decision = mapping.decisions[id]

    assert.ok(decision?.targetId, `Fixture has no active mapping: ${id}`)

    cases[id] = {
      sourceId: record.sourceId,
      stack: record.stack ?? 'common',
      conditional: isConditional,
      sourceValue: record.sourceValue,
      targetId: decision.targetId,
      targetValue: decision.targetValue,
      sourceType: record.sourceType ?? 'module',
      globals: record.globals,
      supportFiles: record.supportFiles,
      origin: record.url ?? source.metadata[record.sourceId].documentation,
      valid,
      invalid,
    }
  }

  const corpus = {
    schemaVersion: 1,
    sourceVersions: source.versions,
    packageJson: {
      type: 'module',
      engines: { node: '>=24' },
      browserslist: ['Chrome >= 130'],
      devDependencies: {
        jest: '^30.0.0',
        vitest: '^4.0.0',
        mocha: '^11.0.0',
        react: '^19.0.0',
        lodash: '^4.17.21',
        'solid-js': '^1.9.15',
        '@sveltejs/kit': '^2.0.0',
      },
    },
    rootFiles: {
      'pages/index.js': 'export default function Page() {return null}\n',
      'pages/about.js': 'export default function Page() {return null}\n',
    },
    cases,
  }

  writeOrCheck(CORPUS_FILE, corpus, false)
  process.stdout.write(`Imported ${Object.keys(cases).length} paired rule fixtures\n`)
}

export function extendCorpus() {
  const corpus = readInventory(CORPUS_FILE)
  const mapping = readInventory(path.join(ROOT, 'data/oxlint-rule-map.json'))
  const examples = {
    '@stylistic/multiline-comment-style': '// first line\n// second line\nexport const isExample = true\n',
    'unicorn/no-null': 'export const value = null\n',
  }

  for (const decision of Object.values(mapping.decisions)) {
    if (!decision.targetId || decision.skipConfiguration || Object.hasOwn(corpus.cases, decision.evidence)) {
      continue
    }

    const existing = Object.values(corpus.cases).find((fixture) => fixture.sourceId === decision.sourceId)
    const isConditional = decision.limitation === 'conditional-configuration'
    const valid = existing?.valid ?? { file: 'valid.ts', code: 'export const isExample = true\n' }
    const invalid = isConditional
      ? { file: 'control.ts', code: 'export const isExample = true\n' }
      : (existing?.invalid ?? { file: 'invalid.ts', code: examples[decision.sourceId] })

    assert.ok(invalid.code, `Add a fixture for ${decision.sourceId}`)
    const id = ruleIdentity(decision.sourceId, decision.sourceValue, 'module')

    corpus.cases[id] = {
      ...existing,
      stack: existing?.stack ?? 'common',
      sourceId: decision.sourceId,
      sourceValue: decision.sourceValue,
      targetId: decision.targetId,
      targetValue: decision.targetValue,
      conditional: isConditional,
      sourceType: existing?.sourceType ?? 'module',
      origin: existing?.origin ?? decision.documentation,
      valid,
      invalid,
    }
  }

  writeOrCheck(CORPUS_FILE, corpus, false)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv[2] === '--extend') {
    extendCorpus()
  } else {
    assert.equal(process.argv[2], '--import', 'Usage: node scripts/oxlint-corpus.mjs --import <probe-directory>')
    importCorpus(process.argv[3])
  }
}
