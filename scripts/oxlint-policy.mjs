import { createHash } from 'node:crypto'

import { serializeInventory } from './oxlint-values.mjs'

export const jsNamespaces = {
  eslint: 'eslint-js',
  '@typescript-eslint': 'typescript-js',
  '@stylistic': 'stylistic-js',
  'import-x': 'import-x-js',
  unicorn: 'unicorn-js',
  sonarjs: 'sonarjs',
  prettier: 'prettier',
  react: 'react-js',
  'react-hooks': 'react-hooks-js',
  '@next/next': 'next-js',
  solid: 'solid',
  svelte: 'svelte',
  astro: 'astro',
}

const nativeNamespaces = {
  eslint: 'eslint',
  '@typescript-eslint': 'typescript',
  unicorn: 'unicorn',
  'import-x': 'import',
  react: 'react',
  'react-hooks': 'react',
  '@next/next': 'nextjs',
}

// These Sonar rules have corresponding native rules backed by the TS7 checker.
const sonarNative = {
  'svelte/no-inner-declarations': 'eslint/no-inner-declarations',
  'sonarjs/deprecation': 'typescript/no-deprecated',
  'sonarjs/no-alphabetical-sort': 'typescript/require-array-sort-compare',
  'sonarjs/no-array-delete': 'typescript/no-array-delete',
  'sonarjs/prefer-regexp-exec': 'typescript/prefer-regexp-exec',
}

const svelteScriptRules = new Set([
  'no-inner-declarations',
  'no-inspect',
  'no-navigation-without-resolve',
  'no-store-async',
  'no-svelte-internal',
  'no-unnecessary-state-wrap',
  'prefer-svelte-reactivity',
  'prefer-writable-derived',
])

const astroScriptRules = new Set([
  'no-deprecated-astro-canonicalurl',
  'no-deprecated-astro-fetchcontent',
  'no-deprecated-astro-resolve',
  'no-deprecated-getentrybyslug',
  'no-exports-from-components',
  'no-prerender-export-outside-pages',
])

// Native 1.86.0 rejects these effective options; keep the original JS implementation.
const nativeOptionGaps = new Set([
  '@typescript-eslint/array-type',
  'preserve-caught-error',
  'unicorn/escape-case',
  'unicorn/no-array-callback-reference',
  'unicorn/no-empty-file',
  'unicorn/no-unreadable-array-destructuring',
  'unicorn/number-literal-case',
  'unicorn/prefer-add-event-listener',
  'unicorn/prefer-array-find',
  'unicorn/prefer-array-flat',
  'unicorn/prefer-query-selector',
  'unicorn/prefer-set-has',
  'unicorn/numeric-separators-style',
  'unicorn/explicit-timer-delay',
  '@typescript-eslint/prefer-as-const',
  'unicorn/consistent-function-scoping',
  'unicorn/no-unnecessary-await',
  'unicorn/prefer-prototype-methods',
  'unicorn/prefer-regexp-test',
  'unicorn/prefer-string-raw',
  'unicorn/prefer-string-starts-ends-with',
  'unicorn/prefer-structured-clone',
  'react/boolean-prop-naming',
  'svelte/no-inner-declarations',
])

const capabilityGaps = {
  'react/boolean-prop-naming': {
    status: 'partial',
    limitation: 'conditional-configuration',
    reason:
      'The source rule returns no visitors without an explicit rule regexp. Its source configuration omits that option; preserve the original JS rule instead of enabling a stricter native default.',
  },
  'svelte/no-inner-declarations': {
    status: 'partial',
    limitation: 'conditional-configuration',
    reason:
      'The configured modern-language blockScopedFunctions=allow accepts legal block functions; illegal placement can fail parsing before the rule runs. Preserve the configured core rule.',
  },
  'svelte/no-navigation-without-resolve': {
    status: 'partial',
    limitation: 'framework-context',
    reason:
      'Script calls can be checked, but template links and TS parser-service-dependent type refinements are unavailable.',
  },
  'svelte/prefer-svelte-reactivity': {
    status: 'partial',
    limitation: 'framework-context',
    reason: 'Script mutations and exported Svelte modules can be checked; template interactions are not available.',
  },
  'unicorn/prefer-private-class-fields': {
    status: 'unsupported',
    limitation: 'nullable-accessibility',
    reason:
      'Oxlint exposes accessibility=null on unmodified class members; the original rule requires undefined and silently skips them.',
  },
  'unicorn/no-blob-to-file': {
    status: 'unsupported',
    limitation: 'definition-kind',
    reason:
      'The original rule requires VariableDefinition.kind; the TypeScript scope managers used by the source preset and Oxlint expose parent.kind instead.',
  },
  'unicorn/no-shorthand-property-overrides': {
    status: 'unsupported',
    limitation: 'css-ast',
    reason:
      'The original rule listens to CSS Block/Declaration nodes, which are absent from the JavaScript AST in both the source preset and Oxlint.',
  },
  'unicorn/no-transition-all': {
    status: 'unsupported',
    limitation: 'css-ast',
    reason: 'The original rule requires CSS Declaration nodes; Oxlint does not expose a CSS parser to JS rules.',
  },
  'no-octal': {
    status: 'partial',
    limitation: 'syntax-diagnostic',
    reason:
      'Legacy octal syntax is also rejected by the TypeScript parser; the diagnostic can be a parser error rather than this rule ID.',
  },
  'no-nonoctal-decimal-escape': {
    status: 'partial',
    limitation: 'syntax-diagnostic',
    reason:
      'Invalid legacy escapes are also rejected during parsing; diagnostic IDs differ from the legacy ESLint rule.',
  },
  'import-x/export': {
    status: 'partial',
    limitation: 'syntax-diagnostic',
    reason: 'Duplicate exports are rejected by the native parser/type checker before the import rule runs.',
  },
  'sonarjs/prefer-regexp-exec': {
    status: 'partial',
    limitation: 'regexp-argument',
    reason:
      'The native typed rule covers RegExp arguments; Sonar also diagnoses match calls with non-RegExp arguments such as numbers.',
  },
}

