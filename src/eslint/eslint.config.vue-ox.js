import prettier from 'eslint-config-prettier'
import vue from 'eslint-plugin-vue'
import { parser } from 'typescript-eslint'

import { vueRules } from '../oxlint/framework-rules.js'

export default [
  { ignores: ['**/node_modules/**', '**/dist/**'] },
  ...vue.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: { parserOptions: { parser } },
  },
  // Oxfmt owns formatting. Keep Vue's framework checks, including template bindings.
  prettier,
  { files: ['**/*.vue'], rules: Object.fromEntries(Object.keys(vueRules).map((name) => [name, 'off'])) },
]
