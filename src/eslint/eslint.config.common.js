import commonConfig from './configs/config.common.js'
import gitignoreConfig from './configs/config.gitignore.js'
import importConfig from './configs/config.import.js'
import prettierConfig from './configs/config.prettier.js'
import sonarjsConfig from './configs/config.sonarjs.js'
import typescriptConfig from './configs/config.typescript.js'
import unicornConfig from './configs/config.unicorn.js'

export default [
  ...gitignoreConfig,
  ...commonConfig,
  ...importConfig,
  ...typescriptConfig,
  ...prettierConfig,
  ...unicornConfig,
  ...sonarjsConfig,
]
