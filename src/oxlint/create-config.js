import { fileURLToPath } from 'node:url'

const pluginFiles = {
  'eslint-js': 'eslint-core',
  'stylistic-js': 'stylistic',
  'import-x-js': 'import-x',
  prettier: 'prettier',
  'unicorn-js': 'unicorn',
  sonarjs: 'sonarjs',
  'typescript-js': 'typescript',
  'react-js': 'react',
  'react-hooks-js': 'react-hooks',
  'next-js': 'next',
  solid: 'solid',
  svelte: 'svelte',
  astro: 'astro',
}

export function createOxlintConfig(bundle) {
  return {
    categories: {
      correctness: 'off',
      suspicious: 'off',
      pedantic: 'off',
      perf: 'off',
      style: 'off',
      restriction: 'off',
      nursery: 'off',
    },
    options: { typeAware: true },
    ignorePatterns: ['**/node_modules/**', '**/.git/**'],
    plugins: bundle.plugins,
    settings: bundle.settings,
    jsPlugins: bundle.jsPlugins.map((name) => ({
      name,
      specifier: fileURLToPath(new URL(`plugins/${pluginFiles[name]}.js`, import.meta.url)),
    })),
    overrides: bundle.overrides.map(({ files, profile }) => ({ files, ...bundle.profiles[profile] })),
  }
}
