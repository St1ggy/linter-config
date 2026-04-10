import { defineConfig } from 'eslint/config'
import sveltePlugin from 'eslint-plugin-svelte'
import { parser } from 'typescript-eslint'

const svelteFiles = ['**/*.svelte', '**/*.svelte.ts']

const extensions = ['.js']

export default defineConfig([
  sveltePlugin.configs['flat/recommended'],
  {
    files: svelteFiles,
    rules: {
      'import-x/named': 'off',
      'import-x/no-cycle': 'off',
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
        extraFileExtensions: ['.svelte', '.svelte.js', '.svelte.ts'],
        parser,
      },
    },
    settings: {
      'import-x/resolver': {
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
