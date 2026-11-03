// Explicit migration: retired deprecated rules are not claimed as active evidence.
import assert from 'node:assert/strict'

import { qualityRuleCases } from './fixtures/quality-rule-cases.mjs'
import { writeOrCheck } from './oxlint-inventory.mjs'
import { readInventory } from './oxlint-values.mjs'

const file = new URL('fixtures/oxlint-rule-cases.json', import.meta.url)
const corpus = readInventory(file)
const source = readInventory(new URL('../data/oxlint-source-inventory.json', import.meta.url))
const mapping = readInventory(new URL('../data/oxlint-rule-map.json', import.meta.url))
const retired = new Set(['newline-before-return', '@stylistic/jsx-props-no-multi-spaces'])

corpus.sourceVersions = source.versions
corpus.cases = Object.fromEntries(
  Object.entries(corpus.cases).filter(
    ([, fixture]) => !retired.has(fixture.sourceId) && !Object.hasOwn(qualityRuleCases, fixture.sourceId),
  ),
)

for (const decision of Object.values(mapping.decisions)) {
  if (!decision.evidence?.startsWith('module:') || Object.hasOwn(corpus.cases, decision.evidence)) {
    continue
  }

  const pair = qualityRuleCases[decision.sourceId]

  assert.ok(pair, `Add paired evidence for ${decision.sourceId}`)
  corpus.cases[decision.evidence] = {
    sourceId: decision.sourceId,
    stack: 'common',
    conditional: false,
    sourceValue: decision.sourceValue,
    targetId: decision.targetId,
    targetValue: decision.targetValue,
    sourceType: 'module',
    origin: decision.documentation,
    valid: { file: 'valid.ts', code: pair[0] },
    invalid: { file: 'invalid.ts', code: pair[1] },
  }
}

writeOrCheck(file, corpus, false)
