import assert from 'node:assert/strict'
import test from 'node:test'

import { temporaryProject } from './fixtures/oxlint-cases.mjs'
import { runOxlint } from './oxlint-tools.mjs'

test('Oxlint JS plugins have no TS6 Program and expose the documented AST limitations', (context) => {
  const directory = temporaryProject(context, {
    'capability.mjs': `export default {rules:{probe:{create(context){return {
      Program(node){context.report({node,message:'program='+Boolean(context.sourceCode.parserServices?.program)+';sourceType='+node.sourceType})},
      PropertyDefinition(node){context.report({node,message:'nullable-accessibility='+String(node.accessibility===null)})},
      VariableDeclarator(node){const scope=context.sourceCode.getScope(node);const variable=scope.set.get(node.id.name);if(variable?.defs[0]) context.report({node,message:'definition-kind='+String(variable.defs[0].kind)})}
    }}}}}\n`,
    '.oxlintrc.json': JSON.stringify({
      plugins: [],
      options: { typeAware: true },
      categories: { correctness: 'off' },
      jsPlugins: [{ name: 'capability', specifier: './capability.mjs' }],
      rules: { 'capability/probe': 'error' },
    }),
    'script.js': 'let values = []\nclass Example { _value = 1 }\n',
    'module.js': 'export const values = []\n',
    'style.css': 'a { transition: all 1s; margin-left: 1px; margin: 0 }\n',
  })
  const result = runOxlint(['--format', 'json', 'script.js', 'module.js', 'style.css'], { cwd: directory })
  const { diagnostics } = JSON.parse(result.stdout)
  const messages = new Set(diagnostics.map((diagnostic) => diagnostic.message))

  assert.ok(messages.has('program=false;sourceType=script'))
  assert.ok(messages.has('program=false;sourceType=module'))
  assert.ok(messages.has('nullable-accessibility=true'))
  assert.ok(messages.has('definition-kind=undefined'))
  assert.ok(diagnostics.every((diagnostic) => diagnostic.filename !== 'style.css'))
})
