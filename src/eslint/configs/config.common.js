import eslint from '@eslint/js'
import stylisticJs from '@stylistic/eslint-plugin-js'
import { defineConfig } from 'eslint/config'

import { files } from './constants.js'

export default defineConfig([
  eslint.configs.recommended,
  stylisticJs.configs.all,
  {
    files,
    plugins: { '@stylistic/js': stylisticJs },
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
      '@stylistic/js/object-curly-newline': 'off',
      '@stylistic/js/operator-linebreak': 'off',
      '@stylistic/js/function-paren-newline': 'off',
      '@stylistic/js/no-confusing-arrow': 'off',
      '@stylistic/js/newline-per-chained-call': 'off',
      '@stylistic/js/indent': 'off',
      '@stylistic/js/implicit-arrow-linebreak': 'off',
      '@stylistic/js/lines-between-class-members': [
        'error',
        'always',
        {
          exceptAfterSingleLine: true,
        },
      ],
      '@stylistic/js/no-mixed-operators': 'off',
      '@stylistic/js/max-len': [
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
      '@stylistic/js/quotes': ['error', 'single', { avoidEscape: true }],
      '@stylistic/js/spaced-comment': ['error', 'always'],
      '@stylistic/js/object-curly-spacing': ['error', 'always', { objectsInObjects: true }],
      '@stylistic/js/padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: '*', next: 'if' },
        { blankLine: 'always', prev: 'if', next: 'if' },
        { blankLine: 'always', prev: ['const', 'let'], next: '*' },
        { blankLine: 'any', prev: ['const', 'let'], next: ['const', 'let'] },
        { blankLine: 'always', prev: '*', next: 'return' },
        { blankLine: 'always', prev: '*', next: 'case' },
        { blankLine: 'always', prev: 'if', next: '*' },
      ],
      '@stylistic/js/multiline-comment-style': ['error', 'separate-lines', { checkJSDoc: true }],
    },
  },
])
