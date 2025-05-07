import { defineConfig } from 'eslint/config'
import sveltePlugin from 'eslint-plugin-svelte'
import { parser } from 'typescript-eslint'

import { files } from './constants.js'

const extensions = ['.js', '.ts', '.svelte']

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
    'import/parsers': {
      'svelte-eslint-parser': ['.svelte'],
      espree: extensions,
    },
    settings: {
      'import/resolver': {
        'eslint-import-resolver-custom-alias': {
          alias: {
            $lib: 'src/lib',
            $app: 'node_modules/@sveltejs/kit/src/runtime/app',
            '@sveltejs/kit': 'node_modules/@sveltejs/kit/src/exports/index.js',
          },
          extensions,
        },
      },
    },
  },
])
