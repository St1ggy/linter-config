import importPlugin from 'eslint-plugin-import'
import tseslint from 'typescript-eslint'

export default tseslint.config({
  files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
  plugins: { import: importPlugin },
  rules: {
    'import/newline-after-import': 'error',
    'import/order': [
      'error',
      {
        'newlines-between': 'always',
        groups: [['builtin', 'external'], ['internal'], ['sibling', 'parent', 'index', 'object'], ['type']],
        pathGroups: [
          {
            pattern: '@/**',
            group: 'external',
            position: 'after',
          },
        ],
        alphabetize: {
          order: 'asc',
          caseInsensitive: false,
        },
      },
    ],
    'import/no-duplicates': [
      'error',
      {
        considerQueryString: true,
      },
    ],
    'import/prefer-default-export': 'off',
    'import/extensions': [
      'error',
      'never',
      {
        js: 'never',
        json: 'ignorePackages',
      },
    ],
    'import/no-unresolved': ['error', {}],
  },
})
