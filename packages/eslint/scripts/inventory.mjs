// Collects effective flat-config rule lists and Stylelint rules from this workspace.
// Run from repo root: `node packages/eslint/scripts/inventory.mjs`
// Or set `LINTER_CONFIG_ROOT` to override the default (`packages/eslint`).

import { spawnSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const LINTER_ROOT = process.env.LINTER_CONFIG_ROOT ?? path.resolve(__dirname, '..')

const SOURCE_LABEL = '@st1ggy/linter-config@4.0.0 (local tree)'

const flatConfigPresets = [
  {
    id: 'eslint-common',
    module: 'src/eslint/eslint.config.common.js',
    sampleFile: 'src/examples/example.ts',
  },
  {
    id: 'eslint-react',
    module: 'src/eslint/eslint.config.react.js',
    sampleFile: 'src/examples/example.ts',
  },
  {
    id: 'eslint-next',
    module: 'src/eslint/eslint.config.next.js',
    sampleFile: 'src/examples/example.ts',
  },
  {
    id: 'eslint-svelte',
    module: 'src/eslint/eslint-svelte.config.js',
    sampleFile: 'src/examples/example.svelte',
  },
]

function compareKeysAlphabetically(left, right) {
  return left.localeCompare(right)
}

function severityFromNumberOrString(sev) {
  if (sev === 0 || sev === 'off') {
    return 'off'
  }

  if (sev === 1 || sev === 'warn') {
    return 'warn'
  }

  if (sev === 2 || sev === 'error') {
    return 'error'
  }

  return sev
}

function normalizeRuleValue(value) {
  if (value === undefined) {
    return
  }

  if (!Array.isArray(value)) {
    return severityFromNumberOrString(value)
  }

  const [sev, ...rest] = value
  const normalized = severityFromNumberOrString(sev)

  if (rest.length > 0) {
    return [normalized, ...rest]
  }

  return normalized
}

function rulesToSortedObject(rules) {
  const out = {}
  const keys = Object.keys(rules).toSorted(compareKeysAlphabetically)

  for (const key of keys) {
    out[key] = normalizeRuleValue(rules[key])
  }

  return out
}

async function inventoryFlatConfigs() {
  process.chdir(LINTER_ROOT)
  const { ESLint } = await import('eslint')
  const results = {}

  for (const preset of flatConfigPresets) {
    const modulePath = path.join(LINTER_ROOT, preset.module)
    const loaded = await import(modulePath)
    const config = loaded.default
    const engine = new ESLint({
      cwd: LINTER_ROOT,
      overrideConfig: config,
    })
    const filePath = path.join(LINTER_ROOT, preset.sampleFile)
    const calculated = await engine.calculateConfigForFile(filePath)
    const rules = rulesToSortedObject(calculated.rules ?? {})

    results[preset.id] = {
      module: preset.module,
      sampleFile: preset.sampleFile,
      ruleCount: Object.keys(rules).length,
      rules,
    }
  }

  return results
}

function inventoryStylelint() {
  const requireFromWorkspace = createRequire(path.join(LINTER_ROOT, 'package.json'))
  const stylelintPackageJsonPath = requireFromWorkspace.resolve('stylelint/package.json')
  const stylelintBin = path.join(path.dirname(stylelintPackageJsonPath), 'bin/stylelint.mjs')
  const scssPath = path.join(LINTER_ROOT, 'src/examples/example.scss')
  const configPath = path.join(LINTER_ROOT, 'src/stylelint/stylelint.config.scss.js')
  const spawned = spawnSync(process.execPath, [stylelintBin, '--print-config', scssPath, '--config', configPath], {
    cwd: LINTER_ROOT,
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  })

  if (spawned.status !== 0) {
    throw new Error(`stylelint --print-config failed: ${spawned.stderr || spawned.stdout || 'unknown error'}`)
  }

  const printed = JSON.parse(spawned.stdout)
  const rawRules = printed.rules ?? {}
  const rules = {}
  const keys = Object.keys(rawRules).toSorted(compareKeysAlphabetically)

  for (const key of keys) {
    rules[key] = rawRules[key]
  }

  return {
    configFile: 'src/stylelint/stylelint.config.scss.js',
    sampleFile: 'src/examples/example.scss',
    ruleCount: Object.keys(rules).length,
    rules,
    plugins: printed.plugins ?? [],
  }
}

async function main() {
  const outputDirectory = path.join(LINTER_ROOT, 'data')

  mkdirSync(outputDirectory, { recursive: true })

  const flatConfigs = await inventoryFlatConfigs()
  const stylelint = inventoryStylelint()

  const meta = {
    generatedAt: new Date().toISOString(),
    source: SOURCE_LABEL,
    linterConfigRoot: LINTER_ROOT,
    flatConfigs,
    stylelint,
  }

  const outputPath = path.join(outputDirectory, 'linter-config-inventory.json')
  const body = `${JSON.stringify(meta, null, 2)}\n`

  writeFileSync(outputPath, body, 'utf8')

  process.stdout.write(
    `Wrote packages/eslint/data/linter-config-inventory.json (${SOURCE_LABEL}, flat presets: ${Object.keys(flatConfigs).length}, stylelint rules: ${stylelint.ruleCount})\n`,
  )
}

await main()
