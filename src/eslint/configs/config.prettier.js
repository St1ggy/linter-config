import prettierConfig from 'eslint-config-prettier'
import prettierPlugin from 'eslint-plugin-prettier'
import { config } from 'typescript-eslint'

import { files } from './constants.js'

export default config([
  prettierConfig,
  {
    files,
    plugins: { prettier: prettierPlugin },
    rules: { 'prettier/prettier': 'error' },
  },
])
