#!/usr/bin/env bash
# See init-common.sh — same as npx @st1ggy/linter-config, stack --svelte.
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec node "${SCRIPT_DIR}/linter-init.mjs" init --svelte "$@"
