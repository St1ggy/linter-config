# Preset layers (`@st1ggy/linter-config`)

This document is the **high-level matrix** of how flat-config and Stylelint presets are layered. The machine-readable inventory (every flat-config rule id and Stylelint rule name with effective severity for sample files) lives in [`../data/linter-config-inventory.json`](../data/linter-config-inventory.json). Regenerate it from a checkout of this repo with:

```bash
node scripts/inventory.mjs
```

(`LINTER_CONFIG_ROOT` overrides the default repository root.)

## Flat-config layers

| Layer | `@st1ggy/linter-config` preset | Notes |
| --- | --- | --- |
| Base + stylistic | `eslint-common` (`config.common.js`, `@eslint/js` recommended, `@stylistic` all + overrides) | Foundation for TS/JS. |
| TypeScript | `config.typescript.js` | typescript-eslint integration. |
| Imports | `config.import.js` (import-x) | Resolver and import ordering. |
| Prettier-in-ESLint | `config.prettier.js` | eslint-plugin-prettier + config-prettier. |
| Unicorn | `config.unicorn.js` | eslint-plugin-unicorn. |
| SonarJS | `config.sonarjs.js` | eslint-plugin-sonarjs. |
| React | `config.react.js` | React/JSX + hooks. |
| Next.js | `config.next.js` | `@next/eslint-plugin-next`. |
| Svelte | `svelte-stack.js` | `eslint-plugin-svelte` flat recommended + TS parser options. |

Inventory rule counts (sample files in this repository):

- `eslint-common`: effective rules on `src/examples/example.ts`
- `eslint-react`: includes React layer on the same sample
- `eslint-next`: Next layer on the same sample
- `eslint-svelte`: effective rules on `src/examples/example.svelte`

## Stylelint (SCSS preset)

| Layer | `@st1ggy/linter-config` | Notes |
| --- | --- | --- |
| SCSS stack | `stylelint.config.scss.js` (recommended + scss + sass-guidelines + clean-order + plugins) | Full Stylelint stack for SCSS. |

Inventory: Stylelint rule entries after `extends` resolution on `src/examples/example.scss`.
