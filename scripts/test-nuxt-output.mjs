import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const port = await new Promise((resolvePort, reject) => {
  const server = createServer()
  server.once('error', reject)
  server.listen(0, '127.0.0.1', () => {
    const address = server.address()
    assert(address && typeof address === 'object')
    const selected = address.port
    server.close(() => resolvePort(selected))
  })
})

const output = []
const server = spawn('node', ['fixtures/nuxt-consumer/.output/server/index.mjs'], {
  cwd: root,
  env: { ...process.env, HOST: '127.0.0.1', PORT: String(port), NODE_ENV: 'production' },
  stdio: ['ignore', 'pipe', 'pipe'],
})
server.stdout.on('data', (chunk) => output.push(chunk.toString()))
server.stderr.on('data', (chunk) => output.push(chunk.toString()))

try {
  let response
  for (let attempt = 0; attempt < 50; attempt++) {
    try {
      response = await fetch(`http://127.0.0.1:${port}/`)
      if (response.ok) break
    } catch {
      await new Promise((resolveWait) => setTimeout(resolveWait, 100))
    }
  }
  assert(response?.ok, `Nuxt output did not start successfully.\n${output.join('')}`)
  const html = await response.text()
  assert.match(html, /Nuxt package fixture/)
  assert.match(html, /SSR signal/)
  assert.match(html, /Hydration-safe field|deterministic IDs/)
  assert.doesNotMatch(html, /Nuxt build error|Internal Server Error/)
  console.log('Nuxt production output rendered the packed component tree.')
} finally {
  server.kill('SIGTERM')
  await Promise.race([
    new Promise((resolveExit) => server.once('exit', resolveExit)),
    new Promise((resolveWait) => setTimeout(resolveWait, 2000)),
  ])
  if (!server.killed) server.kill('SIGKILL')
}
