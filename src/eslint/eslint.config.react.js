import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'

import typescript from './eslint.config.typescript.js'

export default [
  ...typescript,
  {
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    rules: {
      'react/sort-comp': 'off',
      'react/prop-types': 'off',
      'react/jsx-curly-newline': 'off',
      'react/state-in-constructor': 'off',
      'react/require-default-props': 'off',
      'react/jsx-props-no-spreading': 'off',
      'react/jsx-filename-extension': 'off',
      'react/destructuring-assignment': 'off',
      'react/static-property-placement': 'off',
      'react/jsx-one-expression-per-line': 'off',
      'react/self-closing-comp': [
        'error',
        {
          component: true,
          html: true,
        },
      ],
      'react/default-props-match-prop-types': [
        'warn',
        {
          allowRequiredDefaults: true,
        },
      ],
      'react/jsx-wrap-multilines': 'off',
      'react/jsx-indent': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
      'react/function-component-definition': [
        'error',
        {
          namedComponents: 'arrow-function',
          unnamedComponents: 'arrow-function',
        },
      ],
      'react/jsx-curly-brace-presence': [
        'warn',
        {
          props: 'never',
          children: 'never',
        },
      ],
    },
  },
]
