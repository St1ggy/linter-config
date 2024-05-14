import tseslint from 'typescript-eslint'

import common from './eslint.config.common.js'
import typescriptRules from './rules/rules.typescript.js'

export default tseslint.config(
  ...common,
  ...tseslint.configs.recommended,
  ...tseslint.configs.stylistic,
  ...typescriptRules,
)
