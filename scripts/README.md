# Consumer config helpers (monorepo root)

From this repository root, use the npm scripts in the root [`package.json`](../package.json). They run the CLI with **`--eslint --biome --common`** (full wrapper set for this repo’s default stack):

| Script | Effect |
| --- | --- |
| `npm run config:init` | `init` — create missing `eslint.config.js`, `prettier.config.js`, `stylelint.config.js`, `biome.json` |
| `npm run config:reinit` | `reinit` — overwrite those four files |
| `npm run config:create` | same as `config:init` |

Direct CLI (paths from repo root):

```bash
node packages/eslint/scripts/linter-init.mjs init --eslint --biome --react
node packages/eslint/scripts/linter-init.mjs reinit --biome --svelte --dir ./my-app
```

## Flags (published package)

The **`linter-config`** binary is declared in [`package.json`](../package.json) `bin`. In another project:

```bash
npx linter-config init --eslint --common
npx linter-config init --biome --next
npm exec linter-config -- reinit --eslint --biome --svelte
```

Without installing first:

```bash
npx --yes --package @st1ggy/linter-config linter-config init --eslint --react
```

- **`--eslint`** — `eslint.config.js` + `prettier.config.js` + `stylelint.config.js` (one stack).
- **`--biome`** — `biome.json`.
- **Stack (optional, default common):** `--common` | `--react` | `--next` | `--svelte` (at most one).

Shell shortcuts in [`packages/eslint/scripts/`](../packages/eslint/scripts/) (`init-common.sh`, etc.) call **`init --eslint`** with the matching stack only (no Biome).
