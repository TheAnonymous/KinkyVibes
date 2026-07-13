import assert from 'node:assert/strict'
import { createSSRApp, h } from 'vue'
import { renderToString } from '@vue/server-renderer'

delete (globalThis as any).window
delete (globalThis as any).document

const ui = await import('@kinky-vibes/ui')
const icons = await import('@kinky-vibes/ui/icons')

assert.equal(typeof ui.KvDialog, 'object', 'main export should import without a DOM')
assert.equal(typeof icons.KvCheckIcon, 'object', 'icons export should import without a DOM')

async function renderRepresentativeTree() {
  const app = createSSRApp({
    render: () =>
      h(ui.KvProvider, null, () => [
        h(ui.KvHeading, { level: 1 }, () => 'SSR signal'),
        h(ui.KvField, { label: 'Identifier', description: 'Hydration-safe field' }, () =>
          h(ui.KvInput, { defaultValue: 'AX-17' }),
        ),
        h(ui.KvTabs, {
          items: [
            { id: 'status', label: 'Status' },
            { id: 'routing', label: 'Routing' },
          ],
          defaultValue: 'status',
        }, { default: ({ item }: any) => `Panel ${item.label}` }),
        h(ui.KvDialog, { defaultOpen: true, title: 'SSR dialog' }, () => 'Inline until mounted'),
      ]),
  })
  return renderToString(app)
}

const first = await renderRepresentativeTree()
const second = await renderRepresentativeTree()

assert.match(first, /SSR signal/)
assert.match(first, /Hydration-safe field/)
assert.match(first, /aria-describedby="kv-field-v-\d+-description"/)
assert.match(first, /role="dialog"/)
assert.match(first, /Inline until mounted/)
assert.equal(first, second, 'fresh SSR apps should produce deterministic markup')

console.log('Vue SSR import and render smoke checks passed.')