for (const sourceId of ['react-hooks/config', 'react-hooks/gating', 'react-hooks/preserve-manual-memoization']) {
  capabilityGaps[sourceId] = {
    status: 'partial',
    limitation: 'conditional-configuration',
    reason:
      'The original compiler guard and its default options are retained as JS. The corpus verifies the default configuration; option-dependent compiler failure paths are not claimed as verified behavioral parity.',
  }
}

for (const sourceId of [
  'sonarjs/no-unused-collection',
  'unicorn/no-array-concat-in-loop',
  'unicorn/no-array-splice',
  'unicorn/no-unused-properties',
]) {
  capabilityGaps[sourceId] = {
    status: 'partial',
    limitation: 'module-inference',
    reason:
      'Oxlint treats import/export-free JavaScript as script scope; the source preset forces module scope. Local module checks work in explicit ES modules but can skip script-global variables.',
  }
}

export function ruleIdentity(sourceId, value, domain, formatter = 'prettier') {
  const hash = createHash('sha256').update(serializeInventory(value)).digest('hex').slice(0, 12)

  const suffix = sourceId === 'prettier/prettier' && formatter === 'oxfmt' ? ':oxfmt' : ''

  return `${domain}:${sourceId}:${hash}${suffix}`
}

export function fileDomain(file) {
  const extension = file.split('.').at(-1)

  return ['svelte', 'astro', 'vue'].includes(extension) ? extension : 'module'
}

export function splitRule(sourceId) {
  const position = sourceId.lastIndexOf('/')

  return position === -1 ? ['eslint', sourceId] : [sourceId.slice(0, position), sourceId.slice(position + 1)]
}

function requiresFrameworkAst(namespace, name) {
  return namespace === 'astro' || (namespace === 'svelte' && !svelteScriptRules.has(name))
}

function requiresTemplateBindings(domain, name) {
  return (
    domain !== 'module' && ['no-unused-vars', 'no-undef', 'consistent-type-imports', 'jsx-uses-vars'].includes(name)
  )
}

function isJsxMarker(namespace, name, domain) {
  return domain === 'module' && name === 'jsx-uses-vars' && (namespace === 'react' || namespace === 'solid')
}

function isAstroScript(namespace, name, domain) {
  return namespace === 'astro' && domain === 'astro' && astroScriptRules.has(name)
}

function canUseNative(catalog, targetId, sourceId) {
  return catalog.has(targetId) && !nativeOptionGaps.has(sourceId)
}

