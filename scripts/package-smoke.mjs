/* eslint-disable sonarjs/no-os-command-from-path -- Use the developer's or CI runner's npm installation. */

import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const directory = mkdtempSync(path.join(tmpdir(), 'linter-package-'))
const packageJson = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'))

try {
  const packed = execFileSync('npm', ['pack', '--json', '--pack-destination', directory], {
    cwd: root,
    encoding: 'utf8',
  })
  const [{ filename }] = JSON.parse(packed)

  execFileSync(
    'npm',
    [
      'install',
      '--prefix',
      directory,
      '--ignore-scripts',
      '--legacy-peer-deps',
      '--no-audit',
      '--no-fund',
      '--package-lock=false',
      path.join(directory, filename),
      `eslint-plugin-solid@${packageJson.peerDependencies['eslint-plugin-solid']}`,
    ],
    { cwd: directory, stdio: 'inherit' },
  )

  const help = execFileSync('npm', ['exec', '--offline', '--', '@st1ggy/linter-config', '--help'], {
    cwd: directory,
    encoding: 'utf8',
  })

  assert.ok(help.includes('--solid'), 'The installed CLI must expose the Solid stack')
  execFileSync(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      "import assert from 'node:assert/strict'; import config from '@st1ggy/linter-config/eslint-solid'; assert.ok(Array.isArray(config));",
    ],
    { cwd: directory, stdio: 'inherit' },
  )
  process.stdout.write('Packed CLI and Solid preset smoke checks passed.\n')
} finally {
  rmSync(directory, { recursive: true, force: true })
}
