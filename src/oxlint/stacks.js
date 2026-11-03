export const OX_VERSIONS = { oxlint: '1.90.0', 'oxlint-tsgolint': '7.0.2005' }
export const OXFMT_VERSION = '0.75.0'
export const OX_ESLINT_VERSION = '10.14.0'
export const OXFMT_STACKS = ['common', 'react', 'solid', 'next', 'svelte', 'astro', 'angular', 'vue', 'nuxt']
export const SUPPLEMENT_STACKS = ['svelte', 'astro', 'angular', 'vue', 'nuxt']

export const OXFMT_PRESETS = {
  svelte: 'oxfmt-svelte',
  astro: 'oxfmt-astro',
  angular: 'oxfmt-angular',
}

export function oxStackToolVersions(stack) {
  return {
    ...OX_VERSIONS,
    ...(OXFMT_STACKS.includes(stack) && { oxfmt: OXFMT_VERSION }),
    ...(SUPPLEMENT_STACKS.includes(stack) && { eslint: OX_ESLINT_VERSION }),
  }
}

// Only integrations actually used by the corresponding generated bundle.
export const OX_FRAMEWORK_PACKAGES = {
  common: [],
  react: ['@eslint-react/eslint-plugin', 'eslint-plugin-react-hooks'],
  solid: ['eslint-plugin-solid'],
  next: ['@next/eslint-plugin-next', '@eslint-react/eslint-plugin', 'eslint-plugin-react-hooks'],
  svelte: ['eslint-plugin-svelte', 'svelte'],
  astro: ['eslint-plugin-astro', '@astrojs/compiler-rs'],
  angular: [
    '@angular-eslint/eslint-plugin',
    '@angular-eslint/eslint-plugin-template',
    '@angular-eslint/template-parser',
  ],
  vue: ['eslint-plugin-vue', 'vue-eslint-parser'],
  nuxt: ['eslint-plugin-vue', 'vue-eslint-parser', '@nuxt/eslint-plugin'],
}
