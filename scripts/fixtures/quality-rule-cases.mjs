export const qualityRuleCases = {
  eqeqeq: [
    'export const equal = (value: unknown) => value === 1\nexport const isNullish = (value: unknown) => value == null\n',
    'export const equal = (value: unknown) => value == 1\n',
  ],
  'no-else-return': [
    'export function label(ready: boolean) { if (ready) { return 1 } return 0 }\n',
    'export function label(ready: boolean) { if (ready) { return 1 } else { return 0 } }\n',
  ],
  'max-depth': [
    'export function visit(a: boolean) { if (a) { return 1 } return 0 }\n',
    'export function visit(a: boolean) { if (a) { if (a) { if (a) { if (a) { if (a) { return 1 } } } } } return 0 }\n',
  ],
  '@typescript-eslint/no-floating-promises': [
    'export async function run() { await Promise.resolve(1) }\n',
    'export function run() { Promise.resolve(1) }\n',
  ],
  '@typescript-eslint/no-misused-promises': [
    'export async function run() { const ready = Promise.resolve(true); if (await ready) { return 1 } return 0 }\n',
    'export function run() { const ready = Promise.resolve(true); if (ready) { return 1 } return 0 }\n',
  ],
  '@typescript-eslint/await-thenable': [
    'export async function run() { return await Promise.resolve(1) }\n',
    'export async function run() { return await 1 }\n',
  ],
  '@typescript-eslint/no-unnecessary-type-assertion': [
    'export function label(value: string) { return value }\n',
    'export function label(value: string) { return value as string }\n',
  ],
  '@typescript-eslint/no-unnecessary-type-parameters': [
    'export function identity<T>(value: T): T { return value }\n',
    'export function log<T extends string>(value: T): void { console.log(value) }\n',
  ],
  '@typescript-eslint/prefer-nullish-coalescing': [
    'export const settings = (value: { label: string } | null) => value ?? { label: "default" }\nexport const label = (value: string | null) => value || "default"\n',
    'export const settings = (value: { label: string } | null) => value || { label: "default" }\n',
  ],
}
