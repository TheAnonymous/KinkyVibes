import assert from 'node:assert/strict'
import { Window } from 'happy-dom'

const browser = new Window({ url: 'http://localhost/' })
const browserGlobals = {
  window: browser,
  document: browser.document,
  navigator: browser.navigator,
  Node: browser.Node,
  Element: browser.Element,
  HTMLElement: browser.HTMLElement,
  SVGElement: browser.SVGElement,
  getComputedStyle: browser.getComputedStyle.bind(browser),
}
for (const [name, value] of Object.entries(browserGlobals)) {
  Object.defineProperty(globalThis, name, { configurable: true, value, writable: true })
}

const [{ createSSRApp, defineComponent, h, nextTick }, { renderToString }, ui] = await Promise.all([
  import('vue'),
  import('@vue/server-renderer'),
  import('@kinky-vibes/ui'),
])

const Root = defineComponent({
  render: () =>
    h(ui.KvProvider, null, () => [
      h(ui.KvField, { label: 'Hydrated identifier', description: 'Stable association' }, () =>
        h(ui.KvInput, { defaultValue: 'AX-17' }),
      ),
      h(ui.KvTabs, {
        items: [
          { id: 'status', label: 'Status' },
          { id: 'routing', label: 'Routing' },
        ],
        defaultValue: 'status',
      }, { default: ({ item }: any) => `Panel ${item.label}` }),
      h(ui.KvDialog, { defaultOpen: true, title: 'Hydrated dialog' }, () => h('button', 'Continue')),
    ]),
})

const serverHtml = await renderToString(createSSRApp(Root))
const container = document.createElement('div')
container.id = 'app'
container.innerHTML = serverHtml
document.body.append(container)

const warnings: string[] = []
const errors: string[] = []
const originalError = console.error
console.error = (...args: unknown[]) => errors.push(args.join(' '))

const app = createSSRApp(Root)
app.config.warnHandler = (message) => warnings.push(message)
app.mount(container)
await nextTick()
await nextTick()

const label = container.querySelector('label')
const input = container.querySelector('input')
assert(label && input)
assert.equal(label.getAttribute('for'), input.id)
assert(document.body.querySelector('[role="dialog"]'), 'mounted teleport should retain the open dialog')
assert.equal(warnings.filter((message) => /hydration|mismatch/i.test(message)).length, 0, warnings.join('\n'))
assert.equal(errors.filter((message) => /hydration|mismatch/i.test(message)).length, 0, errors.join('\n'))

app.unmount()
console.error = originalError
await browser.close()

console.log('Vue hydration smoke checks passed without mismatches.')
