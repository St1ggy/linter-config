import { type Linter } from 'eslint'
import { type Config as PrettierConfig } from 'prettier'
import { type Config as StylelintConfig } from 'stylelint'

type ConfigArray = Linter.Config[]

declare module '@st1ggy/linter-config' {
  export const eslintCommon: ConfigArray
  export const eslintReact: ConfigArray
  export const eslintNext: ConfigArray
  export const eslintSvelte: ConfigArray

  export const prettierCommon: PrettierConfig
  export const prettierSvelte: PrettierConfig

  export const stylelintScss: StylelintConfig
}

declare module '@st1ggy/linter-config/eslint-next' {
  const config: ConfigArray

  export default config
}

declare module '@st1ggy/linter-config/eslint-react' {
  const config: ConfigArray

  export default config
}

declare module '@st1ggy/linter-config/eslint-svelte' {
  const config: ConfigArray

  export default config
}

declare module '@st1ggy/linter-config/eslint-common' {
  const config: ConfigArray

  export default config
}

declare module '@st1ggy/linter-config/prettier-common' {
  const config: PrettierConfig

  export default config
}

declare module '@st1ggy/linter-config/prettier-svelte' {
  const config: PrettierConfig

  export default config
}

declare module '@st1ggy/linter-config/stylelint-scss' {
  const config: StylelintConfig

  export default config
}
