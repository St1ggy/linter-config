# st1ggy/linter-config

Single npm package **`@st1ggy/linter-config`** with **subpath exports**. Config sources live under [`src/`](src/) (ESLint, Prettier, Stylelint).

Install once:

```bash
npm i -D @st1ggy/linter-config
```

Add **`eslint`**, **`prettier`**, **`stylelint`**, and framework peers only for the stacks you use (see `peerDependencies` in [`package.json`](package.json)).

### Generate local wrapper configs

The published CLI is invoked as **`@st1ggy/linter-config`** (see [`package.json`](package.json) `bin`). Each run writes **`eslint.config.js`**, **`prettier.config.js`**, and **`stylelint.config.js`** as ESM re-exports for one stack.

Unless **`--skip-install`** is passed: if **`package.json`** exists in the target directory and **`@st1ggy/linter-config`** is not yet resolvable from **`node_modules`** (search walks up to the filesystem root, for hoisted monorepos), the CLI runs the detected package manager (**npm** / **pnpm** / **yarn** / **bun** from the nearest lockfile) to **`add -D @st1ggy/linter-config`** or **`install`** when the dependency is already listed but `node_modules` is missing.

Pick **at most one** stack flag (default **`--common`** if you omit all four):

**`--common` · `--react` · `--next` · `--svelte`**

**After** `npm i -D @st1ggy/linter-config`:

```bash
npx @st1ggy/linter-config init
npx @st1ggy/linter-config init --react
npx @st1ggy/linter-config reinit --svelte --dir ./apps/web
npm exec @st1ggy/linter-config -- init --common
```

**Without** installing the dependency first (`npx` will fetch **`@st1ggy/linter-config`**):

```bash
npx --yes @st1ggy/linter-config init
npx --yes @st1ggy/linter-config init --react
npx --yes @st1ggy/linter-config reinit --svelte --dir ./apps/web
```

Older **`--eslint`** on the command line is still accepted for compatibility; **`--eslint`** is optional.

- **`init` / `create`** — create only missing files (skip existing).
- **`reinit`** — overwrite the three wrapper configs (same names; nothing to delete first).

**Legacy filenames** (`.eslintrc.*`, `prettier.config.cjs`, extra copies, …) are **not** removed by `init` / `reinit`. For an **interactive** cleanup in the project root, use [`scripts/remove-current.sh`](scripts/remove-current.sh) (published inside the package under `scripts/`). In this repo: `npm run config:remove-current`. Run it **before** `init` / `reinit` if you need to drop stray configs; it is intentionally **not** wired into `reinit` so CI stays non-interactive.

Your project should use **`"type": "module"`** (or `.mjs` config filenames) so the generated ESM re-exports load.

In this monorepo, `npm run config:init` / `config:reinit` / `config:create` run **`node ./scripts/linter-init.mjs … --dir ./examples/init-smoke`** (see [`scripts/README.md`](scripts/README.md)). The CLI **refuses** to write consumer stubs in the package root (`package.json` name `@st1ggy/linter-config`) so this repository’s dev configs are not overwritten.

## Subpath imports

```js
import eslintReact from '@st1ggy/linter-config/eslint-react'
import prettierCommon from '@st1ggy/linter-config/prettier-common'
import stylelintScss from '@st1ggy/linter-config/stylelint-scss'
```

The barrel export `@st1ggy/linter-config` re-exports ESLint/Prettier/Stylelint presets only (see [`src/index.js`](src/index.js)).

### Migration (Stylelint)

If you previously used Stylelint 16 with this preset, upgrade the consumer to **Stylelint 17** before depending on the latest release.

### Migration from Biome presets

**v6** removes all **`@st1ggy/linter-config/biome`** and **`biome-*`** subpath exports. Use [Biome](https://biomejs.dev/) in your project directly with its own `biome.json`, or stay on ESLint + Prettier + Stylelint via this package.

### Development of this package

`npm install` uses [`.npmrc`](.npmrc) `legacy-peer-deps=true` (see earlier notes on `eslint-import-resolver-custom-alias`).

**Publishing:** this repo’s **root** `package.json` is the published `@st1ggy/linter-config`:

```bash
npm run publish:npm
```

(`npm publish --access public` — do not use a nested `package.json` for publishing.)

## Toolchain (this repo)

There is **one** published package at the **repository root** (no `packages/` workspace layout).

```bash
npm install
npm run lint
```

### Scripts

| Command | What it runs |
| --- | --- |
| `npm run lint` | ESLint + Stylelint (`src/**/*.scss` / `.css`) + Prettier check |
| `npm run lint:eslint` | ESLint only |
| `npm run lint:stylelint` | Stylelint only |
| `npm run lint:prettier` | Prettier `--check` only |
| `npm run lint:fix` | Auto-fix ESLint, Stylelint, Prettier |
| `npm run inventory` | Regenerate [`data/linter-config-inventory.json`](data/linter-config-inventory.json) |
| `npm run config:init` | `node ./scripts/linter-init.mjs init --common --dir ./examples/init-smoke` (skip existing); see [`scripts/README.md`](scripts/README.md) |
| `npm run config:reinit` | same target, overwrite |
| `npm run config:create` | same as `config:init` |
| `npm run config:remove-current` | interactive: offer to delete `*eslint*` / `*stylelint*` / `*prettier*` files in cwd (see [scripts/remove-current.sh](scripts/remove-current.sh)) |

## Optional ESLint add-ons

You can add **eslint-plugin-n**, **eslint-plugin-jsx-a11y**, **eslint-plugin-perfectionist**, or stricter **typescript-eslint** in your own config if needed.
