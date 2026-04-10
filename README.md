# st1ggy/linter-config

Single npm package **`@st1ggy/linter-config`** with **subpath exports**. Sources live in two workspace folders:

| Path | Contents |
| --- | --- |
| [`packages/eslint`](packages/eslint) | ESLint, Prettier, Stylelint configs |
| [`packages/biome`](packages/biome) | Biome JSON presets and [`docs/README.md`](packages/biome/docs/README.md) |

Install once:

```bash
npm i -D @st1ggy/linter-config
```

Add **`@biomejs/biome`** when you use Biome presets. Add **`eslint`**, **`prettier`**, **`stylelint`**, and framework peers only for the stacks you use (see `peerDependencies` in [`package.json`](package.json)).

### Generate local wrapper configs

The package exposes the **`linter-config`** CLI (see [`package.json`](package.json) `bin`). After `npm i -D @st1ggy/linter-config`, run it via `npx linter-config` or `npm exec linter-config` (or `npx --yes --package @st1ggy/linter-config linter-config …` without a prior install).

Pick **at least one** of:

- **`--eslint`** — writes `eslint.config.js`, `prettier.config.js`, and `stylelint.config.js` (Prettier and Stylelint are part of this bundle).
- **`--biome`** — writes `biome.json`.

Pick **at most one** stack flag (default **`--common`** if you omit all four):

**`--common` · `--react` · `--next` · `--svelte`**

The same stack key selects matching ESLint / Prettier / Stylelint / Biome subpaths from this package.

```bash
npx linter-config init --biome --svelte
npx linter-config init --eslint --common
npx linter-config init --eslint --biome --next
npx linter-config reinit --eslint --react --dir ./apps/web
```

- **`init` / `create`** — create only missing files (skip existing).
- **`reinit`** — overwrite only the files implied by your flags (for example `--eslint` refreshes the three JS configs; `--biome` refreshes `biome.json`).

Your project should use **`"type": "module"`** (or `.mjs` config filenames) so the generated ESM re-exports load.

In this monorepo, `npm run config:init`, `config:reinit`, and `config:create` run **`--eslint --biome --common`** (see [`scripts/README.md`](scripts/README.md)).

## Subpath imports

**ESLint / Prettier / Stylelint**

```js
import eslintReact from '@st1ggy/linter-config/eslint-react'
import prettierCommon from '@st1ggy/linter-config/prettier-common'
import stylelintScss from '@st1ggy/linter-config/stylelint-scss'
```

**Biome** (extend from your `biome.json`)

Use package subpaths such as `@st1ggy/linter-config/biome-common`, `@st1ggy/linter-config/biome-react`, `@st1ggy/linter-config/biome-next`, `@st1ggy/linter-config/biome-svelte`, or the root Biome entry `@st1ggy/linter-config/biome`.

The barrel export `@st1ggy/linter-config` re-exports ESLint/Prettier/Stylelint presets only (see [`packages/eslint/src/index.js`](packages/eslint/src/index.js)).

### Migration (Stylelint)

If you previously used Stylelint 16 with this preset, upgrade the consumer to **Stylelint 17** before depending on the latest release.

### Migration (`@st1ggy/biome-config` npm package)

If you depended on the separate **`@st1ggy/biome-config`** package, switch to **`@st1ggy/linter-config`** with the same subpath names (`biome-common`, etc.).

### Development of this package

`npm install` uses [`.npmrc`](.npmrc) `legacy-peer-deps=true` (see earlier notes on `eslint-import-resolver-custom-alias`).

**Publishing:** this repo’s **root** `package.json` is the published `@st1ggy/linter-config`. From the repository root:

```bash
npm run publish:npm
```

(`npm publish --access public` — do not use a nested `package.json` for publishing.)

## Toolchain (this repo)

There is **one** published package (`@st1ggy/linter-config` at the repo root). Folders `packages/eslint` and `packages/biome` are **npm workspaces** used only for development—they are not published on their own.

```bash
npm install
npm run lint
```

### Scripts

| Command | What it runs |
| --- | --- |
| `npm run lint` | Full check: ESLint stack in `packages/eslint`, then Biome in `packages/biome` |
| `npm run lint:eslint` | `packages/eslint`: ESLint + Stylelint + Prettier check |
| `npm run lint:stylelint` | `packages/eslint`: Stylelint only |
| `npm run lint:prettier` | `packages/eslint`: Prettier `--check` only |
| `npm run lint:biome` | `packages/biome`: `biome ci` |
| `npm run lint:fix` | Auto-fix ESLint/Stylelint/Prettier in `packages/eslint`, then Biome `--write` in `packages/biome` |
| `npm run lint:fix:eslint` | Fix only the ESLint workspace |
| `npm run lint:fix:biome` | Fix only the Biome workspace |
| `npm run inventory` | Regenerate `packages/eslint/data/linter-config-inventory.json` |
| `npm run config:init` | `linter-config init --eslint --biome --common` (skip existing); see [`scripts/README.md`](scripts/README.md) |
| `npm run config:reinit` | `reinit` with the same flags (overwrite) |
| `npm run config:create` | Same as `config:init` (alternate script name) |

Inside a workspace you can also run the same scripts locally, e.g. `npm run lint --workspace=packages/eslint` or `cd packages/biome && npm run lint`.

## Optional ESLint add-ons

You can add **eslint-plugin-n**, **eslint-plugin-jsx-a11y**, **eslint-plugin-perfectionist**, or stricter **typescript-eslint** in your own config if needed.
