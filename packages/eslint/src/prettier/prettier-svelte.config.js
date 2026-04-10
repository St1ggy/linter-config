export default {
  plugins: ['prettier-plugin-svelte'],
  overrides: [{ files: '*.svelte', options: { parser: 'svelte' } }],
  useTabs: false,
  printWidth: 120,
  tabWidth: 2,
  semi: false,
  singleQuote: true,
  trailingComma: 'all',
  bracketSpacing: true,
  arrowParens: 'always',
  proseWrap: 'never',
}
