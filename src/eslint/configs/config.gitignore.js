import { includeIgnoreFile } from '@eslint/compat'
import { defineConfig } from 'eslint/config'
import { findUpSync } from 'find-up-simple'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const gitignorePath = findUpSync('.gitignore', { cwd: process.cwd() })

export default defineConfig([includeIgnoreFile(fileURLToPath(new URL(gitignorePath, import.meta.url)))])
