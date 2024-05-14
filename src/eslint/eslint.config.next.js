import nextPlugin from '@next/eslint-plugin-next'

import react from './eslint.config.react.js'

export default [
  ...react,
  {
    plugins: {
      '@next/next': nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
    },
  },
]
