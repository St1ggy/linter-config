import assert from 'node:assert/strict'
import path from 'node:path'
import test from 'node:test'

import { temporaryProject } from './fixtures/oxlint-cases.mjs'
import { validateCoverage } from './oxlint-audit.mjs'
import { saveModule } from './oxlint-generate.mjs'
import { prepareCorpus, readCorpus, verifySourceCorpus, verifyTargetCorpus } from './oxlint-parity.mjs'
import { ROOT, nativeRules } from './oxlint-tools.mjs'
import { readInventory } from './oxlint-values.mjs'

const source = readInventory(path.join(ROOT, 'data/oxlint-source-inventory.json'))
const mapping = readInventory(path.join(ROOT, 'data/oxlint-rule-map.json'))
const corpus = readCorpus()
const catalog = nativeRules()
const supported = Object.entries(mapping.decisions).find(
  ([, item]) => item.domain === 'module' && item.status === 'native' && !item.skipConfiguration,
)

test('Coverage rejects an unmapped source rule', () => {
  const changed = structuredClone(mapping)

  delete changed.decisions[supported[0]]
  assert.throws(() => validateCoverage(source, changed, corpus, catalog), /Unmapped source rule/)
})

test('Coverage rejects changed options, severities and missing evidence', () => {
  const options = structuredClone(mapping)

  options.decisions[supported[0]].sourceValue.push({ changed: true })
  assert.throws(() => validateCoverage(source, options, corpus, catalog), /Source configuration drift/)
  const severity = structuredClone(mapping)

  severity.decisions[supported[0]].targetValue[0] = 1
  assert.throws(() => validateCoverage(source, severity, corpus, catalog), /Severity drift/)
  const evidence = structuredClone(mapping)

  delete evidence.decisions[supported[0]].evidence
  assert.throws(() => validateCoverage(source, evidence, corpus, catalog), /Missing evidence/)
  const genericEvidence = structuredClone(mapping)

  genericEvidence.decisions[supported[0]].evidence = 'capability:css-ast'
  assert.throws(
    () => validateCoverage(source, genericEvidence, corpus, catalog),
    /Generic capability evidence cannot replace/,
  )
  const missingFixture = structuredClone(corpus)

  delete missingFixture.cases[supported[1].evidence]
  assert.throws(() => validateCoverage(source, mapping, missingFixture, catalog), /Missing fixture/)
})

test('Coverage detects new upstream rules and false claims of SFC equivalence', () => {
  const updated = structuredClone(source)
  const profile = updated.presets.common.scopes['src/probe.ts'].profile

  updated.profiles[profile].rules['upstream/new-rule'] = [2]
  assert.throws(() => validateCoverage(updated, mapping, corpus, catalog), /Unmapped source rule/)
  const changed = structuredClone(mapping)
  const sfc = Object.values(changed.decisions).find((item) => item.domain === 'svelte' && item.status === 'partial')

  sfc.status = 'native'
  assert.throws(() => validateCoverage(source, changed, corpus, catalog), /SFC coverage cannot claim/)
})

test('Generated config check rejects stale output without rewriting it', async (context) => {
  const directory = temporaryProject(context, { 'config.js': 'export default {}\n' })

  await assert.rejects(
    saveModule(path.join(directory, 'config.js'), 'export default {changed:true}\n', true),
    /Stale generated config/,
  )
})

test('Missing positive source/target diagnostics fail behavioral evidence', async (context) => {
  const id = Object.keys(corpus.cases).find((key) => corpus.cases[key].sourceId === 'no-restricted-syntax')
  const changed = structuredClone(corpus)

  changed.cases = { [id]: changed.cases[id] }
  changed.cases[id].invalid.code = changed.cases[id].valid.code
  const directory = temporaryProject(context)
  const entries = await prepareCorpus(directory, changed)

  await assert.rejects(verifySourceCorpus(directory, changed, entries), /Source invalid evidence changed/)
  assert.throws(() => verifyTargetCorpus(directory, changed, entries), /Target invalid evidence changed/)
})
