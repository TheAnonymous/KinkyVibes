import { computed, defineComponent, h, nextTick, onBeforeUnmount, onMounted, ref, Teleport, type PropType } from 'vue'
import { useKvControllable } from '../composables/useKvControllable'
import { useKvId } from '../composables/useKvId'
import { useKvPosition } from '../composables/useKvPosition'
import type { KvBreadcrumbItem, KvMenuItem, KvPlacement, KvStep, KvTabItem } from '../types'

export const KvTabs = defineComponent({
  name: 'KvTabs',
  props: {
    modelValue: { type: String, default: undefined },
    defaultValue: String,
    items: { type: Array as PropType<KvTabItem[]>, required: true },
    orientation: { type: String as PropType<'horizontal' | 'vertical'>, default: 'horizontal' },
    label: { type: String, default: 'Tabs' },
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit, slots }) {
    const fallback = props.defaultValue ?? props.items.find((item) => !item.disabled)?.id ?? ''
    const value = useKvControllable<string>(props, 'modelValue', fallback, emit)
    const baseId = useKvId('tabs')
    const buttons = ref<HTMLButtonElement[]>([])
    const select = (item: KvTabItem, focus = false) => {
      if (item.disabled) return
      value.value = item.id
      emit('change', item.id)
      if (focus) void nextTick(() => buttons.value[props.items.indexOf(item)]?.focus())
    }
    const onKeydown = (event: KeyboardEvent, index: number) => {
      const previousKey = props.orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp'
      const nextKey = props.orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown'
      const enabledIndexes = props.items.flatMap((item, itemIndex) => item.disabled ? [] : [itemIndex])
      if (!enabledIndexes.length) return
      let next: number
      if (event.key === 'Home') next = enabledIndexes[0]!
      else if (event.key === 'End') next = enabledIndexes.at(-1)!
      else if (event.key === previousKey) next = (index - 1 + props.items.length) % props.items.length
      else if (event.key === nextKey) next = (index + 1) % props.items.length
      else return
      event.preventDefault()
      while (props.items[next]?.disabled && next !== index) next = (next + (event.key === previousKey ? -1 : 1) + props.items.length) % props.items.length
      if (props.items[next]) select(props.items[next]!, true)
    }
    return () => {
      const active = props.items.find((item) => item.id === value.value) ?? props.items[0]
      buttons.value = []
      return h('div', { class: ['kv-tabs', `kv-tabs--${props.orientation}`] }, [
        h('div', { class: 'kv-tabs__list', role: 'tablist', 'aria-label': props.label, 'aria-orientation': props.orientation },
          props.items.map((item, index) =>
            h('button', {
              ref: (element: any) => { if (element) buttons.value[index] = element },
              class: 'kv-tabs__tab', type: 'button', role: 'tab', disabled: item.disabled,
              id: `${baseId.value}-tab-${item.id}`, 'aria-controls': `${baseId.value}-panel-${item.id}`,
              'aria-selected': item.id === value.value, tabindex: item.id === value.value ? 0 : -1,
              onClick: () => select(item), onKeydown: (event: KeyboardEvent) => onKeydown(event, index),
            }, item.label),
          ),
        ),
        active && h('div', {
          class: 'kv-tabs__panel', role: 'tabpanel', tabindex: 0,
          id: `${baseId.value}-panel-${active.id}`, 'aria-labelledby': `${baseId.value}-tab-${active.id}`,
        }, slots[`panel-${active.id}`]?.({ item: active }) ?? slots.default?.({ item: active })),
      ])
    }
  },
})

export const KvBreadcrumbs = defineComponent({
  name: 'KvBreadcrumbs',
  props: { items: { type: Array as PropType<KvBreadcrumbItem[]>, required: true }, label: { type: String, default: 'Breadcrumb' } },
  setup: (props) => () =>
    h('nav', { class: 'kv-breadcrumbs', 'aria-label': props.label }, h('ol',
      props.items.map((item, index) => h('li', { class: 'kv-breadcrumbs__item' }, [
        index > 0 && h('span', { class: 'kv-breadcrumbs__separator', 'aria-hidden': 'true' }, '/'),
        item.href && index < props.items.length - 1
          ? h('a', { class: 'kv-link', href: item.href }, item.label)
          : h('span', { 'aria-current': index === props.items.length - 1 ? 'page' : undefined }, item.label),
      ])),
    )),
})

export const KvPagination = defineComponent({
  name: 'KvPagination',
  props: {
    modelValue: { type: Number, default: undefined }, defaultValue: { type: Number, default: 1 },
    total: { type: Number, required: true }, pageSize: { type: Number, default: 10 }, siblingCount: { type: Number, default: 1 },
    label: { type: String, default: 'Pagination' },
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    const page = useKvControllable<number>(props, 'modelValue', props.defaultValue, emit)
    const count = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))
    const pages = computed(() => {
      const values = new Set([1, count.value])
      for (let index = Math.max(1, page.value - props.siblingCount); index <= Math.min(count.value, page.value + props.siblingCount); index++) values.add(index)
      const sorted = [...values].sort((a, b) => a - b)
      return sorted.flatMap((item, index) => index > 0 && item - sorted[index - 1]! > 1 ? [-1, item] : [item])
    })
    const go = (next: number) => {
      const bounded = Math.max(1, Math.min(count.value, next))
      if (bounded === page.value) return
      page.value = bounded
      emit('change', bounded)
    }
    return () => h('nav', { class: 'kv-pagination', 'aria-label': props.label }, [
      h('button', { class: 'kv-pagination__button', type: 'button', disabled: page.value <= 1, 'aria-label': 'Previous page', onClick: () => go(page.value - 1) }, '‹'),
      ...pages.value.map((item) => item === -1
        ? h('span', { class: 'kv-pagination__ellipsis', 'aria-hidden': 'true' }, '…')
        : h('button', { class: 'kv-pagination__button', type: 'button', 'aria-label': `Page ${item}`, 'aria-current': item === page.value ? 'page' : undefined, onClick: () => go(item) }, String(item))),
      h('button', { class: 'kv-pagination__button', type: 'button', disabled: page.value >= count.value, 'aria-label': 'Next page', onClick: () => go(page.value + 1) }, '›'),
    ])
  },
})

