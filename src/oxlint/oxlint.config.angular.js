import { fileURLToPath } from 'node:url'

import { angularRules } from './framework-rules.js'
import common from './oxlint.config.common.js'

export default {
  ...common,
  ignorePatterns: [...common.ignorePatterns, '**/.angular/**', '**/dist/**'],
  jsPlugins: [
    ...common.jsPlugins,
    { name: 'angular', specifier: fileURLToPath(new URL('plugins/angular.js', import.meta.url)) },
  ],
  overrides: [...common.overrides, { files: ['**/*.ts'], rules: angularRules }],
}
