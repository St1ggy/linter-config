import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import process from 'node:process'
import test from 'node:test'

import { ROOT } from './oxlint-tools.mjs'

function runPromptFailure(name, isError = true) {
  const promptSource = `
    async function fail() {
      const error = ${isError ? 'new Error("prompt failed")' : '{ message: "prompt failed" }'};
      error.name = ${JSON.stringify(name)};
      throw error;
    }
    export { fail as confirm, fail as input, fail as select };
  `
  const source = `
    import { registerHooks } from 'node:module';
    import process from 'node:process';
    const url = ${JSON.stringify(`data:text/javascript,${encodeURIComponent(promptSource)}`)};
    registerHooks({
      resolve(specifier, context, nextResolve) {
        return specifier === '@inquirer/prompts'
          ? { url, shortCircuit: true }
          : nextResolve(specifier, context);
      },
    });
    Object.defineProperty(process.stdin, 'isTTY', { value: true });
    Object.defineProperty(process.stdout, 'isTTY', { value: true });
    process.argv = [process.execPath, 'scripts/linter-init.mjs'];
    await import(${JSON.stringify(new URL('linter-init.mjs', import.meta.url).href)});
  `

  return spawnSync(process.execPath, ['--input-type=module', '--eval', source], {
    cwd: ROOT,
    encoding: 'utf8',
    timeout: 15_000,
  })
}

for (const name of ['ExitPromptError', 'CancelPromptError']) {
  test(`CLI handles ${name} from a different module instance`, () => {
    const result = runPromptFailure(name)

    assert.equal(result.error, undefined)
    assert.equal(result.status, 0, result.stderr)
    assert.equal(result.stdout, '\nCancelled.\n')
    assert.equal(result.stderr, '')
  })
}

test('CLI reports ordinary prompt failures without treating them as cancellation', () => {
  const result = runPromptFailure('Error')

  assert.equal(result.error, undefined)
  assert.equal(result.status, 1)
  assert.equal(result.stdout, '')
  assert.equal(result.stderr, 'prompt failed\n')
})

test('CLI does not treat a non-Error cancellation lookalike as successful cancellation', () => {
  const result = runPromptFailure('ExitPromptError', false)

  assert.equal(result.error, undefined)
  assert.equal(result.status, 1)
  assert.equal(result.stdout, '')
  assert.equal(result.stderr, '[object Object]\n')
})
