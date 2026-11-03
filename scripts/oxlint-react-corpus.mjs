// Explicit one-time migration to the modern React preset; never run as a check.
import assert from 'node:assert/strict'

import { reactModernCases } from './fixtures/react-modern-cases.mjs'
import { writeOrCheck } from './oxlint-inventory.mjs'
import { readInventory } from './oxlint-values.mjs'

const file = new URL('fixtures/oxlint-rule-cases.json', import.meta.url)
const corpus = readInventory(file)
const source = readInventory(new URL('../data/oxlint-source-inventory.json', import.meta.url))
const mapping = readInventory(new URL('../data/oxlint-rule-map.json', import.meta.url))

corpus.sourceVersions = source.versions
corpus.cases = Object.fromEntries(
  Object.entries(corpus.cases).filter(
    ([, fixture]) => !fixture.sourceId.startsWith('react/') && !fixture.sourceId.startsWith('@eslint-react/'),
  ),
)

for (const decision of Object.values(mapping.decisions)) {
  if (!decision.evidence?.startsWith('module:') || Object.hasOwn(corpus.cases, decision.evidence)) {
    continue
  }

  const name = decision.sourceId.replace('@eslint-react/', '')
  const pair =
    decision.sourceId === '@stylistic/jsx-self-closing-comp'
      ? ['export const View = () => <Item />\n', 'export const View = () => <Item></Item>\n']
      : reactModernCases[name]

  assert.ok(pair, `Add paired evidence for ${decision.sourceId}`)
  corpus.cases[decision.evidence] = {
    sourceId: decision.sourceId,
    stack: 'react',
    conditional: false,
    sourceValue: decision.sourceValue,
    targetId: decision.targetId,
    targetValue: decision.targetValue,
    sourceType: 'module',
    globals: { window: 'readonly', document: 'readonly', fetch: 'readonly' },
    origin: decision.documentation,
    valid: { file: 'valid.tsx', code: pair[0] },
    invalid: { file: 'invalid.tsx', code: pair[1] },
  }
}

writeOrCheck(file, corpus, false)
