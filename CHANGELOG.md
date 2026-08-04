# Changelog

Notable changes to **`@st1ggy/linter-config`** (sources under [`src/`](src/)) are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Append release notes with:

```bash
npm run changelog
```

(Uses [Conventional Commits](https://www.conventionalcommits.org/) and [`conventional-changelog-cli`](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-cli) with the `conventionalcommits` preset.)

## [7.2.2](https://github.com/St1ggy/linter-config/compare/linter-config-v7.2.1...linter-config-v7.2.2) (2026-08-04)

### Bug Fixes

- **release:** format generated changelog ([445bf47](https://github.com/St1ggy/linter-config/commit/445bf47420e9f4b86e17dd577d6723e50f089a9a))

## [7.2.1](https://github.com/St1ggy/linter-config/compare/linter-config-v7.2.0...linter-config-v7.2.1) (2026-08-04)

### Bug Fixes

- **npm:** align repository URL for provenance ([2e5cbb8](https://github.com/St1ggy/linter-config/commit/2e5cbb815b0607118dd89cc1696b29af9708f050))

## [7.2.0](https://github.com/St1ggy/linter-config/compare/linter-config-v7.1.0...linter-config-v7.2.0) (2026-08-04)

### Features

- **release:** allow forced manual versions ([bfb133b](https://github.com/St1ggy/linter-config/commit/bfb133b237908203c208bd6de801ec1ca336168d))

## [7.1.0](https://github.com/St1ggy/linter-config/compare/linter-config-v7.0.1...linter-config-v7.1.0) (2026-08-04)

### Features

- **release:** publish after release PR merge ([7db4f32](https://github.com/St1ggy/linter-config/commit/7db4f32237e231247f3a201868345e5964a79a84))

### Bug Fixes

- **release:** separate manual publish retry ([c9ab755](https://github.com/St1ggy/linter-config/commit/c9ab755a0a493a5af2cf0c422acd33fc2d361cbe))

## [7.0.1](https://github.com/St1ggy/linter-config/compare/linter-config-v7.0.0...linter-config-v7.0.1) (2026-08-04)

### Bug Fixes

- **release:** use npm trusted publishing ([640580b](https://github.com/St1ggy/linter-config/commit/640580bf449f3343e72738c2aa79f1d565f201af))

## [7.0.0](https://github.com/St1ggy/linter-config/compare/linter-config-v6.3.2...linter-config-v7.0.0) (2026-08-04)

### ⚠ BREAKING CHANGES

- add Astro stack and release automation
- consolidate package at repo root; remove Biome
- single @st1ggy/linter-config package with packages/eslint and packages/biome
- extract Biome into packages/biome (@st1ggy/biome-config)
- monorepo layout and Biome presets under @st1ggy/linter-config
- import-related ESLint rules now use the import-x/* prefix. Update any consumer overrides from import/* to import-x/*.

### Features

- add Astro stack and release automation ([98da418](https://github.com/St1ggy/linter-config/commit/98da418c00404ce44e0ccad364a8a5545ac128a5))
- extract Biome into packages/biome (@st1ggy/biome-config) ([0af7d50](https://github.com/St1ggy/linter-config/commit/0af7d50fea9af97d5292f2be9093fd0d09ecabda))
- migrate to eslint-plugin-import-x and refresh toolchain ([ad4cd77](https://github.com/St1ggy/linter-config/commit/ad4cd7754afe0162b799b8119b9ed3a317376868))
- monorepo layout and Biome presets under @st1ggy/linter-config ([199cedb](https://github.com/St1ggy/linter-config/commit/199cedb0bd8b77b221237b90ac5efdb1a4e35d3b))
- single @st1ggy/linter-config package with packages/eslint and packages/biome ([78bba56](https://github.com/St1ggy/linter-config/commit/78bba56ccbb57a112d5f3ff2c9cb2b9287c60e0f))

### Bug Fixes

- **eslint:** prefer type over interface for object type aliases ([c6c6992](https://github.com/St1ggy/linter-config/commit/c6c69928646892c301f77babf06c6eebe5286bb0))
- **release:** set published version baseline ([745cf74](https://github.com/St1ggy/linter-config/commit/745cf7473fcf2cfd642954407a08c0684d2c6032))
- **types:** ambient declarations for package exports ([f7f74ca](https://github.com/St1ggy/linter-config/commit/f7f74caaadf7226fcecd8e716c5c65015ab7220c))

### Code Refactoring

- consolidate package at repo root; remove Biome ([1bc2c61](https://github.com/St1ggy/linter-config/commit/1bc2c6144dec517c00378989c5b28c1b42555a33))

## [6.3.2](https://github.com/st1ggy/linter-config/compare/v6.3.1...v6.3.2) - 2026-04-10

### Fixed

- **TypeScript:** `index.d.ts` is an ambient script again (no top-level `import`/`export`), so `declare module '@st1ggy/linter-config/…'` defines subpath types instead of augmenting them — fixes **TS2666** and duplicate `config` errors. Stylelint types use `import type * as Stylelint` for `export =` compatibility.

## [6.3.1](https://github.com/st1ggy/linter-config/compare/v6.3.0...v6.3.1) - 2026-04-10

### Fixed

- **TypeScript:** `@typescript-eslint/consistent-type-definitions` now reliably en **`type`** (not `interface`). The `typescript-eslint` **stylistic** preset enabled the rule as `error` without an option, which defaults to **`interface`**; that layer is stripped and the rule is set to `['error', 'type']` in the type-aware config.

## [6.3.0](https://github.com/st1ggy/linter-config/compare/v6.2.0...v6.3.0) - 2026-04-10

### BREAKING CHANGES

- **CLI invocation:** document and prefer **`npx @st1ggy/linter-config …`** / **`npm exec @st1ggy/linter-config -- …`**. The `bin` key is explicitly **`@st1ggy/linter-config`** (npm may still add an unscoped `linter-config` shim in `node_modules/.bin`; do not rely on the bare name in docs or scripts).

## [6.2.0](https://github.com/st1ggy/linter-config/compare/v6.1.0...v6.2.0) - 2026-04-10

### Added

- **`linter-config`** now installs **`@st1ggy/linter-config`** when **`package.json`** is present and the package is not yet resolvable from **`node_modules`** (walking upward for hoisted installs). Uses **npm**, **pnpm**, **yarn**, or **bun** from the nearest lockfile. **`--skip-install`** disables this.
- Refuses to write consumer stubs in the published package source root; **`npm run config:*`** targets [`examples/init-smoke`](examples/init-smoke).

### Changed

- Shell **`init-*.sh`** comments updated; they forward **`--skip-install`** and other args.

## [6.1.0](https://github.com/st1ggy/linter-config/compare/v6.0.0...v6.1.0) - 2026-04-10

### Changed (repository layout)

- **Flat tree:** development sources moved from `packages/eslint/` to the repository root (`src/`, `scripts/`, `data/`, `docs/`). npm **workspaces** were removed; `npm run lint` and `npm run inventory` run from the root. Published **subpath exports** and tarball contents are unchanged for consumers.

## [6.0.0](https://github.com/st1ggy/linter-config/compare/v5.0.0...v6.0.0) - 2026-04-10

### BREAKING CHANGES

- **Removed Biome:** all **`biome`** and **`biome-*`** package exports, `packages/biome` sources, and the **`@biomejs/biome`** peer/dev dependency. This package ships **ESLint, Prettier, and Stylelint** presets only.
- **`linter-config` CLI:** always writes `eslint.config.js`, `prettier.config.js`, and `stylelint.config.js` for the chosen stack. **`--eslint`** is optional (accepted for compatibility). **`--biome`** is ignored with a warning (use Biome separately in your project if needed).

## [5.0.0](https://github.com/st1ggy/linter-config/compare/v4.0.0...v5.0.0) - 2026-04-10

### BREAKING CHANGES

- **`biome-svelte`:** enables `html.experimentalFullSupportEnabled`, aligns `html.formatter` with common (including `lineWidth` 120 and `indentScriptAndStyle: true`), and sets **`a11y`** recommended rules (parity with `biome-react`). Projects that extend this subpath may see **new lint failures** and **different `.svelte` formatting** than with `@st1ggy/linter-config@4.x`. Use one formatter for `.svelte` if Prettier (or another formatter) is also in play.

## [4.0.0](https://github.com/st1ggy/linter-config/compare/v3.0.0...v4.0.0) - 2026-04-10

### Summary

Single npm package **`@st1ggy/linter-config`** is published from the **repository root**. Development sources live in two private workspaces:

- [`packages/eslint`](packages/eslint) — ESLint, Prettier, Stylelint
- [`packages/biome`](packages/biome) — Biome JSON presets

### ⚠ BREAKING CHANGES

- **One install:** `npm i -D @st1ggy/linter-config` — Biome presets are **`@st1ggy/linter-config/biome-*`** subpaths, not a separate `@st1ggy/biome-config` (or legacy `@st1ggy/linter-config-biome`) npm package.
- **Monorepo layout:** published `package.json` and `exports` are at the repo root; `packages/eslint` and `packages/biome` are not published on their own.
- **Svelte preset files** use names such as `eslint-svelte.config.js`, `prettier-svelte.config.js`, `svelte-stack.js`; public subpath `exports` (`/eslint-svelte`, `/prettier-svelte`, etc.) stay the same for consumers.

### Features

- Subpath exports for `eslint-common`, `eslint-react`, `eslint-next`, `eslint-svelte`, `prettier-common`, `prettier-svelte`, `stylelint-scss`, `biome`, `biome-common`, `biome-react`, `biome-next`, `biome-svelte`.
- Root and workspace scripts for linting each tree (`npm run lint`, `lint:eslint`, `lint:biome`, `lint:fix`, …).
- **`linter-config` CLI** (`bin`): `init` / `reinit` / `create` with `--eslint`, `--biome`, and stack flags `--common` | `--react` | `--next` | `--svelte` (with `--eslint`, Prettier and Stylelint wrappers are written together).
- Machine-readable rule inventory at `data/linter-config-inventory.json` (regenerate with `npm run inventory`); mapping notes in `docs/RULE_MAPPING.md`.
