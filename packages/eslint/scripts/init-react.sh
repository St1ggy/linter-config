#!/usr/bin/env bash

declare -A postfix_map=(
  [eslint]="react"
  [stylelint]="scss"
  [prettier]="common"
)

for l in eslint stylelint prettier; do
  echo "creating $l.config.js with ${l}-${postfix_map[$l]}"
  echo "export { default } from '@st1ggy/linter-config/${l}-${postfix_map[$l]}';" > $l.config.js;
done
