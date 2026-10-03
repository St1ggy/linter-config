import astro, { rules as astroRules } from 'eslint-plugin-astro'
import { readFileSync } from 'node:fs'

// Only the six script-only rules are enabled. The native linter still parses
// the JavaScript; this adapter neither creates a TS Program nor parses templates.
function frontmatterContext(context) {
  const filename = context.physicalFilename ?? context.filename
  const source = readFileSync(filename, 'utf8')
  const frontmatter = /^\u{FEFF}?---[^\S\n]*\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/u.exec(source)?.[1]

  if (frontmatter === undefined || frontmatter.trim() !== context.sourceCode.text.trim()) {
    return null
  }

  const sourceCode = Object.create(context.sourceCode)
  const wrapped = Object.create(context)

  Object.defineProperty(sourceCode, 'parserServices', {
    value: { ...context.sourceCode.parserServices, isAstro: true },
  })
  Object.defineProperty(wrapped, 'sourceCode', { value: sourceCode, configurable: true })

  return wrapped
}

export default {
  ...astro,
  rules: Object.fromEntries(
    Object.entries(astroRules).map(([name, rule]) => [
      name,
      {
        ...rule,
        create(context) {
          const wrapped = frontmatterContext(context)

          return wrapped ? rule.create(wrapped) : {}
        },
      },
    ]),
  ),
}
