import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, defineComponent, h, nextTick, ref } from 'vue'
import { config, mount } from '@vue/test-utils'
import {
  KinkyVibes,
  KvAlert,
  KvButton,
  KvCombobox,
  KvDialog,
  KvDropdownMenu,
  KvField,
  KvInput,
  KvTable,
  KvTabs,
  KvTooltip,
  KvToastProvider,
  useKvToast,
  type KvSortState,
} from '../src'
import { KvCheckIcon } from '../src/icons'

config.global.stubs = { transition: false, 'transition-group': false }

const mountedWrappers: Array<ReturnType<typeof mount>> = []
const trackedMount = (...args: Parameters<typeof mount>) => {
  const wrapper = mount(...args)
  mountedWrappers.push(wrapper)
  return wrapper
}

afterEach(() => {
  mountedWrappers.splice(0).forEach((wrapper) => wrapper.unmount())
  vi.useRealTimers()
})

describe('public package contracts', () => {
  it('registers every component through the optional plugin', () => {
    const app = createApp({ render: () => null })
    app.use(KinkyVibes)
    expect(app.component('KvButton')).toBe(KvButton)
    expect(app.component('KvDialog')).toBe(KvDialog)
    expect(app.component('KvToastProvider')).toBe(KvToastProvider)
  })

  it('renders system icons with currentColor and an accessible optional label', () => {
    const wrapper = trackedMount(KvCheckIcon, { props: { label: 'Complete' } })
    expect(wrapper.attributes('stroke')).toBe('currentColor')
    expect(wrapper.attributes('role')).toBe('img')
    expect(wrapper.attributes('aria-label')).toBe('Complete')
  })

  it('keeps visual alert status separate from opt-in announcement priority', () => {
    const silent = trackedMount(KvAlert, { props: { status: 'error', title: 'Visual error' } })
    expect(silent.attributes('role')).toBeUndefined()
    const polite = trackedMount(KvAlert, { props: { announce: 'polite', title: 'Stored' } })
    expect(polite.attributes('role')).toBe('status')
    const assertive = trackedMount(KvAlert, { props: { status: 'neutral', announce: 'assertive', title: 'Disconnected' } })
    expect(assertive.attributes('role')).toBe('alert')
  })

  it('forwards tooltip behavior and description directly to one HTML trigger', async () => {
    vi.useFakeTimers()
    const clicked = vi.fn()
    const wrapper = trackedMount(KvTooltip, {
      attachTo: document.body,
      props: { text: 'Channel metadata', delay: 0 },
      slots: { default: () => h('button', { type: 'button', onClick: clicked }, 'Inspect') },
    })
    const trigger = wrapper.get('button')
    expect(trigger.classes()).toContain('kv-tooltip__trigger')
    expect(trigger.attributes('tabindex')).toBeUndefined()
    await trigger.trigger('click')
    expect(clicked).toHaveBeenCalledOnce()
    await trigger.trigger('focus')
    vi.runAllTimers()
    await nextTick()
    const tooltip = document.querySelector<HTMLElement>('[role="tooltip"]')
    expect(tooltip?.textContent).toBe('Channel metadata')
    expect(trigger.attributes('aria-describedby')).toBe(tooltip?.id)
  })
})

describe('form state and field wiring', () => {
  it('connects label, description, error, required, and input ID', () => {
    const wrapper = trackedMount(KvField, {
      props: { label: 'Signal', description: 'Short identifier', error: 'Already used', required: true },
      slots: { default: () => h(KvInput) },
    })
    const label = wrapper.get('label')
    const input = wrapper.get('input')
    const description = wrapper.get('.kv-field__description')
    const error = wrapper.get('.kv-field__error')

    expect(input.attributes('id')).toBe(label.attributes('for'))
    expect(input.attributes('aria-describedby')).toBe(`${description.attributes('id')} ${error.attributes('id')}`)
    expect(input.attributes('aria-invalid')).toBe('true')
    expect(input.attributes('required')).toBeDefined()
  })

  it('supports uncontrolled input state and still emits updates', async () => {
    const wrapper = trackedMount(KvInput, { props: { defaultValue: 'alpha' } })
    const input = wrapper.get('input')
    expect(input.element.value).toBe('alpha')
    await input.setValue('bravo')
    expect(input.element.value).toBe('bravo')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['bravo'])
  })

  it('leaves controlled state with the parent', async () => {
    const wrapper = trackedMount(KvInput, { props: { modelValue: 'fixed' } })
    await wrapper.get('input').setValue('attempt')
    expect(wrapper.emitted('update:modelValue')).toEqual([['attempt']])
    await wrapper.setProps({ modelValue: 'parent' })
    expect(wrapper.get('input').element.value).toBe('parent')
  })
})

