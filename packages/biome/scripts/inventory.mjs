/**
 * Collects effective ESLint and Stylelint rules from @st1ggy/linter-config (packages/eslint).
 * Run from repo root: `node packages/biome/scripts/inventory.mjs`
 * Or set LINTER_CONFIG_ROOT to packages/eslint.
 */
import { spawnSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BIOME_CONFIG_ROOT = path.resolve(__dirname, '..')
const LINTER_ROOT = process.env.LINTER_CONFIG_ROOT ?? path.resolve(BIOME_CONFIG_ROOT, '..', 'eslint')

const SOURCE_LABEL = '@st1ggy/linter-config@4.0.0 (local tree)'

const eslintPresets = [
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

function normalizeRuleValue(value) {
  if (value === undefined) return undefined
  if (value === 0 || value === 'off') return 'off'
  if (value === 1 || value === 'warn') return 'warn'
  if (value === 2 || value === 'error') return 'error'
  if (Array.isArray(value)) {
    const [sev, ...rest] = value
    const s =
      sev === 0 || sev === 'off'
        ? 'off'
        : sev === 1 || sev === 'warn'
          ? 'warn'
          : sev === 2 || sev === 'error'
            ? 'error'
            : sev
    return rest.length ? [s, ...rest] : s
  }
  return value
}

function rulesToSortedObject(rules) {
  const out = {}
  for (const k of Object.keys(rules).sort()) {
    out[k] = normalizeRuleValue(rules[k])
  }
  return out
}

async function inventoryEslint() {
  process.chdir(LINTER_ROOT)
  const { ESLint } = await import('eslint')
  const results = {}

  for (const preset of eslintPresets) {
    const modPath = path.join(LINTER_ROOT, preset.module)
    const config = (await import(modPath)).default
    const eslint = new ESLint({
      cwd: LINTER_ROOT,
      overrideConfig: config,
    })
    const filePath = path.join(LINTER_ROOT, preset.sampleFile)
    const calculated = await eslint.calculateConfigForFile(filePath)
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
  const requireFromEslint = createRequire(path.join(LINTER_ROOT, 'package.json'))
  const stylelintPkg = requireFromEslint.resolve('stylelint/package.json')
  const stylelintBin = path.join(path.dirname(stylelintPkg), 'bin/stylelint.mjs')
  const scssPath = path.join(LINTER_ROOT, 'src/examples/example.scss')
  const configPath = path.join(LINTER_ROOT, 'src/stylelint/stylelint.config.scss.js')
  const r = spawnSync(process.execPath, [stylelintBin, '--print-config', scssPath, '--config', configPath], {
    cwd: LINTER_ROOT,
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  })
  if (r.status !== 0) {
    throw new Error(`stylelint --print-config failed: ${r.stderr || r.stdout || 'unknown error'}`)
  }
  const printed = JSON.parse(r.stdout)
  const rawRules = printed.rules ?? {}
  const rules = {}
  for (const k of Object.keys(rawRules).sort()) {
    rules[k] = rawRules[k]
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
  const outDir = path.join(BIOME_CONFIG_ROOT, 'data')
  mkdirSync(outDir, { recursive: true })

  const eslint = await inventoryEslint()
  const stylelint = inventoryStylelint()

  const meta = {
    generatedAt: new Date().toISOString(),
    source: SOURCE_LABEL,
    linterConfigRoot: LINTER_ROOT,
    eslint,
    stylelint,
  }

  writeFileSync(path.join(outDir, 'linter-config-inventory.json'), `${JSON.stringify(meta, null, 2)}\n`, 'utf8')

  console.log(
    `Wrote data/linter-config-inventory.json (${SOURCE_LABEL}, eslint presets: ${Object.keys(eslint).length}, stylelint rules: ${stylelint.ruleCount})`,
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
