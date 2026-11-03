/* eslint-disable sonarjs/no-os-command-from-path -- Use the developer's or CI runner's npm installation. */

import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { OXFMT_STACKS, OXFMT_VERSION, OX_VERSIONS } from '../src/oxlint/stacks.js'

import { STACKS, run } from './linter-init-core.mjs'
import { OX_STACKS, ROOT, packageExecutable, runOxfmt, runOxlint, selectedStacks } from './oxlint-tools.mjs'

const manifest = JSON.parse(readFileSync(path.join(ROOT, 'package.json'), 'utf8'))
const lock = JSON.parse(readFileSync(path.join(ROOT, 'package-lock.json'), 'utf8'))
const pmPosition = process.argv.indexOf('--pm')
const pm = pmPosition === -1 ? 'npm' : process.argv[pmPosition + 1]

assert.ok(pm === 'npm' || pm === 'pnpm', 'Supported smoke package managers: npm, pnpm')

function pmCommand(args, directory) {
  const command = pm === 'npm' ? 'npm' : process.execPath
  const parameters = pm === 'npm' ? args : [packageExecutable('pnpm', 'bin/pnpm.cjs'), ...args]
  const env = { ...process.env }

  // Do not inherit `npm exec --package=node@...` when checking the minimum
  // Node version: it would make the nested npm exec select the Node package.
  delete env.npm_config_package

  return execFileSync(command, parameters, { cwd: directory, encoding: 'utf8', timeout: 240_000, env })
}

function exactVersion(name) {
  const version = lock.packages[`node_modules/${name}`]?.version

  assert.ok(version, `No tested version in the lockfile: ${name}`)

  return version
}

function installProject(directory, tarball, packages) {
  mkdirSync(directory)
  const dependencies = Object.fromEntries(packages.map((name) => [name, exactVersion(name)]))
  const overrides = Object.fromEntries(Object.keys(manifest.dependencies).map((name) => [name, exactVersion(name)]))

  // Test the checked dependency versions; peer auto-installation must not hide
  // an integration missing from the selected stack.
  writeFileSync(
    path.join(directory, 'package.json'),
    JSON.stringify({
      private: true,
      type: 'module',
      devDependencies: { '@st1ggy/linter-config': `file:${tarball}`, ...dependencies },
      ...(pm === 'npm' && { overrides }),
    }),
  )

  if (pm === 'pnpm') {
    const settings = [
      'nodeLinker: isolated',
      'autoInstallPeers: false',
      'strictPeerDependencies: true',
      'overrides:',
      ...Object.entries(overrides).map(([name, version]) => `  '${name}': '${version}'`),
      '',
    ]

    writeFileSync(path.join(directory, 'pnpm-workspace.yaml'), settings.join('\n'))
  }

  const args =
    pm === 'npm'
      ? ['install', '--ignore-scripts', '--strict-peer-deps', '--no-audit', '--no-fund', '--package-lock=false']
      : ['install', '--ignore-scripts', '--no-frozen-lockfile', '--reporter=append-only']

  pmCommand(args, directory)
  const helpArgs =
    pm === 'npm' ? ['exec', '--offline', '--', '@st1ggy/linter-config', '--help'] : ['exec', 'linter-config', '--help']

  assert.ok(pmCommand(helpArgs, directory).includes('--solid-ox'), 'The installed CLI must expose Oxlint stack flags')
}

function installedPackage(directory) {
  return path.join(directory, 'node_modules/@st1ggy/linter-config')
}

function checkTypes(directory) {
  writeFileSync(path.join(directory, 'kind.ts'), "export type Kind = 'pending' | 'done'\n")
  writeFileSync(
    path.join(directory, 'probe.ts'),
    "import type { Kind } from './kind'\n\nexport const label = (kind: Kind) => {\n  switch (kind) {\n    case 'pending':\n      return kind\n  }\n}\n",
  )
  const linted = runOxlint(['probe.ts'], { cwd: directory, toolDirectory: directory })

  assert.equal(linted.status, 1, linted.stdout + linted.stderr)
  assert.match(linted.stdout, /switch-exhaustiveness-check/)
  writeFileSync(path.join(directory, 'type-error.ts'), 'export const value: string = 42\n')
  const checked = runOxlint(['--type-check', 'type-error.ts'], { cwd: directory, toolDirectory: directory })

  assert.notEqual(checked.status, 0)
  assert.match(checked.stdout + checked.stderr, /2322|not assignable/)
}

