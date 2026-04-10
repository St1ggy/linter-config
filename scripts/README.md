# Consumer config helpers (monorepo root)

From this repository root, use the npm scripts in the root [`package.json`](../package.json). They run **`node ./scripts/linter-init.mjs`** against **[`examples/init-smoke`](../examples/init-smoke)** so we never write consumer stubs into the **`@st1ggy/linter-config`** package root (the CLI blocks that).

| Script                  | Effect                                                                                  |
| ----------------------- | --------------------------------------------------------------------------------------- |
| `npm run config:init`   | `init` — create missing `eslint.config.js`, `prettier.config.js`, `stylelint.config.js` |
| `npm run config:reinit` | `reinit` — overwrite those three files                                                  |
| `npm run config:create` | same as `config:init`                                                                   |

Each run installs **`@st1ggy/linter-config`** into `examples/init-smoke` when needed (unless you add **`--skip-install`** to the underlying command in `package.json`).

### Legacy config cleanup (optional)

**`reinit`** only overwrites `eslint.config.js`, `prettier.config.js`, and `stylelint.config.js`. It does **not** call [`remove-current.sh`](remove-current.sh): that script is **interactive** (prompts per file) and is meant for one-off migration when old filenames still sit next to the new wrappers. From the repo root: **`npm run config:remove-current`** (runs `bash ./scripts/remove-current.sh` in the current shell cwd — run from the directory you want to clean, or `cd` there first).

Direct CLI (paths from repo root — same entry as published **`@st1ggy/linter-config`**):

```bash
node ./scripts/linter-init.mjs init --react
node ./scripts/linter-init.mjs reinit --svelte --dir ./my-app
```

## Flags (published package)

The CLI is published under the name **`@st1ggy/linter-config`** (see [`package.json`](../package.json) `bin`). In another project **after** `npm i -D @st1ggy/linter-config`:

```bash
npx @st1ggy/linter-config init --common
npx @st1ggy/linter-config init --next
npm exec @st1ggy/linter-config -- reinit --svelte
```

**Without** installing first:

```bash
npx --yes @st1ggy/linter-config init --react
```

- **Stack (optional, default common):** `--common` | `--react` | `--next` | `--svelte` (at most one).
- **`--skip-install`:** only write wrapper files; do not run npm/pnpm/yarn/bun.

Shell shortcuts in this folder (`init-common.sh`, etc.) call **`node …/linter-init.mjs`** (same script as the published **`@st1ggy/linter-config`** CLI) with the matching stack; pass **`--skip-install`** through when needed.
