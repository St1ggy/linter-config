import prettierConfig from 'eslint-config-prettier'
import prettierPlugin from 'eslint-plugin-prettier'
import tseslint from 'typescript-eslint'

export default tseslint.config({
  files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
  extends: [prettierConfig],
  plugins: { prettier: prettierPlugin },
  rules: { 'prettier/prettier': 'error' },
})
