// Kept separate from the legacy declarations to make the formatter an optional peer.
declare module '@st1ggy/linter-config/oxfmt-common' {
  import type { OxfmtConfig } from 'oxfmt'

  const config: OxfmtConfig

  export default config
}
