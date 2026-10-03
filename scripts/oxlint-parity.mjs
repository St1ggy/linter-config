import { ESLint } from 'eslint'
import assert from 'node:assert/strict'
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import prettierConfig from '../src/prettier/prettier.config.common.js'

import { CORPUS_FILE, diagnosticCode, isCompilerDiagnostic } from './oxlint-corpus.mjs'
import { sourceModule } from './oxlint-inventory.mjs'
import { ROOT, runOxlint } from './oxlint-tools.mjs'
import { readInventory } from './oxlint-values.mjs'

export function readCorpus() {
  return readInventory(CORPUS_FILE)
}

function keyDirectory(index) {
  return `rule-${String(index).padStart(4, '0')}`
}

export async function prepareCorpus(directory, corpus) {
  const { default: preset } = await import(pathToFileURL(path.join(ROOT, 'src/oxlint/oxlint.config.common.js')).href)
  const common = { ...preset, overrides: [], rules: {} }

  writeFileSync(path.join(directory, 'package.json'), JSON.stringify(corpus.packageJson))
  writeFileSync(path.join(directory, '.prettierrc.json'), JSON.stringify(prettierConfig))
  writeFileSync(path.join(directory, 'oxlint.config.ts'), `export default ${JSON.stringify(common)}\n`)
  writeFileSync(
    path.join(directory, 'tsconfig.json'),
    JSON.stringify({
      compilerOptions: {
        target: 'esnext',
        module: 'esnext',
        moduleResolution: 'bundler',
        moduleDetection: 'force',
        allowJs: true,
        jsx: 'preserve',
        noEmit: true,
        skipLibCheck: true,
      },
      include: ['rule-*/*.ts', 'rule-*/*.tsx', 'rule-*/*.js', 'rule-*/*.jsx', 'rule-*/*.cjs'],
      exclude: ['node_modules'],
    }),
  )
  const entries = Object.entries(corpus.cases)
  const presets = { common: preset }

  for (const stack of ['react', 'solid', 'next', 'svelte', 'astro']) {
    const loaded = await import(pathToFileURL(path.join(ROOT, `src/oxlint/oxlint.config.${stack}.js`)).href)

    presets[stack] = loaded.default
  }

  const rootFiles = Object.entries(corpus.rootFiles ?? {})

  for (const [file, code] of rootFiles) {
    mkdirSync(path.dirname(path.join(directory, file)), { recursive: true })
    writeFileSync(path.join(directory, file), code)
  }

  for (const [index, [, fixture]] of entries.entries()) {
    const folder = path.join(directory, keyDirectory(index))

    mkdirSync(folder, { recursive: true })
    // Prettier remains a real lint implementation in the SFC stacks. Exercise
    // its legacy corpus there; Oxfmt checks are covered separately.
    const selected = presets[fixture.sourceId === 'prettier/prettier' ? 'astro' : (fixture.stack ?? 'common')]
    const config = {
      plugins: selected.plugins,
      jsPlugins: selected.jsPlugins,
      categories: selected.categories,
      settings: selected.settings,
      globals: fixture.globals,
      rules: { [fixture.targetId]: fixture.targetValue },
    }

    writeFileSync(path.join(folder, '.oxlintrc.json'), JSON.stringify(config))

    const supportFiles = Object.entries(fixture.supportFiles ?? {})

    for (const [name, code] of supportFiles) {
      writeFileSync(path.join(folder, name), code)
    }

    for (const specimen of [fixture.valid, fixture.invalid]) {
      mkdirSync(path.dirname(path.join(folder, specimen.file)), { recursive: true })
      writeFileSync(path.join(folder, specimen.file), specimen.code)
    }
  }

  return entries
}

async function verifySourceCase(engine, filePath, id, fixture, kind) {
  const specimen = fixture[kind]
  const [result] = await engine.lintText(specimen.code, { filePath })
  const ownMessages = result.messages.filter((message) => message.ruleId === fixture.sourceId)

  if (specimen.sourceParser) {
    assert.ok(result.fatalErrorCount > 0, `Source parser evidence missing: ${id}`)
  } else {
    assert.equal(result.fatalErrorCount, 0, `${id}: ${JSON.stringify(result.messages)}`)
    assert.equal(
      ownMessages.length > 0,
      kind === 'invalid' && !fixture.conditional,
      `Source ${kind} evidence changed: ${id}`,
    )

    if (kind === 'invalid' && !fixture.conditional) {
      assert.equal(ownMessages[0].severity, fixture.sourceValue[0], `Source severity changed: ${id}`)
    }
  }
}

