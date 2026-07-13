import { cp, copyFile, mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const dist = resolve(root, 'dist')

await mkdir(dist, { recursive: true })
await copyFile(resolve(root, 'src/styles/tokens.css'), resolve(dist, 'tokens.css'))
await copyFile(resolve(root, 'src/styles/styles.css'), resolve(dist, 'styles.css'))
await copyFile(resolve(dist, 'icons/index.d.ts'), resolve(dist, 'icons.d.ts'))
await copyFile(resolve(dist, 'icons/index.d.ts.map'), resolve(dist, 'icons.d.ts.map'))
await cp(resolve(root, 'src/styles/fonts'), resolve(dist, 'fonts'), { recursive: true })
