# Changelog

All notable changes to **`@st1ggy/linter-config`** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html). Published versions refer to the package in [`packages/eslint`](packages/eslint).

Release notes for new versions are appended with:

```bash
npm run changelog
```

(Requires [Conventional Commits](https://www.conventionalcommits.org/) messages; uses [`conventional-changelog-cli`](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-cli) with the `conventionalcommits` preset.)

## [4.0.0](https://github.com/st1ggy/linter-config/compare/v3.0.0...v4.0.0) - 2026-04-10

### ⚠ BREAKING CHANGES

- **Monorepo:** sources and publishable `package.json` live under [`packages/eslint`](packages/eslint); consumers still install `npm i -D @st1ggy/linter-config`.
- **Biome:** JSON presets are only published as **`@st1ggy/linter-config` subpaths** (`biome-common`, `biome-react`, `biome-next`, `biome-svelte`, `biome`). The separate package **`@st1ggy/linter-config-biome` is removed**—switch `extends` / resolution to e.g. `@st1ggy/linter-config/biome-common`.
- **Internal filenames:** Svelte-related preset files were renamed (`eslint-svelte.config.js`, `prettier-svelte.config.js`, `svelte-stack.js`); documented **subpath `exports`** (`/eslint-svelte`, `/prettier-svelte`) are unchanged.

### Features

- Monorepo layout with npm workspaces; root scripts delegate to `@st1ggy/linter-config` workspace ([199cedb](https://github.com/st1ggy/linter-config/commit/199cedb0bd8b77b221237b90ac5efdb1a4e35d3b)).
