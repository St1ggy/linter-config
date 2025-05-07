import nextPlugin from '@next/eslint-plugin-next'
import { defineConfig } from 'eslint/config'

import { files } from './constants.js'

export default defineConfig([
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
