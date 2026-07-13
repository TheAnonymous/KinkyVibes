import { defineComponent, h, type CSSProperties, type PropType } from 'vue'

const content = (slots: Record<string, any>) => slots.default?.()

export const KvProvider = defineComponent({
  name: 'KvProvider',
  props: {
    tokens: { type: Object as PropType<Record<string, string>>, default: () => ({}) },
    grain: { type: Boolean, default: true },
  },
  setup(props, { slots }) {
    return () => {
      const style = Object.fromEntries(Object.entries(props.tokens).filter(([key]) => key.startsWith('--kv-'))) as CSSProperties
      return h('div', { class: 'kv-provider', 'data-kv-root': '', 'data-kv-grain': props.grain || undefined, style }, content(slots))
    }
  },
})

export const KvContainer = defineComponent({
  name: 'KvContainer',
  props: { size: { type: String as PropType<'sm' | 'md' | 'lg' | 'full'>, default: 'lg' }, as: { type: String, default: 'div' } },
  setup: (props, { slots }) => () => h(props.as, { class: ['kv-container', `kv-container--${props.size}`] }, content(slots)),
})

export const KvStack = defineComponent({
  name: 'KvStack',
  props: { gap: { type: String as PropType<'xs' | 'sm' | 'md' | 'lg' | 'xl'>, default: 'md' }, as: { type: String, default: 'div' } },
  setup: (props, { slots }) => () => h(props.as, { class: ['kv-stack', `kv-stack--${props.gap}`] }, content(slots)),
})

export const KvCluster = defineComponent({
  name: 'KvCluster',
  props: {
    gap: { type: String as PropType<'xs' | 'sm' | 'md' | 'lg'>, default: 'sm' },
    align: { type: String as PropType<'start' | 'center' | 'end' | 'stretch'>, default: 'center' },
    justify: { type: String as PropType<'start' | 'center' | 'end' | 'between'>, default: 'start' },
    as: { type: String, default: 'div' },
  },
  setup: (props, { slots }) => () =>
    h(props.as, { class: ['kv-cluster', `kv-cluster--${props.gap}`, `kv-cluster--align-${props.align}`, `kv-cluster--justify-${props.justify}`] }, content(slots)),
})

export const KvGrid = defineComponent({
  name: 'KvGrid',
  props: {
    min: { type: String, default: '15rem' },
    gap: { type: String as PropType<'sm' | 'md' | 'lg'>, default: 'md' },
    as: { type: String, default: 'div' },
  },
  setup: (props, { slots }) => () =>
    h(props.as, { class: ['kv-grid', `kv-grid--${props.gap}`], style: { '--kv-grid-min': props.min } }, content(slots)),
})

export const KvDivider = defineComponent({
  name: 'KvDivider',
  props: { orientation: { type: String as PropType<'horizontal' | 'vertical'>, default: 'horizontal' } },
  setup: (props) => () => h('div', { class: ['kv-divider', `kv-divider--${props.orientation}`], role: 'separator', 'aria-orientation': props.orientation }),
})

export const KvVisuallyHidden = defineComponent({
  name: 'KvVisuallyHidden',
  props: { as: { type: String, default: 'span' }, focusable: Boolean },
  setup: (props, { slots }) => () => h(props.as, { class: ['kv-visually-hidden', props.focusable && 'kv-visually-hidden--focusable'] }, content(slots)),
})

export const KvHeading = defineComponent({
  name: 'KvHeading',
  props: { level: { type: Number as PropType<1 | 2 | 3 | 4 | 5 | 6>, default: 2 }, eyebrow: String },
  setup: (props, { slots }) => () =>
    h('div', { class: 'kv-heading-wrap' }, [
      props.eyebrow && h('span', { class: 'kv-heading__eyebrow' }, props.eyebrow),
      h(`h${props.level}`, { class: ['kv-heading', `kv-heading--${props.level}`] }, content(slots)),
    ]),
})

export const KvText = defineComponent({
  name: 'KvText',
  props: {
    as: { type: String, default: 'p' },
    size: { type: String as PropType<'sm' | 'md' | 'lg'>, default: 'md' },
    tone: { type: String as PropType<'default' | 'muted' | 'signal'>, default: 'default' },
  },
  setup: (props, { slots }) => () => h(props.as, { class: ['kv-text', `kv-text--${props.size}`, `kv-text--${props.tone}`] }, content(slots)),
})

export const KvLink = defineComponent({
  name: 'KvLink',
  props: { href: { type: String, required: true }, external: Boolean },
  setup: (props, { slots }) => () =>
    h('a', { class: 'kv-link', href: props.href, target: props.external ? '_blank' : undefined, rel: props.external ? 'noreferrer noopener' : undefined }, content(slots)),
})

export const KvCode = defineComponent({
  name: 'KvCode',
  props: { block: Boolean },
  setup: (props, { slots }) => () =>
    props.block ? h('pre', { class: 'kv-code kv-code--block' }, h('code', content(slots))) : h('code', { class: 'kv-code' }, content(slots)),
})
