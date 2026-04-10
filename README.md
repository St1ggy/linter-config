# @st1ggy/linter-config

Shared ESLint, Prettier and Stylelint configs for React, Next.js and Svelte projects.

## Install

```bash
npm i -D @st1ggy/linter-config
```

Install only toolchain dependencies you actually use in your project (`eslint`, `prettier`, `stylelint`, framework packages).

This package targets **ESLint 9–10**, **Prettier 3**, and **Stylelint 17**. Install matching majors in the consuming repo.

### Migration (Stylelint)

If you previously used Stylelint 16 with this preset, upgrade the consumer to **Stylelint 17** before depending on the latest release.

### Development of this package

When working on this repository, `npm install` uses [`.npmrc`](.npmrc) `legacy-peer-deps=true` because `eslint-import-resolver-custom-alias` still declares a peer on `eslint-plugin-import@>=2`, so npm may pull the legacy import plugin for resolution even though published presets use **eslint-plugin-import-x**. Consumer projects that only install `@st1ggy/linter-config` are unaffected.

## Toolchain (this repo)

Single entry points for all linters:

```bash
npm run lint      # eslint → stylelint → prettier --check
npm run lint:fix  # eslint --fix → stylelint --fix → prettier --write
```

Individual steps: `npm run lint:eslint`, `npm run lint:stylelint`, `npm run lint:prettier`.

In your application you can mirror the same pattern (sequential or parallel with `npm-run-all` / `concurrently`).

## Tree-shaking friendly imports

Prefer **subpath** imports so only the preset you need is loaded (smaller static import graph for Node and bundlers). The package is published with `sideEffects: false` and explicit `exports` per subpath.

```js
import eslintReact from '@st1ggy/linter-config/eslint-react'
import prettierCommon from '@st1ggy/linter-config/prettier-common'
import stylelintScss from '@st1ggy/linter-config/stylelint-scss'
```

The root entry re-exports every preset from one module; it is convenient but pulls the combined graph:

```js
import { eslintReact } from '@st1ggy/linter-config'
```

Use the root import only when you intentionally want that barrel.

## Optional rule packs (not included by default)

These are common next steps for stricter or more consistent code; add them in your own `eslint.config` if you need them:

- **eslint-plugin-n** — Node.js-specific imports and `package.json` `exports` / `node:` protocol.
- **eslint-plugin-jsx-a11y** — accessibility rules for React.
- **eslint-plugin-perfectionist** — opinionated sorting (can overlap with import order / stylistic rules).
- **typescript-eslint** `recommendedTypeChecked` — stricter type-aware rules (higher cost and stricter `tsconfig` requirements).

## Available Configs

- `@st1ggy/linter-config/eslint-common`
- `@st1ggy/linter-config/eslint-react`
- `@st1ggy/linter-config/eslint-next`
- `@st1ggy/linter-config/eslint-svelte`
- `@st1ggy/linter-config/prettier-common`
- `@st1ggy/linter-config/prettier-svelte`
- `@st1ggy/linter-config/stylelint-scss`