describe('keyboard interaction', () => {
  it('moves tabs with Arrow, Home, and End while skipping disabled tabs', async () => {
    const wrapper = trackedMount(KvTabs, {
      attachTo: document.body,
      props: {
        defaultValue: 'one',
        items: [
          { id: 'one', label: 'One' },
          { id: 'two', label: 'Two', disabled: true },
          { id: 'three', label: 'Three' },
        ],
      },
    })
    const buttons = wrapper.findAll('[role="tab"]')
    await buttons[0]!.trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['three'])
    expect(document.activeElement).toBe(buttons[2]!.element)
    await buttons[2]!.trigger('keydown', { key: 'Home' })
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['one'])
    await buttons[0]!.trigger('keydown', { key: 'End' })
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['three'])
  })

  it('filters and selects combobox options with the standard listbox keys', async () => {
    const wrapper = trackedMount(KvCombobox, {
      attachTo: document.body,
      props: {
        options: [
          { value: 'alpha', label: 'Alpha' },
          { value: 'bravo', label: 'Bravo' },
          { value: 'charlie', label: 'Charlie' },
        ],
      },
    })
    const input = wrapper.get('input')
    await input.setValue('br')
    expect(wrapper.findAll('[role="option"]')).toHaveLength(1)
    await input.trigger('keydown', { key: 'ArrowDown' })
    await input.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['bravo'])
    expect(input.element.value).toBe('Bravo')
    expect(wrapper.find('[role="listbox"]').exists()).toBe(false)
  })

  it('keeps enabled combobox and menu items visible for Home and End', async () => {
    const scrollIntoView = vi.fn()
    HTMLElement.prototype.scrollIntoView = scrollIntoView
    const options = [
      { value: 'disabled-first', label: 'Disabled first', disabled: true },
      { value: 'alpha', label: 'Alpha' },
      { value: 'disabled-middle', label: 'Disabled middle', disabled: true },
      { value: 'omega', label: 'Omega' },
      { value: 'disabled-last', label: 'Disabled last', disabled: true },
    ]
    const combobox = trackedMount(KvCombobox, { attachTo: document.body, props: { options } })
    const input = combobox.get('input')
    await input.trigger('focus')
    await input.trigger('keydown', { key: 'End' })
    expect(input.attributes('aria-activedescendant')).toMatch(/-3$/)
    await input.trigger('keydown', { key: 'Home' })
    expect(input.attributes('aria-activedescendant')).toMatch(/-1$/)

    const menu = trackedMount(KvDropdownMenu, {
      attachTo: document.body,
      props: { items: options.map((option) => ({ id: option.value, label: option.label, disabled: option.disabled })) },
    })
    await menu.get('.kv-dropdown__trigger').trigger('click')
    await nextTick()
    const menuElement = document.querySelector<HTMLElement>('[role="menu"]')!
    expect(document.activeElement?.textContent).toBe('Alpha')
    menuElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }))
    await nextTick()
    expect(document.activeElement?.textContent).toBe('Omega')
    expect(scrollIntoView).toHaveBeenCalled()
  })
})

describe('consumer-owned table state', () => {
  const rows = [
    { id: 'b', name: 'Bravo' },
    { id: 'a', name: 'Alpha' },
  ]

  it('emits sorting and selection without reordering consumer data', async () => {
    const wrapper = trackedMount(KvTable, {
      props: {
        items: rows,
        columns: [{ key: 'name', label: 'Name', sortable: true }],
        rowKey: 'id',
        selectable: true,
      },
    })
    expect(wrapper.findAll('tbody tr').map((row) => row.text())).toEqual(['Bravo', 'Alpha'])
    await wrapper.get('.kv-table__sort').trigger('click')
    expect(wrapper.emitted('sort-change')?.at(-1)).toEqual([{ key: 'name', direction: 'asc' } satisfies KvSortState])
    expect(wrapper.findAll('tbody tr').map((row) => row.text())).toEqual(['Bravo', 'Alpha'])
    await wrapper.findAll('tbody input[type="checkbox"]')[0]!.setValue(true)
    expect(wrapper.emitted('selection-change')?.at(-1)).toEqual([['b']])
  })

  it('renders loading and empty states in semantic table rows', () => {
    const loading = trackedMount(KvTable, { props: { items: [], columns: [{ key: 'name', label: 'Name' }], rowKey: 'id', loading: true } })
    expect(loading.get('.kv-table__state').text()).toContain('Loading data')
    const empty = trackedMount(KvTable, { props: { items: [], columns: [{ key: 'name', label: 'Name' }], rowKey: 'id' } })
    expect(empty.get('.kv-table__state').text()).toBe('No data available')
  })
})

