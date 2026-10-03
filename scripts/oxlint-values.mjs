import { readFileSync } from 'node:fs'

export function serializeInventory(value, space) {
  return JSON.stringify(value, (key, item) => (item === Infinity ? { $number: 'Infinity' } : item), space)
}

export function readInventory(file) {
  return JSON.parse(readFileSync(file, 'utf8'), (key, item) => (item?.$number === 'Infinity' ? Infinity : item))
}
