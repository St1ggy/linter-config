/* eslint-disable import-x/no-named-as-default-member -- @next/eslint-plugin-next is CJS; no ESM named export for configs */
import nextPlugin from '@next/eslint-plugin-next'
import { defineConfig } from 'eslint/config'

import { files } from './constants.js'

const { configs: nextConfigs } = nextPlugin

export default defineConfig([
  {
    files,
    plugins: {
      '@next/next': nextPlugin,
    },
    rules: {
      ...nextConfigs.recommended.rules,
      ...nextConfigs['core-web-vitals'].rules,
    },
  },
])
