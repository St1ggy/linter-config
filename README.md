# st1ggy/linter-config

Single npm package **`@st1ggy/linter-config`** with **subpath exports**. Config sources live under [`src/`](src/) (ESLint, Oxlint, Oxfmt, Prettier, Stylelint).

Install once:

```bash
npm i -D @st1ggy/linter-config
```

Oxlint/Oxfmt engines and framework-specific plugins are optional peers. The wizard installs the selected stack's engines and integration plugins as dev dependencies.

### Generate local wrapper configs

The published CLI is invoked as **`@st1ggy/linter-config`** (see [`package.json`](package.json) `bin`). Each run writes a linter config, a formatter config and **`stylelint.config.js`** as re-exports for the selected stack. ESLint stacks use **`eslint.config.js`** and **`prettier.config.js`**. Common/React/Solid/Next Oxlint stacks use **`oxlint.config.ts`** and **`oxfmt.config.ts`**; Svelte/Astro Oxlint stacks use **`oxlint.config.ts`** and **`prettier.config.js`**.

Unless **`--skip-install`** is passed: if **`package.json`** exists in the target directory, the CLI runs the detected package manager (**npm** / **pnpm** / **yarn** / **bun** from the nearest lockfile) to install **`@st1ggy/linter-config`** and only the selected stack's integration plugins. When all selected packages are already declared but missing from `node_modules`, it runs a regular install instead.

Pick **at most one** stack flag (default **`--common`** if omitted):

**`--common` · `--react` · `--solid` · `--next` · `--svelte` · `--astro`**

**`--common-ox` · `--react-ox` · `--solid-ox` · `--next-ox` · `--svelte-ox` · `--astro-ox`**

**After** `npm i -D @st1ggy/linter-config`:

```bash
npx @st1ggy/linter-config init
npx @st1ggy/linter-config init --react
npx @st1ggy/linter-config init --solid
npx @st1ggy/linter-config init --solid-ox
npx @st1ggy/linter-config migrate --svelte --dir ./apps/web
npx @st1ggy/linter-config init --astro
npm exec @st1ggy/linter-config -- init --common
```

**Without** installing the dependency first (`npx` will fetch **`@st1ggy/linter-config`**):

```bash
npx --yes @st1ggy/linter-config init
npx --yes @st1ggy/linter-config init --react
npx --yes @st1ggy/linter-config init --solid
npx --yes @st1ggy/linter-config migrate --svelte --dir ./apps/web
npx --yes @st1ggy/linter-config init --astro
```

The CLI is interactive in a terminal. Command and stack flags preselect their values, then the wizard confirms the target directory, dependency installation, affected wrapper files, and (for migration) each legacy config file. Pass **`--skip-install`** only when `@st1ggy/linter-config` is already available or will be installed manually.

Older **`--eslint`** on the command line is still accepted for compatibility; **`--eslint`** is optional.

- **`init` / `create`** — create only missing files (skip existing).
- **`migrate` / `reinit`** — optionally remove selected legacy configs, then overwrite the selected stack's three wrapper configs.

**Legacy filenames** (`.eslintrc.*`, `.oxlintrc.*`, `.oxfmtrc.*`, `prettier.config.cjs`, extra copies, …) are presented one by one by `migrate`; no file is deleted without confirmation. Changing engines offers the other linter and formatter configs for removal during migration. [`scripts/remove-current.sh`](scripts/remove-current.sh) remains available as a standalone cleanup helper.

Your project should use **`"type": "module"`** (or `.mjs` config filenames) so the generated ESM re-exports load.

In this monorepo, `npm run config:init` / `config:migrate` / `config:reinit` / `config:create` run **`node ./scripts/linter-init.mjs … --dir ./examples/init-smoke`** (see [`scripts/README.md`](scripts/README.md)). The CLI **refuses** to write consumer stubs in the package root (`package.json` name `@st1ggy/linter-config`) so this repository’s dev configs are not overwritten.

## Subpath imports

```js
import eslintReact from '@st1ggy/linter-config/eslint-react'
import eslintSolid from '@st1ggy/linter-config/eslint-solid'
import eslintAstro from '@st1ggy/linter-config/eslint-astro'
import prettierCommon from '@st1ggy/linter-config/prettier-common'
import prettierAstro from '@st1ggy/linter-config/prettier-astro'
import stylelintScss from '@st1ggy/linter-config/stylelint-scss'
```

The barrel export `@st1ggy/linter-config` re-exports ESLint/Prettier/Stylelint presets only (see [`src/index.js`](src/index.js)).

### SolidJS

