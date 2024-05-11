import unicornPlugin from 'eslint-plugin-unicorn'

export default [
  unicornPlugin.configs['flat/recommended'],
  {
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
]
