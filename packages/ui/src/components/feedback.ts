import {
  defineComponent,
  h,
  inject,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  Teleport,
  type InjectionKey,
  type PropType,
} from 'vue'
import type { KvSize, KvStatus, KvToast, KvToastOptions } from '../types'

export const KvAlert = defineComponent({
  name: 'KvAlert',
  props: {
    title: String,
    status: { type: String as PropType<KvStatus>, default: 'neutral' },
    dismissible: Boolean,
    closeLabel: { type: String, default: 'Dismiss' },
  },
  emits: ['dismiss'],
  setup: (props, { emit, slots }) => () =>
    h('div', { class: ['kv-alert', `kv-alert--${props.status}`], role: props.status === 'error' ? 'alert' : 'status' }, [
      h('span', { class: 'kv-alert__marker', 'aria-hidden': 'true' }),
      h('div', { class: 'kv-alert__content' }, [props.title && h('div', { class: 'kv-alert__title' }, props.title), h('div', { class: 'kv-alert__description' }, slots.default?.())]),
      props.dismissible && h('button', { class: 'kv-alert__close', type: 'button', 'aria-label': props.closeLabel, onClick: () => emit('dismiss') }, '×'),
    ]),
})

export const KvBadge = defineComponent({
  name: 'KvBadge',
  props: { status: { type: String as PropType<KvStatus>, default: 'neutral' }, dot: Boolean },
  setup: (props, { slots }) => () => h('span', { class: ['kv-badge', `kv-badge--${props.status}`] }, [props.dot && h('span', { class: 'kv-badge__dot', 'aria-hidden': 'true' }), slots.default?.()]),
})

export const KvProgress = defineComponent({
  name: 'KvProgress',
  props: {
    value: { type: Number, default: undefined }, max: { type: Number, default: 100 },
    label: { type: String, required: true }, showValue: Boolean,
  },
  setup(props) {
    return () => {
      const percent = props.value === undefined ? undefined : Math.max(0, Math.min(100, (props.value / props.max) * 100))
      return h('div', { class: 'kv-progress-wrap' }, [
        h('div', { class: 'kv-progress__meta' }, [h('span', props.label), props.showValue && percent !== undefined && h('span', `${Math.round(percent)}%`)]),
        h('div', {
          class: ['kv-progress', percent === undefined && 'kv-progress--indeterminate'], role: 'progressbar',
          'aria-label': props.label, 'aria-valuemin': 0, 'aria-valuemax': props.max, 'aria-valuenow': props.value,
        }, h('span', { class: 'kv-progress__bar', style: percent === undefined ? undefined : { width: `${percent}%` } })),
      ])
    }
  },
})

export const KvSpinner = defineComponent({
  name: 'KvSpinner',
  props: { label: { type: String, default: 'Loading' }, size: { type: String as PropType<KvSize>, default: 'md' } },
  setup: (props) => () => h('span', { class: ['kv-spinner', `kv-spinner--${props.size}`], role: 'status' }, [h('span', { class: 'kv-visually-hidden' }, props.label)]),
})

export const KvSkeleton = defineComponent({
  name: 'KvSkeleton',
  props: { width: { type: String, default: '100%' }, height: { type: String, default: '1rem' }, radius: { type: String, default: 'var(--kv-radius-sm)' } },
  setup: (props) => () => h('span', { class: 'kv-skeleton', 'aria-hidden': 'true', style: { width: props.width, height: props.height, borderRadius: props.radius } }),
})

export const KvEmptyState = defineComponent({
  name: 'KvEmptyState',
  props: { title: { type: String, required: true }, description: String },
  setup: (props, { slots }) => () => h('div', { class: 'kv-empty-state' }, [
    slots.icon && h('div', { class: 'kv-empty-state__icon', 'aria-hidden': 'true' }, slots.icon()),
    h('h3', { class: 'kv-empty-state__title' }, props.title),
    props.description && h('p', { class: 'kv-empty-state__description' }, props.description),
    slots.default && h('div', { class: 'kv-empty-state__action' }, slots.default()),
  ]),
})

interface KvToastApi {
  toast: (options: KvToastOptions) => string
  dismiss: (id: string) => void
  clear: () => void
}

const toastKey: InjectionKey<KvToastApi> = Symbol('KvToast')

export function useKvToast(): KvToastApi {
  const api = inject(toastKey, null)
  if (!api) throw new Error('useKvToast must be used inside KvToastProvider')
  return api
}

let toastSequence = 0

export const KvToastProvider = defineComponent({
  name: 'KvToastProvider',
  props: {
    placement: { type: String as PropType<'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'>, default: 'bottom-right' },
    defaultDuration: { type: Number, default: 5000 },
    teleportTo: { type: String, default: 'body' },
  },
  setup(props, { slots }) {
    const toasts = ref<KvToast[]>([])
    const mounted = ref(false)
    const timers = new Map<string, ReturnType<typeof setTimeout>>()
    const dismiss = (id: string) => {
      toasts.value = toasts.value.filter((item) => item.id !== id)
      clearTimeout(timers.get(id))
      timers.delete(id)
    }
    const toast = (options: KvToastOptions) => {
      const id = `kv-toast-${++toastSequence}`
      toasts.value.push({ ...options, id })
      const duration = options.duration ?? props.defaultDuration
      if (duration > 0) timers.set(id, setTimeout(() => dismiss(id), duration))
      return id
    }
    const clear = () => [...toasts.value].forEach((item) => dismiss(item.id))
    provide(toastKey, { toast, dismiss, clear })
    onMounted(() => { mounted.value = true })
    onBeforeUnmount(clear)
    return () => [
      slots.default?.(),
      mounted.value && h(Teleport, { to: props.teleportTo }, h('div', {
        class: ['kv-toasts', `kv-toasts--${props.placement}`], 'aria-label': 'Notifications',
      }, toasts.value.map((item) => h('section', {
        class: ['kv-toast', `kv-toast--${item.status ?? 'info'}`], role: item.status === 'error' ? 'alert' : 'status',
      }, [
        h('span', { class: 'kv-toast__marker', 'aria-hidden': 'true' }),
        h('div', { class: 'kv-toast__content' }, [h('div', { class: 'kv-toast__title' }, item.title), item.description && h('div', { class: 'kv-toast__description' }, item.description)]),
        item.actionLabel && h('button', { class: 'kv-toast__action', type: 'button', onClick: () => item.onAction?.() }, item.actionLabel),
        h('button', { class: 'kv-toast__close', type: 'button', 'aria-label': 'Dismiss notification', onClick: () => dismiss(item.id) }, '×'),
      ])))),
    ]
  },
})
