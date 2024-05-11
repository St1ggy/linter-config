import commonRules from './rules/rules.common.js'
import prettierRules from './rules/rules.prettier.js'
import sonarjsRules from './rules/rules.sonarjs.js'
import unicornRules from './rules/rules.unicorn.js'

export default [...prettierRules, ...commonRules, ...unicornRules, ...sonarjsRules]
