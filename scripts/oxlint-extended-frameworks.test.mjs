import angular from '@angular-eslint/eslint-plugin'
import { ESLint } from 'eslint'
import vue from 'eslint-plugin-vue'
import assert from 'node:assert/strict'
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

import { angularRules, recommendedAngularRules, vueRules } from '../src/oxlint/framework-rules.js'
import { OXFMT_STACKS } from '../src/oxlint/stacks.js'

import { temporaryProject } from './fixtures/oxlint-cases.mjs'
import {
  STACKS,
  assertStackRuntime,
  legacyConfigFiles,
  run,
  stackPackages,
  wrapperFileNames,
} from './linter-init-core.mjs'
import { nativeRules, runOxfmt, runOxlint } from './oxlint-tools.mjs'

function frameworkProject(context, stack, files = {}) {
  const key = `${stack}-ox`
  const linter = import.meta.resolve(`@st1ggy/linter-config/${key}`)
  const formatter = import.meta.resolve(`@st1ggy/linter-config/${STACKS[key].formatterPreset}`)

  return temporaryProject(context, {
    'oxlint.config.ts': `export { default } from ${JSON.stringify(linter)}\n`,
    'oxfmt.config.ts': `export { default } from ${JSON.stringify(formatter)}\n`,
    ...files,
  })
}

test('Vue native rules and Angular JS rules track the reviewed upstream recommended sets', () => {
  const catalog = new Set(
    nativeRules()
      .filter((rule) => rule.scope === 'vue')
      .map((rule) => `vue/${rule.value}`),
  )
  const recommended = Object.assign({}, ...vue.configs['flat/recommended'].map((config) => config.rules ?? {}))
  const supported = Object.fromEntries(Object.entries(recommended).filter(([id]) => catalog.has(id)))

  assert.deepEqual(vueRules, supported)
  assert.deepEqual(angularRules, recommendedAngularRules(angular, 'angular'))
})

for (const stack of OXFMT_STACKS) {
  test(`${stack}-ox never generates or installs ESLint and preserves existing ESLint files`, (context) => {
    const directory = temporaryProject(context, { 'prettier.config.js': '// keep until migration is confirmed\n' })

    run('init', directory, `${stack}-ox`, { quiet: true })
    assert.ok(legacyConfigFiles(directory, `${stack}-ox`).includes('prettier.config.js'))
    assert.equal(
      readFileSync(path.join(directory, 'prettier.config.js'), 'utf8'),
      '// keep until migration is confirmed\n',
    )
    assert.ok(!wrapperFileNames(`${stack}-ox`).includes('eslint.config.js'))
    assert.ok(!stackPackages(`${stack}-ox`).includes('eslint'))
    assert.ok(!stackPackages(`${stack}-ox`).includes('@angular-eslint/eslint-plugin-template'))
    assert.ok(!stackPackages(`${stack}-ox`).includes('@angular-eslint/template-parser'))
    assert.ok(!stackPackages(`${stack}-ox`).includes('vue-eslint-parser'))
    assert.equal(existsSync(path.join(directory, 'eslint.config.js')), false)
    writeFileSync(path.join(directory, 'eslint.config.js'), '// user ESLint config\n')

    writeFileSync(path.join(directory, 'oxfmt.config.ts'), '// custom formatter\n')
    run('init', directory, `${stack}-ox`, { quiet: true })
    assert.equal(readFileSync(path.join(directory, 'oxfmt.config.ts'), 'utf8'), '// custom formatter\n')
    run('migrate', directory, `${stack}-ox`, { quiet: true })
    assert.ok(
      readFileSync(path.join(directory, 'oxfmt.config.ts'), 'utf8').includes(STACKS[`${stack}-ox`].formatterPreset),
    )

    assert.equal(readFileSync(path.join(directory, 'eslint.config.js'), 'utf8'), '// user ESLint config\n')
  })
}

test('Svelte 4 is not silently upgraded or given an incompatible Oxfmt wrapper', (context) => {
  const directory = temporaryProject(context)

  unlinkSync(path.join(directory, 'node_modules'))
  mkdirSync(path.join(directory, 'node_modules/svelte'), { recursive: true })
  writeFileSync(path.join(directory, 'node_modules/svelte/package.json'), '{"name":"svelte","version":"4.2.20"}\n')
  assert.throws(() => assertStackRuntime(directory, 'svelte-ox'), /requires Svelte 5/)
  assert.throws(() => run('init', directory, 'svelte-ox'), /requires Svelte 5/)
  assert.doesNotThrow(() => assertStackRuntime(directory, 'svelte'))
})

