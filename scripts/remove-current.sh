#!/usr/bin/env bash

for l in eslint stylelint prettier; do
  # shellcheck disable=SC2044
  for f in $(find . -type f -name "*$l*" -maxdepth 1); do
    read -p "Delete ${f:2}? y/n " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      rm -rf "$f"
    fi
  done
done
