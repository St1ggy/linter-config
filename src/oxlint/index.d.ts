// Keep Oxlint types in a separate ambient declaration file so existing ESLint
// consumers do not need to install the optional Oxlint peer.
declare module '@st1ggy/linter-config/common-ox' {
  import type { OxlintConfig } from 'oxlint'

  const config: OxlintConfig

  export default config
}

declare module '@st1ggy/linter-config/react-ox' {
  import type { OxlintConfig } from 'oxlint'

  const config: OxlintConfig

  export default config
}

declare module '@st1ggy/linter-config/solid-ox' {
  import type { OxlintConfig } from 'oxlint'

  const config: OxlintConfig

  export default config
}

declare module '@st1ggy/linter-config/next-ox' {
  import type { OxlintConfig } from 'oxlint'

  const config: OxlintConfig

  export default config
}

declare module '@st1ggy/linter-config/svelte-ox' {
  import type { OxlintConfig } from 'oxlint'

  const config: OxlintConfig

  export default config
}

declare module '@st1ggy/linter-config/astro-ox' {
  import type { OxlintConfig } from 'oxlint'

  const config: OxlintConfig

  export default config
}
