import { defineComponent, h, type PropType } from 'vue'
import { useKvControllable } from '../composables/useKvControllable'
import { useKvId } from '../composables/useKvId'
import type { KvAccordionItem, KvRowKey, KvSortState, KvTableColumn } from '../types'

export const KvCard = defineComponent({
  name: 'KvCard',
  props: {
    as: { type: String, default: 'article' },
    interactive: Boolean,
    padding: { type: String as PropType<'none' | 'sm' | 'md' | 'lg'>, default: 'md' },
  },
  setup: (props, { slots }) => () =>
    h(props.as, { class: ['kv-card', `kv-card--${props.padding}`, props.interactive && 'kv-card--interactive'] }, [
      slots.header && h('header', { class: 'kv-card__header' }, slots.header()),
      h('div', { class: 'kv-card__body' }, slots.default?.()),
      slots.footer && h('footer', { class: 'kv-card__footer' }, slots.footer()),
    ]),
})

export const KvAccordion = defineComponent({
  name: 'KvAccordion',
  props: {
    modelValue: { type: [String, Array] as PropType<string | string[]>, default: undefined },
    defaultValue: { type: [String, Array] as PropType<string | string[]>, default: () => [] },
    items: { type: Array as PropType<KvAccordionItem[]>, required: true },
    multiple: Boolean,
    headingLevel: { type: Number as PropType<2 | 3 | 4 | 5 | 6>, default: 3 },
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit, slots }) {
    const state = useKvControllable<string | string[]>(props, 'modelValue', props.defaultValue, emit)
    const baseId = useKvId('accordion')
    const isOpen = (id: string) => Array.isArray(state.value) ? state.value.includes(id) : state.value === id
    const toggle = (id: string) => {
      if (props.multiple) {
        const current = Array.isArray(state.value) ? state.value : state.value ? [state.value] : []
        state.value = current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
      } else state.value = isOpen(id) ? '' : id
      emit('change', state.value)
    }
    return () => h('div', { class: 'kv-accordion' }, props.items.map((item) => {
      const open = isOpen(item.id)
      const triggerId = `${baseId.value}-trigger-${item.id}`
      const panelId = `${baseId.value}-panel-${item.id}`
      return h('section', { class: 'kv-accordion__item' }, [
        h(`h${props.headingLevel}`, { class: 'kv-accordion__heading' }, h('button', {
          class: 'kv-accordion__trigger', id: triggerId, type: 'button', disabled: item.disabled,
          'aria-expanded': open, 'aria-controls': panelId, onClick: () => toggle(item.id),
        }, [h('span', item.title), h('span', { class: 'kv-accordion__icon', 'aria-hidden': 'true' }, open ? '−' : '+')])),
        open && h('div', {
          class: 'kv-accordion__panel', id: panelId, role: 'region', 'aria-labelledby': triggerId,
        }, slots[`item-${item.id}`]?.({ item }) ?? slots.default?.({ item }) ?? item.content),
      ])
    }))
  },
})

type RowId = string | number

export interface KvTableProps<T> {
  items: T[]
  columns: KvTableColumn<T>[]
  rowKey: KvRowKey<T>
  sort?: KvSortState
  defaultSort?: KvSortState
  selectedKeys?: RowId[]
  defaultSelectedKeys?: RowId[]
  selectable?: boolean
  loading?: boolean
  loadingText?: string
  emptyText?: string
  caption?: string
}

export interface KvTableSlots<T> {
  empty?: () => any
  [name: `cell-${string}`]: ((props: { item: T; value: unknown; rowIndex: number }) => any) | undefined
}

