import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { format } from 'prettier'

import { OX_FRAMEWORK_PACKAGES, OX_VERSIONS } from '../src/oxlint/stacks.js'
import prettierConfig from '../src/prettier/prettier.config.common.js'

import { fileDomain, ruleIdentity } from './oxlint-policy.mjs'
import { OX_STACKS, ROOT, engineVersions, nativeRules } from './oxlint-tools.mjs'
import { readInventory, serializeInventory } from './oxlint-values.mjs'

const statuses = ['native', 'js-plugin', 'partial', 'unsupported', 'disabled']
const capabilities = new Set([
  'framework-template',
  'template-bindings',
  'sfc-type-services',
  'js-type-services',
  'nullable-accessibility',
  'definition-kind',
  'css-ast',
  'fragment-scope',
  'jsx-bindings',
  'astro-frontmatter',
])
const optionalPackages = {
  'react-js': 'eslint-plugin-react',
  'react-hooks-js': 'eslint-plugin-react-hooks',
  'next-js': '@next/eslint-plugin-next',
  solid: 'eslint-plugin-solid',
  svelte: 'eslint-plugin-svelte',
  astro: 'eslint-plugin-astro',
}

function scopeDomain(file) {
  const component = /\.(astro|svelte)\//.exec(file)

  return component ? `${component[1]}-client` : fileDomain(file)
}

function assertEvidence(decision, corpus) {
  if (decision.status === 'disabled') {
    return
  }

  assert.ok(decision.evidence, `Missing evidence: ${decision.sourceId}/${decision.domain}`)

  if (decision.evidence.startsWith('capability:')) {
    assert.ok(capabilities.has(decision.evidence.slice(11)), `Unknown capability evidence: ${decision.evidence}`)
    const intrinsic = decision.skipConfiguration && decision.evidence === 'capability:jsx-bindings'
    const isFrontmatter =
      decision.status === 'partial' &&
      decision.limitation === 'astro-frontmatter' &&
      decision.evidence === 'capability:astro-frontmatter'

    assert.ok(
      decision.status === 'unsupported' || intrinsic || isFrontmatter,
      `Generic capability evidence cannot replace a rule's positive fixture: ${decision.sourceId}`,
    )

    return
  }

  const fixture = corpus.cases[decision.evidence]

  assert.ok(fixture, `Missing fixture: ${decision.evidence}`)
  assert.equal(fixture.sourceId, decision.sourceId)
  assert.equal(
    serializeInventory(fixture.sourceValue.slice(1)),
    serializeInventory(decision.sourceValue.slice(1)),
    `Source options drift: ${decision.sourceId}`,
  )
  assert.equal(fixture.targetId, decision.targetId, `Target rule drift: ${decision.sourceId}`)
  assert.equal(
    serializeInventory(fixture.targetValue.slice(1)),
    serializeInventory(decision.targetValue.slice(1)),
    `Target options drift: ${decision.sourceId}`,
  )
  assert.ok(fixture.valid?.code && fixture.invalid?.code, `Incomplete fixture: ${decision.evidence}`)

  if (fixture.conditional) {
    assert.equal(decision.status, 'partial', `Conditional coverage cannot be claimed as full: ${decision.sourceId}`)
  }
}

function assertDecision(sourceId, value, domain, decision, corpus, catalog) {
  assert.ok(decision, `Unmapped source rule: ${domain}/${sourceId}`)
  assert.ok(statuses.includes(decision.status), `Unclassified rule: ${sourceId}`)
  assert.equal(decision.sourceId, sourceId)
  assert.equal(decision.domain, domain)
  assert.equal(
    serializeInventory(decision.sourceValue),
    serializeInventory(value),
    `Source configuration drift: ${sourceId}`,
  )

  if (value[0] === 0) {
    assert.equal(decision.status, 'disabled', `Disabled source rule was enabled: ${sourceId}`)
  } else {
    assert.notEqual(decision.status, 'disabled', `Active rule silently disabled: ${sourceId}`)
  }

  if (decision.status === 'partial' || decision.status === 'unsupported') {
    assert.ok(decision.reason && decision.limitation && decision.documentation, `Unexplained limitation: ${sourceId}`)
  }

  if (domain !== 'module' && !decision.skipConfiguration) {
    assert.ok(
      decision.status !== 'native' && decision.status !== 'js-plugin',
      `SFC coverage cannot claim full template parity: ${sourceId}/${domain}`,
    )
  }

  if (decision.targetId && !decision.skipConfiguration) {
    assert.equal(decision.targetValue[0], value[0], `Severity drift: ${sourceId}`)

    if (decision.implementation === 'native') {
      assert.ok(catalog.has(decision.targetId), `Unknown native target: ${decision.targetId}`)
    }
  }

  if (decision.status === 'native' || decision.status === 'js-plugin') {
    assert.ok(decision.targetId, `Supported rule has no target: ${sourceId}`)
  }

  assertEvidence(decision, corpus)
}

