import sonarjs from 'eslint-plugin-sonarjs'

export default [
  sonarjs.configs.recommended.files,
  {
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
  },
]
