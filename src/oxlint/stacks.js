export const OX_VERSIONS = { oxlint: '1.86.0', 'oxlint-tsgolint': '7.0.2003' }
export const OXFMT_VERSION = '0.71.0'
export const OXFMT_STACKS = ['common', 'react', 'solid', 'next']

export function oxStackToolVersions(stack) {
  return OXFMT_STACKS.includes(stack) ? { ...OX_VERSIONS, oxfmt: OXFMT_VERSION } : OX_VERSIONS
}

// Only integrations actually used by the corresponding generated bundle.
export const OX_FRAMEWORK_PACKAGES = {
  common: [],
  react: ['eslint-plugin-react', 'eslint-plugin-react-hooks'],
  solid: ['eslint-plugin-solid'],
  next: ['@next/eslint-plugin-next', 'eslint-plugin-react', 'eslint-plugin-react-hooks'],
  svelte: ['eslint-plugin-svelte', 'prettier-plugin-svelte'],
  astro: ['eslint-plugin-astro', 'prettier-plugin-astro'],
}
