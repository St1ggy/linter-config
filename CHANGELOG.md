# Changelog

Notable changes to **`@st1ggy/linter-config`** (sources under [`src/`](src/)) are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Append release notes with:

```bash
npm run changelog
```

(Uses [Conventional Commits](https://www.conventionalcommits.org/) and [`conventional-changelog-cli`](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-cli) with the `conventionalcommits` preset.)

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
