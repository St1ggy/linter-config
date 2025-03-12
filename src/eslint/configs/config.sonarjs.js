import { configs } from 'eslint-plugin-sonarjs'
import { config } from 'typescript-eslint'

import { files } from './constants.js'

export default config([
  configs.recommended,
  {
    files,
    rules: {
      'sonarjs/todo-tag': 'warn',
    },
  },
])
