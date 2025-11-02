import { type ConfigArray } from 'eslint'
import { type Config as PrettierConfig } from 'prettier'
import { type Config as StylelintConfig } from 'stylelint'

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
