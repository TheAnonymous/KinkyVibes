import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { componentDocs, staticPages } from '../src/catalog'

const entries = [
  ...staticPages,
  ...componentDocs.map((entry) => ({
    title: entry.name,
    path: `/components/${entry.slug}`,
    text: `${entry.category} ${entry.description} ${entry.props.map((prop) => `${prop.name} ${prop.type}`).join(' ')} ${(entry.keyboard ?? []).join(' ')}`,
    kind: 'component' as const,
    category: entry.category,
  })),
]

const publicDir = resolve(import.meta.dirname, '../public')
await mkdir(publicDir, { recursive: true })
await writeFile(resolve(publicDir, 'search-index.json'), `${JSON.stringify(entries, null, 2)}\n`)
