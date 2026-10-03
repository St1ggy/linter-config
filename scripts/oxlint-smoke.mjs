import assert from 'node:assert/strict'
import { mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import prettierConfig from '../src/prettier/prettier.config.common.js'

import { ROOT, runOxlint, selectedStacks } from './oxlint-tools.mjs'

export function smoke(stacks) {
  for (const stack of stacks) {
    const directory = mkdtempSync(path.join(tmpdir(), 'oxlint-smoke-'))

    try {
      symlinkSync(path.join(ROOT, 'node_modules'), path.join(directory, 'node_modules'), 'dir')
      writeFileSync(path.join(directory, 'package.json'), '{"type":"module"}\n')
      writeFileSync(
        path.join(directory, 'tsconfig.json'),
        '{"compilerOptions":{"target":"esnext","allowJs":true,"noEmit":true},"include":["*.ts"]}\n',
      )
      writeFileSync(path.join(directory, '.prettierrc.json'), JSON.stringify(prettierConfig))
      const config = pathToFileURL(path.join(ROOT, `src/oxlint/oxlint.config.${stack}.js`)).href

      writeFileSync(path.join(directory, 'oxlint.config.ts'), `export { default } from ${JSON.stringify(config)}\n`)
      writeFileSync(path.join(directory, 'probe.ts'), 'export const isExample = true\n')
      const valid = runOxlint(['probe.ts'], { cwd: directory })

      assert.equal(valid.status, 0, valid.stdout + valid.stderr)
      writeFileSync(path.join(directory, 'probe.ts'), 'export enum State { Pending, Done }\n')
      const invalid = runOxlint(['probe.ts'], { cwd: directory })

      assert.equal(invalid.status, 1, invalid.stdout + invalid.stderr)
      assert.match(invalid.stdout, /no-restricted-syntax/)
      process.stdout.write(`${stack}-ox smoke passed\n`)
    } finally {
      rmSync(directory, { recursive: true, force: true })
    }
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  smoke(selectedStacks())
}
