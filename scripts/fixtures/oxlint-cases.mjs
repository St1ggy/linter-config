import { mkdirSync, mkdtempSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { ROOT } from '../oxlint-tools.mjs'

export const toolchainFiles = {
  'kind.ts': "export type Kind = 'pending' | 'done'\n",
  'probe.ts':
    "import type { Kind } from './kind'\nexport function label(kind: Kind) { switch (kind) { case 'pending': return kind } }\n",
}

export function temporaryProject(context, files = {}) {
  const prefix = path.join(tmpdir(), 'linter-ox-')
  const directory = realpathSync(mkdtempSync(prefix))

  context.after(() => rmSync(directory, { recursive: true, force: true }))
  symlinkSync(path.join(ROOT, 'node_modules'), path.join(directory, 'node_modules'), 'dir')
  const allFiles = {
    'package.json': JSON.stringify({ private: true, type: 'module' }),
    'tsconfig.json': JSON.stringify({
      compilerOptions: {
        target: 'esnext',
        module: 'esnext',
        moduleResolution: 'bundler',
        allowJs: true,
        jsx: 'preserve',
        noEmit: true,
        skipLibCheck: true,
      },
      include: ['*.ts', '*.tsx', '*.js', '*.jsx'],
    }),
    ...files,
  }

  for (const [file, contents] of Object.entries(allFiles)) {
    mkdirSync(path.dirname(path.join(directory, file)), { recursive: true })
    writeFileSync(path.join(directory, file), contents)
  }

  return directory
}
