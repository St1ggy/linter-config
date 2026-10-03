import svelte from 'eslint-plugin-svelte'

const innerDeclarations = svelte.rules['no-inner-declarations']

// The source preset treats Svelte scripts as strict modules. Oxlint's extracted
// import-free chunks use script scope. Preserve the original rule's strictness
// without modifying the native AST or scope objects used by other rules.
export default {
  ...svelte,
  rules: {
    ...svelte.rules,
    'no-inner-declarations': {
      ...innerDeclarations,
      create(context) {
        const sourceCode = Object.create(context.sourceCode)

        Object.defineProperty(sourceCode, 'getScope', {
          value(node) {
            const scope = context.sourceCode.getScope(node)

            if (!scope.upper) {
              return scope
            }

            const upper = Object.create(scope.upper)
            const wrapped = Object.create(scope)

            Object.defineProperty(upper, 'isStrict', { value: true })
            Object.defineProperty(wrapped, 'upper', { value: upper })

            return wrapped
          },
        })
        const wrapped = Object.create(context)

        Object.defineProperty(wrapped, 'sourceCode', { value: sourceCode, configurable: true })

        return innerDeclarations.create(wrapped)
      },
    },
  },
}
