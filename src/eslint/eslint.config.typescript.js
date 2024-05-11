import tseslint from 'typescript-eslint'

import common from './eslint.config.common.js'

export default tseslint.config(...tseslint.configs.recommended, ...tseslint.configs.stylistic, ...common, {
  languageOptions: {
    parserOptions: {
      project: ['tsconfig.json'],
    },
  },
  settings: {
    'import/resolver': {
      typescript: {},
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
  },
})
