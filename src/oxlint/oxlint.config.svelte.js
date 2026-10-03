import bundle from './configs/config.svelte.js'
import { createOxlintConfig } from './create-config.js'

export default createOxlintConfig(bundle)