function initialDecision(sourceId, value, domain, metadata, catalog) {
  const [namespace, name] = splitRule(sourceId)
  const base = { sourceId, sourceValue: value, domain, documentation: metadata.documentation }

  if (value[0] === 0) {
    return { ...base, status: 'disabled', reason: 'Disabled in the effective source configuration.' }
  }

  if (isAstroScript(namespace, name, domain)) {
    return {
      ...base,
      status: 'partial',
      implementation: 'js-plugin',
      targetId: sourceId,
      targetValue: value,
      typeAware: false,
      limitation: 'astro-frontmatter',
      evidence: 'capability:astro-frontmatter',
      reason:
        'The original script rule runs on the extracted frontmatter with an isAstro context adapter, not a template parser. Identical frontmatter and browser-script text cannot be distinguished by the plugin API.',
    }
  }

  if (isJsxMarker(namespace, name, domain)) {
    return {
      ...base,
      status: 'native',
      implementation: 'intrinsic',
      targetId: 'eslint/no-unused-vars',
      skipConfiguration: true,
      reason:
        'Oxlint scope analysis records JSX variable references intrinsically; retain the existing unused-variable rule options.',
      evidence: 'capability:jsx-bindings',
    }
  }

  if (requiresFrameworkAst(namespace, name)) {
    return {
      ...base,
      status: 'unsupported',
      reason: 'Requires framework parser/processor AST; Oxlint exposes extracted scripts, not template nodes.',
      limitation: 'framework-template',
    }
  }

  if (requiresTemplateBindings(domain, name)) {
    return {
      ...base,
      status: 'unsupported',
      reason:
        'Template references are unavailable to script-only analysis; enabling this rule would misreport template-used bindings.',
      limitation: 'template-bindings',
    }
  }

  let targetId = sonarNative[sourceId] ?? `${nativeNamespaces[namespace]}/${name}`

  if (namespace === '@typescript-eslint' && !catalog.has(targetId)) {
    targetId = `eslint/${name}`
  }

  if (canUseNative(catalog, targetId, sourceId)) {
    const target = catalog.get(targetId)

    if (domain !== 'module' && target.type_aware) {
      return {
        ...base,
        status: 'unsupported',
        reason: 'Native typed linting cannot build a TS program from extracted framework templates.',
        limitation: 'sfc-type-services',
      }
    }

    return { ...base, status: 'native', targetId, targetValue: value, typeAware: target.type_aware }
  }

  if (metadata.requiresTypeChecking) {
    return {
      ...base,
      status: 'unsupported',
      reason:
        'The JS rule requires TypeScript parser services, which the Oxlint JS plugin API does not provide; no native equivalent is registered.',
      limitation: 'js-type-services',
    }
  }

  const targetValue = structuredClone(value)

  if (sourceId === 'unicorn/numeric-separators-style' && targetValue[1]?.number?.fractionGroupLength === Infinity) {
    // Oxlint transports plugin options as JSON. Omitting the implicit default lets
    // the original Unicorn rule restore Infinity instead of receiving JSON null.
    delete targetValue[1].number.fractionGroupLength
  }

  return {
    ...base,
    status: 'js-plugin',
    targetId: `${jsNamespaces[namespace]}/${name}`,
    targetValue,
    typeAware: false,
    reason: nativeOptionGaps.has(sourceId)
      ? 'The native rule differs on the effective source options or behavioral corpus; use the original JS rule.'
      : 'No native equivalent is registered; use the original JS rule.',
  }
}

export function classifyRule(sourceId, value, domain, metadata, catalog, formatter = 'prettier') {
  if (sourceId === 'prettier/prettier' && formatter === 'oxfmt' && value[0] !== 0) {
    if (value.length > 1) {
      throw new Error('Review rule-local Prettier options before migrating them to Oxfmt')
    }

    return {
      sourceId,
      sourceValue: value,
      domain,
      documentation: metadata.documentation,
      status: 'formatter',
      implementation: 'formatter',
      formatter: 'oxfmt',
      skipConfiguration: true,
      targetId: 'oxfmt/check',
      targetValue: value,
      evidence: 'capability:oxfmt-check',
      reason:
        'Formatting is checked separately by Oxfmt using the migrated common formatter options. No Prettier rule is executed inside Oxlint for this stack.',
    }
  }

  const decision = initialDecision(sourceId, value, domain, metadata, catalog)

  if (decision.skipConfiguration || decision.limitation === 'astro-frontmatter') {
    return decision
  }

  if (!decision.targetId) {
    if (decision.status === 'unsupported') {
      decision.evidence = `capability:${decision.limitation}`
    }

    return decision
  }

  const gap =
    sourceId === '@stylistic/padding-line-between-statements' && value.length === 1
      ? {
          status: 'partial',
          limitation: 'conditional-configuration',
          reason:
            'The source enables this rule without any statement-pair options, so it has no active padding checks. Preserve that default configuration.',
        }
      : capabilityGaps[sourceId]

  const result = {
    ...decision,
    implementation: decision.status,
    ...gap,
    evidence: ruleIdentity(sourceId, value, 'module'),
  }

  if (domain !== 'module' && (result.status === 'native' || result.status === 'js-plugin')) {
    result.status = 'partial'
    result.limitation = 'script-extraction'
    result.reason =
      'The implementation is exercised on JS/TS fixtures and runs on extracted scripts here; template AST, bindings and whole-component equivalence are not provided by Oxlint.'
  }

  if (result.status === 'unsupported') {
    result.candidateTarget = result.targetId
    delete result.targetId
    delete result.targetValue
    result.evidence = `capability:${result.limitation}`
  }

  return result
}
