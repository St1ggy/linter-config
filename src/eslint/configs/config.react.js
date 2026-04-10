import { defineConfig } from 'eslint/config'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'

import { files } from './constants.js'

export default defineConfig([
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat['jsx-runtime'],
  {
    files,
    plugins: { 'react-hooks': reactHooksPlugin },
    rules: {
      'react/boolean-prop-naming': 'error',
      'react/button-has-type': 'error',
      'react/checked-requires-onchange-or-readonly': 'error',
      'react/default-props-match-prop-types': ['error', { allowRequiredDefaults: true }],
      'react/destructuring-assignment': 'error',
      'react/function-component-definition': [
        'error',
        {
          namedComponents: 'arrow-function',
          unnamedComponents: 'arrow-function',
        },
      ],
      'react/hook-use-state': 'error',
      'react/jsx-boolean-value': 'error',
      'react/jsx-fragments': 'error',
      'react/jsx-handler-names': 'error',
      'react/jsx-no-constructed-context-values': 'error',
      'react/jsx-no-leaked-render': 'error',
      'react/jsx-no-useless-fragment': 'error',
      'react/no-multi-comp': 'error',
      'react/self-closing-comp': ['error', { component: true, html: true }],

      ...reactHooksPlugin.configs.recommended.rules,
      // @stylistic
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
