import { ESLint } from 'eslint'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { OX_STACKS, ROOT } from './oxlint-tools.mjs'
import { serializeInventory } from './oxlint-values.mjs'

const lock = JSON.parse(readFileSync(path.join(ROOT, 'package-lock.json'), 'utf8'))
const packageNames = {
  '@typescript-eslint': 'typescript-eslint',
  '@stylistic': '@stylistic/eslint-plugin',
  '@next/next': '@next/eslint-plugin-next',
}

export function sourceModule(stack) {
  const file = stack === 'svelte' ? 'eslint-svelte.config.js' : `eslint.config.${stack}.js`

  return path.join(ROOT, 'src/eslint', file)
}

function sortedObject(object) {
  return Object.fromEntries(Object.entries(object).toSorted(([left], [right]) => left.localeCompare(right)))
}

function sampleFor(file) {
  if (file.endsWith('.vue')) {
    return '<script>export const sample = true</script><template><p>Hello</p></template>'
  }

  if (file.endsWith('.svelte')) {
    return '<script lang="ts">let sample: boolean = true</script><p>{sample}</p>'
  }

  if (file.endsWith('.astro')) {
    return '---\nconst sample: boolean = true\n---\n<p>{sample}</p>\n<script>const client: boolean = true; console.log(client)</script>'
  }

  if (file.endsWith('.d.ts')) {
    return 'export declare const sample: boolean'
  }

  if (/\.[cm]?tsx?$/.test(file)) {
    return 'export const sample: boolean = true'
  }

  return 'export const sample = true'
}

function parserStatus(config, file, text = sampleFor(file)) {
  const parser = config.languageOptions?.parser
  const parse = parser?.parseForESLint ?? parser?.parse

  if (!parse) {
    return { baselineStatus: 'config-only' }
  }

  try {
    parse.call(parser, text, {
      ...config.languageOptions.parserOptions,
      filePath: path.join(ROOT, file),
      ecmaVersion: 'latest',
      sourceType: 'module',
      project: false,
      projectService: false,
      loc: true,
      range: true,
      tokens: true,
      comment: true,
    })

    return { baselineStatus: 'lintable' }
  } catch (error) {
    return { baselineStatus: 'parse-error', baselineError: error.message.replaceAll(ROOT, '<root>') }
  }
}

function scopeFiles(layers) {
  const extensions = new Set([
    'js',
    'jsx',
    'ts',
    'tsx',
    'mjs',
    'cjs',
    'mts',
    'cts',
    'd.ts',
    'vue',
    'svelte',
    'svelte.js',
    'svelte.ts',
    'astro',
  ])

  const patterns = layers.flatMap((layer) => layer.files ?? []).flat()

  for (const pattern of patterns) {
    const group = /\.\{([\w.,]+)\}/.exec(pattern)
    const matches = group?.[1].split(',') ?? []

    for (const extension of matches) {
      extensions.add(extension)
    }
  }

  const files = [...extensions]
    .toSorted((left, right) => left.localeCompare(right))
    .flatMap((extension) => [`src/probe.${extension}`, `probe.${extension}`])

  return files
}

async function processorFiles(engine, files) {
  const result = new Map(files.map((file) => [file, sampleFor(file)]))
  const components = files.filter((file) => file.endsWith('.astro') || file.endsWith('.svelte'))

  for (const file of components) {
    const absolute = path.join(ROOT, file)
    const config = await engine.calculateConfigForFile(absolute)
    const processor = config?.processor

    if (processor?.preprocess) {
      const fragments = await processor.preprocess(sampleFor(file), absolute)

      for (const [index, fragment] of fragments.entries()) {
        if (typeof fragment !== 'string' && fragment.filename) {
          result.set(`${file}/${index}_${fragment.filename}`, fragment.text)
        }
      }

      processor.postprocess(
        fragments.map(() => []),
        absolute,
      )
    }
  }

  return result
}

function collectMetadata(config, metadata, versions) {
  const ruleIds = Object.keys(config.rules ?? {})

  for (const ruleId of ruleIds) {
    const separator = ruleId.lastIndexOf('/')
    const pluginName = separator === -1 ? 'eslint' : ruleId.slice(0, separator)
    const ruleName = ruleId.slice(separator + 1)
    const rule = config.plugins?.[pluginName]?.rules?.[ruleName]
    const packageName = packageNames[pluginName] ?? (pluginName === 'eslint' ? 'eslint' : `eslint-plugin-${pluginName}`)
    const version = lock.packages[`node_modules/${packageName}`]?.version ?? 'unknown'

    versions[packageName] = version
    metadata[ruleId] = {
      package: packageName,
      version,
      requiresTypeChecking: rule?.meta?.docs?.requiresTypeChecking === true,
      documentation: rule?.meta?.docs?.url ?? `https://eslint.org/docs/latest/rules/${ruleName}`,
    }
  }
}

export async function collectSourceInventory() {
  const presets = {}
  const profiles = {}
  const metadata = {}
  const versions = {}

  for (const stack of OX_STACKS) {
    const { default: layers } = await import(pathToFileURL(sourceModule(stack)).href)
    const engine = new ESLint({ cwd: ROOT, overrideConfigFile: true, overrideConfig: layers })
    const scopes = {}
    const files = await processorFiles(engine, scopeFiles(layers))

    for (const [file, text] of files) {
      const config = await engine.calculateConfigForFile(path.join(ROOT, file))

      if (config) {
        const profile = {
          rules: sortedObject(config.rules ?? {}),
          settings: config.settings ?? {},
          globals: config.languageOptions?.globals ?? {},
        }
        const key = createHash('sha256').update(serializeInventory(profile)).digest('hex').slice(0, 16)

        profiles[key] = profile
        scopes[file] = {
          profile: key,
          parser: config.languageOptions?.parser?.meta?.name ?? 'unknown',
          ...parserStatus(config, file, text),
        }
        collectMetadata(config, metadata, versions)
      } else {
        scopes[file] = { baselineStatus: 'ignored' }
      }
    }

    presets[stack] = {
      layers: layers.map((layer) => ({ files: layer.files ?? ['**/*'], ignores: layer.ignores ?? [] })),
      scopes,
    }
  }

  return {
    schemaVersion: 1,
    versions: sortedObject(versions),
    metadata: sortedObject(metadata),
    presets,
    profiles: sortedObject(profiles),
  }
}

export function writeOrCheck(file, value, check) {
  const expected = `${serializeInventory(value, 2)}\n`

  if (check) {
    if (readFileSync(file, 'utf8') !== expected) {
      throw new Error(`Stale Oxlint artifact: ${file}`)
    }
  } else {
    writeFileSync(file, expected)
  }
}

async function main() {
  const args = process.argv.slice(2)

  if (!args.includes('--source-only')) {
    const { auditInventory } = await import('./oxlint-audit.mjs')

    await auditInventory(args.includes('--check'))
    process.stdout.write(`Oxlint coverage ${args.includes('--check') ? 'verified' : 'written'}\n`)

    return
  }

  const outputPosition = args.indexOf('--output')
  const output = outputPosition === -1 ? path.join(ROOT, 'data/oxlint-source-inventory.json') : args[outputPosition + 1]

  writeOrCheck(output, await collectSourceInventory(), args.includes('--check'))
  process.stdout.write(`Source inventory ${args.includes('--check') ? 'verified' : 'written'}: ${output}\n`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main()
}
