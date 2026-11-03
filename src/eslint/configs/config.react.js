import reactPlugin from '@eslint-react/eslint-plugin'
import { defineConfig } from 'eslint/config'
import reactHooksPlugin from 'eslint-plugin-react-hooks'

import { files } from './constants.js'

// Keep the official hooks integration (and its existing Oxlint mappings) once.
const duplicateHooks = Object.fromEntries(
  Object.keys(reactHooksPlugin.configs.recommended.rules)
    .map((id) => id.replace('react-hooks/', '@eslint-react/'))
    .filter((id) => Object.hasOwn(reactPlugin.configs.recommended.rules, id))
    .map((id) => [id, 'off']),
)

export default defineConfig([
  { ...reactPlugin.configs.recommended, files },
  {
    files,
    plugins: { 'react-hooks': reactHooksPlugin },
    rules: {
      ...duplicateHooks,
      '@eslint-react/dom-no-missing-button-type': 'error',
      '@eslint-react/use-state': 'error',
      '@eslint-react/no-unstable-context-value': 'error',
      '@eslint-react/jsx-no-useless-fragment': 'error',
      '@eslint-react/no-missing-component-display-name': 'error',

      ...reactHooksPlugin.configs.recommended.rules,
      // @stylistic
      '@stylistic/jsx-self-closing-comp': ['error', { component: true, html: true }],
      '@stylistic/jsx-closing-bracket-location': 'error',
      '@stylistic/jsx-closing-tag-location': 'error',
      '@stylistic/jsx-curly-brace-presence': ['error', { props: 'never', children: 'never' }],
      '@stylistic/jsx-curly-newline': ['error', { multiline: 'consistent', singleline: 'forbid' }],
      '@stylistic/jsx-curly-spacing': [
        'error',
        {
          when: 'never',
          attributes: { allowMultiline: false },
          children: false,
        },
      ],
      '@stylistic/jsx-equals-spacing': ['error', 'never'],
      '@stylistic/jsx-first-prop-new-line': ['error', 'multiline'],
      '@stylistic/jsx-max-props-per-line': ['error', { when: 'multiline' }],
      '@stylistic/jsx-props-no-multi-spaces': 'error',
      '@stylistic/jsx-tag-spacing': 'error',
    },
  },
])
