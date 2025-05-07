import { defineConfig } from 'eslint/config'
import { configs } from 'typescript-eslint'

import { files } from './constants.js'

export default defineConfig([
  ...configs.recommended,
  ...configs.stylistic,
  {
    files,
    languageOptions: {
      parserOptions: {
        project: ['tsconfig.json'],
      },
    },
    rules: {
      '@typescript-eslint/no-shadow': ['error', { ignoreTypeValueShadow: true }],
      '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }],
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'ts-expect-error': 'allow-with-description',
          'ts-ignore': 'allow-with-description',
        },
      ],
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
    },
  },
])
