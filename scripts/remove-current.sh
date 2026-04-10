#!/usr/bin/env bash
# Optional migration helper: interactively delete files in the *current directory* whose names
# contain eslint, stylelint, or prettier (maxdepth 1). Use before switching to the three standard
# wrappers from @st1ggy/linter-config — it does NOT replace `reinit` (reinit overwrites the standard
# filenames without prompts). Not invoked by the CLI; run manually when cleaning legacy configs.

set -euo pipefail

for tool in eslint stylelint prettier; do
  while IFS= read -r -d '' file; do
    read -r -p "Delete ${file#./}? y/n " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      rm -f "$file"
    fi
  done < <(find . -maxdepth 1 -type f -name "*${tool}*" -print0)
done
