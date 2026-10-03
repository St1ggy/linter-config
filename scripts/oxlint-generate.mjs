import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'
import { format } from 'prettier'

import { OXFMT_STACKS } from '../src/oxlint/stacks.js'
import prettierConfig from '../src/prettier/prettier.config.common.js'

import { writeOrCheck } from './oxlint-inventory.mjs'
import { classifyRule, fileDomain, ruleIdentity } from './oxlint-policy.mjs'
import { ROOT, engineVersions, nativeRules, selectedStacks } from './oxlint-tools.mjs'
import { readInventory, serializeInventory } from './oxlint-values.mjs'

const compare = (left, right) => left.localeCompare(right)

function verifyCollision(rules, decision) {
  if (
    Object.hasOwn(rules, decision.targetId) &&
    JSON.stringify(rules[decision.targetId]) !== JSON.stringify(decision.targetValue)
  ) {
    throw new Error(`Conflicting mappings for ${decision.targetId}: ${decision.sourceId}`)
  }
}

function groupOverrides(compiled, allTargets) {
  const cleared = Object.fromEntries([...allTargets].map((rule) => [rule, 'off']))
  const profiles = {}
  const overrides = []

  for (const entry of compiled) {
    const rules = { ...cleared, ...entry.rules }
    const profile = { rules, globals: entry.globals }
    const key = createHash('sha256').update(JSON.stringify(profile)).digest('hex').slice(0, 16)
    const existing = overrides.at(-1)

    profiles[key] = profile

    if (existing?.profile === key) {
      existing.files.push(...entry.files)
    } else {
      overrides.push({ files: entry.files, profile: key })
    }
  }

  return { profiles, overrides }
}

function profileVariants(source, stack) {
  return Object.entries(source.presets[stack].scopes)
    .filter(([file, scope]) => file.startsWith('src/probe.') && !file.slice(4).includes('/') && scope.profile)
    .map(([file, scope]) => ({
      file,
      extension: file.slice('src/probe.'.length),
      profile: source.profiles[scope.profile],
    }))
    .toSorted(
      (left, right) => left.extension.length - right.extension.length || left.extension.localeCompare(right.extension),
    )
}

function virtualMappings(source, stack, decisions, catalog) {
  const scopes = Object.entries(source.presets[stack].scopes).filter(
    ([file, scope]) => file.slice(4).includes('/') && file.startsWith('src/') && scope.profile,
  )

  for (const [file, scope] of scopes) {
    const physical = file.slice(0, file.lastIndexOf('/'))
    const physicalScope = source.presets[stack].scopes[physical]
    const physicalRules = source.profiles[physicalScope.profile].rules
    const rules = source.profiles[scope.profile].rules
    const domain = `${fileDomain(physical)}-client`

    for (const [sourceId, value] of Object.entries(rules)) {
      const decision = classifyRule(sourceId, value, domain, source.metadata[sourceId], catalog)

      if (value[0] !== 0 && JSON.stringify(value) !== JSON.stringify(physicalRules[sourceId])) {
        decision.status = 'unsupported'
        decision.limitation = 'fragment-scope'
        decision.reason =
          'The source processor uses different rules/options for this client fragment. Oxlint exposes one physical filename for frontmatter and browser scripts, so the override cannot be applied independently.'
        decision.evidence = 'capability:fragment-scope'
        delete decision.targetId
        delete decision.targetValue
      }

      decisions[ruleIdentity(sourceId, value, domain)] = decision
    }
  }
}

function verifyLocation(source, stack, variant) {
  const outside = source.presets[stack].scopes[variant.file.slice(4)]

  if (outside?.profile && JSON.stringify(source.profiles[outside.profile]) !== JSON.stringify(variant.profile)) {
    throw new Error(`Location-dependent source scope needs explicit mapping: ${stack}/${variant.file}`)
  }
}

function globalValue(value) {
  if (value === 'off') {
    return 'off'
  }

  return value === true || value === 'writable' ? 'writable' : 'readonly'
}