const markers = {
  common: { file: 'invalid.ts', code: 'export enum State { Pending }\n', rule: 'no-restricted-syntax' },
  react: {
    file: 'invalid.tsx',
    code: 'export const View = () => <button>Hello</button>\n',
    rule: 'dom-no-missing-button-type',
  },
  solid: {
    file: 'invalid.tsx',
    code: 'export const View = ({ name }: { name: string }) => <p>{name}</p>\n',
    rule: 'no-destructure',
  },
  next: {
    file: 'invalid.tsx',
    code: 'export const View = () => <img src="/image.png" alt="Example" />\n',
    rule: 'no-img-element',
  },
  svelte: { file: 'invalid.svelte', code: '<script>\n$inspect(1)\n</script>\n<p>Hello</p>\n', rule: 'no-inspect' },
  astro: { file: 'invalid.astro', code: '---\ndebugger\n---\n<p>Hello</p>\n', rule: 'no-debugger' },
  vue: {
    file: 'InvalidView.vue',
    code: '<script setup>export const value = 1</script>\n<template><p>Hello</p></template>\n',
    rule: 'no-export-in-script-setup',
  },
  nuxt: { file: 'invalid.ts', code: 'export const value = process.client\n', rule: 'prefer-import-meta' },
  angular: {
    file: 'invalid.component.ts',
    code: "import { Component } from '@angular/core'\n@Component({ selector: 'app-probe', template: '', outputs: ['changed'] })\nexport class Probe {}\n",
    rule: 'no-outputs-metadata-property',
  },
}

function checkOxOnly(directory, stack) {
  assert.equal(existsSync(path.join(directory, 'eslint.config.js')), false, `${stack}: no implicit ESLint wrapper`)
  assert.ok(!STACKS[`${stack}-ox`].packages.includes('eslint'), `${stack}: no direct ESLint install`)
}

async function checkOxStack(directory, stack) {
  const corePath = path.join(installedPackage(directory), 'scripts/linter-init-core.mjs')
  const installedCore = await import(pathToFileURL(corePath).href)

  installedCore.run('init', directory, `${stack}-ox`, { quiet: true })
  writeFileSync(
    path.join(directory, 'tsconfig.json'),
    JSON.stringify({
      compilerOptions: {
        allowJs: true,
        strict: true,
        jsx: 'preserve',
        target: 'esnext',
        module: 'esnext',
        moduleResolution: 'bundler',
        skipLibCheck: true,
        noEmit: true,
      },
      include: ['*.ts', '*.tsx', '*.js', '*.svelte', '*.vue'],
    }),
  )
  const { file, code } = validSpecimen(stack)

  writeFileSync(path.join(directory, file), code)
  const valid = runOxlint([file], { cwd: directory, toolDirectory: directory })

  assert.equal(valid.status, 0, valid.stdout + valid.stderr)

  if (STACKS[`${stack}-ox`].formatterFile === 'oxfmt.config.ts') {
    const formatFiles = [file, 'oxfmt.config.ts', 'oxlint.config.ts', 'stylelint.config.js']
    const written = runOxfmt(['--write', ...formatFiles], { cwd: directory, toolDirectory: directory })

    assert.equal(written.status, 0, written.stdout + written.stderr)
    const formatted = runOxfmt(['--check', ...formatFiles], { cwd: directory, toolDirectory: directory })

    assert.equal(formatted.status, 0, formatted.stdout + formatted.stderr)
    writeFileSync(path.join(directory, 'unformatted.ts'), 'export const value="hello";\n')
    assert.equal(runOxfmt(['--check', 'unformatted.ts'], { cwd: directory, toolDirectory: directory }).status, 1)
    const fixed = runOxfmt(['--write', 'unformatted.ts'], { cwd: directory, toolDirectory: directory })

    assert.equal(fixed.status, 0, fixed.stdout + fixed.stderr)
    assert.equal(readFileSync(path.join(directory, 'unformatted.ts'), 'utf8'), "export const value = 'hello'\n")
    const fmtManifest = readFileSync(packageExecutable('oxfmt', 'package.json', directory), 'utf8')

    assert.equal(JSON.parse(fmtManifest).version, OXFMT_VERSION)
  }

  const marker = markers[stack]

  writeFileSync(path.join(directory, marker.file), marker.code)
  const invalid = runOxlint(['--deny-warnings', marker.file], { cwd: directory, toolDirectory: directory })

  assert.equal(invalid.status, 1, invalid.stdout + invalid.stderr)
  assert.ok(invalid.stdout.includes(marker.rule), invalid.stdout)
  checkTypes(directory)
  const oxManifest = readFileSync(packageExecutable('oxlint', 'package.json', directory), 'utf8')
  const tsManifest = readFileSync(packageExecutable('oxlint-tsgolint', 'package.json', directory), 'utf8')

  assert.equal(JSON.parse(oxManifest).version, OX_VERSIONS.oxlint)
  assert.equal(JSON.parse(tsManifest).version, OX_VERSIONS['oxlint-tsgolint'])

  checkOxOnly(directory, stack)

  process.stdout.write(`${pm}: packed ${stack}-ox CLI, formatter, marker and native typed checks passed\n`)
}

function validSpecimen(stack) {
  const specimens = {
    common: { file: 'valid.ts', code: 'export const isExample = true\n' },
    angular: { file: 'valid.ts', code: 'export const isExample = true\n' },
    svelte: { file: 'valid.svelte', code: '<p>Hello</p>\n' },
    astro: { file: 'valid.astro', code: '<p>Hello</p>\n' },
    vue: { file: 'valid-view.vue', code: '<template><p>Hello</p></template>\n' },
    nuxt: { file: 'valid-view.vue', code: '<template><p>Hello</p></template>\n' },
  }

  return specimens[stack] ?? { file: 'valid.tsx', code: 'export const View = () => <p>Hello</p>\n' }
}

