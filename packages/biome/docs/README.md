# Biome presets (`@st1ggy/linter-config`)

This folder holds **Biome** JSON for `@st1ggy/linter-config`: shared `biome.json` plus layered configs under [`configs/`](../configs).

## Subpath exports

Extend from your project `biome.json`, for example:

```json
{
  "extends": ["@st1ggy/linter-config/biome-common"]
}
```

Other subpaths: `biome`, `biome-react`, `biome-next`, `biome-svelte` (see root [`package.json`](../../../package.json) `exports`).

## Scope

Presets tune Biome’s formatter and linter for TypeScript, React/JSX, Next.js App Router paths, and Svelte—using the same versioning and peer expectations as the rest of the package. Styling for CSS/SCSS is covered where Biome supports it; stricter stylesheet tooling may live in consumer projects.
