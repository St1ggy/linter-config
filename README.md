# st1ggy/linter-config

Single npm package **`@st1ggy/linter-config`** with **subpath exports**. Config sources live under [`src/`](src/) (ESLint, Prettier, Stylelint).

Install once:

```bash
npm i -D @st1ggy/linter-config
```

Framework-specific ESLint and Prettier plugins are optional peers, so installing this package does not install integrations for unused frameworks. The wizard installs only the selected stack's plugins as dev dependencies.

### Generate local wrapper configs

The published CLI is invoked as **`@st1ggy/linter-config`** (see [`package.json`](package.json) `bin`). Each run writes **`eslint.config.js`**, **`prettier.config.js`**, and **`stylelint.config.js`** as ESM re-exports for one stack.

Unless **`--skip-install`** is passed: if **`package.json`** exists in the target directory, the CLI runs the detected package manager (**npm** / **pnpm** / **yarn** / **bun** from the nearest lockfile) to install **`@st1ggy/linter-config`** and only the selected stack's integration plugins. When all selected packages are already declared but missing from `node_modules`, it runs a regular install instead.

Pick **at most one** stack flag (default **`--common`** if you omit all five):

**`--common` · `--react` · `--next` · `--svelte` · `--astro`**

**After** `npm i -D @st1ggy/linter-config`:

```bash
npx @st1ggy/linter-config init
npx @st1ggy/linter-config init --react
npx @st1ggy/linter-config migrate --svelte --dir ./apps/web
npx @st1ggy/linter-config init --astro
npm exec @st1ggy/linter-config -- init --common
```

**Without** installing the dependency first (`npx` will fetch **`@st1ggy/linter-config`**):

```bash
npx --yes @st1ggy/linter-config init
npx --yes @st1ggy/linter-config init --react
npx --yes @st1ggy/linter-config migrate --svelte --dir ./apps/web
npx --yes @st1ggy/linter-config init --astro
```

The CLI is interactive in a terminal. Command and stack flags preselect their values, then the wizard confirms the target directory, dependency installation, affected wrapper files, and (for migration) each legacy config file. Pass **`--skip-install`** only when `@st1ggy/linter-config` is already available or will be installed manually.

Older **`--eslint`** on the command line is still accepted for compatibility; **`--eslint`** is optional.

- **`init` / `create`** — create only missing files (skip existing).
- **`migrate` / `reinit`** — optionally remove selected legacy configs, then overwrite the three wrapper configs.

**Legacy filenames** (`.eslintrc.*`, `prettier.config.cjs`, extra copies, …) are presented one by one by `migrate`; no file is deleted without confirmation. [`scripts/remove-current.sh`](scripts/remove-current.sh) remains available as a standalone cleanup helper.

Your project should use **`"type": "module"`** (or `.mjs` config filenames) so the generated ESM re-exports load.

In this monorepo, `npm run config:init` / `config:migrate` / `config:reinit` / `config:create` run **`node ./scripts/linter-init.mjs … --dir ./examples/init-smoke`** (see [`scripts/README.md`](scripts/README.md)). The CLI **refuses** to write consumer stubs in the package root (`package.json` name `@st1ggy/linter-config`) so this repository’s dev configs are not overwritten.

## Subpath imports

```js
import eslintReact from '@st1ggy/linter-config/eslint-react'
import eslintAstro from '@st1ggy/linter-config/eslint-astro'
import prettierCommon from '@st1ggy/linter-config/prettier-common'
import prettierAstro from '@st1ggy/linter-config/prettier-astro'
import stylelintScss from '@st1ggy/linter-config/stylelint-scss'
```

The barrel export `@st1ggy/linter-config` re-exports ESLint/Prettier/Stylelint presets only (see [`src/index.js`](src/index.js)).

### Migration (Stylelint)

If you previously used Stylelint 16 with this preset, upgrade the consumer to **Stylelint 17** before depending on the latest release.

### Migration (v7)

**v7** requires **ESLint 10.8+**. Framework integration plugins are optional peers and are installed by the interactive CLI only for the selected stack.

### Migration from Biome presets

**v6** removes all **`@st1ggy/linter-config/biome`** and **`biome-*`** subpath exports. Use [Biome](https://biomejs.dev/) in your project directly with its own `biome.json`, or stay on ESLint + Prettier + Stylelint via this package.

### Development of this package

`npm install` uses [`.npmrc`](.npmrc) `legacy-peer-deps=true` (see earlier notes on `eslint-import-resolver-custom-alias`).

**Publishing:** this repo’s **root** `package.json` is the published `@st1ggy/linter-config`:

```bash
npm run publish:npm
```

(`npm publish --access public` — do not use a nested `package.json` for publishing.)

Releases are started manually from `Actions` → `Release` → `Run workflow`. It opens or updates a [Release Please](https://github.com/googleapis/release-please) PR with the version bump and generated changelog. Closing that PR without merging ends the release. Merging it triggers a separate workflow run that creates the tag and GitHub Release, checks the package, and publishes it. Release Please automatically creates a PR only for user-facing Conventional Commits (`feat`, `fix`, `perf`, or breaking changes); use the optional `release_as` input with an exact version to force a release for other changes. Configure npm Trusted Publishing for GitHub Actions with repository `St1ggy/linter-config` and workflow `release.yml` before enabling publication.

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
| `npm run config:migrate` | `migrate` selected legacy configs and overwrite wrappers |
| `npm run config:reinit` | alias for `config:migrate` |
| `npm run config:create` | same as `config:init` |
| `npm run config:remove-current` | interactive: offer to delete `*eslint*` / `*stylelint*` / `*prettier*` files in cwd (see [scripts/remove-current.sh](scripts/remove-current.sh)) |

## Optional ESLint add-ons

You can add **eslint-plugin-n**, **eslint-plugin-jsx-a11y**, **eslint-plugin-perfectionist**, or stricter **typescript-eslint** in your own config if needed.
