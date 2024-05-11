import tseslint from 'typescript-eslint'

import common from './eslint.config.common.js'

// export default tseslint.config(...tseslint.configs.strict, ...tseslint.configs.stylistic, ...common, {
export default tseslint.config(...tseslint.configs.recommended, ...common, {
  languageOptions: {
    parserOptions: {
      project: ['tsconfig.json'],
    },
  },
  settings: {
    'import/resolver': {
      typescript: {}, // this loads <rootdir>/tsconfig.json to eslint
    },
  },
  rules: {
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
})
