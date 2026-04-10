/**
 * Biome JSON configuration entrypoints for `@st1ggy/biome-config`.
 * Prefer extending these files from your `biome.json` rather than importing in TypeScript.
 */
type BiomeJsonConfig = Record<string, unknown>

declare module '@st1ggy/biome-config' {
  const config: BiomeJsonConfig

  export default config
}

declare module '@st1ggy/biome-config/biome-common' {
  const config: BiomeJsonConfig

  export default config
}

declare module '@st1ggy/biome-config/biome-react' {
  const config: BiomeJsonConfig

  export default config
}

declare module '@st1ggy/biome-config/biome-next' {
  const config: BiomeJsonConfig

  export default config
}

declare module '@st1ggy/biome-config/biome-svelte' {
  const config: BiomeJsonConfig

  export default config
}
