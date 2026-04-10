export const files = ['**/*.{js,jsx,ts,tsx,mts,cts,mjs,cjs,vue,svelte}']

/** For `parserOptions.project` / type-aware @typescript-eslint rules (omit `.svelte`; Svelte scripts use svelte-eslint-parser). */
export const filesTypeAware = ['**/*.{js,jsx,ts,tsx,mts,cts,mjs,cjs,vue}']

/** Prettier run via eslint-plugin-prettier (omit `.svelte` unless Prettier is configured with `prettier-plugin-svelte`). */
export const filesPrettier = ['**/*.{js,jsx,ts,tsx,mts,cts,mjs,cjs,vue}']