export function generateBundle(source, stack, decisions, catalog) {
  const variants = profileVariants(source, stack)
  const formatter = OXFMT_STACKS.includes(stack) ? 'oxfmt' : 'prettier'
  const compiled = []
  const allTargets = new Set()
  const plugins = new Set()
  const jsPlugins = new Set()

  for (const variant of variants) {
    verifyLocation(source, stack, variant)
    const rules = {}
    const domain = fileDomain(variant.file)

    for (const [sourceId, value] of Object.entries(variant.profile.rules)) {
      const key = ruleIdentity(sourceId, value, domain, formatter)
      const decision = classifyRule(sourceId, value, domain, source.metadata[sourceId], catalog, formatter)

      decisions[key] = decision

      if (decision.targetId && !decision.skipConfiguration) {
        verifyCollision(rules, decision)
        rules[decision.targetId] = decision.targetValue
        allTargets.add(decision.targetId)
        const namespace = decision.targetId.slice(0, decision.targetId.lastIndexOf('/'))

        if (decision.implementation === 'native') {
          plugins.add(namespace)
        } else {
          jsPlugins.add(namespace)
        }
      }
    }

    compiled.push({
      files: [`**/*.${variant.extension}`],
      rules,
      globals: Object.fromEntries(
        Object.entries(variant.profile.globals ?? {}).map(([name, value]) => [name, globalValue(value)]),
      ),
    })
  }

  const { profiles, overrides } = groupOverrides(compiled, allTargets)

  virtualMappings(source, stack, decisions, catalog)

  const settings = variants[0].profile.settings
  const scopedSettings = variants
    .filter((variant) => JSON.stringify(variant.profile.settings) !== JSON.stringify(settings))
    .map((variant) => ({ extension: variant.extension, settings: variant.profile.settings }))

  return {
    formatter,
    plugins: [...plugins].toSorted(compare),
    jsPlugins: [...jsPlugins].toSorted(compare),
    settings:
      scopedSettings.length > 0
        ? { ...settings, 'st1ggy/import-defaults': settings, 'st1ggy/import-scopes': scopedSettings }
        : settings,
    profiles,
    overrides,
  }
}

export async function saveModule(file, code, check) {
  const formatted = await format(code, { ...prettierConfig, parser: 'babel' })

  if (check) {
    if (readFileSync(file, 'utf8') !== formatted) {
      throw new Error(`Stale generated config: ${file}`)
    }
  } else {
    writeFileSync(file, formatted)
  }
}

function attachEvidence(decisions) {
  const corpus = readInventory(path.join(ROOT, 'scripts/fixtures/oxlint-rule-cases.json'))
  const optionsIndex = new Map(
    Object.entries(corpus.cases).map(([id, fixture]) => [
      `${fixture.sourceId}:${serializeInventory(fixture.sourceValue.slice(1))}`,
      id,
    ]),
  )

  for (const decision of Object.values(decisions)) {
    if (
      !decision.evidence ||
      decision.evidence.startsWith('capability:') ||
      Object.hasOwn(corpus.cases, decision.evidence)
    ) {
      continue
    }

    const equivalent = optionsIndex.get(`${decision.sourceId}:${serializeInventory(decision.sourceValue.slice(1))}`)

    if (equivalent) {
      decision.evidence = equivalent
    }
  }
}

export async function generate(stacks, shouldCheck = false) {
  const source = readInventory(path.join(ROOT, 'data/oxlint-source-inventory.json'))
  const catalog = new Map(nativeRules().map((rule) => [`${rule.scope}/${rule.value}`, rule]))
  const decisions = {}

  if (!shouldCheck) {
    mkdirSync(path.join(ROOT, 'src/oxlint/configs'), { recursive: true })
  }

  for (const stack of stacks) {
    const bundle = generateBundle(source, stack, decisions, catalog)
    const contents = `// Generated by scripts/oxlint-generate.mjs.\n/* eslint-disable unicorn/prefer-string-raw, unicorn/numeric-separators-style -- Serialized rule options. */\nexport default ${JSON.stringify(bundle)}\n`

    await saveModule(path.join(ROOT, `src/oxlint/configs/config.${stack}.js`), contents, shouldCheck)
    await saveModule(
      path.join(ROOT, `src/oxlint/oxlint.config.${stack}.js`),
      `import bundle from './configs/config.${stack}.js'\nimport { createOxlintConfig } from './create-config.js'\n\nexport default createOxlintConfig(bundle)\n`,
      shouldCheck,
    )
  }

  attachEvidence(decisions)
  writeOrCheck(
    path.join(ROOT, 'data/oxlint-rule-map.json'),
    { schemaVersion: 1, stacks, sourceVersions: source.versions, engines: engineVersions(), decisions },
    shouldCheck,
  )
  process.stdout.write(`Oxlint configs ${shouldCheck ? 'verified' : 'generated'}: ${stacks.join(', ')}\n`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await generate(selectedStacks(), process.argv.includes('--check'))
}
