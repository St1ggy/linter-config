import unicornPlugin from 'eslint-plugin-unicorn'
import { defineConfig } from 'eslint/config'

import { files } from './constants.js'

export default defineConfig([
  unicornPlugin.configs.recommended,
  {
    rules: {
      'unicorn/consistent-destructuring': 'off',
      'unicorn/no-unused-properties': 'off',
      'unicorn/name-replacements': 'off',
    },
  },
  {
    files,
    rules: {
      'unicorn/custom-error-definition': 'error',
      'unicorn/no-null': 'off',
    },
  },
])