function checkLegacy(directory) {
  const imports = OX_STACKS.map((stack) => `eslint-${stack}`)
  const cases = OX_STACKS.map((stack) => {
    let valid = 'export const View = () => <p>Hello</p>\n'

    if (stack === 'common') {
      valid = 'export const isExample = true\n'
    } else if (stack === 'svelte' || stack === 'astro') {
      valid = '<p>Hello</p>\n'
    }

    return { preset: `eslint-${stack}`, marker: markers[stack], valid }
  })

  writeFileSync(
    path.join(directory, 'tsconfig.json'),
    JSON.stringify({
      compilerOptions: { allowJs: true, strict: true, jsx: 'preserve', noEmit: true },
      include: ['*.ts', '*.tsx', '*.svelte', '*.astro'],
    }),
  )
  writeFileSync(
    path.join(directory, 'prettier.config.js'),
    "export { default } from '@st1ggy/linter-config/prettier-common'\n",
  )
  const code = `
    import assert from 'node:assert/strict';
    import { writeFileSync } from 'node:fs';
    import path from 'node:path';
    import { ESLint } from 'eslint';
    const cases = ${JSON.stringify(cases)};
    for (const { preset, marker, valid } of cases) {
      writeFileSync(path.resolve(preset + '-valid-' + marker.file), valid);
      writeFileSync(path.resolve(preset + '-' + marker.file), marker.code);
    }
    for (const { preset, marker } of cases) {
      const { default: config } = await import('@st1ggy/linter-config/' + preset);
      assert.ok(Array.isArray(config));
      const eslint = new ESLint({
        cwd: process.cwd(),
        overrideConfigFile: true,
        overrideConfig: [
          ...config,
          { languageOptions: { parserOptions: { tsconfigRootDir: process.cwd() } } },
        ],
      });
      const [accepted] = await eslint.lintFiles([path.resolve(preset + '-valid-' + marker.file)]);
      assert.equal(accepted.fatalErrorCount, 0, JSON.stringify(accepted.messages));
      assert.equal(accepted.errorCount, 0, preset + ': ' + JSON.stringify(accepted.messages));
      const [rejected] = await eslint.lintFiles([path.resolve(preset + '-' + marker.file)]);
      assert.equal(rejected.fatalErrorCount, 0, JSON.stringify(rejected.messages));
      assert.ok(rejected.messages.some(({ ruleId }) => ruleId?.endsWith(marker.rule)),
        preset + ': ' + JSON.stringify(rejected.messages));
    }
  `
  const result = spawnSync(process.execPath, ['--input-type=module', '-e', code], { cwd: directory, encoding: 'utf8' })

  assert.equal(result.status, 0, result.stderr)
  // Preserve the old wrapper-generation smoke test alongside the new engines.
  run('init', directory, 'solid', { quiet: true })
  assert.ok(readFileSync(path.join(directory, 'eslint.config.js'), 'utf8').includes('eslint-solid'))
  process.stdout.write(`${pm}: all ${imports.length} packed legacy ESLint imports and diagnostics passed\n`)
}

const directory = mkdtempSync(path.join(tmpdir(), 'linter-package-'))

try {
  const [{ filename, files }] = JSON.parse(
    execFileSync('npm', ['pack', '--json', '--pack-destination', directory], { cwd: ROOT, encoding: 'utf8' }),
  )
  const packedPaths = new Set(files.map((file) => file.path))

  for (const stack of OXFMT_STACKS) {
    assert.ok(packedPaths.has(`src/oxlint/oxlint.config.${stack}.js`))
    assert.ok(packedPaths.has(`scripts/init-${stack}-ox.sh`))
  }

  assert.ok(packedPaths.has('src/oxlint/index.d.ts'))
  assert.ok(packedPaths.has('src/oxfmt/index.d.ts'))
  assert.ok(packedPaths.has('src/oxfmt/oxfmt.config.common.js'))
  assert.ok(
    files.every((file) => !file.path.includes('/fixtures/') && !file.path.endsWith('.test.mjs')),
    'Development fixtures must not be published',
  )
  const tarball = path.join(directory, filename)

  const stacks = selectedStacks(process.argv.slice(2), OXFMT_STACKS)

  for (const stack of stacks) {
    const target = path.join(directory, stack)
    const packages = STACKS[`${stack}-ox`].packages

    installProject(target, tarball, packages)
    await checkOxStack(target, stack)
  }

  const legacy = path.join(directory, 'legacy')
  const legacyPackages = new Set(OX_STACKS.flatMap((stack) => STACKS[stack].packages))

  legacyPackages.add('svelte')
  legacyPackages.add('eslint')
  installProject(legacy, tarball, [...legacyPackages])
  checkLegacy(legacy)
} finally {
  rmSync(directory, { recursive: true, force: true })
}
