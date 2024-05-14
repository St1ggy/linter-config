import commonRules from './rules/rules.common.js'
import importRules from './rules/rules.import.js'
import prettierRules from './rules/rules.prettier.js'
import sonarjsRules from './rules/rules.sonarjs.js'
import unicornRules from './rules/rules.unicorn.js'

export default [...prettierRules, ...commonRules, ...importRules, ...unicornRules, ...sonarjsRules]
