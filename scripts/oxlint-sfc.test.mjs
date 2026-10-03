import { ESLint } from 'eslint'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { pathToFileURL } from 'node:url'

import { temporaryProject } from './fixtures/oxlint-cases.mjs'
import { sourceModule } from './oxlint-inventory.mjs'
import { ROOT, runOxlint } from './oxlint-tools.mjs'

function lintSfc(context, stack, code) {
  const config = pathToFileURL(path.join(ROOT, `src/oxlint/oxlint.config.${stack}.js`)).href
  const directory = temporaryProject(context, {
    'oxlint.config.ts': `export { default } from ${JSON.stringify(config)}\n`,
    [`view.${stack}`]: code,
  })
  const result = runOxlint(['--format', 'json', `view.${stack}`], { cwd: directory })

  assert.ok(result.status === 0 || result.status === 1, result.stdout + result.stderr)
  const parsed = JSON.parse(result.stdout)

  assert.ok(
    parsed.diagnostics.every((item) => !item.message.includes('Error running JS plugin')),
    result.stdout,
  )

  return parsed
}

test('Svelte script linting retains rune checks without reporting template-used bindings', (context) => {
  const valid = lintSfc(context, 'svelte', '<script lang="ts">\nconst text = "Hello"\n</script>\n<p>{text}</p>\n')

  assert.deepEqual(valid.diagnostics, [])
  const invalid = lintSfc(context, 'svelte', '<script lang="ts">\n$inspect(1)\n</script>\n<p>Hello</p>\n')

  assert.ok(invalid.diagnostics.some((item) => item.code === 'svelte(no-inspect)'))
})

test('Astro frontmatter and browser scripts are both checked', (context) => {
  const valid = lintSfc(context, 'astro', '---\nconst text = "Hello"\n---\n<p>{text}</p>\n')

  assert.deepEqual(valid.diagnostics, [])
  const code = '---\ndebugger\n---\n<p>Hello</p>\n<script>\ndebugger\n</script>\n'
  const invalid = lintSfc(context, 'astro', code)
  const findings = invalid.diagnostics.filter((item) => item.code === 'eslint(no-debugger)')

  assert.equal(findings.length, 2)
  assert.deepEqual(
    findings.map((item) => item.labels[0].span.offset).toSorted((left, right) => left - right),
    [code.indexOf('debugger'), code.lastIndexOf('debugger')],
  )
})

test('SFC fixes preserve markup and use physical offsets after Unicode text', (context) => {
  for (const stack of ['svelte', 'astro']) {
    const config = pathToFileURL(path.join(ROOT, `src/oxlint/oxlint.config.${stack}.js`)).href
    const markup = '<p>Привет</p>\n'
    const code = `${markup}<script>\nconst value = Number.POSITIVE_INFINITY\nconsole.log(value)\n</script>\n`
    const directory = temporaryProject(context, {
      'oxlint.config.ts': `export { default } from ${JSON.stringify(config)}\n`,
      [`view.${stack}`]: code,
    })
    const result = runOxlint(['--fix', `view.${stack}`], { cwd: directory })
    const fixed = readFileSync(path.join(directory, `view.${stack}`), 'utf8')

    assert.ok(result.status === 0 || result.status === 1, result.stdout + result.stderr)
    assert.ok(fixed.startsWith(markup), fixed)
    assert.ok(fixed.includes('const value = Infinity'), fixed)
    assert.ok(fixed.endsWith('</script>\n'), fixed)
  }
})

