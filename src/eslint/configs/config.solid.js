import { defineConfig } from 'eslint/config'
import solidPlugin from 'eslint-plugin-solid'

export default defineConfig([
  {
    ...solidPlugin.configs['flat/recommended'],
    files: ['**/*.{js,jsx,mjs,cjs}'],
  },
  {
    ...solidPlugin.configs['flat/typescript'],
    files: ['**/*.{ts,tsx,mts,cts}'],
  },
  {
    files: ['**/*.{jsx,tsx}'],
    rules: {
      'solid/self-closing-comp': 'error',
      '@stylistic/jsx-closing-bracket-location': 'error',
      '@stylistic/jsx-closing-tag-location': 'error',
      '@stylistic/jsx-curly-brace-presence': ['error', { props: 'never', children: 'never' }],
      '@stylistic/jsx-curly-newline': ['error', { multiline: 'consistent', singleline: 'forbid' }],
      '@stylistic/jsx-curly-spacing': [
        'error',
        {
          when: 'never',
          attributes: { allowMultiline: false },
          children: false,
        },
      ],
      '@stylistic/jsx-equals-spacing': ['error', 'never'],
      '@stylistic/jsx-first-prop-new-line': ['error', 'multiline'],
      '@stylistic/jsx-max-props-per-line': ['error', { when: 'multiline' }],
      '@stylistic/no-multi-spaces': 'error',
      '@stylistic/jsx-tag-spacing': 'error',
    },
  },
])