export const KvSteps = defineComponent({
  name: 'KvSteps',
  props: {
    items: { type: Array as PropType<KvStep[]>, required: true },
    current: { type: [Number, String] as PropType<number | string>, default: 0 },
    label: { type: String, default: 'Progress' },
  },
  setup(props) {
    const index = computed(() => typeof props.current === 'number' ? props.current : props.items.findIndex((item) => item.id === props.current))
    return () => h('ol', { class: 'kv-steps', 'aria-label': props.label }, props.items.map((item, itemIndex) =>
      h('li', { class: 'kv-steps__item', 'data-state': itemIndex < index.value ? 'complete' : itemIndex === index.value ? 'current' : 'pending', 'aria-current': itemIndex === index.value ? 'step' : undefined }, [
        h('span', { class: 'kv-steps__marker', 'aria-hidden': 'true' }, itemIndex < index.value ? '✓' : String(itemIndex + 1).padStart(2, '0')),
        h('span', { class: 'kv-steps__content' }, [h('span', { class: 'kv-steps__label' }, item.label), item.description && h('span', { class: 'kv-steps__description' }, item.description)]),
      ]),
    ))
  },
})

export const KvDropdownMenu = defineComponent({
  name: 'KvDropdownMenu',
  props: {
    open: { type: Boolean, default: undefined }, defaultOpen: Boolean,
    items: { type: Array as PropType<KvMenuItem[]>, required: true },
    triggerLabel: { type: String, default: 'Open menu' },
    placement: { type: String as PropType<KvPlacement>, default: 'bottom-start' },
  },
  emits: ['update:open', 'select'],
  setup(props, { emit, slots }) {
    const isOpen = useKvControllable<boolean>(props, 'open', props.defaultOpen, emit)
    const trigger = ref<HTMLElement | null>(null)
    const menu = ref<HTMLElement | null>(null)
    const mounted = ref(false)
    const active = ref(0)
    const placement = computed(() => props.placement)
    const { style, resolvedPlacement } = useKvPosition(trigger, menu, isOpen, placement)
    const close = (restore = true) => {
      isOpen.value = false
      if (restore) void nextTick(() => trigger.value?.focus())
    }
    const focusActive = () => void nextTick(() => menu.value?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')[active.value]?.focus())
    const move = (direction: 1 | -1) => {
      if (!props.items.some((item) => !item.disabled)) return
      do active.value = (active.value + direction + props.items.length) % props.items.length
      while (props.items[active.value]?.disabled)
      focusActive()
    }
    const onKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); close() }
      else if (event.key === 'ArrowDown') { event.preventDefault(); move(1) }
      else if (event.key === 'ArrowUp') { event.preventDefault(); move(-1) }
      else if (event.key === 'Home') { event.preventDefault(); active.value = 0; focusActive() }
      else if (event.key === 'End') { event.preventDefault(); active.value = props.items.length - 1; focusActive() }
    }
    const select = (item: KvMenuItem) => {
      if (item.disabled) return
      emit('select', item)
      close()
    }
    const pointer = (event: PointerEvent) => {
      if (!isOpen.value || trigger.value?.contains(event.target as Node) || menu.value?.contains(event.target as Node)) return
      close(false)
    }
    onMounted(() => { mounted.value = true; document.addEventListener('pointerdown', pointer) })
    onBeforeUnmount(() => document.removeEventListener('pointerdown', pointer))
    return () => h('div', { class: 'kv-dropdown' }, [
      h('button', {
        ref: trigger, class: 'kv-dropdown__trigger', type: 'button', 'aria-label': props.triggerLabel,
        'aria-haspopup': 'menu', 'aria-expanded': isOpen.value,
        onClick: () => { isOpen.value = !isOpen.value; if (isOpen.value) focusActive() },
        onKeydown: (event: KeyboardEvent) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); isOpen.value = true; active.value = event.key === 'ArrowDown' ? 0 : props.items.length - 1; focusActive() }
        },
      }, slots.trigger?.() ?? props.triggerLabel),
      isOpen.value && h(Teleport, { to: 'body', disabled: !mounted.value }, h('div', {
        ref: menu, class: 'kv-menu', role: 'menu', style: style.value, 'data-placement': resolvedPlacement.value, onKeydown,
      }, props.items.map((item, index) => h('button', {
        class: ['kv-menu__item', item.danger && 'kv-menu__item--danger'], type: 'button', role: 'menuitem',
        tabindex: index === active.value ? 0 : -1, disabled: item.disabled,
        onPointerenter: () => { active.value = index }, onClick: () => select(item),
      }, [item.icon && h(item.icon, { 'aria-hidden': 'true' }), item.label])))),
    ])
  },
})
