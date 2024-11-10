import unicornPlugin from 'eslint-plugin-unicorn'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
    extends: unicornPlugin.configs['flat/recommended'],
  },
  {
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
    rules: {
      'unicorn/consistent-destructuring': 'error',
      'unicorn/custom-error-definition': 'error',
      'unicorn/no-unused-properties': 'error',
      'unicorn/prevent-abbreviations': [
        'error',
        {
          checkShorthandImports: false,
          replacements: {
            dev: false,
            prod: false,
            props: false,
            ref: false,
            refs: false,
          },
        },
      ],
    },
  },
)
