import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import test from 'node:test'

import { temporaryProject } from './fixtures/oxlint-cases.mjs'
import { OX_STACKS, ROOT } from './oxlint-tools.mjs'

const snapshot = JSON.parse(readFileSync(path.join(ROOT, 'data/oxlint-source-inventory.json'), 'utf8'))

test('Source inventory contains every preset and distinct JS, TS and framework scopes', () => {
  assert.deepEqual(Object.keys(snapshot.presets), OX_STACKS)

  for (const preset of Object.values(snapshot.presets)) {
    for (const file of ['src/probe.js', 'probe.ts', 'src/probe.tsx', 'probe.vue', 'src/probe.svelte', 'probe.astro']) {
      assert.ok(preset.scopes[file], file)
    }
  }

  const common = snapshot.presets.common.scopes
  const rules = snapshot.profiles[common['src/probe.ts'].profile].rules

  assert.equal(rules['no-unused-vars'][0], 0)
  assert.equal(rules['@typescript-eslint/no-unused-vars'][0], 2)
  assert.deepEqual(rules['@typescript-eslint/consistent-type-definitions'], [2, 'type'])
  assert.equal(common['src/probe.vue'].baselineStatus, 'parse-error')
  assert.equal(snapshot.metadata['@typescript-eslint/switch-exhaustiveness-check'].requiresTypeChecking, true)
  assert.ok(snapshot.presets.svelte.scopes['src/probe.svelte'].profile)
  assert.ok(snapshot.presets.astro.scopes['src/probe.astro'].profile)
  assert.ok(!JSON.stringify(snapshot).includes(ROOT))
})

test('Inventory check rejects a changed snapshot', (context) => {
  const directory = temporaryProject(context)
  const output = path.join(directory, 'snapshot.json')

  writeFileSync(output, '{}\n')
  const result = spawnSync(
    process.execPath,
    ['scripts/oxlint-inventory.mjs', '--source-only', '--check', '--output', output],
    {
      cwd: ROOT,
      encoding: 'utf8',
    },
  )

  assert.notEqual(result.status, 0)
  assert.match(result.stderr, /Stale Oxlint artifact/)
})
