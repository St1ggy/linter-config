import { ESLint } from 'eslint'
import assert from 'node:assert/strict'
import { mkdirSync, symlinkSync, unlinkSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

import source from '../src/eslint/eslint-svelte.config.js'

import { temporaryProject } from './fixtures/oxlint-cases.mjs'
import { ROOT, packageExecutable, runOxlint } from './oxlint-tools.mjs'

for (const folder of ['.', 'src/routes/nested']) {
  test(`Svelte aliases resolve from the consumer cwd in ${folder} for ESLint and Oxlint`, async (context) => {
    const config = import.meta.resolve('@st1ggy/linter-config/svelte-ox')
    const validFile = path.join(folder, 'valid.svelte.ts')
    const invalidFile = path.join(folder, 'invalid.svelte.ts')
    const code =
      "import { value } from '$lib/value'\nimport { goto } from '$app/navigation'\nimport { kit } from '@sveltejs/kit'\n\nexport { value, goto, kit }\n"
    const directory = temporaryProject(context, {
      'oxlint.config.ts': `export { default } from ${JSON.stringify(config)}\n`,
      'src/lib/value.ts': 'export const value = true\n',
      [validFile]: code,
      [invalidFile]: "import { missing } from '$lib/missing'\n\nexport { missing }\n",
    })

    // The fixture owns a real node_modules directory, never writes through the
    // shared dependency symlink into the developer's checkout.
    unlinkSync(path.join(directory, 'node_modules'))
    const kit = path.join(directory, 'node_modules/@sveltejs/kit')

    mkdirSync(path.join(kit, 'src/runtime/app'), { recursive: true })
    mkdirSync(path.join(kit, 'src/exports'), { recursive: true })
    symlinkSync(
      path.join(ROOT, 'node_modules/oxlint-tsgolint'),
      path.join(directory, 'node_modules/oxlint-tsgolint'),
      'dir',
    )
    symlinkSync(
      path.join(ROOT, 'node_modules/@oxlint-tsgolint'),
      path.join(directory, 'node_modules/@oxlint-tsgolint'),
      'dir',
    )
    mkdirSync(path.join(directory, 'node_modules/.bin'))
    symlinkSync(
      packageExecutable('oxlint-tsgolint', 'bin/tsgolint.js'),
      path.join(directory, 'node_modules/.bin/tsgolint'),
    )
    writeFileSync(path.join(kit, 'src/runtime/app/navigation.js'), 'export const goto = () => {}\n')
    writeFileSync(path.join(kit, 'src/exports/index.js'), 'export const kit = true\n')
    const original = new ESLint({ cwd: directory, overrideConfigFile: true, overrideConfig: source })
    const configForFile = await original.calculateConfigForFile(path.join(directory, validFile))
    const eslint = new ESLint({
      cwd: directory,
      overrideConfigFile: true,
      overrideConfig: [
        {
          files: ['**/*.ts'],
          languageOptions: {
            ...configForFile.languageOptions,
            parserOptions: { ...configForFile.languageOptions.parserOptions, project: false, projectService: false },
          },
          plugins: { 'import-x': configForFile.plugins['import-x'] },
          settings: configForFile.settings,
          rules: { 'import-x/no-unresolved': 'error' },
        },
      ],
    })
    const results = await eslint.lintFiles([validFile, invalidFile])
    const valid = results.find((result) => result.filePath === path.join(directory, validFile))
    const invalid = results.find((result) => result.filePath === path.join(directory, invalidFile))

    assert.ok(valid && invalid)
    assert.equal(valid.fatalErrorCount, 0, JSON.stringify(valid.messages))
    assert.ok(
      valid.messages.every((message) => message.ruleId !== 'import-x/no-unresolved'),
      JSON.stringify(valid.messages),
    )
    assert.ok(
      invalid.messages.some((message) => message.ruleId === 'import-x/no-unresolved'),
      JSON.stringify(invalid.messages),
    )
    const native = runOxlint(['--format', 'json', validFile, invalidFile], { cwd: directory })

    assert.equal(native.status, 1, native.stdout + native.stderr)
    assert.match(native.stdout, /^\s*\{/, native.stdout + native.stderr)
    const { diagnostics } = JSON.parse(native.stdout)
    const unresolved = diagnostics.filter((diagnostic) => diagnostic.code?.endsWith('(no-unresolved)'))

    assert.equal(unresolved.length, 1, native.stdout)
    assert.ok(unresolved[0].filename.endsWith('invalid.svelte.ts'), native.stdout)
    assert.ok(
      diagnostics.every((diagnostic) => !diagnostic.message.includes('Error running JS plugin')),
      native.stdout,
    )
  })
}
