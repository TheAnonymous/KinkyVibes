import {
  computed,
  defineComponent,
  h,
  inject,
  nextTick,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  watch,
  type PropType,
} from 'vue'
import { useKvControllable } from '../composables/useKvControllable'
import { useKvId } from '../composables/useKvId'
import { kvFieldKey } from '../internal/field'
import type { KvComboboxOption, KvSelectOption, KvSize } from '../types'

export const KvField = defineComponent({
  name: 'KvField',
  props: {
    id: String,
    label: { type: String, required: true },
    description: String,
    error: String,
    required: Boolean,
    disabled: Boolean,
  },
  setup(props, { slots }) {
    const inputId = useKvId('field', () => props.id)
    const descriptionId = computed(() => `${inputId.value}-description`)
    const errorId = computed(() => `${inputId.value}-error`)
    const describedBy = computed(() => [props.description && descriptionId.value, props.error && errorId.value].filter(Boolean).join(' ') || undefined)
    provide(kvFieldKey, {
      inputId,
      describedBy,
      invalid: computed(() => Boolean(props.error)),
      disabled: computed(() => props.disabled),
      required: computed(() => props.required),
    })
    return () =>
      h('div', { class: ['kv-field', props.error && 'kv-field--invalid', props.disabled && 'kv-field--disabled'] }, [
        h('label', { class: 'kv-field__label', for: inputId.value }, [props.label, props.required && h('span', { class: 'kv-field__required', 'aria-hidden': 'true' }, ' *')]),
        slots.default?.(),
        props.description && h('div', { class: 'kv-field__description', id: descriptionId.value }, props.description),
        props.error && h('div', { class: 'kv-field__error', id: errorId.value, role: 'alert' }, props.error),
      ])
  },
})

const valueProps = {
  modelValue: { type: [String, Number] as PropType<string | number>, default: undefined },
  defaultValue: { type: [String, Number] as PropType<string | number>, default: '' },
  size: { type: String as PropType<KvSize>, default: 'md' },
  disabled: { type: Boolean, default: undefined },
  required: { type: Boolean, default: undefined },
  invalid: { type: Boolean, default: undefined },
}

function useFieldAttributes(props: Record<string, any>) {
  const field = inject(kvFieldKey, null)
  return computed(() => ({
    id: props.id || field?.inputId.value,
    disabled: props.disabled ?? field?.disabled.value,
    required: props.required ?? field?.required.value,
    'aria-invalid': (props.invalid ?? field?.invalid.value) || undefined,
    'aria-describedby': props['aria-describedby'] || field?.describedBy.value,
  }))
}

export const KvInput = defineComponent({
  name: 'KvInput',
  inheritAttrs: false,
  props: {
    ...valueProps,
    id: String,
    type: {
      type: String as PropType<'text' | 'email' | 'password' | 'search' | 'tel' | 'url' | 'number' | 'date' | 'time' | 'datetime-local'>,
      default: 'text',
    },
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit, attrs }) {
    const value = useKvControllable<any>(props, 'modelValue', props.defaultValue, emit)
    const fieldAttrs = useFieldAttributes(props)
    return () =>
      h('input', {
        ...attrs,
        ...fieldAttrs.value,
        class: ['kv-input', `kv-input--${props.size}`, attrs.class],
        type: props.type,
        value: value.value,
        onInput: (event: Event) => (value.value = (event.target as HTMLInputElement).value),
        onChange: (event: Event) => emit('change', event),
      })
  },
})

export const KvTextarea = defineComponent({
  name: 'KvTextarea',
  inheritAttrs: false,
  props: { ...valueProps, id: String, rows: { type: Number, default: 4 }, resize: { type: String as PropType<'none' | 'vertical' | 'both'>, default: 'vertical' } },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit, attrs }) {
    const value = useKvControllable<any>(props, 'modelValue', props.defaultValue, emit)
    const fieldAttrs = useFieldAttributes(props)
    return () =>
      h('textarea', {
        ...attrs,
        ...fieldAttrs.value,
        class: ['kv-textarea', `kv-input--${props.size}`, attrs.class],
        rows: props.rows,
        value: value.value,
        style: { resize: props.resize },
        onInput: (event: Event) => (value.value = (event.target as HTMLTextAreaElement).value),
        onChange: (event: Event) => emit('change', event),
      })
  },
})

