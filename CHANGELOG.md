# Changelog

Notable changes to **`@st1ggy/linter-config`** (sources under [`packages/eslint`](packages/eslint) and [`packages/biome`](packages/biome)) are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Append release notes with:

```bash
npm run changelog
```

(Uses [Conventional Commits](https://www.conventionalcommits.org/) and [`conventional-changelog-cli`](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-cli) with the `conventionalcommits` preset.)

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
