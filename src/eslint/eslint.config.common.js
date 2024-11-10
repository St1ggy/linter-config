import commonConfig from './configs/config.common.js'
import importConfig from './configs/config.import.js'
import prettierConfig from './configs/config.prettier.js'
import sonarjsConfig from './configs/config.sonarjs.js'
import unicornConfig from './configs/config.unicorn.js'

export default [...prettierConfig, ...commonConfig, ...importConfig, ...unicornConfig, ...sonarjsConfig]
