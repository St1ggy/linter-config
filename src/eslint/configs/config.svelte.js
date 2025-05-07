import { defineConfig } from 'eslint/config'
import sveltePlugin from 'eslint-plugin-svelte'
import { parser } from 'typescript-eslint'

import { files } from './constants.js'

export default defineConfig([
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
    settings: {
      'import/resolver': {
        svelte: true,
      },
    },
  },
])
