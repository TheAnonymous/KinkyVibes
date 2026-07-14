import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

interface ParsedToken {
  name: string
  value: string
}

function parseTokens(css: string): ParsedToken[] {
  return [...css.matchAll(/^\s*(--kv-[\w-]+)\s*:\s*([^;]+);/gm)].map((match) => ({
    name: match[1]!,
    value: match[2]!.trim(),
  }))
}

function groupFor(name: string) {
  if (name.startsWith('--kv-color-')) return 'Color'
  if (/--kv-(font|line|letter)-/.test(name)) return 'Typography'
  if (/--kv-(space|control|container|radius)-/.test(name)) return 'Space & Size'
  if (/--kv-(duration|ease|motion)-/.test(name)) return 'Motion'
  if (/--kv-(border|shadow)(-|$)/.test(name)) return 'Surface'
  if (name.startsWith('--kv-z-')) return 'Layering'
  return 'System'
}

function previewFor(name: string) {
  if (name.startsWith('--kv-color-')) return 'color'
  if (name.startsWith('--kv-shadow-')) return 'shadow'
  if (/--kv-(space|control|container|radius)-/.test(name)) return 'size'
  if (/--kv-(font|line|letter)-/.test(name)) return 'type'
  if (/--kv-(duration|ease|motion)-/.test(name)) return 'motion'
  return 'value'
}

const workspace = resolve(import.meta.dirname, '../../..')
const sourcePath = resolve(workspace, 'packages/ui/src/styles/tokens.css')
const builtPath = resolve(workspace, 'packages/ui/dist/tokens.css')
const outputPath = resolve(import.meta.dirname, '../src/generated/tokens.ts')

const [sourceCss, builtCss] = await Promise.all([
  readFile(sourcePath, 'utf8'),
  readFile(builtPath, 'utf8').catch(() => {
    throw new Error(`Built token stylesheet is missing at ${builtPath}. Build @kinky-vibes/ui before the docs app.`)
  }),
])

const sourceTokens = parseTokens(sourceCss)
const builtTokens = parseTokens(builtCss)
if (JSON.stringify(sourceTokens) !== JSON.stringify(builtTokens)) {
  throw new Error('Token drift detected: packages/ui/dist/tokens.css does not match the source token contract.')
}
if (!builtTokens.length) throw new Error('No --kv-* variables were found in the built token stylesheet.')

const inventory = builtTokens.map((token) => ({
  ...token,
  group: groupFor(token.name),
  preview: previewFor(token.name),
}))
const groups = [...new Set(inventory.map((token) => token.group))]
const output = `// Generated from packages/ui/dist/tokens.css by scripts/generate-tokens.ts.\n` +
  `// Do not edit by hand. The docs build checks the built stylesheet against source before writing this file.\n` +
  `export type TokenPreview = 'color' | 'shadow' | 'size' | 'type' | 'motion' | 'value'\n\n` +
  `export interface TokenRecord {\n  name: string\n  value: string\n  group: string\n  preview: TokenPreview\n}\n\n` +
  `export const tokenGroups = ${JSON.stringify(groups, null, 2)} as const\n\n` +
  `export const tokenInventory: readonly TokenRecord[] = ${JSON.stringify(inventory, null, 2)}\n`

await mkdir(dirname(outputPath), { recursive: true })
await writeFile(outputPath, output)
console.log(`Generated ${inventory.length} documentation tokens from the built stylesheet.`)
