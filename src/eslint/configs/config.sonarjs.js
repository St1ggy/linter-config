import { defineConfig } from 'eslint/config'
import { configs } from 'eslint-plugin-sonarjs'

import { files } from './constants.js'

export default defineConfig([
  configs.recommended,
  {
    files,
    rules: {
      'sonarjs/todo-tag': 'warn',
    },
  },
])
