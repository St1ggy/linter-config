import importPlugin, { rules as importRules } from 'eslint-plugin-import-x'

function scopedContext(context) {
  const scopes = context.settings['st1ggy/import-scopes'] ?? []
  const selected = scopes.findLast((scope) => context.filename.endsWith(`.${scope.extension}`))

  if (!selected) {
    return context
  }

  const defaults = context.settings['st1ggy/import-defaults'] ?? {}
  const settings = { ...context.settings }

  for (const [name, value] of Object.entries(selected.settings)) {
    if (JSON.stringify(settings[name]) === JSON.stringify(defaults[name])) {
      settings[name] = value
    }
  }

  const wrapped = Object.create(context)

  Object.defineProperty(wrapped, 'settings', { value: settings, configurable: true })

  return wrapped
}

export default {
  ...importPlugin,
  rules: Object.fromEntries(
    Object.entries(importRules).map(([name, rule]) => [
      name,
      {
        ...rule,
        create: (context) => rule.create(scopedContext(context)),
      },
    ]),
  ),
}