The `eslint-solid` preset extends `eslint-common` with [eslint-plugin-solid](https://github.com/solidjs-community/eslint-plugin-solid): recommended rules for JavaScript/JSX, TypeScript-aware rules for TypeScript/TSX, and JSX formatting rules. It checks reactive props, reactivity tracking, and Solid-specific JSX usage.

Use the wizard (`npx @st1ggy/linter-config init --solid`) or install the integration manually:

```bash
npm i -D @st1ggy/linter-config eslint-plugin-solid
```

```js
// eslint.config.js
export { default } from '@st1ggy/linter-config/eslint-solid'
```

The named export is `eslintSolid`. The Solid stack uses `prettier-common` and `stylelint-scss`. As with the React preset, source files must be included in the project's `tsconfig.json`; Solid projects normally use `"jsx": "preserve"` and `"jsxImportSource": "solid-js"`.

### Migration (Stylelint)

If you previously used Stylelint 16 with this preset, upgrade the consumer to **Stylelint 17** before depending on the latest release.

## Oxlint variants

Each existing stack has an Oxlint counterpart. The new configs are objects typed as `OxlintConfig`; the existing ESLint configs remain flat-config arrays.

| Stack flag    | Config import                     | Formatter         | Stylelint        |
| ------------- | --------------------------------- | ----------------- | ---------------- |
| `--common-ox` | `@st1ggy/linter-config/common-ox` | `oxfmt-common`    | `stylelint-scss` |
| `--react-ox`  | `@st1ggy/linter-config/react-ox`  | `oxfmt-common`    | `stylelint-scss` |
| `--solid-ox`  | `@st1ggy/linter-config/solid-ox`  | `oxfmt-common`    | `stylelint-scss` |
| `--next-ox`   | `@st1ggy/linter-config/next-ox`   | `oxfmt-common`    | `stylelint-scss` |
| `--svelte-ox` | `@st1ggy/linter-config/svelte-ox` | `prettier-svelte` | `stylelint-scss` |
| `--astro-ox`  | `@st1ggy/linter-config/astro-ox`  | `prettier-astro`  | `stylelint-scss` |

### Install and run

The checked engine versions are **Oxlint 1.86.0**, **oxlint-tsgolint 7.0.2003**, and **Oxfmt 0.71.0**, with native TypeScript 7 typed analysis. Use **Node.js 24.16.0+**. JS-plugin compatibility and the rule inventory are checked against these versions; the CLI installs the selected engines with exact versions.

```bash
npx @st1ggy/linter-config init --solid-ox
```

For manual Solid installation:

```bash
npm i -D @st1ggy/linter-config eslint-plugin-solid
npm i -D --save-exact oxlint@1.86.0 oxlint-tsgolint@7.0.2003 oxfmt@0.71.0
```

```ts
// oxlint.config.ts
export { default } from '@st1ggy/linter-config/solid-ox'
```

```ts
// oxfmt.config.ts
export { default } from '@st1ggy/linter-config/oxfmt-common'
```

```bash
npx oxlint .
npx oxfmt --check .
# Also report TypeScript errors:
npx oxlint --type-aware --type-check .
# Fix supported lint violations, then format:
npx oxlint --fix .
npx oxfmt --write .
```

Oxlint auto-discovers `oxlint.config.ts` and the applicable `tsconfig.json`. Remove options deleted in TypeScript 7, including `baseUrl`; make `paths` relative to the config instead. For Solid JSX, use `"jsx": "preserve"` and `"jsxImportSource": "solid-js"`. The wizard writes wrappers and installs integrations; it does not edit your tsconfig or package scripts.

When composing configs, specify `typeAware` at the **consumer root**; root-only options are not inherited through `extends`:

```ts
import config from '@st1ggy/linter-config/solid-ox'
import { defineConfig } from 'oxlint'

export default defineConfig({
  extends: [config],
  options: { typeAware: true },
  ignorePatterns: ['dist/**'],
})
```

### Oxfmt formatting

`common-ox`, `react-ox`, `solid-ox` and `next-ox` use Oxfmt for formatting. Their lint configs do not load `eslint-plugin-prettier` or execute `prettier/prettier`; run the formatter check alongside linting in CI. The generated `oxfmt.config.ts` imports `@st1ggy/linter-config/oxfmt-common` and is discovered automatically.

The shared config preserves the common style: 120-column width, two-space indentation, single quotes, no semicolons, trailing commas, LF and a final newline. **Import sorting and package.json sorting are explicitly disabled**; the current import lint rules retain control of import order. `.gitignore` and `.prettierignore` are respected during directory traversal. Oxfmt can format an explicitly named gitignored file; for deliberate exclusions, use `.prettierignore` or `ignorePatterns`.

Override options by spreading the shared object:

```ts
import config from '@st1ggy/linter-config/oxfmt-common'
import { defineConfig } from 'oxfmt'

export default defineConfig({
  ...config,
  ignorePatterns: [...(config.ignorePatterns ?? []), 'dist/**'],
})
```

`init` keeps an existing `prettier.config.js`; use `migrate` to offer it for removal when switching to Oxfmt. The wizard does not update consumer package scripts. A typical script pair is `"lint": "oxlint ."` and `"format:check": "oxfmt --check ."`.

Svelte/Astro and the original ESLint stacks keep their existing Prettier configs and plugins. Stylelint remains the style-rule tool for every stack. Prettier also remains a dependency for those integrations and this repository's generation/legacy checks.

### Rule coverage

The presets carry over native rule equivalents and compatible JS plugins, including custom severity, options, JSX style, import ordering and syntax restrictions. All default Oxlint categories are disabled; only migrated rules are enabled. Type-aware checks run through **tsgolint/TS7**. TS6 remains a library dependency for existing ESLint presets and some JS plugins; the new consumer command does not launch ESLint or create a TS6 type-checking Program.

These are **maximum-feasible migrations, with documented gaps**, rather than fully equivalent replacements:

- **Svelte/Astro:** Oxlint checks extracted scripts, not templates. Template-only checks and TS parser-service-dependent JS rules are unavailable. Checks that would misreport template-used variables are omitted for those scopes. Svelte script/module rules and aliases are retained where supported.
- **Astro:** six frontmatter-only script checks are preserved via an adapter (deprecated Astro APIs, deprecated `getEntryBySlug`, component exports and prerender location). Template directives are not checked. The plugin API cannot distinguish frontmatter from a browser script containing identical text; that ambiguity is recorded as partial coverage.
- Some native implementations have narrower behavior or lack source options. The original JS rule is used where compatible; remaining differences are recorded individually.
- Compiler configuration-dependent guards are kept, but default-configuration control fixtures do not count as positive violation evidence.
- Existing `eslint-disable` directives do not automatically retain their meaning after rule namespaces change. Use Oxlint directives with the migrated IDs and check `--report-unused-disable-directives` when migrating.

See [the generated rule mapping](docs/OXLINT_RULE_MAPPING.md) for counts and every partial/unsupported mapping. The migrated formatting check is accounted for with status `formatter`, not silently disabled. The full source scopes, rule options and evidence references are in `data/oxlint-*.json`; development tests keep paired source/target fixtures outside the published tarball.

### Migration (v8: native formatter)

`common-ox`, `react-ox`, `solid-ox` and `next-ox` use Oxfmt instead of Prettier. Their Oxlint command no longer checks formatting. To upgrade a consumer from v7:

1. Run the wizard with `migrate --<stack>-ox` and select the old formatter config for removal, or install `oxfmt@0.71.0` and create `oxfmt.config.ts` importing `@st1ggy/linter-config/oxfmt-common` manually.
2. Add `oxfmt --check .` alongside `oxlint .` in CI; replace the old `prettier --check .` command for that stack.
3. Run `oxlint --fix .` followed by `oxfmt --write .` when applying fixes, and review consumer-specific formatter overrides.

Svelte/Astro Oxlint stacks and the original ESLint stacks retain their Prettier workflow.

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

The `CI` GitHub Actions workflow runs linting, the original Solid tests, Oxlint/Oxfmt tests, explicit TS6 and native TS7 checks, inventory/generated-config checks, and packed-package smoke tests on pushes to `main` and pull requests. It checks Node.js `24.16.0` and `latest`, and installs tarballs with npm and isolated pnpm. A separate `format:ox:check` validates formatting with Oxfmt. The `Release` workflow runs these checks before publishing as well.

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
| `npm run format:ox:check` | Check repository formatting with the shared Oxfmt options |
| `npm run format:ox:compare` | Compare Oxfmt and Prettier on sources and rule fixtures without rewriting files |
| `npm run lint:fix` | Auto-fix ESLint, Stylelint, Prettier |
| `npm run inventory` | Regenerate [`data/linter-config-inventory.json`](data/linter-config-inventory.json) |
| `node --test scripts/solid-config.test.mjs` | Check Solid JSX/TSX linting and wrapper generation |
| `node scripts/package-smoke.mjs` | Check all six packed Oxlint stacks, their CLI/TS7 checks and legacy imports |
| `node scripts/package-smoke.mjs --pm pnpm` | Check the tarball using isolated pnpm dependencies |
| `npm run typecheck:ox` | Explicit native TypeScript 7 compiler check |
| `npm run test:ox` | Oxlint integration, rule parity and coverage guardrail tests |
| `npm run generate:ox` / `generate:ox:check` | Generate/verify the six Oxlint configurations and rule map |
| `npm run inventory:ox` / `inventory:ox:check` | Generate/verify source scopes, evidence and coverage reports |
| `npm run config:init` | `node ./scripts/linter-init.mjs init --common --dir ./examples/init-smoke` (skip existing); see [`scripts/README.md`](scripts/README.md) |
| `npm run config:migrate` | `migrate` selected legacy configs and overwrite wrappers |
| `npm run config:reinit` | alias for `config:migrate` |
| `npm run config:create` | same as `config:init` |
| `npm run config:remove-current` | interactive: offer to delete `*eslint*` / `*stylelint*` / `*prettier*` files in cwd (see [scripts/remove-current.sh](scripts/remove-current.sh)) |

## Optional ESLint add-ons

You can add **eslint-plugin-n**, **eslint-plugin-jsx-a11y**, **eslint-plugin-perfectionist**, or stricter **typescript-eslint** in your own config if needed.