test('Svelte module aliases and script-only framework rules are retained', (context) => {
  const config = pathToFileURL(path.join(ROOT, 'src/oxlint/oxlint.config.svelte.js')).href
  const directory = temporaryProject(context, {
    'oxlint.config.ts': `export { default } from ${JSON.stringify(config)}\n`,
    'src/lib/value.js': 'export const value = true\n',
    'view.svelte.ts': "import { value } from '$lib/value.js'\n\nexport { value }\n",
    'invalid.svelte.ts': "import * as internal from 'svelte/internal'\n\n$inspect(internal)\n",
  })
  const valid = runOxlint(['--format', 'json', 'view.svelte.ts'], { cwd: directory })

  assert.ok(
    JSON.parse(valid.stdout).diagnostics.every((item) => !item.code?.includes('no-unresolved')),
    valid.stdout,
  )
  const invalid = runOxlint(['--format', 'json', 'invalid.svelte.ts'], { cwd: directory })
  const rules = new Set(JSON.parse(invalid.stdout).diagnostics.map((item) => item.code))

  assert.ok(rules.has('svelte(no-svelte-internal)'), invalid.stdout)
  assert.ok(rules.has('svelte(no-inspect)'), invalid.stdout)
})

test('Template-only rules are recorded as unsupported instead of claiming template linting', (context) => {
  const svelte = lintSfc(context, 'svelte', '<script>\nconst html = "<b>hello</b>"\n</script>\n{@html html}\n')
  const astro = lintSfc(context, 'astro', '<Component client:only />\n')

  assert.ok(svelte.diagnostics.every((item) => item.code !== 'svelte(no-at-html-tags)'))
  assert.ok(astro.diagnostics.every((item) => !item.code?.includes('missing-client-only-directive-value')))
})

test('Astro script-only rules retain source diagnostics on extracted frontmatter', async (context) => {
  const { default: sourceConfig } = await import(pathToFileURL(sourceModule('astro')).href)
  const sourceEngine = new ESLint({ cwd: ROOT, overrideConfigFile: true, overrideConfig: sourceConfig })
  const calculated = await sourceEngine.calculateConfigForFile(path.join(ROOT, 'src/components/probe.astro'))
  const disabled = Object.fromEntries(Object.keys(calculated.rules).map((id) => [id, 'off']))
  const examples = {
    'no-deprecated-astro-canonicalurl': ['const value = Astro.canonicalURL', 'const value = Astro.url'],
    'no-deprecated-astro-fetchcontent': [
      "const value = Astro.fetchContent('./posts/*.md')",
      "const value = Astro.glob('./posts/*.md')",
    ],
    'no-deprecated-astro-resolve': ["const value = Astro.resolve('./image.png')", "const value = './image.png'"],
    'no-deprecated-getentrybyslug': [
      "import { getEntryBySlug } from 'astro:content'",
      "import { getEntry } from 'astro:content'",
    ],
    'no-exports-from-components': ['export const value = true', 'const value = true'],
    'no-prerender-export-outside-pages': ['export const prerender = true', 'const prerender = true'],
  }

  for (const [name, pair] of Object.entries(examples)) {
    const ruleId = `astro/${name}`
    const engine = new ESLint({
      cwd: ROOT,
      overrideConfigFile: true,
      overrideConfig: [
        ...sourceConfig,
        {
          languageOptions: { parserOptions: { project: false, projectService: false } },
          rules: { ...disabled, [ruleId]: 'error' },
        },
      ],
    })

    for (const [index, script] of pair.entries()) {
      const code = `---\n${script}\n---\n<p>Hello</p>\n`
      const [original] = await engine.lintText(code, { filePath: path.join(ROOT, 'src/components/probe.astro') })
      const target = lintSfc(context, 'astro', code)

      assert.equal(original.fatalErrorCount, 0, JSON.stringify(original.messages))
      assert.equal(
        original.messages.some((item) => item.ruleId === ruleId),
        index === 0,
        ruleId,
      )
      assert.equal(
        target.diagnostics.some((item) => item.code === `astro(${name})`),
        index === 0,
        `${ruleId}: ${JSON.stringify(target.diagnostics)}`,
      )
    }
  }
})

test('Astro frontmatter adapters do not apply export restrictions to browser scripts', (context) => {
  const result = lintSfc(
    context,
    'astro',
    '---\nconst value = true\n---\n<p>{value}</p>\n<script>\nexport const browserValue = true\n</script>\n',
  )

  assert.ok(
    result.diagnostics.every((item) => !item.code?.startsWith('astro(')),
    JSON.stringify(result),
  )
})
