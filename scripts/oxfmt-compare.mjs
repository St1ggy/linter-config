import { globSync, readFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'
import { format as formatOx } from 'oxfmt'
import { format as formatPrettier } from 'prettier'

import oxfmtConfig from '../src/oxfmt/oxfmt.config.common.js'
import prettierConfig from '../src/prettier/prettier.config.common.js'

import { ROOT, packageExecutable } from './oxlint-tools.mjs'
import { readInventory } from './oxlint-values.mjs'

export async function compareFormatters() {
  const records = []
  const sources = globSync(
    [
      'src/**/*.{js,ts,tsx,css,scss}',
      'scripts/*.mjs',
      '.github/workflows/*.yml',
      'package.json',
      'tsconfig.json',
      'index.d.ts',
      'eslint.config.js',
      'prettier.config.js',
    ],
    { cwd: ROOT },
  )

  for (const file of sources) {
    records.push({ id: file, file, code: readFileSync(path.join(ROOT, file), 'utf8'), group: 'sources' })
  }

  const corpus = readInventory(path.join(ROOT, 'scripts/fixtures/oxlint-rule-cases.json'))

  for (const [id, fixture] of Object.entries(corpus.cases)) {
    for (const kind of ['valid', 'invalid']) {
      const specimen = fixture[kind]

      records.push({ id: `${id}/${kind}`, ...specimen, group: 'corpus' })
    }
  }

  const counts = { sources: { equal: 0, different: 0, skipped: 0 }, corpus: { equal: 0, different: 0, skipped: 0 } }
  const differences = []

  for (const record of records) {
    let expected

    try {
      expected = await formatPrettier(record.code, { ...prettierConfig, filepath: record.file })
    } catch {
      counts[record.group].skipped++
      continue
    }

    // Compare the shared layout only. Import sorting is an intentional new
    // Oxfmt-only behavior with separate grouping/side-effect/idempotence tests.
    const result = await formatOx(record.file, record.code, { ...oxfmtConfig, sortImports: false })

    if (result.errors.length > 0) {
      counts[record.group].skipped++
    } else if (result.code === expected) {
      counts[record.group].equal++
    } else {
      counts[record.group].different++
      differences.push(record.id)
    }
  }

  const versions = Object.fromEntries(
    ['oxfmt', 'prettier'].map((name) => [
      name,
      JSON.parse(readFileSync(packageExecutable(name, 'package.json'), 'utf8')).version,
    ]),
  )

  return { versions, counts, differences, excludedFeatures: ['sortImports'] }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.stdout.write(`${JSON.stringify(await compareFormatters(), null, 2)}\n`)
}