export async function verifySourceCorpus(directory, corpus, entries) {
  const { default: config } = await import(pathToFileURL(sourceModule('common')).href)
  const base = new ESLint({ cwd: ROOT, overrideConfigFile: true, overrideConfig: config })
  const calculated = await base.calculateConfigForFile(path.join(ROOT, 'src/examples/example.ts'))
  const configurations = { common: calculated }

  for (const stack of ['react', 'solid', 'next', 'svelte', 'astro']) {
    const { default: preset } = await import(pathToFileURL(sourceModule(stack)).href)
    const engine = new ESLint({ cwd: ROOT, overrideConfigFile: true, overrideConfig: preset })

    configurations[stack] = await engine.calculateConfigForFile(
      path.join(ROOT, `src/probe.${stack === 'svelte' ? 'svelte.ts' : 'tsx'}`),
    )
  }
  const source = readInventory(path.join(ROOT, 'data/oxlint-source-inventory.json'))

  assert.deepEqual(corpus.sourceVersions, source.versions, 'Source plugin versions changed; review the corpus')

  for (const [index, [id, fixture]] of entries.entries()) {
    const selected = configurations[fixture.stack ?? 'common']
    const options = {
      ...selected.languageOptions.parserOptions,
      project: source.metadata[fixture.sourceId].requiresTypeChecking ? path.join(directory, 'tsconfig.json') : false,
      projectService: false,
      tsconfigRootDir: directory,
      ecmaFeatures: { jsx: true },
    }
    const engine = new ESLint({
      cwd: directory,
      overrideConfigFile: true,
      overrideConfig: [
        {
          files: ['**/*.{js,jsx,ts,tsx,cjs,mjs}'],
          languageOptions: {
            ...selected.languageOptions,
            globals: fixture.globals ?? {},
            sourceType: fixture.sourceType,
            parserOptions: options,
          },
          plugins: selected.plugins,
          settings: selected.settings,
          rules: { [fixture.sourceId]: fixture.sourceValue },
        },
      ],
    })

    for (const kind of ['valid', 'invalid']) {
      const specimen = fixture[kind]
      const filePath = path.join(directory, keyDirectory(index), specimen.file)

      await verifySourceCase(engine, filePath, id, fixture, kind)
    }
  }
}

function verifyTargetCase(id, fixture, kind, messages) {
  const ownMessages = messages.filter((diagnostic) => diagnostic.code === diagnosticCode(fixture.targetId))

  if (fixture[kind].targetParser) {
    assert.ok(
      messages.some(
        (diagnostic) => isCompilerDiagnostic(diagnostic) || diagnostic.code === diagnosticCode(fixture.targetId),
      ),
      `Native syntax evidence missing: ${id}`,
    )
  } else {
    assert.ok(
      messages.every((message) => !isCompilerDiagnostic(message)),
      `Invalid target fixture: ${id}: ${JSON.stringify(messages)}`,
    )
    assert.equal(
      ownMessages.length > 0,
      kind === 'invalid' && !fixture.conditional,
      `Target ${kind} evidence changed: ${id}`,
    )

    if (kind === 'invalid' && !fixture.conditional) {
      assert.equal(
        ownMessages[0].severity,
        fixture.sourceValue[0] === 1 ? 'warning' : 'error',
        `Target severity changed: ${id}`,
      )
    }
  }
}

export function verifyTargetCorpus(directory, corpus, entries) {
  assert.equal(entries.length, Object.keys(corpus.cases).length)
  const paths = entries.map((entry, index) => keyDirectory(index))
  const result = runOxlint(['--format', 'json', ...paths], { cwd: directory })

  assert.ok(result.status === 0 || result.status === 1, result.stderr || result.stdout)
  const parsed = JSON.parse(result.stdout)
  const crashed = parsed.diagnostics.filter((diagnostic) => diagnostic.message.includes('Error running JS plugin'))

  assert.deepEqual(crashed, [], 'A JS rule crashed instead of checking its fixture')

  for (const [index, [id, fixture]] of entries.entries()) {
    for (const kind of ['valid', 'invalid']) {
      const specimen = fixture[kind]
      const file = `${keyDirectory(index)}/${specimen.file}`
      const messages = parsed.diagnostics.filter((diagnostic) => diagnostic.filename === file)

      verifyTargetCase(id, fixture, kind, messages)
    }
  }

  return parsed
}
