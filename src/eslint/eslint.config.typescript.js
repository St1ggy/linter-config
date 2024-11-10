import tseslint from 'typescript-eslint'

import commonConfig from './eslint.config.common.js'
import typescriptConfig from './rules/rules.typescript.js'

export default tseslint.config(
  ...commonConfig,
  ...tseslint.configs.recommended,
  ...tseslint.configs.stylistic,
  ...typescriptConfig,
)
