# st1ggy/linter-config

Single npm package **`@st1ggy/linter-config`** with **subpath exports**. Config sources live under [`src/`](src/) (ESLint, Oxlint, Oxfmt, Prettier, Stylelint).

Install once:

```bash
npm i -D @st1ggy/linter-config
```

Oxlint/Oxfmt engines and framework-specific plugins are optional peers. The wizard installs the selected stack's engines and integration plugins as dev dependencies.

### Generate local wrapper configs

The published CLI is invoked as **`@st1ggy/linter-config`** (see [`package.json`](package.json) `bin`). ESLint stacks write **`eslint.config.js`**, **`prettier.config.js`** and **`stylelint.config.js`**. All nine Ox stacks write **`oxlint.config.ts`**, **`oxfmt.config.ts`** and **`stylelint.config.js`**. Svelte, Astro, Angular, Vue and Nuxt additionally write **`eslint.config.js`** for framework/template checks that Oxlint cannot replace.

Unless **`--skip-install`** is passed: if **`package.json`** exists in the target directory, the CLI runs the detected package manager (**npm** / **pnpm** / **yarn** / **bun** from the nearest lockfile) to install **`@st1ggy/linter-config`** and only the selected stack's integration plugins. When all selected packages are already declared but missing from `node_modules`, it runs a regular install instead.

Pick **at most one** stack flag (default **`--common`** if omitted):

**`--common` · `--react` · `--solid` · `--next` · `--svelte` · `--astro`**

**`--common-ox` · `--react-ox` · `--solid-ox` · `--next-ox` · `--svelte-ox` · `--astro-ox`**

**`--angular-ox` · `--vue-ox` · `--nuxt-ox`**

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
- **`migrate` / `reinit`** — optionally remove selected legacy configs, then overwrite the selected stack's three or four wrapper configs.

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

Each existing stack has an Oxlint counterpart. Angular, Vue and Nuxt have additional Ox presets. Oxlint configs are objects typed as `OxlintConfig`; ESLint companions are flat-config arrays. Stylelint remains the style-rule tool for every stack.

All imports below are subpaths of `@st1ggy/linter-config`.

| Stack flag     | Oxlint preset | Formatter       | ESLint companion    |
| -------------- | ------------- | --------------- | ------------------- |
| `--common-ox`  | `common-ox`   | `oxfmt-common`  | —                   |
| `--react-ox`   | `react-ox`    | `oxfmt-common`  | —                   |
| `--solid-ox`   | `solid-ox`    | `oxfmt-common`  | —                   |
| `--next-ox`    | `next-ox`     | `oxfmt-common`  | —                   |
| `--svelte-ox`  | `svelte-ox`   | `oxfmt-svelte`  | `eslint-svelte-ox`  |
| `--astro-ox`   | `astro-ox`    | `oxfmt-astro`   | `eslint-astro-ox`   |
| `--angular-ox` | `angular-ox`  | `oxfmt-angular` | `eslint-angular-ox` |
| `--vue-ox`     | `vue-ox`      | `oxfmt-common`  | `eslint-vue-ox`     |
| `--nuxt-ox`    | `nuxt-ox`     | `oxfmt-common`  | `eslint-nuxt-ox`    |

### Install and run

The checked engine versions are **Oxlint 1.90.0**, **oxlint-tsgolint 7.0.2005**, and **Oxfmt 0.75.0**. The project compiler remains **TypeScript 6.0.3** (the latest stable 6.x); no TypeScript 7 compiler is installed. Use a supported **Node.js LTS** release, minimum **24.16.0**. The CLI installs engines with exact versions and only the selected framework integrations. Companion stacks also install **ESLint 10.14.0** directly so `pnpm exec eslint` works without relying on hoisting. Svelte Ox formatting requires **Svelte 5**; Svelte 4 projects need an explicitly compatible older lint/format toolchain or an intentional runtime upgrade. This Ox stack does not upgrade an installed Svelte 4 runtime for you. Astro formatting additionally needs **`@astrojs/compiler-rs@^0.5.2`**, installed by the wizard.

