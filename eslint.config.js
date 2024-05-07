import common from './dist/eslint/eslint.config.common.js'

export default [
  common,
  {
    rules: {
      'import/extensions': 'off',
    },
  },
]
