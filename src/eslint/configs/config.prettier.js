import prettierConfig from 'eslint-config-prettier'
import prettierPlugin from 'eslint-plugin-prettier'
import { defineConfig } from 'eslint/config'

import { filesPrettier } from './constants.js'

export default defineConfig([
  prettierConfig,
  {
    files: filesPrettier,
    plugins: { prettier: prettierPlugin },
    rules: { 'prettier/prettier': 'error' },
  },
])
