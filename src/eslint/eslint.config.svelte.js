import svelteConfig from './configs/config.svelte.js'
import commonConfig from './eslint.config.common.js'

export default [...commonConfig, ...svelteConfig]
