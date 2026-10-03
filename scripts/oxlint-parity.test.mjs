import assert from 'node:assert/strict'
import test from 'node:test'

import { temporaryProject } from './fixtures/oxlint-cases.mjs'
import { prepareCorpus, readCorpus, verifySourceCorpus, verifyTargetCorpus } from './oxlint-parity.mjs'

test('Every migrated rule fixture preserves source/target diagnostics and severity', async (context) => {
  const corpus = readCorpus()
  const directory = temporaryProject(context)
  const entries = await prepareCorpus(directory, corpus)

  assert.ok(entries.length >= 590, 'The reviewed common-rule corpus must not silently shrink')
  await verifySourceCorpus(directory, corpus, entries)
  verifyTargetCorpus(directory, corpus, entries)
})
