import tseslint from 'typescript-eslint'

import typescriptRules from './rules/rules.typescript.js'
import common from './eslint.config.common.js'

export default tseslint.config(
  ...common,
  ...tseslint.configs.recommended,
  ...tseslint.configs.stylistic,
  ...typescriptRules,
)
