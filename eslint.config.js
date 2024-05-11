import common from './src/eslint/eslint.config.common.js'
import react from './src/eslint/eslint.config.react.js'

export default [
  // ...common,
  ...react,
  {
    rules: {
      'import/extensions': 'off',
    },
    ignores: ['dist/*'],
  },
]
