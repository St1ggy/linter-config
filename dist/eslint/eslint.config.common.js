import eslint from '@eslint/js'
import prettierConfig from 'eslint-config-prettier'
import importPlugin from 'eslint-plugin-import'
import prettierPlugin from 'eslint-plugin-prettier'

export default {
  plugins: {
    import: importPlugin,
    prettier: prettierPlugin,
  },
  rules: {
    ...eslint.configs.recommended.rules,
    ...prettierConfig.rules,
    'no-console': 'warn',
    'no-debugger': 'warn',
    'prettier/prettier': 'error',
    'object-curly-newline': 'off',
    'operator-linebreak': 'off',
    'function-paren-newline': 'off',
    'no-confusing-arrow': 'off',
    'newline-per-chained-call': 'off',
    indent: 'off',
    'implicit-arrow-linebreak': 'off',
    'no-undef': 'off',
    'lines-between-class-members': [
      'error',
      'always',
      {
        exceptAfterSingleLine: true,
      },
    ],
    'prefer-template': 'error',
    'arrow-body-style': ['error', 'as-needed'],
    'no-return-assign': 'off',
    'newline-before-return': ['error'],
    radix: 'off',
    'no-mixed-operators': 'off',
    'max-len': [
      'error',
      {
        code: 120,
        tabWidth: 2,
        ignoreComments: true,
        ignoreRegExpLiterals: true,
        ignoreStrings: true,
        ignoreTrailingComments: true,
      },
    ],
    camelcase: [
      'error',
      {
        allow: ['Open_Sans'],
      },
    ],
    'no-shadow': 'off',
    'no-unused-vars': 'off',
    'no-use-before-define': 'off',
    'import/newline-after-import': 'error',
    'sort-imports': [
      'error',
      {
        ignoreDeclarationSort: true,
      },
    ],
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
    quotes: ['error', 'single'],
    'import/no-duplicates': [
      'error',
      {
        considerQueryString: true,
      },
    ],
    'object-shorthand': 'error',
    'prefer-const': 'error',
    'class-methods-use-this': 'off',
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
    'spaced-comment': ['error', 'always'],
  },
}
