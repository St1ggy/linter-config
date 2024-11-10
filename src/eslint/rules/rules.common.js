import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
    extends: eslint.configs.recommended,
  },
  {
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
    rules: {
      'no-console': 'warn',
      'no-debugger': 'warn',
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
      'sort-imports': [
        'error',
        {
          ignoreDeclarationSort: true,
        },
      ],
      quotes: ['error', 'single', { avoidEscape: true }],
      'object-shorthand': 'error',
      'prefer-const': 'error',
      'class-methods-use-this': 'off',
      'spaced-comment': ['error', 'always'],
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
    },
  },
)
