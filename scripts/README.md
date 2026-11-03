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
node ./scripts/linter-init.mjs init --solid --dir ./my-solid-app
node ./scripts/linter-init.mjs migrate --svelte --dir ./my-app
node ./scripts/linter-init.mjs init --astro
```

## Flags (published package)

The CLI is published under the name **`@st1ggy/linter-config`** (see [`package.json`](../package.json) `bin`). In another project **after** `npm i -D @st1ggy/linter-config`:

```bash
npx @st1ggy/linter-config init --common
npx @st1ggy/linter-config init --next
npx @st1ggy/linter-config init --solid
npm exec @st1ggy/linter-config -- migrate --svelte
```

**Without** installing first:

```bash
npx --yes @st1ggy/linter-config init --astro
```

- **ESLint stacks:** `--common` | `--react` | `--solid` | `--next` | `--svelte` | `--astro`.
- **Oxlint stacks:** `--common-ox` | `--react-ox` | `--solid-ox` | `--next-ox` | `--svelte-ox` | `--astro-ox` | `--angular-ox` | `--vue-ox` | `--nuxt-ox`.
- Select at most one stack; the default is `common`.
- **`--skip-install`:** only write wrapper files; do not run npm/pnpm/yarn/bun.
- Every CLI command opens an interactive wizard. `init` creates missing wrappers; `migrate` can remove selected legacy configs and replaces wrappers.

Shell shortcuts in this folder (`init-common.sh`, etc.) call **`node …/linter-init.mjs`** (same script as the published **`@st1ggy/linter-config`** CLI) with the matching stack; pass **`--skip-install`** through when needed.

For SolidJS, `init-solid.sh` selects `eslint-solid`, `prettier-common`, and `stylelint-scss`, and installs `eslint-plugin-solid` alongside `@st1ggy/linter-config`.

## Oxlint wrappers

The nine `init-*-ox.sh` shortcuts select the corresponding `*-ox` stack. All write `oxlint.config.ts`, `oxfmt.config.ts` and `stylelint.config.js`. Svelte/Astro/Angular/Vue/Nuxt also write `eslint.config.js` for framework/template checks and install `eslint@10.14.0` directly. The wizard pins `oxlint@1.90.0`, `oxlint-tsgolint@7.0.2005` and `oxfmt@0.75.0` and installs only the selected framework integrations. Svelte Ox requires Svelte 5; Astro formatting requires `@astrojs/compiler-rs`. The Angular runtime and generated Nuxt project types remain the application's responsibility.

```bash
npx @st1ggy/linter-config init --react-ox
npx @st1ggy/linter-config migrate --astro-ox
node ./scripts/linter-init.mjs init --solid-ox --dir ./my-app --skip-install
npx @st1ggy/linter-config init --angular-ox
npx @st1ggy/linter-config init --vue-ox
npx @st1ggy/linter-config init --nuxt-ox
```

`init` preserves existing wrappers, including the other linter/formatter config. `migrate` offers the opposite configs and old `.oxlintrc.*`/`.oxfmtrc.*` files for removal before generating the selected wrappers. It never deletes them without confirmation.

For every Ox stack, run `oxlint .` and `oxfmt --check .` separately. Also run `eslint .` for Svelte/Astro/Angular/Vue/Nuxt; otherwise template checks are lost. These configs do not run Prettier's JS rule. `oxfmt --write .` formats after lint fixes; import and package.json sorting are disabled. The shared formatter options are available through `@st1ggy/linter-config/oxfmt-common`; Svelte/Astro/Angular use `oxfmt-svelte`, `oxfmt-astro` and `oxfmt-angular` respectively.

The project compiler stays on TypeScript 6. Oxlint uses its own tsgolint engine for typed linting; it does not install or replace the project compiler. That engine has independent tsconfig constraints (such as no `baseUrl` support); the generator does not modify consumer configs. Read the [usage guide](../README.md#oxlint-variants) and [coverage report](../docs/OXLINT_RULE_MAPPING.md) before switching. The generated inventory covers the six source-derived presets; Angular/Vue/Nuxt compose the common preset and have separate integration tests. ESLint companions restore framework/template checks, not every unsupported general-purpose typed rule.

## Oxlint development checks

```bash
node scripts/oxlint-inventory.mjs --source-only
npm run generate:ox
npm run inventory:ox
npm run generate:ox:check
npm run inventory:ox:check
npm run test:ox
npm run format:ox:check
npm run format:ox:compare
npm run typecheck
node scripts/package-smoke.mjs
node scripts/package-smoke.mjs --pm pnpm
```

The parity corpus asserts source and target diagnostics; guardrails reject missing mappings, option/severity drift, absent fixtures and unverified claims of complete SFC coverage. Inventory regeneration is deterministic and does not silently adopt new upstream rules: generated artifacts and fixtures must be reviewed together after dependency updates.
