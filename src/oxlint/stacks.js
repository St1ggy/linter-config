export const OX_VERSIONS = { oxlint: '1.86.0', 'oxlint-tsgolint': '7.0.2003' }

// Only integrations actually used by the corresponding generated bundle.
export const OX_FRAMEWORK_PACKAGES = {
  common: [],
  react: ['eslint-plugin-react', 'eslint-plugin-react-hooks'],
  solid: ['eslint-plugin-solid'],
  next: ['@next/eslint-plugin-next', 'eslint-plugin-react', 'eslint-plugin-react-hooks'],
  svelte: ['eslint-plugin-svelte', 'prettier-plugin-svelte'],
  astro: ['eslint-plugin-astro', 'prettier-plugin-astro'],
}
