import stylisticMigrate from '@stylistic/eslint-plugin-migrate'

import common from './src/eslint/eslint.config.common.js'

export default [
  {
    ignores: ['**/node_modules/**', 'dist/**', 'examples/init-smoke/**', 'src/examples/example.{astro,svelte}'],
  },
  ...common,
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
