import { vueRules } from './framework-rules.js'
import common from './oxlint.config.common.js'

export default {
  ...common,
  plugins: [...common.plugins, 'vue'],
  overrides: [...common.overrides, { files: ['**/*.vue'], rules: vueRules }],
}
