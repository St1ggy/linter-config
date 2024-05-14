import reactJsxRuntime from 'eslint-plugin-react/configs/jsx-runtime.js'
import reactRecommended from 'eslint-plugin-react/configs/recommended.js'
import reactHooksPlugin from 'eslint-plugin-react-hooks'

export default [
  reactRecommended,
  reactJsxRuntime,
  {
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
      'react/jsx-child-element-spacing': 'error',
      'react/jsx-closing-bracket-location': 'error',
      'react/jsx-closing-tag-location': 'error',
      'react/jsx-curly-brace-presence': ['error', { props: 'never', children: 'never' }],
      'react/jsx-curly-newline': ['error', { multiline: 'consistent', singleline: 'forbid' }],
      'react/jsx-curly-spacing': [
        'error',
        {
          when: 'never',
          attributes: { allowMultiline: false },
          children: false,
        },
      ],
      'react/jsx-equals-spacing': ['error', 'never'],
      'react/jsx-first-prop-new-line': ['error', 'multiline'],
      'react/jsx-fragments': 'error',
      'react/jsx-handler-names': 'error',
      'react/jsx-max-props-per-line': ['error', { when: 'multiline' }],
      'react/jsx-no-constructed-context-values': 'error',
      'react/jsx-no-leaked-render': 'error',
      'react/jsx-no-useless-fragment': 'error',
      'react/jsx-one-expression-per-line': ['error', { allow: 'single-child' }],
      'react/jsx-props-no-multi-spaces': 'error',
      'react/jsx-tag-spacing': 'error',
      'react/no-multi-comp': 'error',
      'react/self-closing-comp': ['error', { component: true, html: true }],
      ...reactHooksPlugin.configs.recommended.rules,
    },
  },
]