const formatCases = [
  { stack: 'svelte', file: 'probe.svelte', code: '<script>const text="hello";</script><p>{text}</p>' },
  { stack: 'astro', file: 'probe.astro', code: '---\nconst text="hello";\n---\n<p>{text}</p>' },
  {
    stack: 'vue',
    file: 'ProbeView.vue',
    code: '<script setup lang="ts">const text:string="hello";</script><template><p>{{text}}</p></template>',
  },
  {
    stack: 'nuxt',
    file: 'ProbeView.vue',
    code: '<script setup>const text="hello";</script><template><p>{{text}}</p></template>',
  },
  { stack: 'angular', file: 'probe.html', code: '@if(ready){<p>{{value}}</p>}' },
]

for (const { stack, file, code } of formatCases) {
  test(`${stack}: Oxfmt checks, fixes and idempotently formats framework syntax`, (context) => {
    const directory = frameworkProject(context, stack, { [file]: code })

    assert.equal(runOxfmt(['--check', file], { cwd: directory }).status, 1)
    const fixed = runOxfmt(['--write', file], { cwd: directory })

    assert.equal(fixed.status, 0, fixed.stdout + fixed.stderr)
    const formatted = readFileSync(path.join(directory, file), 'utf8')

    assert.notEqual(formatted, code)
    assert.equal(runOxfmt(['--check', file], { cwd: directory }).status, 0)
    assert.equal(runOxfmt(['--write', file], { cwd: directory }).status, 0)
    assert.equal(readFileSync(path.join(directory, file), 'utf8'), formatted)
  })
}

const scriptCases = [
  {
    stack: 'vue',
    file: 'probe-view.vue',
    valid: '<script setup>const text = "hello"</script><template><p>{{ text }}</p></template>',
    invalid: '<script setup>export const text = "hello"</script><template><p>{{ text }}</p></template>',
    rule: 'no-export-in-script-setup',
  },
  {
    stack: 'nuxt',
    file: 'probe.ts',
    valid: 'export const value = import.meta.client\n',
    invalid: 'export const value = process.client\n',
    rule: 'prefer-import-meta',
  },
  {
    stack: 'angular',
    file: 'probe.component.ts',
    valid:
      "import { Component } from '@angular/core'\n\n@Component({ selector: 'app-probe', template: '' })\nexport class Probe {}\n",
    invalid:
      "import { Component } from '@angular/core'\n\n@Component({ selector: 'app-probe', template: '', outputs: ['changed'] })\nexport class Probe {}\n",
    rule: 'no-outputs-metadata-property',
  },
]

for (const { stack, file, valid, invalid, rule } of scriptCases) {
  test(`${stack}: Oxlint retains common rules and runs framework script checks`, (context) => {
    const directory = frameworkProject(context, stack, { [file]: valid })
    const accepted = runOxlint([file], { cwd: directory })

    assert.equal(accepted.status, 0, accepted.stdout + accepted.stderr)
    const brokenDirectory = frameworkProject(context, stack, { [file]: invalid })
    const rejected = runOxlint([file], { cwd: brokenDirectory })

    assert.equal(rejected.status, 1, rejected.stdout + rejected.stderr)
    assert.match(rejected.stdout, new RegExp(rule))
    assert.ok(!rejected.stdout.includes('Error running JS plugin'), rejected.stdout)
  })
}

const nuxtCases = [
  {
    file: 'nuxt.config.ts',
    valid: 'export default { extends: [], modules: [] }\n',
    invalid: 'export default { modules: [], extends: [] }\n',
    rule: 'nuxt-config-keys-order',
  },
  {
    file: 'nuxt.config.ts',
    valid: 'export default { ssr: true }\n',
    invalid: 'export default { test: true }\n',
    rule: 'no-nuxt-config-test-key',
  },
  {
    file: 'page.ts',
    valid: 'definePageMeta({ middleware: () => { useRoute() } })\n',
    invalid: 'definePageMeta({ title: useRoute().params.title })\n',
    rule: 'no-page-meta-runtime-values',
  },
]

