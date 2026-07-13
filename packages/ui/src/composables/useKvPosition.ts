import { nextTick, onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'
import type { CSSProperties } from 'vue'
import type { KvPlacement } from '../types'

const gap = 8
const edge = 8

function opposite(side: string) {
  return { top: 'bottom', bottom: 'top', left: 'right', right: 'left' }[side] ?? side
}

export function useKvPosition(
  anchor: Ref<HTMLElement | null>,
  floating: Ref<HTMLElement | null>,
  open: Ref<boolean>,
  placement: Ref<KvPlacement>,
) {
  const style = ref<CSSProperties>({ position: 'fixed', visibility: 'hidden' })
  const resolvedPlacement = ref<KvPlacement>(placement.value)
  let mounted = false

  const update = async () => {
    if (!mounted || !open.value) return
    await nextTick()
    if (!anchor.value || !floating.value) return
    const a = anchor.value.getBoundingClientRect()
    const f = floating.value.getBoundingClientRect()
    let [side, align = 'center'] = placement.value.split('-') as [string, string]

    const wouldOverflow =
      (side === 'top' && a.top - f.height - gap < edge) ||
      (side === 'bottom' && a.bottom + f.height + gap > window.innerHeight - edge) ||
      (side === 'left' && a.left - f.width - gap < edge) ||
      (side === 'right' && a.right + f.width + gap > window.innerWidth - edge)
    if (wouldOverflow) side = opposite(side)

    let top = a.bottom + gap
    let left = a.left + (a.width - f.width) / 2
    if (side === 'top') top = a.top - f.height - gap
    if (side === 'left') {
      top = a.top + (a.height - f.height) / 2
      left = a.left - f.width - gap
    }
    if (side === 'right') {
      top = a.top + (a.height - f.height) / 2
      left = a.right + gap
    }
    if (side === 'bottom') top = a.bottom + gap

    if (side === 'top' || side === 'bottom') {
      if (align === 'start') left = a.left
      if (align === 'end') left = a.right - f.width
    } else {
      if (align === 'start') top = a.top
      if (align === 'end') top = a.bottom - f.height
    }

    top = Math.max(edge, Math.min(top, window.innerHeight - f.height - edge))
    left = Math.max(edge, Math.min(left, window.innerWidth - f.width - edge))
    resolvedPlacement.value = `${side}${align === 'center' ? '' : `-${align}`}` as KvPlacement
    style.value = { position: 'fixed', top: `${Math.round(top)}px`, left: `${Math.round(left)}px`, visibility: 'visible' }
  }

  const listener = () => void update()
  onMounted(() => {
    mounted = true
    window.addEventListener('resize', listener)
    window.addEventListener('scroll', listener, true)
    void update()
  })
  watch([open, placement], () => void update(), { flush: 'post' })
  onBeforeUnmount(() => {
    window.removeEventListener('resize', listener)
    window.removeEventListener('scroll', listener, true)
  })

  return { style, resolvedPlacement, update }
}
