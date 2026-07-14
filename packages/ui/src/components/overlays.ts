import {
  cloneVNode,
  Comment,
  computed,
  defineComponent,
  h,
  onBeforeUnmount,
  onMounted,
  ref,
  Teleport,
  Transition,
  watch,
  type PropType,
} from 'vue'
import { useKvControllable } from '../composables/useKvControllable'
import { useKvFocusTrap } from '../composables/useKvFocusTrap'
import { useKvId } from '../composables/useKvId'
import { useKvPosition } from '../composables/useKvPosition'
import type { KvPlacement } from '../types'

function createModal(name: 'KvDialog' | 'KvAlertDialog' | 'KvDrawer', role: 'dialog' | 'alertdialog', drawer = false) {
  return defineComponent({
    name,
    props: {
      open: { type: Boolean, default: undefined },
      defaultOpen: Boolean,
      title: { type: String, required: true },
      description: String,
      closeLabel: { type: String, default: 'Close' },
      closeOnOutside: { type: Boolean, default: true },
      closeOnEscape: { type: Boolean, default: true },
      teleportTo: { type: String, default: 'body' },
      side: { type: String as PropType<'left' | 'right'>, default: 'right' },
      size: { type: String as PropType<'sm' | 'md' | 'lg'>, default: 'md' },
      cancelLabel: { type: String, default: 'Cancel' },
      confirmLabel: { type: String, default: 'Confirm' },
      destructive: Boolean,
    },
    emits: ['update:open', 'close', 'cancel', 'confirm'],
    setup(props, { emit, slots }) {
      const isOpen = useKvControllable<boolean>(props, 'open', props.defaultOpen, emit)
      const trapActive = ref(isOpen.value)
      const panel = ref<HTMLElement | null>(null)
      const initialFocus = ref<HTMLElement | null>(null)
      const mounted = ref(false)
      const titleId = useKvId(name === 'KvDrawer' ? 'drawer-title' : 'dialog-title')
      const descriptionId = useKvId(name === 'KvDrawer' ? 'drawer-description' : 'dialog-description')
      const close = (reason = 'programmatic') => {
        if (!isOpen.value) return
        isOpen.value = false
        emit('close', reason)
      }
      useKvFocusTrap(panel, trapActive, {
        onEscape: () => { if (props.closeOnEscape) close('escape') },
        lockBodyScroll: true,
        initialFocus: role === 'alertdialog' ? initialFocus : undefined,
      })
      watch(isOpen, (value) => {
        if (value) trapActive.value = true
      })
      onMounted(() => { mounted.value = true })

      return () => {
        const actions = role === 'alertdialog'
          ? (slots.actions?.({ close }) ?? [
              h('button', {
                ref: initialFocus, class: 'kv-button kv-button--secondary kv-button--md', type: 'button',
                onClick: () => { emit('cancel'); close('cancel') },
              }, props.cancelLabel),
              h('button', {
                class: ['kv-button', props.destructive ? 'kv-button--danger' : 'kv-button--primary', 'kv-button--md'], type: 'button',
                onClick: () => emit('confirm'),
              }, props.confirmLabel),
            ])
          : slots.footer?.({ close })
        const content = h('div', {
          class: ['kv-overlay', drawer && 'kv-overlay--drawer'],
          onPointerdown: (event: PointerEvent) => {
            if (event.target === event.currentTarget && props.closeOnOutside) close('outside')
          },
        }, h('section', {
          ref: panel,
          class: [drawer ? 'kv-drawer' : 'kv-dialog', drawer && `kv-drawer--${props.side}`, drawer && `kv-drawer--${props.size}`],
          role,
          'aria-modal': 'true',
          'aria-labelledby': titleId.value,
          'aria-describedby': props.description ? descriptionId.value : undefined,
          tabindex: -1,
        }, [
          h('header', { class: drawer ? 'kv-drawer__header' : 'kv-dialog__header' }, [
            h('div', [h('h2', { class: 'kv-dialog__title', id: titleId.value }, props.title), props.description && h('p', { class: 'kv-dialog__description', id: descriptionId.value }, props.description)]),
            h('button', { class: 'kv-dialog__close', type: 'button', 'aria-label': props.closeLabel, onClick: () => close('button') }, '×'),
          ]),
          h('div', { class: drawer ? 'kv-drawer__body' : 'kv-dialog__body' }, slots.default?.({ close })),
          actions && h('footer', { class: drawer ? 'kv-drawer__footer' : 'kv-dialog__footer' }, actions),
        ]))
        return h(Teleport, { to: props.teleportTo, disabled: !mounted.value }, h(Transition, {
          name: drawer ? 'kv-drawer-motion' : 'kv-overlay-motion',
          onAfterLeave: () => { trapActive.value = false },
        }, () => isOpen.value ? content : null))
      }
    },
  })
}

export const KvDialog = createModal('KvDialog', 'dialog')
export const KvAlertDialog = createModal('KvAlertDialog', 'alertdialog')
export const KvDrawer = createModal('KvDrawer', 'dialog', true)

