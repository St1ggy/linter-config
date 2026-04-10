import stylisticMigrate from '@stylistic/eslint-plugin-migrate'

import svelte from './src/eslint/configs/svelte-stack.js'
import common from './src/eslint/eslint.config.common.js'

export default [
  {
    ignores: ['dist/**'],
  },
  ...common,
  ...svelte,
  {
    rules: {
      'import-x/extensions': 'off',
    },
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