export function validateCoverage(source, mapping, corpus, registeredRules) {
  assert.deepEqual(mapping.stacks, OX_STACKS, 'Every stack must be audited')
  assert.deepEqual(mapping.sourceVersions, source.versions, 'Source versions changed')
  assert.deepEqual(corpus.sourceVersions, source.versions, 'Corpus versions changed')
  const catalog = new Set(registeredRules.map((rule) => `${rule.scope}/${rule.value}`))
  const presets = {}
  const used = new Set()

  for (const stack of OX_STACKS) {
    const scopes = {}
    const sourceScopes = Object.entries(source.presets[stack].scopes)

    for (const [file, scope] of sourceScopes) {
      const counts = Object.fromEntries(statuses.map((status) => [status, 0]))
      const domain = scopeDomain(file)
      const rules = scope.profile ? source.profiles[scope.profile].rules : {}

      for (const [sourceId, value] of Object.entries(rules)) {
        const id = ruleIdentity(sourceId, value, domain)
        const decision = mapping.decisions[id]

        assertDecision(sourceId, value, domain, decision, corpus, catalog)
        used.add(id)
        counts[decision.status]++
      }

      scopes[file] = { domain, baselineStatus: scope.baselineStatus, sourceProfile: scope.profile, counts }
    }

    presets[`${stack}-ox`] = { scopes }
  }

  assert.equal(used.size, Object.keys(mapping.decisions).length, 'Mapping contains stale or unreachable records')

  return {
    schemaVersion: 1,
    engines: mapping.engines,
    sourceVersions: mapping.sourceVersions,
    evidence: {
      cases: Object.keys(corpus.cases).length,
      conditional: Object.values(corpus.cases).filter((fixture) => fixture.conditional).length,
    },
    presets,
  }
}

function verifyAdapterRules(config, adapters) {
  const rules = config.overrides.flatMap((override) => Object.entries(override.rules))

  for (const [id, value] of rules) {
    if (value === 'off') {
      continue
    }

    const namespace = id.slice(0, id.lastIndexOf('/'))
    const plugin = adapters.get(namespace)

    if (plugin) {
      assert.ok(plugin.rules[id.slice(namespace.length + 1)], `Missing JS target: ${id}`)
    }
  }
}

async function verifyRuntime(mapping) {
  for (const stack of OX_STACKS) {
    const { default: config } = await import(
      pathToFileURL(path.join(ROOT, `src/oxlint/oxlint.config.${stack}.js`)).href
    )

    assert.equal(config.options.typeAware, true)
    assert.equal(config.rules, undefined, 'Unexpected global rules')
    assert.ok(
      Object.values(config.categories).every((severity) => severity === 'off'),
      'Implicit rule categories must be disabled',
    )
    const adapters = new Map()

    for (const plugin of config.jsPlugins) {
      const loaded = await import(pathToFileURL(plugin.specifier).href)

      adapters.set(plugin.name, loaded.default)
      const packageName = optionalPackages[plugin.name]

      if (packageName) {
        assert.ok(OX_FRAMEWORK_PACKAGES[stack].includes(packageName), `CLI is missing ${packageName} for ${stack}`)
      }
    }

    verifyAdapterRules(config, adapters)
  }

  const engines = engineVersions()

  assert.deepEqual(mapping.engines, engines, 'Engine versions changed')
  assert.equal(engines.oxlint, OX_VERSIONS.oxlint)
  assert.equal(engines['oxlint-tsgolint'], OX_VERSIONS['oxlint-tsgolint'])
  assert.equal(engines['@typescript/native'], '7.0.2')
}

function escapeCell(value) {
  return String(value)
    .replaceAll('|', String.raw`\|`)
    .replaceAll('`', '&#96;')
    .replaceAll('\n', ' ')
}

