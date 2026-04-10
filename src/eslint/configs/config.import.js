import { defineConfig } from 'eslint/config'
import { flatConfigs } from 'eslint-plugin-import-x'

import { files } from './constants.js'

export default defineConfig([
  flatConfigs.recommended,
  flatConfigs.typescript,
  {
    files,
    rules: {
      'import-x/newline-after-import': 'error',
      'import-x/order': [
        'error',
        {
          'newlines-between': 'always',
          groups: [['builtin', 'external'], ['internal'], ['parent'], ['sibling', 'index', 'object'], ['type']],
          pathGroups: [
            {
              pattern: '@/**',
              group: 'external',
              position: 'after',
            },
          ],
          alphabetize: {
            order: 'asc',
            caseInsensitive: false,
          },
        },
      ],
      'import-x/no-duplicates': [
        'error',
        {
          considerQueryString: true,
        },
      ],
      'import-x/prefer-default-export': 'off',
      'import-x/extensions': [
        'error',
        'never',
        {
          js: 'never',
          json: 'ignorePackages',
        },
      ],
      'import-x/no-unresolved': ['error', {}],
    },
    settings: {
      'import-x/resolver': {
        typescript: true,
        node: true,
      },
    },
  },
])
