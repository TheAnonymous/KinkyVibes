import { computed, useId, type ComputedRef, type MaybeRefOrGetter, toValue } from 'vue'

export function useKvId(prefix: string, provided?: MaybeRefOrGetter<string | undefined>): ComputedRef<string> {
  const vueId = useId().replace(/:/g, '')
  return computed(() => toValue(provided) || `kv-${prefix}-${vueId}`)
}
