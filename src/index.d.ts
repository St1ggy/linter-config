import type { Linter } from 'eslint'

declare module '@st1ggy/linter-config/eslint-next' {
  const config: Linter.Config[]

  export default config
}

declare module '@st1ggy/linter-config/eslint-react' {
  const config: Linter.Config[]

  export default config
}

declare module '@st1ggy/linter-config/eslint-svelte' {
  const config: Linter.Config[]

  export default config
}

declare module '@st1ggy/linter-config/eslint-common' {
  const config: Linter.Config[]

  export default config
}

declare module '@st1ggy/linter-config/prettier-common' {
  import type { Config } from 'prettier'

  const config: Config

  export default config
}

declare module '@st1ggy/linter-config/prettier-svelte' {
  import type { Config } from 'prettier'

  const config: Config

  export default config
}

declare module '@st1ggy/linter-config/stylelint-scss' {
  import type { Config } from 'stylelint'

  const config: Config

  export default config
}
