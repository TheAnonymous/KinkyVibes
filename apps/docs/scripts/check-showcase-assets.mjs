import { readdir, readFile, stat } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const docsRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const assetRoot = path.join(docsRoot, 'src/assets/showcase')

const assets = [
  ['hero-1600.webp', 1600, 1000, 420],
  ['hero-800.webp', 800, 500, 180],
  ...['actions', 'data-disclosure', 'feedback', 'forms', 'foundations', 'navigation', 'overlays']
    .flatMap((name) => [
      [`${name}-960.webp`, 960, 720, 220],
      [`${name}-480.webp`, 480, 360, 90],
    ]),
  ['system-field-1600.webp', 1600, 640, 320],
  ['system-field-800.webp', 800, 320, 110],
  ...['feature-css', 'feature-focus', 'feature-ssr']
    .flatMap((name) => [
      [`${name}-720.webp`, 720, 480, 160],
      [`${name}-360.webp`, 360, 240, 55],
    ]),
  ...['page-accessibility', 'page-customization', 'page-installation', 'page-ssr', 'page-tokens']
    .flatMap((name) => [
      [`${name}-1200.webp`, 1200, 600, 280],
      [`${name}-600.webp`, 600, 300, 100],
    ]),
]

function webpDimensions(buffer) {
  if (buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WEBP') {
    throw new Error('not a RIFF WebP file')
  }

  const chunks = []
  let width
  let height
  let offset = 12

  while (offset + 8 <= buffer.length) {
    const type = buffer.toString('ascii', offset, offset + 4)
    const size = buffer.readUInt32LE(offset + 4)
    const data = offset + 8
    chunks.push(type)

    if (type === 'VP8X' && size >= 10) {
      width = 1 + buffer.readUIntLE(data + 4, 3)
      height = 1 + buffer.readUIntLE(data + 7, 3)
    } else if (type === 'VP8 ' && size >= 10 && buffer[data + 3] === 0x9d && buffer[data + 4] === 0x01 && buffer[data + 5] === 0x2a) {
      width = buffer.readUInt16LE(data + 6) & 0x3fff
      height = buffer.readUInt16LE(data + 8) & 0x3fff
    } else if (type === 'VP8L' && size >= 5 && buffer[data] === 0x2f) {
      const bits = buffer.readUInt32LE(data + 1)
      width = 1 + (bits & 0x3fff)
      height = 1 + ((bits >> 14) & 0x3fff)
    }

    offset = data + size + (size % 2)
  }

  if (!width || !height) throw new Error('missing supported WebP image chunk')
  return { width, height, chunks }
}

const expectedNames = new Set(assets.map(([name]) => name))
const actualNames = await readdir(assetRoot)
const unexpected = actualNames.filter((name) => !expectedNames.has(name))
const missing = [...expectedNames].filter((name) => !actualNames.includes(name))

if (unexpected.length || missing.length) {
  throw new Error(`showcase asset set mismatch; missing: ${missing.join(', ') || 'none'}; unexpected: ${unexpected.join(', ') || 'none'}`)
}

for (const [name, expectedWidth, expectedHeight, budgetKb] of assets) {
  const file = path.join(assetRoot, name)
  const [buffer, details] = await Promise.all([readFile(file), stat(file)])
  const { width, height, chunks } = webpDimensions(buffer)
  const metadata = chunks.filter((chunk) => ['ICCP', 'EXIF', 'XMP '].includes(chunk))

  if (width !== expectedWidth || height !== expectedHeight) {
    throw new Error(`${name}: expected ${expectedWidth}x${expectedHeight}, received ${width}x${height}`)
  }
  if (details.size > budgetKb * 1024) {
    throw new Error(`${name}: ${(details.size / 1024).toFixed(1)} KiB exceeds ${budgetKb} KiB budget`)
  }
  if (metadata.length) {
    throw new Error(`${name}: metadata/profile chunks must be stripped (${metadata.join(', ')})`)
  }

  console.log(`${name}: ${width}x${height}, ${(details.size / 1024).toFixed(1)} KiB, implicit sRGB, metadata-free`)
}

const favicon = await readFile(path.join(docsRoot, 'public/favicon.svg'), 'utf8')
if (!/<svg\b[^>]*\bviewBox=/.test(favicon) || /<script\b/i.test(favicon)) {
  throw new Error('public/favicon.svg must be a viewBox-based, script-free SVG')
}
console.log('favicon.svg: viewBox present, script-free')
