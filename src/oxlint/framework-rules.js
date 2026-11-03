// Native script rules shared with eslint-plugin-vue's flat/recommended preset.
// Template-only rules remain in the companion ESLint preset.
const vueErrors = [
  'no-arrow-functions-in-watch',
  'no-async-in-computed-properties',
  'no-computed-properties-in-data',
  'no-deprecated-data-object-declaration',
  'no-deprecated-delete-set',
  'no-deprecated-destroyed-lifecycle',
  'no-deprecated-events-api',
  'no-deprecated-model-definition',
  'no-deprecated-props-default-this',
  'no-deprecated-vue-config-keycodes',
  'no-dupe-keys',
  'no-export-in-script-setup',
  'no-expose-after-await',
  'no-lifecycle-after-await',
  'no-reserved-component-names',
  'no-reserved-keys',
  'no-reserved-props',
  'no-shared-component-data',
  'no-side-effects-in-computed-properties',
  'no-watch-after-await',
  'prefer-import-from-vue',
  'require-prop-type-constructor',
  'require-render-return',
  'require-slots-as-functions',
  'return-in-computed-property',
  'return-in-emits-validator',
  'valid-define-emits',
  'valid-define-options',
  'valid-define-props',
  'valid-next-tick',
]
const vueWarnings = [
  'component-definition-name-casing',
  'prop-name-casing',
  'require-default-prop',
  'require-prop-types',
  'no-multiple-slot-args',
  'no-required-prop-with-default',
]

export const vueRules = Object.fromEntries([
  ...vueErrors.map((name) => [`vue/${name}`, 'error']),
  ...vueWarnings.map((name) => [`vue/${name}`, 'warn']),
])

export const nuxtRules = {
  'nuxt/prefer-import-meta': 'error',
  'nuxt/nuxt-config-keys-order': 'warn',
  'nuxt/no-nuxt-config-test-key': 'error',
  'nuxt/no-page-meta-runtime-values': 'error',
}

export const angularRules = Object.fromEntries(
  [
    'contextual-lifecycle',
    'no-empty-lifecycle-method',
    'no-input-rename',
    'no-inputs-metadata-property',
    'no-output-native',
    'no-output-on-prefix',
    'no-output-rename',
    'no-outputs-metadata-property',
    'prefer-inject',
    'prefer-on-push-component-change-detection',
    'prefer-standalone',
    'use-pipe-transform-interface',
  ].map((name) => [`angular/${name}`, 'error']),
)

export function recommendedAngularRules(plugin, namespace) {
  return Object.fromEntries(
    Object.entries(plugin.rules)
      .filter(([, rule]) => rule.meta.docs?.recommended === 'recommended')
      .map(([name]) => [`${namespace}/${name}`, 'error']),
  )
}
