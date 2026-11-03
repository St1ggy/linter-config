import vue from './eslint.config.vue-ox.js'

// Nuxt's JS rules run in Oxlint; Vue's parser retains template checks here.
export default [...vue, { ignores: ['**/.nuxt/**', '**/.output/**'] }]
