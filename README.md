# st1ggy/linter-config

Single npm package **`@st1ggy/linter-config`** with **subpath exports**. Config sources live under [`src/`](src/) (ESLint, Oxlint, Oxfmt, Prettier, Stylelint).

Install once:

```bash
npm i -D @st1ggy/linter-config
```

Oxlint/Oxfmt engines and framework-specific plugins are optional peers. The wizard installs the selected stack's engines and integration plugins as dev dependencies.

### Generate local wrapper configs

The published CLI is invoked as **`@st1ggy/linter-config`** (see [`package.json`](package.json) `bin`). ESLint stacks write **`eslint.config.js`**, **`prettier.config.js`** and **`stylelint.config.js`**. All nine Ox stacks write only **`oxlint.config.ts`**, **`oxfmt.config.ts`** and **`stylelint.config.js`**. They never generate or require an ESLint companion. Framework templates are not linted by Oxlint.

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
import eslintAstro from '@st1ggy/linter-config/eslint-astro'
import eslintReact from '@st1ggy/linter-config/eslint-react'
import eslintSolid from '@st1ggy/linter-config/eslint-solid'
import prettierAstro from '@st1ggy/linter-config/prettier-astro'
import prettierCommon from '@st1ggy/linter-config/prettier-common'
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

Each existing stack has an Oxlint counterpart. Angular, Vue and Nuxt have additional Ox presets. Oxlint configs are objects typed as `OxlintConfig`. All nine run with Oxlint + Oxfmt; Stylelint remains the CSS/SCSS rule tool. The old `eslint-*-ox` flat-config arrays remain optional compatibility exports, not part of the generated workflow.

All imports below are subpaths of `@st1ggy/linter-config`.

| Stack flag     | Oxlint preset | Formatter       | Optional compatibility export |
| -------------- | ------------- | --------------- | ----------------------------- |
| `--common-ox`  | `common-ox`   | `oxfmt-common`  | —                             |
| `--react-ox`   | `react-ox`    | `oxfmt-common`  | —                             |
| `--solid-ox`   | `solid-ox`    | `oxfmt-common`  | —                             |
| `--next-ox`    | `next-ox`     | `oxfmt-common`  | —                             |
| `--svelte-ox`  | `svelte-ox`   | `oxfmt-svelte`  | `eslint-svelte-ox`            |
| `--astro-ox`   | `astro-ox`    | `oxfmt-astro`   | `eslint-astro-ox`             |
| `--angular-ox` | `angular-ox`  | `oxfmt-angular` | `eslint-angular-ox`           |
| `--vue-ox`     | `vue-ox`      | `oxfmt-common`  | `eslint-vue-ox`               |
| `--nuxt-ox`    | `nuxt-ox`     | `oxfmt-common`  | `eslint-nuxt-ox`              |

### Install and run

The checked engine versions are **Oxlint 1.90.0**, **oxlint-tsgolint 7.0.2005**, and **Oxfmt 0.75.0**. The project compiler remains **TypeScript 6.0.3** (the latest stable 6.x); no TypeScript 7 compiler is installed. Use a supported **Node.js LTS** release, minimum **24.16.0**. The CLI installs engines with exact versions and only the selected script/formatter integrations, never ESLint or template parsers for Ox stacks. Svelte Ox formatting requires **Svelte 5**; Svelte 4 projects need an explicitly compatible older lint/format toolchain or an intentional runtime upgrade. This Ox stack does not upgrade an installed Svelte 4 runtime for you. Astro formatting additionally needs **`@astrojs/compiler-rs@^0.5.2`**, installed by the wizard.

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

Every Ox stack uses Oxfmt for formatting. Oxlint does not run `prettier/prettier`; run the formatter check alongside linting in CI. The generated `oxfmt.config.ts` imports the stack's formatter preset and is discovered automatically. Svelte/Astro explicitly enable their formatter integrations; Angular associates all `*.html` files with `angular-html`, including templates without a `.component.html` suffix. Vue/Nuxt files are recognized automatically.

The shared config preserves the common style: 120-column width, two-space indentation, single quotes, no semicolons, trailing commas, LF and a final newline. **Oxfmt owns import declaration sorting**: external/builtin imports, internal aliases (`@/`, `~/`), parent imports, sibling/index imports, then type imports, with empty lines between groups. Comments preserve explicit sorting partitions; empty lines alone do not. `sortSideEffects: false` preserves the relative order of bare side-effect imports, but they are not barriers by themselves: value imports can move across them. Separate order-sensitive sections with comments, or disable `sortImports` for those files. Oxfmt 0.75 cannot combine empty-line partitions with automatic empty lines between groups. Native `sort-imports` still sorts named specifiers, which Oxfmt 0.75 does not sort; `import-x/newline-after-import` retains the gap after imports. The competing `import-x/order` lint fixer is not executed in Ox stacks. Package.json property sorting stays disabled. `.gitignore` and `.prettierignore` are respected during directory traversal. Oxfmt can format an explicitly named gitignored file; for deliberate exclusions, use `.prettierignore` or `ignorePatterns`.

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

For every Ox stack, use `"lint": "oxlint ."` and `"format:check": "oxfmt --check ."`:

```bash
npx oxlint .
npx oxfmt --check .
```

Run `oxlint --fix .` before `oxfmt --write .`. This workflow intentionally has no template linting. Oxfmt delegates framework formatting to bundled Prettier integrations; formatting is not template validation. This is also not a claim that every rule is Rust-native: compatible JS plugins run inside Oxlint. ESLint remains a dependency for the legacy exports and some plugin APIs, but is not a second required command. The original ESLint stacks retain their Prettier workflow.

### Framework coverage

