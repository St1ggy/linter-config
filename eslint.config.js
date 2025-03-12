import stylisticMigrate from '@stylistic/eslint-plugin-migrate'

import common from './src/eslint/eslint.config.common.js'

export default [
  ...common,
  {
    rules: {
      'import/extensions': 'off',
    },
    ignores: ['dist/*'],
  },
  {
    plugins: {
      '@stylistic/migrate': stylisticMigrate,
    },
    rules: {
      '@stylistic/migrate/migrate-js': 'warn',
      '@stylistic/migrate/migrate-jsx': 'warn',
      '@stylistic/migrate/migrate-ts': 'warn',
    },
  },
]
