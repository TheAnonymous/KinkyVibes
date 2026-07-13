import type { ComputedRef, InjectionKey } from 'vue'

export interface KvFieldContext {
  inputId: ComputedRef<string>
  describedBy: ComputedRef<string | undefined>
  invalid: ComputedRef<boolean>
  disabled: ComputedRef<boolean>
  required: ComputedRef<boolean>
}

export const kvFieldKey: InjectionKey<KvFieldContext> = Symbol('KvField')
