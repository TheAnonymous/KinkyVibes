import assert from 'node:assert/strict'
import { cp, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { basename, join, resolve } from 'node:path'
import { spawn } from 'node:child_process'

const root = resolve(import.meta.dirname, '..')
const temp = await mkdtemp(join(tmpdir(), 'kinky-vibes-pack-'))

function run(command, args, options = {}) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, { cwd: root, stdio: ['ignore', 'pipe', 'pipe'], ...options })
    let stdout = ''
    let stderr = ''
    child.stdout?.on('data', (chunk) => { stdout += chunk })
    child.stderr?.on('data', (chunk) => { stderr += chunk })
    child.on('error', reject)
    child.on('close', (code) => {
      if (code === 0) resolvePromise({ stdout, stderr })
      else reject(new Error(`${command} ${args.join(' ')} failed (${code})\n${stdout}\n${stderr}`))
    })
  })
}

async function prepareFixture(name, tarball) {
  const source = join(root, 'fixtures', name)
  const target = join(temp, name)
  await cp(source, target, { recursive: true, filter: (path) => !path.includes('node_modules') && !path.includes('/.nuxt') && !path.includes('/.output') && !path.endsWith('/dist') })
  const packagePath = join(target, 'package.json')
  const packageJson = JSON.parse(await readFile(packagePath, 'utf8'))
  packageJson.dependencies['@kinky-vibes/ui'] = `file:${tarball}`
  await writeFile(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`)
  return target
}

try {
  await run('npm', ['run', 'build:ui'])
  const packed = await run('npm', ['pack', '-w', '@kinky-vibes/ui', '--pack-destination', temp, '--json'])
  const packInfo = JSON.parse(packed.stdout)
  const artifact = Array.isArray(packInfo) ? packInfo[0] : Object.values(packInfo)[0]
  assert(artifact, 'npm pack should report one workspace artifact')
  const tarball = join(temp, artifact.filename)
  const files = new Set(artifact.files.map((file) => file.path))
  for (const required of ['dist/index.js', 'dist/index.d.ts', 'dist/icons.js', 'dist/icons.d.ts', 'dist/styles.css', 'dist/tokens.css', 'dist/fonts/Inter-Variable.ttf', 'dist/fonts/BarlowCondensed-Variable.ttf', 'dist/fonts/Saira-Variable.ttf', 'dist/fonts/OFL-Saira.txt']) {
    assert(files.has(required), `packed artifact is missing ${required}`)
  }

  const packageJson = JSON.parse(await readFile(join(root, 'packages/ui/package.json'), 'utf8'))
  assert.equal(packageJson.dependencies, undefined, 'UI package must not have runtime dependencies')
  assert.deepEqual(packageJson.peerDependencies, { vue: '>=3.5 <4' })

  for (const fixture of ['vue-consumer', 'nuxt-consumer']) {
    const fixtureRoot = await prepareFixture(fixture, tarball)
    process.stdout.write(`Installing ${fixture} from ${basename(tarball)}…\n`)
    await run('npm', ['install', '--ignore-scripts'], { cwd: fixtureRoot })
    if (fixture === 'vue-consumer') await run('npm', ['run', 'typecheck'], { cwd: fixtureRoot })
    await run('npm', ['run', 'build'], { cwd: fixtureRoot })
  }

  console.log('Packed Vue and Nuxt consumer checks passed.')
} finally {
  await rm(temp, { recursive: true, force: true })
}
