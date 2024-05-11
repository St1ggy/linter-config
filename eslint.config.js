import common from './src/eslint/eslint.config.common.js'

export default [
  ...common,
  {
    rules: {
      'import/extensions': 'off',
    },
    ignores: ['dist/*'],
  },
]