```bash
npx @st1ggy/linter-config init --solid-ox
```

For manual Solid installation:

```bash
npm i -D @st1ggy/linter-config eslint-plugin-solid
npm i -D --save-exact oxlint@1.90.0 oxlint-tsgolint@7.0.2005 oxfmt@0.75.0
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

Oxlint auto-discovers `oxlint.config.ts` and the applicable `tsconfig.json`. The project stays on TypeScript 6; do not migrate it to TypeScript 7 for this preset. Oxlint's bundled native typed-lint engine has its own configuration constraints: for example, it does not support `baseUrl`. If your TS6 project relies on such options, evaluate a separate Oxlint tsconfig or keep ESLint typed linting rather than changing the project's compiler. For Solid JSX, use `"jsx": "preserve"` and `"jsxImportSource": "solid-js"`. The wizard writes wrappers and installs integrations; it does not edit your tsconfig or package scripts.

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

Every Ox stack uses Oxfmt for formatting. Oxlint and companion ESLint configs do not run `prettier/prettier`; run the formatter check alongside linting in CI. The generated `oxfmt.config.ts` imports the stack's formatter preset and is discovered automatically. Svelte/Astro explicitly enable their formatter integrations; Angular associates all `*.html` files with `angular-html`, including templates without a `.component.html` suffix. Vue/Nuxt files are recognized automatically.

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

`init` preserves existing configs, including custom ESLint companions and old Prettier wrappers. Use `migrate` to overwrite wrappers and offer the old formatter config for removal. The wizard does not update consumer package scripts.

For common/React/Solid/Next, use `"lint": "oxlint ."` and `"format:check": "oxfmt --check ."`. For Svelte/Astro/Angular/Vue/Nuxt, **run all three commands**:

```bash
npx oxlint .
npx eslint .
npx oxfmt --check .
```

For example, `"lint": "oxlint . && eslint ."` and `"format:check": "oxfmt --check ."`. Run both linters' fixes before `oxfmt --write .`. Omitting the ESLint command loses template checks. Oxfmt delegates framework formatting to bundled Prettier integrations; it is not an entirely Rust-native template formatter. The original ESLint stacks retain their Prettier configs and plugins. Prettier also remains a package dependency for Stylelint and legacy/development checks.

### Framework coverage

- **Svelte:** Oxlint checks extracted scripts and supported rune/module rules; the ESLint companion retains framework/template rules with the Svelte parser. Include `.svelte` files in the consumer tsconfig. SvelteKit aliases from the existing Svelte preset are retained.
- **Astro:** Oxlint checks frontmatter and browser scripts, including the existing six frontmatter adapters. The ESLint companion uses the actual Astro parser/processor for template directives. Some script checks intentionally overlap because extracted scripts cannot distinguish every frontmatter/browser context.
- **Vue 3:** the common Ox preset supplies JS/TS checks and 36 native Vue rules from the upstream recommended intersection. The ESLint companion supplies the remaining Vue recommended/template checks using `vue-eslint-parser` and the TS parser. Rules already enabled natively are disabled in the companion. Bindings used only in templates are not treated as unused by script-only checks.
- **Nuxt:** builds on Vue and adds the four `@nuxt/eslint-plugin` rules through Oxlint's JS-plugin API. `.nuxt` and `.output` are ignored. This is a standalone preset, not the project-aware `@nuxt/eslint` module: generate Nuxt's types/config (`nuxt prepare`) before typed linting and use the application's tsconfig. It does not discover arbitrary auto-import globals from a Nuxt build.
- **Angular:** the common Ox preset supplies JS/TS checks; 12 `angular-eslint` 22 recommended script rules run as a JS plugin. ESLint handles HTML templates and inline `@Component` templates, including recommended and accessibility rules. The wizard does not install or upgrade the application's Angular runtime. New framework integrations are tested independently of the six source-derived migration inventories.

### Rule coverage

The source-derived presets carry over native rule equivalents and compatible JS plugins, including custom severity, options, JSX style, import ordering and syntax restrictions. All default Oxlint categories are disabled; presets explicitly select rules. Type-aware Oxlint checks run through **tsgolint**, which embeds a native TypeScript-derived engine independently of the project's **TypeScript 6** compiler. Its 7.x package version does not upgrade the project compiler. The separate ESLint companions use their framework parsers and may use TS6 parser services; Oxlint itself does not provide these services to JS plugins.

These are **maximum-feasible migrations, with documented gaps**, rather than fully equivalent replacements:

- **Svelte/Astro/Vue/Nuxt:** Oxlint checks extracted scripts, not templates. The ESLint companions retain framework/template checks, but do not restore every unsupported general-purpose TS-aware rule from the original common ESLint preset. Checks that would misreport template-used variables are omitted from script-only analysis.
- **Astro:** the Oxlint plugin API cannot distinguish frontmatter from a browser script containing identical text; that ambiguity remains recorded as partial coverage even with a precise ESLint companion.
- Some native implementations have narrower behavior or lack source options. The original JS rule is used where compatible; remaining differences are recorded individually.
- Compiler configuration-dependent guards are kept, but default-configuration control fixtures do not count as positive violation evidence.
- Existing `eslint-disable` directives do not automatically retain their meaning after rule namespaces change. Use Oxlint directives with the migrated IDs and check `--report-unused-disable-directives` when migrating.

See [the generated rule mapping](docs/OXLINT_RULE_MAPPING.md) for the six source-derived presets' counts and partial/unsupported mappings. Angular/Vue/Nuxt compose the common preset and add separately tested integrations; they are not claimed to have full source/target rule parity. The migrated formatting check is accounted for with status `formatter`, not silently disabled. The full source scopes, rule options and evidence references are in `data/oxlint-*.json`; development tests keep paired source/target fixtures outside the published tarball.

### Migration to the all-Ox formatter workflow

All Ox stacks use Oxfmt instead of a separate Prettier command. To upgrade an existing consumer:

1. Run the wizard with `migrate --<stack>-ox`; review config replacements and select the old formatter config for removal. It installs the checked engine pins and selected integrations. Use the stack-specific formatter import from the table above when configuring manually.
2. Add `oxfmt --check .` alongside `oxlint .` in CI; replace the old `prettier --check .` command for that stack.
3. For Svelte/Astro/Angular/Vue/Nuxt, keep the generated `eslint.config.js` and run `eslint .` alongside Oxlint for framework/template checks.
4. Run `oxlint --fix .`, the companion `eslint --fix .` where applicable, then `oxfmt --write .`; review consumer-specific formatter overrides.

The original non-Ox ESLint stacks retain their Prettier workflow. An old custom ESLint wrapper is preserved by `init`; migrate explicitly if you want the new companion instead of the full legacy preset.

### React and Next rule migration (v8)

React/Next presets now use `@eslint-react/eslint-plugin` instead of `eslint-plugin-react`, including their Oxlint adapters. The modern recommended preset adds React 19 migration, server-function, DOM safety and effect-cleanup checks. The official `eslint-plugin-react-hooks` remains responsible for hooks; overlapping modern-plugin aliases are disabled to avoid duplicate diagnostics.

Retained custom checks include button types, `useState` destructuring/naming, unstable context values, useless fragments, and component display names. Self-closing JSX moves to `@stylistic/jsx-self-closing-comp`. Similar modern rules are not guaranteed to report exactly the same cases or severities as their legacy counterparts; the generated [rule mapping](docs/OXLINT_RULE_MAPPING.md) records the active configuration.

The legacy checks for `propTypes`/`defaultProps`, boolean-prop naming, prop destructuring, arrow-only component definitions, boolean-value and fragment shorthand, handler naming, and one-component-per-file are no longer enforced. Legacy `jsx-no-leaked-render` is also removed: the modern type-checked conditional-rendering check is not enabled by the selected recommended preset. Legacy JSX undefined-name, duplicate-prop, unescaped-entity, target-blank and deprecated-API diagnostics are not retained as an identical rule set; use TypeScript and explicitly configured project rules where needed. This is a deliberate rule-set change, not a compatibility-preserving plugin rename.

### Migration (v7)

**v7** requires **ESLint 10.8+**. Framework integration plugins are optional peers and are installed by the interactive CLI only for the selected stack.

### Migration from Biome presets

**v6** removes all **`@st1ggy/linter-config/biome`** and **`biome-*`** subpath exports. Use [Biome](https://biomejs.dev/) in your project directly with its own `biome.json`, or stay on ESLint + Prettier + Stylelint via this package.

### Development of this package

Installs use [`.npmrc`](.npmrc) `strict-peer-deps=true`; no legacy peer-resolution bypass is required. Import aliases use the TypeScript resolver and do not require the old `eslint-import-resolver-custom-alias` or `eslint-plugin-import`. Astro's optional accessibility integration uses `eslint-plugin-jsx-a11y-x`, which declares ESLint 10 support.

Security audit is not yet clean: [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249) affects the transitive `minimatch` v3/v10 releases required by ESLint, TypeScript ESLint, import/accessibility/Sonar plugins, and `doiuse → multimatch`. These ranges do not admit the fixed v11 release. Updating pnpm removes the previous high-severity findings, but eliminating the remaining moderate findings requires upstream-compatible fixes or separately reviewed backports. A blanket major-version override is intentionally not used; root overrides would not protect consumers of the published config either.

**Publishing:** this repo’s **root** `package.json` is the published `@st1ggy/linter-config`:

```bash
npm run publish:npm
```

(`npm publish --access public` — do not use a nested `package.json` for publishing.)

Releases are started manually from `Actions` → `Release` → `Run workflow`. It opens or updates a [Release Please](https://github.com/googleapis/release-please) PR with the version bump and generated changelog. Closing that PR without merging ends the release. Merging it triggers a separate workflow run that creates the tag and GitHub Release, checks the package, and publishes it. Release Please automatically creates a PR only for user-facing Conventional Commits (`feat`, `fix`, `perf`, or breaking changes); use the optional `release_as` input with an exact version to force a release for other changes. Configure npm Trusted Publishing for GitHub Actions with repository `St1ggy/linter-config` and workflow `release.yml` before enabling publication.

## Toolchain (this repo)

The `CI` GitHub Actions workflow runs linting, the original Solid tests, Oxlint/Oxfmt tests, TypeScript 6 compiler/declaration checks, inventory/generated-config checks, and packed-package smoke tests on pushes to `main` and pull requests. It checks Node.js `24.16.0` and `lts/*` (latest LTS, not Current), and installs tarballs with npm and isolated pnpm. A separate `format:ox:check` validates formatting with Oxfmt. The `Release` workflow uses the latest Node.js LTS and runs these checks before publishing as well.

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
| `node scripts/package-smoke.mjs` | Check all nine packed Oxlint stacks, their CLI/typed lint checks and legacy imports |
| `node scripts/package-smoke.mjs --pm pnpm` | Check the tarball using isolated pnpm dependencies |
| `npm run typecheck` | TypeScript 6 compiler check |
| `npm run test:ox` | Oxlint integration, rule parity and coverage guardrail tests |
| `npm run generate:ox` / `generate:ox:check` | Generate/verify the six Oxlint configurations and rule map |
| `npm run inventory:ox` / `inventory:ox:check` | Generate/verify source scopes, evidence and coverage reports |
| `npm run config:init` | `node ./scripts/linter-init.mjs init --common --dir ./examples/init-smoke` (skip existing); see [`scripts/README.md`](scripts/README.md) |
| `npm run config:migrate` | `migrate` selected legacy configs and overwrite wrappers |
| `npm run config:reinit` | alias for `config:migrate` |
| `npm run config:create` | same as `config:init` |
| `npm run config:remove-current` | interactive: offer to delete `*eslint*` / `*stylelint*` / `*prettier*` files in cwd (see [scripts/remove-current.sh](scripts/remove-current.sh)) |

## Optional ESLint add-ons

You can add **eslint-plugin-n**, **eslint-plugin-jsx-a11y-x**, **eslint-plugin-perfectionist**, or stricter **typescript-eslint** in your own config if needed. Check each integration's ESLint peer range.
