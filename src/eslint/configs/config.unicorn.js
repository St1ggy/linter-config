import { defineConfig } from 'eslint/config'
import unicornPlugin from 'eslint-plugin-unicorn'

import { files } from './constants.js'

export default defineConfig([
  unicornPlugin.configs.recommended,
  {
    files,
    rules: {
      'unicorn/consistent-destructuring': 'error',
      'unicorn/custom-error-definition': 'error',
      'unicorn/no-unused-properties': 'error',
      'unicorn/no-null': 'off',
      'unicorn/prevent-abbreviations': [
        'error',
        {
          replacements: {
            dev: false,
            prod: false,
            props: false,
            ref: false,
            refs: false,
            args: false,
            params: false,
            utils: false,
            env: false,
          },
        },
      ],
    },
  },
])
