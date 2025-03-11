import angular from 'angular-eslint'

export default [
  ...angular.configs.tsAll,
  ...angular.configs.templateAll,
  {
    files: ['**/*.ts'],
    processor: angular.processInlineTemplates,
  },
  {
    files: ['**/*.html'],
    rules: {
      '@angular-eslint/template/i18n': 'off',
      '@angular-eslint/template/no-call-expression': ['error', { allowPrefix: '$' }],
    },
  },
]