export const KvSelect = defineComponent({
  name: 'KvSelect',
  inheritAttrs: false,
  props: {
    ...valueProps,
    id: String,
    options: { type: Array as PropType<KvSelectOption[]>, default: () => [] },
    placeholder: String,
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit, attrs, slots }) {
    const value = useKvControllable<any>(props, 'modelValue', props.defaultValue, emit)
    const fieldAttrs = useFieldAttributes(props)
    return () =>
      h('div', { class: 'kv-select-wrap' }, [
        h(
          'select',
          {
            ...attrs,
            ...fieldAttrs.value,
            class: ['kv-select', `kv-input--${props.size}`, attrs.class],
            value: value.value,
            onChange: (event: Event) => {
              value.value = (event.target as HTMLSelectElement).value
              emit('change', event)
            },
          },
          [
            props.placeholder && h('option', { value: '', disabled: props.required }, props.placeholder),
            ...(slots.default?.() ?? props.options.map((option) => h('option', { value: option.value, disabled: option.disabled }, option.label))),
          ],
        ),
        h('span', { class: 'kv-select__chevron', 'aria-hidden': 'true' }, '⌄'),
      ])
  },
})

export const KvCombobox = defineComponent({
  name: 'KvCombobox',
  inheritAttrs: false,
  props: {
    modelValue: { type: String, default: undefined },
    defaultValue: { type: String, default: '' },
    options: { type: Array as PropType<KvComboboxOption[]>, default: () => [] },
    placeholder: String,
    id: String,
    disabled: { type: Boolean, default: undefined },
    required: { type: Boolean, default: undefined },
    invalid: { type: Boolean, default: undefined },
    size: { type: String as PropType<KvSize>, default: 'md' },
    noResultsText: { type: String, default: 'No matches' },
  },
  emits: ['update:modelValue', 'select', 'open', 'close'],
  setup(props, { emit, attrs }) {
    const value = useKvControllable<string>(props, 'modelValue', props.defaultValue, emit)
    const open = ref(false)
    const active = ref(-1)
    const query = ref(props.options.find((option) => option.value === value.value)?.label ?? value.value)
    const root = ref<HTMLElement | null>(null)
    const list = ref<HTMLElement | null>(null)
    const fieldAttrs = useFieldAttributes(props)
    const listId = useKvId('combobox-list')
    const filtered = computed(() => {
      const needle = query.value.trim().toLocaleLowerCase()
      return props.options.filter((option) => !needle || option.label.toLocaleLowerCase().includes(needle))
    })
    const firstEnabled = () => filtered.value.findIndex((option) => !option.disabled)
    const lastEnabled = () => {
      let index = filtered.value.length - 1
      while (index >= 0 && filtered.value[index]?.disabled) index -= 1
      return index
    }

    const setOpen = (next: boolean) => {
      if (open.value === next) return
      open.value = next
      emit(next ? 'open' : 'close')
      if (next) active.value = firstEnabled()
    }
    const choose = (option: KvComboboxOption) => {
      if (option.disabled) return
      value.value = option.value
      query.value = option.label
      emit('select', option)
      setOpen(false)
    }
    const move = (direction: 1 | -1) => {
      const enabled = filtered.value.filter((option) => !option.disabled)
      if (!enabled.length) return
      let next = active.value
      do next = (next + direction + filtered.value.length) % filtered.value.length
      while (filtered.value[next]?.disabled && next !== active.value)
      active.value = next
    }
    const onKeydown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault()
        const wasOpen = open.value
        setOpen(true)
        if (wasOpen) move(event.key === 'ArrowDown' ? 1 : -1)
        else active.value = event.key === 'ArrowDown' ? firstEnabled() : lastEnabled()
      } else if (event.key === 'Home' && open.value) {
        event.preventDefault()
        active.value = firstEnabled()
      } else if (event.key === 'End' && open.value) {
        event.preventDefault()
        active.value = lastEnabled()
      } else if (event.key === 'Enter' && open.value && filtered.value[active.value]) {
        event.preventDefault()
        choose(filtered.value[active.value]!)
      } else if (event.key === 'Escape' && open.value) {
        event.preventDefault()
        setOpen(false)
      }
    }
    const pointer = (event: PointerEvent) => {
      if (!root.value?.contains(event.target as Node)) setOpen(false)
    }
    onMounted(() => document.addEventListener('pointerdown', pointer))
    onBeforeUnmount(() => document.removeEventListener('pointerdown', pointer))
    watch(() => props.modelValue, (next) => {
      if (next === undefined) return
      query.value = props.options.find((option) => option.value === next)?.label ?? next
    })
    watch(filtered, () => {
      if (open.value) active.value = firstEnabled()
    })
    watch(active, async (index) => {
      if (index < 0) return
      await nextTick()
      list.value?.querySelector<HTMLElement>(`#${listId.value}-${index}`)?.scrollIntoView({ block: 'nearest' })
    })
    return () =>
      h('div', { ref: root, class: 'kv-combobox' }, [
        h('input', {
          ...attrs,
          ...fieldAttrs.value,
          class: ['kv-input', `kv-input--${props.size}`, attrs.class],
          role: 'combobox',
          value: query.value,
          placeholder: props.placeholder,
          autocomplete: 'off',
          'aria-autocomplete': 'list',
          'aria-expanded': open.value,
          'aria-controls': listId.value,
          'aria-activedescendant': open.value && active.value >= 0 ? `${listId.value}-${active.value}` : undefined,
          onInput: (event: Event) => {
            query.value = (event.target as HTMLInputElement).value
            setOpen(true)
          },
          onFocus: () => setOpen(true),
          onKeydown,
        }),
        open.value &&
          h('ul', { ref: list, class: 'kv-listbox', id: listId.value, role: 'listbox' },
            filtered.value.length
              ? filtered.value.map((option, index) =>
                  h('li', {
                    id: `${listId.value}-${index}`,
                    class: ['kv-listbox__option', index === active.value && 'is-active'],
                    role: 'option',
                    'aria-selected': option.value === value.value,
                    'aria-disabled': option.disabled || undefined,
                    onPointerdown: (event: PointerEvent) => event.preventDefault(),
                    onClick: () => choose(option),
                  }, option.label),
                )
              : h('li', { class: 'kv-listbox__empty' }, props.noResultsText),
          ),
      ])
  },
})

