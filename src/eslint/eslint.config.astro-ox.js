import astro from './configs/astro-stack.js'

export default [...astro, { ignores: ['**/node_modules/**', '**/.astro/**', '**/dist/**'] }]
