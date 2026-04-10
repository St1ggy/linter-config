# ESLint / Stylelint → Biome mapping (`@st1ggy/linter-config/biome-*`)

This document is the **high-level matrix**. The machine-readable inventory (every ESLint rule id and Stylelint rule name with effective severity for sample files) lives in [`../data/linter-config-inventory.json`](../data/linter-config-inventory.json). Regenerate it from a checkout of this repo with:

```bash
node packages/biome/scripts/inventory.mjs
```

(`LINTER_CONFIG_ROOT` overrides the default `packages/eslint` directory.)

## Legend

| Status | Meaning |
| --- | --- |
| **yes** | Reasonable Biome coverage for the intent (names/options may still differ). |
| **partial** | Some overlap; not a drop-in replacement—review Biome rule docs. |
| **no** | No equivalent in Biome at preset level—**intentional gap** in `@st1ggy/linter-config/biome-*` (Biome presets do not add ESLint/Stylelint/tsc). |

## ESLint layers (flat configs)

| Layer | `linter-config` entry | Biome | Notes |
| --- | --- | --- | --- |
| Base + stylistic | `eslint-common` (`config.common.js`, `@eslint/js` recommended, `@stylistic` all + overrides) | **partial** | Biome formatter + `linter.rules`; no `@stylistic/*` parity; no universal `no-restricted-syntax` AST bans. |
| TypeScript | `config.typescript.js` | **partial** | Type-aware tseslint rules are not reproduced 1:1. |
| Imports | `config.import.js` (import-x) | **partial** | Biome import organization differs from import-x groups/resolvers. |
| Prettier-in-ESLint | `config.prettier.js` | **partial** | Biome is the formatter; semantics differ from `eslint-plugin-prettier`. |
| Unicorn | `config.unicorn.js` | **no** | No unicorn plugin in Biome. |
| SonarJS | `config.sonarjs.js` | **partial** | Complexity-style overlap only; not Sonar parity. |
| React | `config.react.js` | **partial** | React/JSX rules differ from `eslint-plugin-react` + stylistic JSX block. |
| Next.js | `config.next.js` | **no** | `@next/eslint-plugin-next` rules are not available in Biome. |
| Svelte | `svelte-stack.js` | **partial** | Depends on Biome Svelte support for your version; not `eslint-plugin-svelte` parity. |

Inventory rule counts (sample files in `linter-config` tree):

- `eslint-common`: 910 effective rules on `src/examples/example.ts`
- `eslint-react`: includes React layer on the same sample
- `eslint-next`: Next layer on the same sample
- `eslint-svelte`: effective rules on `src/examples/example.svelte`

## Stylelint (SCSS preset)

| Layer | `linter-config` | Biome | Notes |
| --- | --- | --- | --- |
| SCSS stack | `stylelint.config.scss.js` (recommended + scss + sass-guidelines + clean-order + plugins) | **partial** | Biome CSS/SCSS linting only—no clean-order / browserslist plugin / stylelint-prettier parity. |

Inventory: **114** Stylelint rule entries after `extends` resolution on `src/examples/example.scss`.

## Intentional product stance

`@st1ggy/linter-config/biome-*` presets ship **Biome only**. Anything marked **no** or incomplete **partial** is either approximated by Biome where practical or listed as a documented gap. Consumers may run other tools in their own repositories; those tools are **not** part of the Biome JSON exports.