export const KvCheckbox = defineComponent({
  name: 'KvCheckbox',
  props: {
    modelValue: { type: Boolean, default: undefined },
    defaultValue: Boolean,
    label: { type: String, required: true },
    description: String,
    disabled: Boolean,
    indeterminate: Boolean,
    value: String,
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    const checked = useKvControllable<boolean>(props, 'modelValue', props.defaultValue, emit)
    const input = ref<HTMLInputElement | null>(null)
    const sync = () => { if (input.value) input.value.indeterminate = props.indeterminate }
    onMounted(sync)
    watch(() => props.indeterminate, sync)
    return () =>
      h('label', { class: ['kv-choice', props.disabled && 'kv-choice--disabled'] }, [
        h('input', {
          ref: input,
          class: 'kv-choice__native',
          type: 'checkbox',
          checked: checked.value,
          disabled: props.disabled,
          value: props.value,
          onChange: (event: Event) => {
            checked.value = (event.target as HTMLInputElement).checked
            emit('change', event)
          },
        }),
        h('span', { class: 'kv-choice__control', 'aria-hidden': 'true' }),
        h('span', { class: 'kv-choice__content' }, [h('span', { class: 'kv-choice__label' }, props.label), props.description && h('span', { class: 'kv-choice__description' }, props.description)]),
      ])
  },
})

