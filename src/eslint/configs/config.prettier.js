import { defineConfig } from 'eslint/config'
import prettierConfig from 'eslint-config-prettier'
import prettierPlugin from 'eslint-plugin-prettier'

import { files } from './constants.js'

export default defineConfig([
  prettierConfig,
  {
    files,
    plugins: { prettier: prettierPlugin },
    rules: { 'prettier/prettier': 'error' },
  },
])
