import nextPlugin from '@next/eslint-plugin-next'
import { config } from 'typescript-eslint'

import { files } from './constants.js'

export default config([
  {
    files,
    plugins: {
      '@next/next': nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
    },
  },
])
