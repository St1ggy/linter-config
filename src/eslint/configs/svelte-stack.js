import sveltePlugin from 'eslint-plugin-svelte'
import { defineConfig } from 'eslint/config'
import { parser } from 'typescript-eslint'

const svelteFiles = ['**/*.svelte', '**/*.svelte.ts']

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
      'st1ggy/import-aliases': {
        $lib: 'src/lib',
        $app: 'node_modules/@sveltejs/kit/src/runtime/app',
        '@sveltejs/kit': 'node_modules/@sveltejs/kit/src/exports/index.js',
      },
    },
  },
])
