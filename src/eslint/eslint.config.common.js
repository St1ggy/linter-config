import commonConfig from './rules/rules.common.js'
import importConfig from './rules/rules.import.js'
import prettierConfig from './rules/rules.prettier.js'
import sonarjsConfig from './rules/rules.sonarjs.js'
import unicornConfig from './rules/rules.unicorn.js'

export default [...prettierConfig, ...commonConfig, ...importConfig, ...unicornConfig, ...sonarjsConfig]
