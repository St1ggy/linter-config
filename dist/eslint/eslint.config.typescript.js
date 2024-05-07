import tsPlugin from '@typescript-eslint/eslint-plugin'
import parser from '@typescript-eslint/parser'

import common from './eslint.config.common.js'

export default {
  ...common,
  plugins: {
    ...common.plugins,
    '@typescript-eslint': tsPlugin,
  },
  languageOptions: {
    ecmaVersion: 'latest',
    parser,
    sourceType: 'module',
    project: ['tsconfig.json'],
    extraFileExtensions: ['.js'],
  },
  rules: {
    ...common.rules,
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/ban-types': ['warn'],
    '@typescript-eslint/no-shadow': [
      'error',
      {
        ignoreTypeValueShadow: true,
      },
    ],
    '@typescript-eslint/no-var-requires': ['off'],
    '@typescript-eslint/no-empty-function': ['off'],
    '@typescript-eslint/no-use-before-define': ['error'],
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        ignoreRestSiblings: true,
      },
    ],
    '@typescript-eslint/ban-ts-comment': [
      'error',
      {
        'ts-expect-error': 'allow-with-description',
        'ts-ignore': 'allow-with-description',
      },
    ],
    '@typescript-eslint/switch-exhaustiveness-check': 'error',
    '@typescript-eslint/consistent-type-imports': [
      'error',
      {
        fixStyle: 'inline-type-imports',
      },
    ],
  },
}