export const KvPopover = defineComponent({
  name: 'KvPopover',
  props: {
    open: { type: Boolean, default: undefined }, defaultOpen: Boolean,
    placement: { type: String as PropType<KvPlacement>, default: 'bottom' },
    triggerLabel: { type: String, default: 'Toggle popover' },
    closeOnOutside: { type: Boolean, default: true },
    teleportTo: { type: String, default: 'body' },
  },
  emits: ['update:open', 'close'],
  setup(props, { emit, slots }) {
    const isOpen = useKvControllable<boolean>(props, 'open', props.defaultOpen, emit)
    const trigger = ref<HTMLElement | null>(null)
    const content = ref<HTMLElement | null>(null)
    const mounted = ref(false)
    const restoreAfterLeave = ref(true)
    const placement = computed(() => props.placement)
    const { style, resolvedPlacement } = useKvPosition(trigger, content, isOpen, placement)
    const close = (reason: string, restore = false) => {
      if (!isOpen.value) return
      restoreAfterLeave.value = restore
      isOpen.value = false
      emit('close', reason)
    }
    const pointer = (event: PointerEvent) => {
      if (!isOpen.value || !props.closeOnOutside || trigger.value?.contains(event.target as Node) || content.value?.contains(event.target as Node)) return
      close('outside')
    }
    const keydown = (event: KeyboardEvent) => {
      if (isOpen.value && event.key === 'Escape') { event.preventDefault(); close('escape', true) }
    }
    onMounted(() => {
      mounted.value = true
      document.addEventListener('pointerdown', pointer)
      document.addEventListener('keydown', keydown)
    })
    onBeforeUnmount(() => {
      document.removeEventListener('pointerdown', pointer)
      document.removeEventListener('keydown', keydown)
    })
    watch(isOpen, (value) => {
      if (value) restoreAfterLeave.value = true
    })
    return () => h('span', { class: 'kv-popover-root' }, [
      h('button', {
        ref: trigger, class: 'kv-popover__trigger', type: 'button', 'aria-label': props.triggerLabel,
        'aria-haspopup': 'dialog', 'aria-expanded': isOpen.value, onClick: () => (isOpen.value = !isOpen.value),
      }, slots.trigger?.() ?? props.triggerLabel),
      h(Teleport, { to: props.teleportTo, disabled: !mounted.value }, h(Transition, {
        name: 'kv-popover-motion',
        onAfterLeave: () => {
          if (restoreAfterLeave.value) trigger.value?.focus({ preventScroll: true })
        },
      }, () => isOpen.value ? h('div', {
        ref: content, class: 'kv-popover', role: 'dialog', style: style.value, 'data-placement': resolvedPlacement.value,
      }, slots.default?.({ close })) : null)),
    ])
  },
})

export const KvTooltip = defineComponent({
  name: 'KvTooltip',
  props: {
    text: { type: String, required: true },
    placement: { type: String as PropType<KvPlacement>, default: 'top' },
    delay: { type: Number, default: 350 },
    disabled: Boolean,
    teleportTo: { type: String, default: 'body' },
  },
  setup(props, { slots }) {
    const open = ref(false)
    const trigger = ref<HTMLElement | null>(null)
    const content = ref<HTMLElement | null>(null)
    const mounted = ref(false)
    const id = useKvId('tooltip')
    const placement = computed(() => props.placement)
    const { style, resolvedPlacement } = useKvPosition(trigger, content, open, placement)
    let timer: ReturnType<typeof setTimeout> | undefined
    const show = () => {
      if (props.disabled) return
      clearTimeout(timer)
      timer = setTimeout(() => { open.value = true }, props.delay)
    }
    const hide = () => { clearTimeout(timer); open.value = false }
    onMounted(() => { mounted.value = true })
    onBeforeUnmount(() => clearTimeout(timer))
    return () => {
      const children = (slots.default?.() ?? []).filter((child) => child.type !== Comment)
      const child = children[0]
      if (children.length !== 1 || !child || typeof child.type !== 'string') {
        console.warn('[KinkyVibes] KvTooltip requires exactly one HTML element in its default slot.')
        return null
      }
      const existingDescription = child.props?.['aria-describedby']
      const describedBy = [existingDescription, open.value && id.value].filter(Boolean).join(' ') || undefined
      const triggerNode = cloneVNode(child, {
        ref: (element: any) => { trigger.value = element instanceof HTMLElement ? element : null },
        class: 'kv-tooltip__trigger',
        'aria-describedby': describedBy,
        onPointerenter: show,
        onPointerleave: hide,
        onFocus: show,
        onBlur: hide,
        onKeydown: (event: KeyboardEvent) => { if (event.key === 'Escape') hide() },
      }, true)
      const tooltip = h(Teleport, { to: props.teleportTo, disabled: !mounted.value }, h(Transition, {
        name: 'kv-tooltip-motion',
      }, () => open.value ? h('span', {
        ref: content, class: 'kv-tooltip', id: id.value, role: 'tooltip', style: style.value, 'data-placement': resolvedPlacement.value,
      }, props.text) : null))
      return [triggerNode, tooltip]
    }
  },
})