for (const { file, valid, invalid, rule } of nuxtCases) {
  test(`Nuxt ${rule} preserves positive and negative diagnostics`, (context) => {
    for (const [code, shouldReport] of [
      [valid, false],
      [invalid, true],
    ]) {
      const directory = frameworkProject(context, 'nuxt', { [file]: code })
      const result = runOxlint(['--format', 'json', file], { cwd: directory })

      assert.ok(result.status === 0 || result.status === 1, result.stderr + result.stdout)
      const { diagnostics } = JSON.parse(result.stdout)

      assert.ok(diagnostics.every((diagnostic) => !diagnostic.message.includes('Error running JS plugin')))
      assert.equal(
        diagnostics.some((diagnostic) => diagnostic.code === `nuxt(${rule})`),
        shouldReport,
        result.stdout,
      )
    }
  })
}

test('Nuxt config-only rules do not reject ordinary exported objects', (context) => {
  const directory = frameworkProject(context, 'nuxt', { 'settings.ts': 'export default { test: true }\n' })
  const result = runOxlint(['settings.ts'], { cwd: directory })

  assert.ok(!result.stdout.includes('no-nuxt-config-test-key'), result.stdout)
})

const templateCases = [
  {
    stack: 'svelte',
    file: 'probe.svelte',
    valid: '<p>Hello</p>\n',
    invalid: '<p>{@html content}</p>\n',
    rule: 'svelte/no-at-html-tags',
  },
  {
    stack: 'astro',
    file: 'probe.astro',
    valid: '<p>Hello</p>\n',
    invalid: '<div set:html={content}>Hello</div>\n',
    rule: 'astro/no-conflict-set-directives',
  },
  {
    stack: 'vue',
    file: 'ProbeView.vue',
    valid: '<template><p>Hello</p></template>\n',
    invalid: '<template><p v-for="item in items">{{ item }}</p></template>\n',
    rule: 'vue/require-v-for-key',
  },
  {
    stack: 'nuxt',
    file: 'ProbeView.vue',
    valid: '<template><p>Hello</p></template>\n',
    invalid: '<template><p v-for="item in items">{{ item }}</p></template>\n',
    rule: 'vue/require-v-for-key',
  },
  {
    stack: 'angular',
    file: 'probe.html',
    valid: '<p>Hello</p>\n',
    invalid: '<img src="image.png">\n',
    rule: '@angular-eslint/template/alt-text',
  },
]

for (const { stack, file, valid, invalid, rule } of templateCases) {
  test(`${stack}: explicitly opted-in compatibility ESLint preset checks templates`, async (context) => {
    const directory = temporaryProject(context, {
      'tsconfig.json': JSON.stringify({ compilerOptions: { allowJs: true }, include: ['*.svelte', '*.ts'] }),
      [file]: valid,
      [`invalid-${file}`]: invalid,
    })
    const { default: config } = await import(`@st1ggy/linter-config/eslint-${stack}-ox`)
    const eslint = new ESLint({ cwd: directory, overrideConfigFile: true, overrideConfig: config })
    const filepath = path.join(directory, file)
    const [accepted] = await eslint.lintText(valid, { filePath: filepath })

    assert.equal(accepted.fatalErrorCount, 0, JSON.stringify(accepted.messages))
    assert.equal(accepted.errorCount, 0, JSON.stringify(accepted.messages))
    const [rejected] = await eslint.lintText(invalid, { filePath: path.join(directory, `invalid-${file}`) })

    assert.equal(rejected.fatalErrorCount, 0, JSON.stringify(rejected.messages))
    assert.ok(
      rejected.messages.some(({ ruleId }) => ruleId === rule),
      JSON.stringify(rejected.messages),
    )
    const effective = await eslint.calculateConfigForFile(filepath)

    assert.notEqual(effective.rules?.['prettier/prettier']?.[0], 2)
  })
}

test('Angular companion extracts and checks inline component templates', async (context) => {
  const directory = temporaryProject(context)
  const { default: config } = await import('@st1ggy/linter-config/eslint-angular-ox')
  const eslint = new ESLint({ cwd: directory, overrideConfigFile: true, overrideConfig: config })
  const code =
    "import { Component } from '@angular/core'\n@Component({ template: '<img src=\"image.png\">' })\nexport class Probe {}\n"
  const [result] = await eslint.lintText(code, { filePath: path.join(directory, 'probe.component.ts') })

  assert.equal(result.fatalErrorCount, 0, JSON.stringify(result.messages))
  assert.ok(
    result.messages.some(({ ruleId }) => ruleId === '@angular-eslint/template/alt-text'),
    JSON.stringify(result.messages),
  )
})
