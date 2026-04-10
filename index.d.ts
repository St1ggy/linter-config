// Ambient declarations for `@st1ggy/linter-config`.
// This file must remain a script (no top-level `import` / `export`) so each
// `declare module '…'` introduces a module, not an augmentation — otherwise
// TypeScript reports TS2666 for `export default` in subpath entries.
declare module '@st1ggy/linter-config' {
  import type { Linter } from 'eslint'
  import type { Config as PrettierConfig } from 'prettier'
  import type * as Stylelint from 'stylelint'

  export const eslintCommon: Linter.Config[]
  export const eslintReact: Linter.Config[]
  export const eslintNext: Linter.Config[]
  export const eslintSvelte: Linter.Config[]

  export const prettierCommon: PrettierConfig
  export const prettierSvelte: PrettierConfig

  export const stylelintScss: Stylelint.Config
}

declare module '@st1ggy/linter-config/eslint-next' {
  import type { Linter } from 'eslint'

  const config: Linter.Config[]

  export default config
}

declare module '@st1ggy/linter-config/eslint-react' {
  import type { Linter } from 'eslint'

  const config: Linter.Config[]

  export default config
}

declare module '@st1ggy/linter-config/eslint-svelte' {
  import type { Linter } from 'eslint'

  const config: Linter.Config[]

  export default config
}

declare module '@st1ggy/linter-config/eslint-common' {
  import type { Linter } from 'eslint'

  const config: Linter.Config[]

  export default config
}

declare module '@st1ggy/linter-config/prettier-common' {
  import type { Config as PrettierConfig } from 'prettier'

  const config: PrettierConfig

  export default config
}

declare module '@st1ggy/linter-config/prettier-svelte' {
  import type { Config as PrettierConfig } from 'prettier'

  const config: PrettierConfig

  export default config
}

declare module '@st1ggy/linter-config/stylelint-scss' {
  import type * as Stylelint from 'stylelint'

  const config: Stylelint.Config

  export default config
}
