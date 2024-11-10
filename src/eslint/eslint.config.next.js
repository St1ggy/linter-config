import nextConfig from './eslint.config.next.js'
import reactConfig from './eslint.config.react.js'

export default [...reactConfig, ...nextConfig]
