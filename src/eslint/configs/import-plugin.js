import importPlugin, { flatConfigs as importConfigs, rules as importRules } from 'eslint-plugin-import-x'
import path from 'node:path'
import process from 'node:process'

function aliasContext(context) {
  const aliases = context.settings['st1ggy/import-aliases']

  if (!aliases) {
    return context
  }

  const settings = context.settings
  const resolvers = settings['import-x/resolver'] ?? {}
  const typescript = typeof resolvers.typescript === 'object' ? resolvers.typescript : {}
  const alias = Object.fromEntries(
    Object.entries(aliases).map(([name, target]) => [name, [path.resolve(context.cwd ?? process.cwd(), target)]]),
  )
  const wrapped = Object.create(context)

  Object.defineProperty(wrapped, 'settings', {
    value: {
      ...settings,
      'import-x/resolver': { ...resolvers, typescript: { ...typescript, alias: { ...alias, ...typescript.alias } } },
    },
  })

  return wrapped
}

const plugin = {
  ...importPlugin,
  rules: Object.fromEntries(
    Object.entries(importRules).map(([name, rule]) => [
      name,
      { ...rule, create: (context) => rule.create(aliasContext(context)) },
    ]),
  ),
}

export const flatConfigs = Object.fromEntries(
  Object.entries(importConfigs).map(([name, config]) => [
    name,
    { ...config, ...(config.plugins && { plugins: { ...config.plugins, 'import-x': plugin } }) },
  ]),
)
export const rules = plugin.rules

export default plugin
