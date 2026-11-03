import { fileURLToPath } from 'node:url'

import { nuxtRules } from './framework-rules.js'
import vue from './oxlint.config.vue.js'

const configRules = {
  'nuxt/nuxt-config-keys-order': nuxtRules['nuxt/nuxt-config-keys-order'],
  'nuxt/no-nuxt-config-test-key': nuxtRules['nuxt/no-nuxt-config-test-key'],
}
const scriptRules = Object.fromEntries(Object.entries(nuxtRules).filter(([name]) => !Object.hasOwn(configRules, name)))

export default {
  ...vue,
  ignorePatterns: [...vue.ignorePatterns, '**/.nuxt/**', '**/.output/**'],
  jsPlugins: [
    ...vue.jsPlugins,
    { name: 'nuxt', specifier: fileURLToPath(new URL('plugins/nuxt.js', import.meta.url)) },
  ],
  overrides: [
    ...vue.overrides,
    { files: ['**/*.{js,mjs,cjs,ts,mts,cts,vue}'], rules: scriptRules },
    { files: ['**/nuxt.config.{js,mjs,cjs,ts,mts,cts}'], rules: configRules },
  ],
}
