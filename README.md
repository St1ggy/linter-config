# st1ggy/linter-config (monorepo)

The npm package **`@st1ggy/linter-config`** is published from [`packages/eslint`](packages/eslint). It exposes **subpath imports** for ESLint, Prettier, Stylelint, and Biome presets (same style for every tool).

## Install

```bash
npm i -D @st1ggy/linter-config
```

Add **`@biomejs/biome`** only if you use Biome configs. Install **`eslint`**, **`prettier`**, **`stylelint`**, and framework peers only for the stacks you use.

The package targets **ESLint 9–10**, **Prettier 3**, **Stylelint 17**, and **Biome 2.4.x** (see `peerDependencies` in [`packages/eslint/package.json`](packages/eslint/package.json)).

### Migration (Stylelint)

If you previously used Stylelint 16 with this preset, upgrade the consumer to **Stylelint 17** before depending on the latest release.

### Development of this package

When working on this repository, `npm install` uses [`.npmrc`](.npmrc) `legacy-peer-deps=true` because `eslint-import-resolver-custom-alias` still declares a peer on `eslint-plugin-import@>=2`, so npm may pull the legacy import plugin for resolution even though published presets use **eslint-plugin-import-x**. Consumer projects that only install `@st1ggy/linter-config` are unaffected.

**Publishing to npm:** the repo root is a private workspace. Do **not** run bare `npm publish` at the root (it can trigger an npm bug: `Cannot read properties of null (reading 'prerelease')`). Publish the workspace package instead:

```bash
npm run publish:npm
```

or `npm publish -w @st1ggy/linter-config --access public`, or `cd packages/eslint && npm publish`.

## Toolchain (this repo)

From the repository root:

```bash
npm install
npm run lint
```

[`packages/eslint`](packages/eslint) `npm run lint` runs ESLint → Stylelint → Prettier → Biome (`lint:fix` runs ESLint/Stylelint/Prettier with fix/write).

## Tree-shaking friendly imports

Prefer **subpath** imports so only the preset you need is loaded. The package is published with `sideEffects: false` and explicit `exports` per subpath.

```js
import eslintReact from '@st1ggy/linter-config/eslint-react'
import biomeCommon from '@st1ggy/linter-config/biome-common'
import prettierCommon from '@st1ggy/linter-config/prettier-common'
import stylelintScss from '@st1ggy/linter-config/stylelint-scss'
```

The root entry re-exports ESLint/Prettier/Stylelint presets from one module; it is convenient but pulls the combined graph:

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

## Subpath exports (`@st1ggy/linter-config`)

**ESLint**

- `@st1ggy/linter-config/eslint-common`
- `@st1ggy/linter-config/eslint-react`
- `@st1ggy/linter-config/eslint-next`
- `@st1ggy/linter-config/eslint-svelte`

**Prettier**

- `@st1ggy/linter-config/prettier-common`
- `@st1ggy/linter-config/prettier-svelte`

**Stylelint**

- `@st1ggy/linter-config/stylelint-scss`

**Biome** (JSON; extend from your `biome.json`)

- `@st1ggy/linter-config/biome` (package-local `biome.json` entry)
- `@st1ggy/linter-config/biome-common`
- `@st1ggy/linter-config/biome-react`
- `@st1ggy/linter-config/biome-next`
- `@st1ggy/linter-config/biome-svelte`

See [`packages/eslint/package.json`](packages/eslint/package.json) `exports` for the canonical list.