export const KvRadioGroup = defineComponent({
  name: 'KvRadioGroup',
  props: {
    modelValue: { type: [String, Number] as PropType<string | number>, default: undefined },
    defaultValue: { type: [String, Number] as PropType<string | number>, default: '' },
    options: { type: Array as PropType<KvSelectOption[]>, default: () => [] },
    label: { type: String, required: true },
    name: String,
    disabled: Boolean,
    orientation: { type: String as PropType<'horizontal' | 'vertical'>, default: 'vertical' },
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    const value = useKvControllable<any>(props, 'modelValue', props.defaultValue, emit)
    const name = useKvId('radio', () => props.name)
    return () =>
      h('fieldset', { class: ['kv-radio-group', `kv-radio-group--${props.orientation}`], disabled: props.disabled }, [
        h('legend', { class: 'kv-radio-group__legend' }, props.label),
        ...props.options.map((option) =>
          h('label', { class: ['kv-choice', option.disabled && 'kv-choice--disabled'] }, [
            h('input', {
              class: 'kv-choice__native', type: 'radio', name: name.value, value: option.value,
              checked: value.value === option.value, disabled: option.disabled,
              onChange: (event: Event) => { value.value = option.value; emit('change', event) },
            }),
            h('span', { class: 'kv-choice__control kv-choice__control--radio', 'aria-hidden': 'true' }),
            h('span', { class: 'kv-choice__label' }, option.label),
          ]),
        ),
      ])
  },
})

export const KvSwitch = defineComponent({
  name: 'KvSwitch',
  props: {
    modelValue: { type: Boolean, default: undefined },
    defaultValue: Boolean,
    label: { type: String, required: true },
    description: String,
    disabled: Boolean,
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    const checked = useKvControllable<boolean>(props, 'modelValue', props.defaultValue, emit)
    const toggle = () => {
      if (props.disabled) return
      checked.value = !checked.value
      emit('change', checked.value)
    }
    return () =>
      h('button', { class: 'kv-switch', type: 'button', role: 'switch', disabled: props.disabled, 'aria-checked': checked.value, onClick: toggle }, [
        h('span', { class: 'kv-switch__track', 'aria-hidden': 'true' }, h('span', { class: 'kv-switch__thumb' })),
        h('span', { class: 'kv-choice__content' }, [h('span', { class: 'kv-choice__label' }, props.label), props.description && h('span', { class: 'kv-choice__description' }, props.description)]),
      ])
  },
})

export const KvSlider = defineComponent({
  name: 'KvSlider',
  inheritAttrs: false,
  props: {
    modelValue: { type: Number, default: undefined }, defaultValue: { type: Number, default: 0 },
    min: { type: Number, default: 0 }, max: { type: Number, default: 100 }, step: { type: Number, default: 1 },
    id: String, disabled: { type: Boolean, default: undefined }, showValue: { type: Boolean, default: true },
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit, attrs }) {
    const value = useKvControllable<number>(props, 'modelValue', props.defaultValue, emit)
    const fieldAttrs = useFieldAttributes(props)
    return () => h('div', { class: 'kv-slider' }, [
      h('input', {
        ...attrs, ...fieldAttrs.value, class: ['kv-slider__input', attrs.class], type: 'range',
        min: props.min, max: props.max, step: props.step, value: value.value,
        style: { '--kv-slider-position': `${((value.value - props.min) / (props.max - props.min)) * 100}%` },
        onInput: (event: Event) => (value.value = Number((event.target as HTMLInputElement).value)),
        onChange: (event: Event) => emit('change', event),
      }),
      props.showValue && h('output', { class: 'kv-slider__value', for: fieldAttrs.value.id }, String(value.value)),
    ])
  },
})

export const KvFileInput = defineComponent({
  name: 'KvFileInput',
  inheritAttrs: false,
  props: {
    id: String, accept: String, multiple: Boolean, disabled: { type: Boolean, default: undefined },
    prompt: { type: String, default: 'Choose file' }, emptyText: { type: String, default: 'No file selected' },
  },
  emits: ['update:files', 'change'],
  setup(props, { emit, attrs }) {
    const files = ref<File[]>([])
    const fieldAttrs = useFieldAttributes(props)
    const update = (event: Event) => {
      files.value = Array.from((event.target as HTMLInputElement).files ?? [])
      emit('update:files', files.value)
      emit('change', event)
    }
    return () => h('label', { class: ['kv-file-input', fieldAttrs.value.disabled && 'kv-file-input--disabled'] }, [
      h('input', { ...attrs, ...fieldAttrs.value, class: 'kv-file-input__native', type: 'file', accept: props.accept, multiple: props.multiple, onChange: update }),
      h('span', { class: 'kv-file-input__action' }, props.prompt),
      h('span', { class: 'kv-file-input__name' }, files.value.length ? files.value.map((file) => file.name).join(', ') : props.emptyText),
    ])
  },
})
