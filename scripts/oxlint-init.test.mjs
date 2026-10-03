import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { chmodSync, existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import test from 'node:test'

import { temporaryProject } from './fixtures/oxlint-cases.mjs'
import {
  PACKAGE,
  STACKS,
  STACK_CHOICES,
  STACK_KEYS,
  ensureDevDependencies,
  existingWrapperFiles,
  legacyConfigFiles,
  resolveStackKey,
  run,
  stackPackageSpecs,
  stackPackages,
  wrapperFileNames,
} from './linter-init-core.mjs'
import { OX_STACKS, ROOT } from './oxlint-tools.mjs'

test('All twelve stacks generate the selected engine and retain init/migrate semantics', (context) => {
  assert.equal(STACK_KEYS.length, 12)
  assert.deepEqual(
    STACK_CHOICES.map((choice) => choice.value),
    STACK_KEYS,
  )
  assert.equal(resolveStackKey({}), 'common')

  for (const stack of STACK_KEYS) {
    const directory = temporaryProject(context)
    const names = wrapperFileNames(stack)

    assert.equal(resolveStackKey({ [stack]: true }), stack)
    run('init', directory, stack, { quiet: true })
    assert.deepEqual(existingWrapperFiles(directory, stack), names)
    assert.equal(
      readFileSync(path.join(directory, names[0]), 'utf8'),
      `export { default } from '${PACKAGE}/${STACKS[stack].linterPreset}';\n`,
    )
    writeFileSync(path.join(directory, names[0]), '// custom\n')
    run('create', directory, stack, { quiet: true })
    assert.equal(readFileSync(path.join(directory, names[0]), 'utf8'), '// custom\n')
    run('reinit', directory, stack, { quiet: true })
    assert.ok(readFileSync(path.join(directory, names[0]), 'utf8').includes(STACKS[stack].linterPreset))
  }

  assert.throws(() => resolveStackKey({ react: true, 'react-ox': true }), /Pick at most one/)
  assert.deepEqual(stackPackages('astro-ox'), [
    PACKAGE,
    'oxlint',
    'oxlint-tsgolint',
    'eslint-plugin-astro',
    'prettier-plugin-astro',
  ])
})

test('Changing engines keeps the other wrapper and offers it as a legacy file', (context) => {
  const directory = temporaryProject(context)

  run('init', directory, 'solid', { quiet: true })
  run('init', directory, 'solid-ox', { quiet: true })
  assert.ok(existsSync(path.join(directory, 'eslint.config.js')))
  assert.ok(existsSync(path.join(directory, 'oxlint.config.ts')))
  assert.deepEqual(legacyConfigFiles(directory, 'solid-ox'), ['eslint.config.js'])
  assert.deepEqual(legacyConfigFiles(directory, 'solid'), ['oxlint.config.ts'])
  writeFileSync(path.join(directory, '.oxlintrc.json'), '{}\n')
  assert.ok(legacyConfigFiles(directory, 'solid-ox').includes('.oxlintrc.json'))
})

function packageManagerProject(context, pm) {
  const locks = { npm: 'package-lock.json', pnpm: 'pnpm-lock.yaml', yarn: 'yarn.lock', bun: 'bun.lock' }
  const directory = temporaryProject(context, { [locks[pm]]: '' })
  const bin = path.join(directory, 'bin')
  const log = path.join(directory, 'pm-args.json')

  unlinkSync(path.join(directory, 'node_modules'))
  mkdirSync(bin)
  const executable = path.join(bin, pm)

  writeFileSync(
    executable,
    `#!${process.execPath}\nimport * as fs from 'node:fs';fs.writeFileSync(process.env.OX_PM_LOG,JSON.stringify(process.argv.slice(2)));\n`,
  )
  chmodSync(executable, 0o755)
  const previousPath = process.env.PATH
  const previousLog = process.env.OX_PM_LOG

  process.env.PATH = `${bin}${path.delimiter}${previousPath}`
  process.env.OX_PM_LOG = log
  context.after(() => {
    process.env.PATH = previousPath

    if (previousLog === undefined) {
      delete process.env.OX_PM_LOG
    } else {
      process.env.OX_PM_LOG = previousLog
    }
  })

  return { directory, log }
}

for (const pm of ['npm', 'pnpm', 'yarn', 'bun']) {
  test(`${pm}: pins missing or incompatible Oxlint engines`, (context) => {
    const { directory, log } = packageManagerProject(context, pm)

    writeFileSync(
      path.join(directory, 'package.json'),
      JSON.stringify({ type: 'module', devDependencies: { oxlint: '1.0.0', 'oxlint-tsgolint': '7.0.1000' } }),
    )
    mkdirSync(path.join(directory, 'node_modules/oxlint'), { recursive: true })
    writeFileSync(path.join(directory, 'node_modules/oxlint/package.json'), '{"name":"oxlint","version":"1.0.0"}\n')
    ensureDevDependencies(directory, ['oxlint', 'oxlint-tsgolint'], false, {
      quiet: true,
      specs: stackPackageSpecs('common-ox'),
    })
    const args = JSON.parse(readFileSync(log, 'utf8'))

    assert.ok(args.includes('oxlint@1.86.0'))
    assert.ok(args.includes('oxlint-tsgolint@7.0.2003'))
    assert.ok(args.includes(pm === 'npm' || pm === 'pnpm' ? '--save-exact' : '--exact'))
  })

  test(`${pm}: retains ordinary install for declared legacy dependencies`, (context) => {
    const { directory, log } = packageManagerProject(context, pm)

    writeFileSync(
      path.join(directory, 'package.json'),
      '{"type":"module","devDependencies":{"eslint-plugin-react":"^7.37.5"}}\n',
    )
    ensureDevDependencies(directory, ['eslint-plugin-react'], false, { quiet: true })
    assert.deepEqual(JSON.parse(readFileSync(log, 'utf8')), ['install'])
  })
}

test('skip-install and already-correct versions do not invoke a package manager', (context) => {
  const { directory, log } = packageManagerProject(context, 'npm')

  ensureDevDependencies(directory, ['oxlint'], true, { specs: stackPackageSpecs('common-ox') })
  assert.ok(!existsSync(log))
  writeFileSync(path.join(directory, 'package.json'), '{"type":"module","devDependencies":{"oxlint":"1.86.0"}}\n')
  mkdirSync(path.join(directory, 'node_modules/oxlint'), { recursive: true })
  writeFileSync(path.join(directory, 'node_modules/oxlint/package.json'), '{"name":"oxlint","version":"1.86.0"}\n')
  ensureDevDependencies(directory, ['oxlint'], false, { quiet: true, specs: stackPackageSpecs('common-ox') })
  assert.ok(!existsSync(log))
})

test('Published CLI help and each shell shortcut expose the new stack flags', () => {
  const help = spawnSync(process.execPath, ['scripts/linter-init.mjs', '--help'], { cwd: ROOT, encoding: 'utf8' })

  assert.equal(help.status, 0, help.stderr)

  for (const stack of OX_STACKS) {
    assert.ok(help.stdout.includes(`--${stack}-ox`))
    const file = path.join(ROOT, `scripts/init-${stack}-ox.sh`)
    const checked = spawnSync('/bin/bash', ['-n', file], { encoding: 'utf8' })

    assert.equal(checked.status, 0, checked.stderr)
    assert.ok(readFileSync(file, 'utf8').includes(`init --${stack}-ox "$@"`))
  }
})
