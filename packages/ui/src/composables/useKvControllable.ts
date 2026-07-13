import { computed, ref, type WritableComputedRef } from 'vue'

export function useKvControllable<T>(
  props: Record<string, unknown>,
  propName: string,
  defaultValue: T,
  emit: (event: any, value: T) => void,
): WritableComputedRef<T> {
  const internal = ref(defaultValue)

  return computed<T>({
    get: () => (props[propName] === undefined ? (internal.value as T) : (props[propName] as T)),
    set: (value) => {
      if (props[propName] === undefined) internal.value = value as any
      emit(`update:${propName}`, value)
    },
  })
}
