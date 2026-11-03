import svelte from './configs/svelte-stack.js'

// Framework/template checks supplement Oxlint's extracted-script analysis.
export default [...svelte, { ignores: ['**/node_modules/**', '**/.svelte-kit/**', '**/build/**'] }]