function sampleExtension(stack) {
  if (stack === 'svelte' || stack === 'astro') {
    return stack
  }

  return stack === 'common' ? 'ts' : 'tsx'
}

export function coverageMarkdown(report, mapping) {
  const lines = [
    '# Oxlint rule mapping',
    '',
    'Generated by `npm run inventory:ox`. Runtime configuration is generated from the checked source inventory and migration policy.',
    '',
    'Only Oxlint executes the new presets. Native typed rules use tsgolint/TypeScript 7. JS plugins do not receive a TS6 Program.',
    '',
    `The committed corpus contains ${report.evidence.cases} records: ${report.evidence.cases - report.evidence.conditional} positive/negative pairs and ${report.evidence.conditional} explicitly conditional default-configuration controls. SFC entries are partial script-only coverage, not template parity.`,
    '',
    '## Representative scopes',
    '',
    '| Preset | Sample | Native | JS | Partial | Unsupported | Disabled | Source parser |',
    '| --- | --- | --- | --- | --- | --- | --- | --- |',
  ]

  for (const [name, preset] of Object.entries(report.presets)) {
    const stack = name.slice(0, -3)
    const extension = sampleExtension(stack)
    const file = `src/probe.${extension}`
    const scope = preset.scopes[file]
    const counts = scope.counts

    lines.push(
      `| ${name} | ${file} | ${counts.native} | ${counts['js-plugin']} | ${counts.partial} | ${counts.unsupported} | ${counts.disabled} | ${scope.baselineStatus} |`,
    )
  }

  lines.push(
    '',
    '## Limitations and partial mappings',
    '',
    'Each row includes the source options, target, scope and evidence reference. `capability:*` references executable capability/SFC tests; other references identify fixtures in `scripts/fixtures/oxlint-rule-cases.json`. Baseline parser failures and configured-only scopes are retained separately in `data/oxlint-config-inventory.json`.',
    '',
    '| Source rule | Options | Domain | Status | Target | Reason | Evidence |',
    '| --- | --- | --- | --- | --- | --- | --- |',
  )

  const limitations = Object.values(mapping.decisions).filter(
    (decision) => decision.status === 'partial' || decision.status === 'unsupported',
  )

  for (const decision of limitations) {
    const cells = [
      decision.sourceId,
      serializeInventory(decision.sourceValue),
      decision.domain,
      decision.status,
      decision.targetId ?? '—',
      decision.reason,
      decision.evidence,
    ]

    lines.push(`| ${cells.map((cell) => escapeCell(cell)).join(' | ')} |`)
  }

  lines.push(
    '',
    '## Complete machine-readable records',
    '',
    '- `data/oxlint-source-inventory.json`: all source scopes, effective rules/options, globals, settings and plugin versions.',
    '- `data/oxlint-rule-map.json`: every native, JS, partial, unsupported and disabled decision, including evidence bindings.',
    '- `data/oxlint-config-inventory.json`: per-preset/per-scope counts and baseline parser status.',
    '',
    'Regenerate with `npm run generate:ox && npm run inventory:ox`; verify with `npm run generate:ox:check && npm run inventory:ox:check && npm run test:ox`.',
    '',
  )

  return lines.join('\n')
}

export async function auditInventory(shouldCheck = false) {
  const source = readInventory(path.join(ROOT, 'data/oxlint-source-inventory.json'))
  const mapping = readInventory(path.join(ROOT, 'data/oxlint-rule-map.json'))
  const corpus = readInventory(path.join(ROOT, 'scripts/fixtures/oxlint-rule-cases.json'))
  const report = validateCoverage(source, mapping, corpus, nativeRules())

  await verifyRuntime(mapping)
  const outputs = {
    'data/oxlint-config-inventory.json': `${serializeInventory(report, 2)}\n`,
    'docs/OXLINT_RULE_MAPPING.md': await format(coverageMarkdown(report, mapping), {
      ...prettierConfig,
      parser: 'markdown',
    }),
  }

  for (const [file, content] of Object.entries(outputs)) {
    const absolute = path.join(ROOT, file)

    if (shouldCheck) {
      assert.equal(readFileSync(absolute, 'utf8'), content, `Stale audit artifact: ${file}`)
    } else {
      writeFileSync(absolute, content)
    }
  }

  return report
}
