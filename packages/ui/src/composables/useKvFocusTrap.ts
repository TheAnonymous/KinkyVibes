import { nextTick, onBeforeUnmount, onMounted, watch, type Ref } from 'vue'

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

let scrollLocks = 0
let previousOverflow = ''

function lockScroll() {
  if (scrollLocks++ === 0) {
    previousOverflow = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
  }
}

function unlockScroll() {
  scrollLocks = Math.max(0, scrollLocks - 1)
  if (scrollLocks === 0) document.documentElement.style.overflow = previousOverflow
}

export interface KvFocusTrapOptions {
  onEscape?: () => void
  restoreFocus?: boolean
  lockBodyScroll?: boolean
  initialFocus?: Ref<HTMLElement | null>
}

export function useKvFocusTrap(
  root: Ref<HTMLElement | null>,
  active: Ref<boolean>,
  options: KvFocusTrapOptions = {},
) {
  let mounted = false
  let returnTarget: HTMLElement | null = null
  let locked = false

  const focusInitial = async () => {
    await nextTick()
    const target = options.initialFocus?.value ?? root.value?.querySelector<HTMLElement>(focusableSelector) ?? root.value
    target?.focus()
  }

  const handleKeydown = (event: KeyboardEvent) => {
    if (!active.value || !root.value) return
    if (event.key === 'Escape') {
      event.preventDefault()
      options.onEscape?.()
      return
    }
    if (event.key !== 'Tab') return

    const candidates = [...root.value.querySelectorAll<HTMLElement>(focusableSelector)].filter((element) => {
      const styles = window.getComputedStyle(element)
      return !element.hidden && styles.display !== 'none' && styles.visibility !== 'hidden'
    })
    if (candidates.length === 0) {
      event.preventDefault()
      root.value.focus()
      return
    }
    const first = candidates[0]
    const last = candidates.at(-1)
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last?.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first?.focus()
    }
  }

  const activate = () => {
    if (!mounted) return
    returnTarget = document.activeElement instanceof HTMLElement ? document.activeElement : null
    document.addEventListener('keydown', handleKeydown)
    if (options.lockBodyScroll && !locked) {
      lockScroll()
      locked = true
    }
    void focusInitial()
  }

  const deactivate = () => {
    document.removeEventListener('keydown', handleKeydown)
    if (locked) {
      unlockScroll()
      locked = false
    }
    if (options.restoreFocus !== false && returnTarget?.isConnected && !returnTarget.matches(':disabled, [aria-disabled="true"]')) {
      returnTarget.focus({ preventScroll: true })
    }
    returnTarget = null
  }

  onMounted(() => {
    mounted = true
    if (active.value) activate()
  })
  watch(active, (value, previous) => {
    if (value && !previous) activate()
    if (!value && previous) deactivate()
  })
  onBeforeUnmount(deactivate)

  return { focusInitial }
}
