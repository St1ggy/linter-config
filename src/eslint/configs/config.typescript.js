import { defineConfig } from 'eslint/config'
import { configs } from 'typescript-eslint'

import { filesTypeAware } from './constants.js'

// `flat/stylistic` enables `@typescript-eslint/consistent-type-definitions` as `'error'` only, which
// uses the rule default (`interface`). Strip it here so we set `type` explicitly below.
const stylisticWithoutTypeDefinitionStyle = configs.stylistic.map((block) => {
  const rules = block.rules

  if (!rules?.['@typescript-eslint/consistent-type-definitions']) {
    return block
  }

  const nextRules = { ...rules }

  delete nextRules['@typescript-eslint/consistent-type-definitions']

  return { ...block, rules: nextRules }
})

export default defineConfig([
  ...configs.recommended,
  ...stylisticWithoutTypeDefinitionStyle,
  {
    files: filesTypeAware,
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
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
      '@typescript-eslint/no-unnecessary-type-parameters': 'warn',
      '@typescript-eslint/prefer-nullish-coalescing': ['warn', { ignorePrimitives: true }],
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
    },
  },
])
