# st1ggy/linter-config (monorepo)

| npm package | Path | Role |
| --- | --- | --- |
| **`@st1ggy/linter-config`** | [`packages/eslint`](packages/eslint) | ESLint, Prettier, Stylelint |
| **`@st1ggy/biome-config`** | [`packages/biome`](packages/biome) | Biome JSON presets only |

## Install

**ESLint / Prettier / Stylelint**

```bash
npm i -D @st1ggy/linter-config
```

**Biome**

```bash
npm i -D @st1ggy/biome-config @biomejs/biome
```

Install framework peers (`eslint`, `prettier`, `stylelint`, `react`, …) only for stacks you use.

`@st1ggy/linter-config` targets **ESLint 9–10**, **Prettier 3**, **Stylelint 17**. `@st1ggy/biome-config` targets **Biome 2.4.x** (see each package’s `peerDependencies`).

### Migration (Stylelint)

If you previously used Stylelint 16 with this preset, upgrade the consumer to **Stylelint 17** before depending on the latest release.

### Migration (Biome subpaths on `@st1ggy/linter-config`)

If you used **`@st1ggy/linter-config/biome-*`** (v4.x), switch to the dedicated package:

- `@st1ggy/linter-config/biome-common` → `@st1ggy/biome-config/biome-common` (same pattern for `biome-react`, `biome-next`, `biome-svelte`).

### Development of this package

When working on this repository, `npm install` uses [`.npmrc`](.npmrc) `legacy-peer-deps=true` because `eslint-import-resolver-custom-alias` still declares a peer on `eslint-plugin-import@>=2`, so npm may pull the legacy import plugin for resolution even though published presets use **eslint-plugin-import-x**. Consumer projects that only install `@st1ggy/linter-config` are unaffected.

**Publishing to npm:** the repo root is private. Do **not** run bare `npm publish` at the root (`Cannot read properties of null (reading 'prerelease')`). Publish workspace packages:

```bash
npm run publish:npm
```

This runs `npm publish` for **`@st1ggy/linter-config`** and **`@st1ggy/biome-config`** in sequence.

## Toolchain (this repo)

```bash
npm install
npm run lint
```

- `packages/eslint`: ESLint → Stylelint → Prettier  
- `packages/biome`: `biome ci .`

## Tree-shaking friendly imports

Prefer **subpath** imports. Both packages use `sideEffects: false` and explicit `exports`.

```js
import eslintReact from '@st1ggy/linter-config/eslint-react'
import prettierCommon from '@st1ggy/linter-config/prettier-common'
import stylelintScss from '@st1ggy/linter-config/stylelint-scss'
```

```js
// Biome — extend JSON from biome.json, e.g. "@st1ggy/biome-config/biome-common"
```

## Optional rule packs (not included by default)

- **eslint-plugin-n**, **eslint-plugin-jsx-a11y**, **eslint-plugin-perfectionist**, **typescript-eslint** `recommendedTypeChecked` — add in your own `eslint.config` if needed.

## Subpath exports

**`@st1ggy/linter-config`** — see [`packages/eslint/package.json`](packages/eslint/package.json) (`eslint-common`, `eslint-react`, `eslint-next`, `eslint-svelte`, `prettier-common`, `prettier-svelte`, `stylelint-scss`).

**`@st1ggy/biome-config`** — see [`packages/biome/package.json`](packages/biome/package.json) (`biome-common`, `biome-react`, `biome-next`, `biome-svelte`, root `biome.json` entry).
