import { defineComponent, h, type PropType } from 'vue'
import type { KvSize, KvVariant } from '../types'

const buttonProps = {
  variant: { type: String as PropType<KvVariant>, default: 'primary' },
  size: { type: String as PropType<KvSize>, default: 'md' },
  type: { type: String as PropType<'button' | 'submit' | 'reset'>, default: 'button' },
  disabled: Boolean,
  loading: Boolean,
}

export const KvButton = defineComponent({
  name: 'KvButton',
  props: { ...buttonProps, block: Boolean },
  emits: ['click'],
  setup(props, { slots, emit }) {
    return () =>
      h(
        'button',
        {
          class: ['kv-button', `kv-button--${props.variant}`, `kv-button--${props.size}`, props.block && 'kv-button--block'],
          type: props.type,
          disabled: props.disabled || props.loading,
          'aria-busy': props.loading || undefined,
          onClick: (event: MouseEvent) => emit('click', event),
        },
        [
          props.loading && h('span', { class: 'kv-button__loader', 'aria-hidden': 'true' }),
          slots.leading?.(),
          h('span', { class: 'kv-button__label' }, slots.default?.()),
          slots.trailing?.(),
        ],
      )
  },
})

export const KvIconButton = defineComponent({
  name: 'KvIconButton',
  props: { ...buttonProps, label: { type: String, required: true } },
  emits: ['click'],
  setup(props, { slots, emit }) {
    return () =>
      h(
        'button',
        {
          class: ['kv-icon-button', `kv-icon-button--${props.variant}`, `kv-icon-button--${props.size}`],
          type: props.type,
          disabled: props.disabled || props.loading,
          'aria-label': props.label,
          'aria-busy': props.loading || undefined,
          onClick: (event: MouseEvent) => emit('click', event),
        },
        props.loading ? h('span', { class: 'kv-button__loader', 'aria-hidden': 'true' }) : slots.default?.(),
      )
  },
})

export const KvButtonGroup = defineComponent({
  name: 'KvButtonGroup',
  props: {
    label: { type: String, required: true },
    orientation: { type: String as PropType<'horizontal' | 'vertical'>, default: 'horizontal' },
    attached: Boolean,
  },
  setup: (props, { slots }) => () =>
    h('div', { class: ['kv-button-group', `kv-button-group--${props.orientation}`, props.attached && 'kv-button-group--attached'], role: 'group', 'aria-label': props.label }, slots.default?.()),
})
