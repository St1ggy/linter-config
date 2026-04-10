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

### `biome-svelte`

[`biome-svelte`](../configs/biome.svelte.json) extends **`biome-common`** and turns on everything Biome exposes for Svelte today (there is no separate `svelte/*` rule group or Svelte linter domain like Vue’s—see [Biome domains](https://biomejs.dev/linter/domains)):

- **`html.experimentalFullSupportEnabled`** — full parsing, linting, and formatting of `.svelte` (not only the extracted script).
- **`html.formatter`** — aligned with common (`lineWidth` 120, LF, spaces, width 2); **`indentScriptAndStyle`** is enabled so `<script>` / `<style>` contents are indented under the tags.
- **`linter.rules.a11y.recommended`** — same accessibility baseline as **`biome-react`**, applied to markup in components.

If you also format `.svelte` with Prettier (or another tool), choose a single formatter for those files to avoid conflicting output. Biome’s HTML/Svelte formatter is still evolving; expect occasional whitespace differences vs other formatters.

## Scope

Presets tune Biome’s formatter and linter for TypeScript, React/JSX, Next.js App Router paths, and Svelte—using the same versioning and peer expectations as the rest of the package. Styling for CSS/SCSS is covered where Biome supports it; stricter stylesheet tooling may live in consumer projects.