- **Svelte:** Oxlint checks extracted scripts and supported rune/module rules, not template directives or accessibility. Include `.svelte` files in the consumer tsconfig. SvelteKit aliases from the existing Svelte preset are retained.
- **Astro:** Oxlint checks frontmatter and browser scripts, including the existing six frontmatter adapters, not template directives or accessibility. Extracted scripts cannot distinguish every frontmatter/browser context.
- **Vue 3:** the common Ox preset supplies JS/TS checks and 36 native Vue rules from the upstream recommended intersection. Templates, including `v-for` key checks, are not linted. Bindings used only in templates are not treated as unused by script-only checks.
- **Nuxt:** builds on Vue and adds the four `@nuxt/eslint-plugin` rules through Oxlint's JS-plugin API. `.nuxt` and `.output` are ignored. This is a standalone preset, not the project-aware `@nuxt/eslint` module: generate Nuxt's types/config (`nuxt prepare`) before typed linting and use the application's tsconfig. It does not discover arbitrary auto-import globals from a Nuxt build.
- **Angular:** the common Ox preset supplies JS/TS checks; 12 `angular-eslint` 22 recommended script rules run as a JS plugin. Neither external HTML nor inline `@Component` templates receive template/accessibility lint checks. The wizard does not install or upgrade the application's Angular runtime. New framework integrations are tested independently of the six source-derived migration inventories.

### Rule coverage

The source-derived presets carry over native rule equivalents and compatible JS plugins, including custom severity, options, JSX style and syntax restrictions; import ordering is intentionally delegated to Oxfmt. All default Oxlint categories are disabled; presets explicitly select rules. Type-aware Oxlint checks run through **tsgolint**, which embeds a native TypeScript-derived engine independently of the project's **TypeScript 6** compiler. Its 7.x package version does not upgrade the project compiler. Oxlint does not provide a TypeScript Program to JS plugins.

These are **maximum-feasible migrations, with documented gaps**, rather than fully equivalent replacements:

- **Svelte/Astro/Vue/Nuxt/Angular:** templates are not linted by this workflow. The retained `eslint-*-ox` exports require explicit setup and their optional framework/template parser packages if you choose to restore such checks. Checks that would misreport template-used variables are omitted from script-only analysis.
- **Astro:** the Oxlint plugin API cannot distinguish frontmatter from a browser script containing identical text; that ambiguity remains recorded as partial coverage.
- Some native implementations have narrower behavior or lack source options. The original JS rule is used where compatible; remaining differences are recorded individually.
- Compiler configuration-dependent guards are kept, but default-configuration control fixtures do not count as positive violation evidence.
- Existing `eslint-disable` directives do not automatically retain their meaning after rule namespaces change. Use Oxlint directives with the migrated IDs and check `--report-unused-disable-directives` when migrating.

See [the generated rule mapping](docs/OXLINT_RULE_MAPPING.md) for the six source-derived presets' counts and partial/unsupported mappings. Angular/Vue/Nuxt compose the common preset and add separately tested integrations; they are not claimed to have full source/target rule parity. The migrated formatting check is accounted for with status `formatter`, not silently disabled. The full source scopes, rule options and evidence references are in `data/oxlint-*.json`; development tests keep paired source/target fixtures outside the published tarball.

### Migration to the all-Ox formatter workflow

All Ox stacks use Oxfmt instead of a separate Prettier command. To upgrade an existing consumer:

1. Run the wizard with `migrate --<stack>-ox`; review config replacements and select the old formatter config for removal. It installs the checked engine pins and selected integrations. Use the stack-specific formatter import from the table above when configuring manually.
2. Add `oxfmt --check .` alongside `oxlint .` in CI; replace the old `prettier --check .` command for that stack.
3. Remove `eslint .` from the Ox stack's package scripts. Existing ESLint files are preserved by both `init` and `migrate`; explicitly select old configs for removal if no longer needed. This intentionally drops template lint checks.
4. Run `oxlint --fix .`, then `oxfmt --write .`; review consumer-specific formatter overrides.

The original non-Ox ESLint stacks retain their Prettier workflow. No companion ESLint file is generated by an Ox stack, including on `migrate`.

### Curated quality checks

The base rules now reject unhandled/misused Promises, awaiting non-thenables, and loose equality (except intentional `== null`). Unnecessary assertions/type parameters, nullish coalescing for nullable objects, early returns and nesting beyond four levels start as warnings. Typed checks require an included tsconfig; `prefer-nullish-coalescing` requires `strictNullChecks`. Primitive fallbacks (`""`, `0`, `false`) are deliberately ignored by that rule so intentional `||` behavior is retained. Review fixes before applying them.

Deprecated `newline-before-return` and `jsx-props-no-multi-spaces` are disabled; existing statement-padding rules and Oxfmt retain their relevant layout responsibilities. `unicorn/name-replacements`, `unicorn/consistent-destructuring` and `unicorn/no-unused-properties` are off by default. They can be explicitly enabled in a consumer override as `unicorn-js/name-replacements`, `unicorn-js/consistent-destructuring` and `unicorn-js/no-unused-properties` for a stricter style. The experimental `prefer-optional-chain` and `no-unnecessary-condition` checks remain off.

Append strict overrides after the generated ones; a root-level rule can otherwise be overridden by a file profile:

```ts
import config from '@st1ggy/linter-config/common-ox'

export default {
  ...config,
  overrides: [
    ...config.overrides,
    {
      files: ['**/*.{js,jsx,ts,tsx,mts,cts,mjs,cjs}'],
      rules: {
        'unicorn-js/name-replacements': 'warn',
        'unicorn-js/consistent-destructuring': 'warn',
        'unicorn-js/no-unused-properties': 'warn',
      },
    },
  ],
}
```

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