const KvTableBase = defineComponent({
  name: 'KvTable',
  props: {
    items: { type: Array as PropType<any[]>, required: true },
    columns: { type: Array as PropType<KvTableColumn<any>[]>, required: true },
    rowKey: { type: [String, Function] as PropType<KvRowKey<any>>, required: true },
    sort: { type: Object as PropType<KvSortState>, default: undefined },
    defaultSort: { type: Object as PropType<KvSortState>, default: undefined },
    selectedKeys: { type: Array as PropType<RowId[]>, default: undefined },
    defaultSelectedKeys: { type: Array as PropType<RowId[]>, default: () => [] },
    selectable: Boolean,
    loading: Boolean,
    loadingText: { type: String, default: 'Loading data' },
    emptyText: { type: String, default: 'No data available' },
    caption: String,
  },
  emits: ['update:sort', 'sort-change', 'update:selectedKeys', 'selection-change', 'row-click'],
  setup(props, { emit, slots }) {
    const sort = useKvControllable<KvSortState | undefined>(props, 'sort', props.defaultSort, emit)
    const selection = useKvControllable<RowId[]>(props, 'selectedKeys', props.defaultSelectedKeys, emit)
    const keyFor = (item: any): RowId => typeof props.rowKey === 'function' ? props.rowKey(item) : item[props.rowKey] as RowId
    const sortable = (column: KvTableColumn<any>) => {
      if (!column.sortable) return
      const next: KvSortState = {
        key: column.key,
        direction: sort.value?.key === column.key && sort.value.direction === 'asc' ? 'desc' : 'asc',
      }
      sort.value = next
      emit('sort-change', next)
    }
    const setSelected = (key: RowId, next: boolean) => {
      selection.value = next ? [...new Set([...selection.value, key])] : selection.value.filter((item) => item !== key)
      emit('selection-change', selection.value)
    }
    const allSelected = () => props.items.length > 0 && props.items.every((item) => selection.value.includes(keyFor(item)))
    const toggleAll = (next: boolean) => {
      const visible = props.items.map(keyFor)
      selection.value = next ? [...new Set([...selection.value, ...visible])] : selection.value.filter((key) => !visible.includes(key))
      emit('selection-change', selection.value)
    }
    return () => h('div', { class: 'kv-table-wrap', 'aria-busy': props.loading || undefined }, h('table', { class: 'kv-table' }, [
      props.caption && h('caption', props.caption),
      h('thead', h('tr', [
        props.selectable && h('th', { class: 'kv-table__select', scope: 'col' }, h('input', {
          type: 'checkbox', 'aria-label': 'Select all visible rows', checked: allSelected(),
          onChange: (event: Event) => toggleAll((event.target as HTMLInputElement).checked),
        })),
        ...props.columns.map((column) => h('th', {
          scope: 'col', style: { width: column.width }, class: `kv-table__cell--${column.align ?? 'start'}`,
          'aria-sort': sort.value?.key === column.key ? (sort.value.direction === 'asc' ? 'ascending' : 'descending') : undefined,
        }, column.sortable
          ? h('button', { class: 'kv-table__sort', type: 'button', onClick: () => sortable(column) }, [
              column.label,
              h('span', { 'aria-hidden': 'true' }, sort.value?.key === column.key ? (sort.value.direction === 'asc' ? ' ↑' : ' ↓') : ' ↕'),
            ])
          : column.label)),
      ])),
      h('tbody', props.loading
        ? h('tr', h('td', { colspan: props.columns.length + (props.selectable ? 1 : 0), class: 'kv-table__state' }, [h('span', { class: 'kv-spinner', 'aria-hidden': 'true' }), h('span', props.loadingText)]))
        : props.items.length === 0
          ? h('tr', h('td', { colspan: props.columns.length + (props.selectable ? 1 : 0), class: 'kv-table__state' }, slots.empty?.() ?? props.emptyText))
          : props.items.map((item, rowIndex) => {
              const key = keyFor(item)
              return h('tr', { class: selection.value.includes(key) && 'is-selected', onClick: () => emit('row-click', item, rowIndex) }, [
                props.selectable && h('td', { class: 'kv-table__select' }, h('input', {
                  type: 'checkbox', 'aria-label': `Select row ${rowIndex + 1}`, checked: selection.value.includes(key),
                  onClick: (event: MouseEvent) => event.stopPropagation(),
                  onChange: (event: Event) => setSelected(key, (event.target as HTMLInputElement).checked),
                })),
                ...props.columns.map((column) => {
                  const cellValue = column.value ? column.value(item) : item[column.key]
                  return h('td', { class: `kv-table__cell--${column.align ?? 'start'}` }, slots[`cell-${column.key}`]?.({ item, value: cellValue, rowIndex }) ?? String(cellValue ?? ''))
                }),
              ])
            })),
    ]))
  },
})

export const KvTable = KvTableBase
