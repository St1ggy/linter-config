import eslint from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin'
import { defineConfig } from 'eslint/config'

import { files } from './constants.js'

export default defineConfig([
  eslint.configs.recommended,
  stylistic.configs.all,
  {
    files,
    plugins: { '@stylistic': stylistic },
    rules: {
      'no-console': 'warn',
      'no-debugger': 'warn',
      'no-undef': 'off',
      'prefer-template': 'error',
      'arrow-body-style': ['error', 'as-needed'],
      'no-return-assign': 'off',
      'newline-before-return': ['error'],
      radix: 'off',
      camelcase: [
        'error',
        {
          allow: [],
        },
      ],
      'no-shadow': 'off',
      'no-unused-vars': 'off',
      'no-use-before-define': 'off',
      'sort-imports': [
        'error',
        {
          ignoreDeclarationSort: true,
        },
      ],
      'object-shorthand': 'error',
      'prefer-const': 'error',
      'class-methods-use-this': 'off',
      'no-restricted-syntax': [
        'error',
        {
          selector: 'WithStatement',
          message: '`with` statement are not allowed.',
        },
        {
          selector: 'ForInStatement',
          message: 'Use for..of instead.',
        },
        {
          selector: 'TSEnumDeclaration',
          message: "Don't declare enums, use type union of literal strings or constants.",
        },
        {
          selector: 'MemberExpression[object.name="React"]',
          message: 'Use named imports from react.',
        },
        {
          selector:
            'CallExpression[callee.property.name="replaceAll"] > Literal[regex.flags=/^[^g]*$/].arguments:first-child',
          message: 'Missing "g" flag in regular expression.',
        },
      ],
      curly: ['error', 'all'],
      // @stylistic
      '@stylistic/object-curly-newline': 'off',
      '@stylistic/operator-linebreak': 'off',
      '@stylistic/function-paren-newline': 'off',
      '@stylistic/no-confusing-arrow': 'off',
      '@stylistic/newline-per-chained-call': 'off',
      '@stylistic/indent': 'off',
      '@stylistic/implicit-arrow-linebreak': 'off',
      '@stylistic/lines-between-class-members': [
        'error',
        'always',
        {
          exceptAfterSingleLine: true,
        },
      ],
      '@stylistic/no-mixed-operators': 'off',
      '@stylistic/max-len': [
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
      '@stylistic/quotes': ['error', 'single', { avoidEscape: true }],
      '@stylistic/spaced-comment': ['error', 'always'],
      '@stylistic/object-curly-spacing': ['error', 'always', { objectsInObjects: true }],
      '@stylistic/padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: '*', next: 'if' },
        { blankLine: 'always', prev: 'if', next: 'if' },
        { blankLine: 'always', prev: ['const', 'let'], next: '*' },
        { blankLine: 'any', prev: ['const', 'let'], next: ['const', 'let'] },
        { blankLine: 'always', prev: '*', next: 'return' },
        { blankLine: 'always', prev: '*', next: 'case' },
        { blankLine: 'always', prev: 'if', next: '*' },
      ],
      '@stylistic/multiline-comment-style': ['error', 'separate-lines', { checkJSDoc: true }],
    },
  },
])
