import commonConfig from './prettier.config.common.js'

export default {
  ...commonConfig,
  plugins: ['prettier-plugin-astro'],
  overrides: [{ files: '*.astro', options: { parser: 'astro' } }],
}
