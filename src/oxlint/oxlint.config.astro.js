import bundle from './configs/config.astro.js'
import { createOxlintConfig } from './create-config.js'

export default createOxlintConfig(bundle)