describe('modal and toast lifecycle', () => {
  it('traps focus, closes on Escape, restores focus, and releases scroll lock', async () => {
    const Host = defineComponent({
      setup() {
        const open = ref(false)
        return () => h('div', [
          h('button', { id: 'trigger', onClick: () => (open.value = true) }, 'Open'),
          h(KvDialog, { open: open.value, title: 'Review', 'onUpdate:open': (value: boolean) => (open.value = value) }, {
            default: () => [h('button', { id: 'first' }, 'First'), h('button', { id: 'last' }, 'Last')],
          }),
        ])
      },
    })
    trackedMount(Host, { attachTo: document.body })
    const trigger = document.querySelector<HTMLButtonElement>('#trigger')!
    trigger.focus()
    trigger.click()
    await nextTick()
    await nextTick()
    expect(document.documentElement.style.overflow).toBe('hidden')
    expect(document.activeElement?.getAttribute('aria-label')).toBe('Close')

    document.querySelector<HTMLButtonElement>('#last')!.focus()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }))
    expect(document.activeElement?.getAttribute('aria-label')).toBe('Close')

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await nextTick()
    expect(document.querySelector('[role="dialog"]')).not.toBeNull()
    expect(document.documentElement.style.overflow).toBe('hidden')
    await new Promise((resolve) => setTimeout(resolve, 280))
    expect(document.querySelector('[role="dialog"]')).toBeNull()
    expect(document.activeElement).toBe(trigger)
    expect(document.documentElement.style.overflow).toBe('')
  })

  it('provides timed and dismissible toasts', async () => {
    vi.useFakeTimers()
    const Trigger = defineComponent({
      setup() {
        const { toast } = useKvToast()
        return () => h('button', { onClick: () => toast({ title: 'Stored', duration: 1000 }) }, 'Toast')
      },
    })
    const wrapper = trackedMount(KvToastProvider, { attachTo: document.body, slots: { default: () => h(Trigger) } })
    await wrapper.get('button').trigger('click')
    await nextTick()
    expect(document.querySelector('.kv-toast__title')?.textContent).toBe('Stored')
    vi.advanceTimersByTime(1000)
    await nextTick()
    vi.advanceTimersByTime(500)
    await nextTick()
    expect(document.querySelector('.kv-toast')).toBeNull()
  })

  it('pauses toast timers for hover and focus-within, then resumes the true remainder', async () => {
    vi.useFakeTimers()
    const Trigger = defineComponent({
      setup() {
        const { toast } = useKvToast()
        return () => h('button', { onClick: () => toast({ title: 'Calibrating', actionLabel: 'Inspect', duration: 1000 }) }, 'Toast')
      },
    })
    const wrapper = trackedMount(KvToastProvider, { attachTo: document.body, slots: { default: () => h(Trigger) } })
    await wrapper.get('button').trigger('click')
    await nextTick()
    vi.advanceTimersByTime(400)
    const toast = document.querySelector<HTMLElement>('.kv-toast')!
    toast.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }))
    const action = toast.querySelector<HTMLButtonElement>('.kv-toast__action')!
    action.focus()
    toast.dispatchEvent(new PointerEvent('pointerleave', { bubbles: true }))
    vi.advanceTimersByTime(1200)
    await nextTick()
    expect(document.querySelector('.kv-toast')).not.toBeNull()
    action.blur()
    vi.advanceTimersByTime(599)
    await nextTick()
    expect(document.querySelector('.kv-toast')).not.toBeNull()
    vi.advanceTimersByTime(1)
    await nextTick()
    vi.advanceTimersByTime(500)
    await nextTick()
    expect(document.querySelector('.kv-toast')).toBeNull()
  })

  it('keeps duration-zero toasts until explicit dismissal', async () => {
    vi.useFakeTimers()
    const Trigger = defineComponent({
      setup() {
        const { toast } = useKvToast()
        return () => h('button', { onClick: () => toast({ title: 'Pinned', duration: 0 }) }, 'Toast')
      },
    })
    const wrapper = trackedMount(KvToastProvider, { attachTo: document.body, slots: { default: () => h(Trigger) } })
    await wrapper.get('button').trigger('click')
    vi.advanceTimersByTime(60_000)
    await nextTick()
    expect(document.querySelector('.kv-toast__title')?.textContent).toBe('Pinned')
  })
})
