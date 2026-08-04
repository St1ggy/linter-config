# Consumer config helpers (monorepo root)

From this repository root, use the npm scripts in the root [`package.json`](../package.json). They run **`node ./scripts/linter-init.mjs`** against **[`examples/init-smoke`](../examples/init-smoke)** so we never write consumer stubs into the **`@st1ggy/linter-config`** package root (the CLI blocks that).

| Script                   | Effect                                                                                  |
| ------------------------ | --------------------------------------------------------------------------------------- |
| `npm run config:init`    | `init` — create missing `eslint.config.js`, `prettier.config.js`, `stylelint.config.js` |
| `npm run config:migrate` | `migrate` — optionally remove legacy configs, then overwrite the three wrappers         |
| `npm run config:reinit`  | alias for `config:migrate`                                                              |
| `npm run config:create`  | same as `config:init`                                                                   |

Each run installs **`@st1ggy/linter-config`** and only the selected stack's integration plugins into `examples/init-smoke` when needed (unless you add **`--skip-install`** to the underlying command in `package.json`).

### Legacy config cleanup (optional)

**`migrate`** presents every legacy config file for confirmation before it overwrites `eslint.config.js`, `prettier.config.js`, and `stylelint.config.js`. [`remove-current.sh`](remove-current.sh) remains available as a standalone cleanup helper. From the repo root: **`npm run config:remove-current`**.

Direct CLI (paths from repo root — same entry as published **`@st1ggy/linter-config`**):

```bash
node ./scripts/linter-init.mjs init --react
node ./scripts/linter-init.mjs migrate --svelte --dir ./my-app
node ./scripts/linter-init.mjs init --astro
```

## Flags (published package)

The CLI is published under the name **`@st1ggy/linter-config`** (see [`package.json`](../package.json) `bin`). In another project **after** `npm i -D @st1ggy/linter-config`:

```bash
npx @st1ggy/linter-config init --common
npx @st1ggy/linter-config init --next
npm exec @st1ggy/linter-config -- migrate --svelte
```

**Without** installing first:

```bash
npx --yes @st1ggy/linter-config init --astro
```

- **Stack (optional, default common):** `--common` | `--react` | `--next` | `--svelte` | `--astro` (at most one).
- **`--skip-install`:** only write wrapper files; do not run npm/pnpm/yarn/bun.
- Every CLI command opens an interactive wizard. `init` creates missing wrappers; `migrate` can remove selected legacy configs and replaces wrappers.

Shell shortcuts in this folder (`init-common.sh`, etc.) call **`node …/linter-init.mjs`** (same script as the published **`@st1ggy/linter-config`** CLI) with the matching stack; pass **`--skip-install`** through when needed.
