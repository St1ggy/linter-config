#!/usr/bin/env bash
# Runs the same entry as `npx @st1ggy/linter-config` (see scripts/linter-init.mjs): writes wrappers and,
# unless --skip-install is passed, ensures @st1ggy/linter-config is installed when package.json exists.
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec node "${SCRIPT_DIR}/linter-init.mjs" init --common "$@"
