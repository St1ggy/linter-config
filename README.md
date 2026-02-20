# @st1ggy/linter-config

Shared ESLint, Prettier and Stylelint configs for React, Next.js and Svelte projects.

## Install

```bash
npm i -D @st1ggy/linter-config
```

Install only toolchain dependencies you actually use in your project (`eslint`, `prettier`, `stylelint`, framework packages).

## Tree-Shaking Friendly Imports

Prefer subpath imports to load only the required config:

```js
import eslintReact from '@st1ggy/linter-config/eslint-react'
import prettierCommon from '@st1ggy/linter-config/prettier-common'
import stylelintScss from '@st1ggy/linter-config/stylelint-scss'
```

Root import is supported, but it references all exported configs:

```js
import { eslintReact } from '@st1ggy/linter-config'
```

## Available Configs

- `@st1ggy/linter-config/eslint-common`
- `@st1ggy/linter-config/eslint-react`
- `@st1ggy/linter-config/eslint-next`
- `@st1ggy/linter-config/eslint-svelte`
- `@st1ggy/linter-config/prettier-common`
- `@st1ggy/linter-config/prettier-svelte`
- `@st1ggy/linter-config/stylelint-scss`
