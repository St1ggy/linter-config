import sveltePlugin from 'eslint-plugin-svelte'
import { config, parser } from 'typescript-eslint'

import { files } from './constants.js'

export default config([
  sveltePlugin.configs['flat/recommended'],
  {
    files,
    rules: {},
    languageOptions: {
      parserOptions: {
        project: ['tsconfig.json'],
        projectService: true,
        extraFileExtensions: ['.svelte', '.svelte.js', '.svelte.ts'],
        parser,
      },
    },
  },
])
