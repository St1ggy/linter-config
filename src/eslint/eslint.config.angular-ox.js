import template from '@angular-eslint/eslint-plugin-template'
import * as templateParser from '@angular-eslint/template-parser'
import { parser } from 'typescript-eslint'

import { recommendedAngularRules } from '../oxlint/framework-rules.js'

const accessibility = Object.fromEntries(
  Object.entries(template.rules)
    .filter(([, rule]) => rule.meta.docs?.description.startsWith('[Accessibility]'))
    .map(([name]) => [`@angular-eslint/template/${name}`, 'error']),
)

export default [
  { ignores: ['**/node_modules/**', '**/.angular/**', '**/dist/**'] },
  {
    files: ['**/*.ts'],
    languageOptions: { parser },
    processor: template.processors['extract-inline-html'],
  },
  {
    files: ['**/*.html'],
    languageOptions: { parser: templateParser },
    plugins: { '@angular-eslint/template': template },
    rules: { ...recommendedAngularRules(template, '@angular-eslint/template'), ...accessibility },
  },
]
