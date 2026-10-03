import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { cpSync, mkdirSync, readFileSync, symlinkSync, unlinkSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import test from 'node:test'

import { temporaryProject, toolchainFiles } from './fixtures/oxlint-cases.mjs'
import { OX_STACKS, ROOT, packageExecutable, runOxlint } from './oxlint-tools.mjs'

const manifest = JSON.parse(readFileSync(path.join(ROOT, 'package.json'), 'utf8'))

function consumerPackage(context, dependencies = []) {
  const directory = temporaryProject(context)
  const modules = path.join(directory, 'node_modules')

  unlinkSync(modules)
  const installed = path.join(modules, '@st1ggy/linter-config')

  mkdirSync(installed, { recursive: true })
  cpSync(path.join(ROOT, 'src'), path.join(installed, 'src'), { recursive: true })
  cpSync(path.join(ROOT, 'index.d.ts'), path.join(installed, 'index.d.ts'))
  writeFileSync(path.join(installed, 'package.json'), JSON.stringify(manifest))

  for (const name of dependencies) {
    const destination = path.join(modules, name)

    mkdirSync(path.dirname(destination), { recursive: true })
    symlinkSync(path.join(ROOT, 'node_modules', name), destination, 'dir')
  }

  if (dependencies.includes('oxlint-tsgolint')) {
    symlinkSync(path.join(ROOT, 'node_modules/@oxlint-tsgolint'), path.join(modules, '@oxlint-tsgolint'), 'dir')
    mkdirSync(path.join(modules, '.bin'), { recursive: true })
    symlinkSync(packageExecutable('oxlint-tsgolint', 'bin/tsgolint.js'), path.join(modules, '.bin/tsgolint'))
  }

  return directory
}

test('All Oxlint public exports load without optional engine or framework peers', (context) => {
  const directory = consumerPackage(context)
  const code = `import assert from 'node:assert/strict'; for (const stack of ${JSON.stringify(OX_STACKS)}) { const {default:config}=await import('@st1ggy/linter-config/'+stack+'-ox'); assert.equal(config.options.typeAware,true); assert.equal(Array.isArray(config),false); }`
  const result = spawnSync(process.execPath, ['--input-type=module', '-e', code], { cwd: directory, encoding: 'utf8' })

  assert.equal(result.status, 0, result.stderr)
})

test('Common consumer export works without other framework integrations and supports composition', (context) => {
  const directory = consumerPackage(context, [...Object.keys(manifest.dependencies), 'oxlint', 'oxlint-tsgolint'])

  for (const [file, code] of Object.entries(toolchainFiles)) {
    writeFileSync(path.join(directory, file), code)
  }

  for (const config of [
    "export { default } from '@st1ggy/linter-config/common-ox'\n",
    "import config from '@st1ggy/linter-config/common-ox'; import {defineConfig} from 'oxlint'; export default defineConfig({extends:[config],options:{typeAware:true}})\n",
  ]) {
    writeFileSync(path.join(directory, 'oxlint.config.ts'), config)
    const result = runOxlint(['probe.ts'], { cwd: directory, toolDirectory: directory })

    assert.equal(result.status, 1, result.stdout + result.stderr)
    assert.match(result.stdout, /switch-exhaustiveness-check/)
    assert.ok(!result.stdout.includes('Failed to load'), result.stdout)
  }
})

test('Oxlint declarations are checked by TS7 and cannot become any or ESLint arrays', (context) => {
  const directory = consumerPackage(context, ['oxlint'])
  const imports = OX_STACKS.map(
    (stack, index) => `import config${index} from '@st1ggy/linter-config/${stack}-ox'`,
  ).join('\n')
  const checks = OX_STACKS.map(
    (stack, index) =>
      `const value${index}: OxlintConfig = config${index}\n// @ts-expect-error A preset is an object, not an ESLint config array.\nconfig${index}.push({})`,
  ).join('\n')

  writeFileSync(path.join(directory, 'probe.ts'), `import type { OxlintConfig } from 'oxlint'\n${imports}\n${checks}\n`)
  const executable = packageExecutable('@typescript/native', 'bin/tsc')
  const result = spawnSync(process.execPath, [executable, '--noEmit'], { cwd: directory, encoding: 'utf8' })

  assert.equal(result.status, 0, result.stdout + result.stderr)
})

test('The old common export loads without the new Oxlint peers', (context) => {
  const directory = consumerPackage(context, Object.keys(manifest.dependencies))
  const result = spawnSync(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      "import assert from 'node:assert/strict'; import config from '@st1ggy/linter-config/eslint-common'; assert.ok(Array.isArray(config));",
    ],
    { cwd: directory, encoding: 'utf8' },
  )

  assert.equal(result.status, 0, result.stderr)
})
