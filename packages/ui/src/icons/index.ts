import { defineComponent, h, type PropType } from 'vue'

export interface KvIconProps {
  size?: number | string
  label?: string
  strokeWidth?: number
}

function icon(name: string, paths: string[]) {
  return defineComponent({
    name,
    props: {
      size: { type: [Number, String] as PropType<number | string>, default: 20 },
      label: String,
      strokeWidth: { type: Number, default: 1.75 },
    },
    setup(props) {
      return () => h('svg', {
        class: 'kv-icon', width: props.size, height: props.size, viewBox: '0 0 24 24', fill: 'none',
        stroke: 'currentColor', 'stroke-width': props.strokeWidth, 'stroke-linecap': 'square', 'stroke-linejoin': 'miter',
        role: props.label ? 'img' : undefined, 'aria-label': props.label, 'aria-hidden': props.label ? undefined : 'true',
      }, paths.map((path) => h('path', { d: path })))
    },
  })
}

export const KvCloseIcon = icon('KvCloseIcon', ['M5 5l14 14', 'M19 5L5 19'])
export const KvChevronDownIcon = icon('KvChevronDownIcon', ['M5 9l7 7 7-7'])
export const KvChevronLeftIcon = icon('KvChevronLeftIcon', ['M15 5l-7 7 7 7'])
export const KvChevronRightIcon = icon('KvChevronRightIcon', ['M9 5l7 7-7 7'])
export const KvCheckIcon = icon('KvCheckIcon', ['M4 12l5 5L20 6'])
export const KvMinusIcon = icon('KvMinusIcon', ['M5 12h14'])
export const KvSearchIcon = icon('KvSearchIcon', ['M10.5 18a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15Z', 'M16 16l5 5'])
export const KvMenuIcon = icon('KvMenuIcon', ['M4 6h16', 'M4 12h16', 'M4 18h16'])
export const KvInfoIcon = icon('KvInfoIcon', ['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z', 'M12 11v6', 'M12 7h.01'])
export const KvWarningIcon = icon('KvWarningIcon', ['M12 3L2 21h20L12 3Z', 'M12 9v5', 'M12 17h.01'])
export const KvErrorIcon = icon('KvErrorIcon', ['M4.93 4.93a10 10 0 1 0 14.14 14.14A10 10 0 0 0 4.93 4.93Z', 'M9 9l6 6', 'M15 9l-6 6'])
