import { type ConfigArray } from 'eslint'
import { type Config as PrettierConfig } from 'prettier'
import { type Config as StylelintConfig } from 'stylelint'

declare module '@st1ggy/linter-config/eslint-next' {
  export default config as ConfigArray
}

declare module '@st1ggy/linter-config/eslint-react' {
  export default config as ConfigArray
}

declare module '@st1ggy/linter-config/eslint-svelte' {
  export default config as ConfigArray
}

declare module '@st1ggy/linter-config/eslint-common' {
  export default config as ConfigArray
}

declare module '@st1ggy/linter-config/prettier-common' {
  export default config as PrettierConfig
}

declare module '@st1ggy/linter-config/prettier-svelte' {
  export default config as PrettierConfig
}

declare module '@st1ggy/linter-config/stylelint-scss' {
  export default config as StylelintConfig
}
