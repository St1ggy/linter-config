import commonConfig from './eslint.config.common.js'
import typescriptConfig from './rules/rules.typescript.js'

export default [...commonConfig, ...typescriptConfig]
