// Some plugins key file-level caches by SourceCode identity. Give each rule
// invocation a fresh identity while preserving the native SourceCode methods.
export function withFreshSourceCode(plugin) {
  return {
    ...plugin,
    rules: Object.fromEntries(
      Object.entries(plugin.rules).map(([name, rule]) => [
        name,
        {
          ...rule,
          create(context) {
            const sourceCode = new Proxy(context.sourceCode, {
              get(target, property) {
                return Reflect.get(target, property, target)
              },
            })
            const wrapped = Object.create(context)

            Object.defineProperties(wrapped, {
              sourceCode: { value: sourceCode, configurable: true },
              getSourceCode: { value: () => sourceCode, configurable: true },
            })

            return rule.create(wrapped)
          },
        },
      ]),
    ),
  }
}
