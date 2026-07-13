import type { App, Plugin } from 'vue'
import {
  KvCluster,
  KvCode,
  KvContainer,
  KvDivider,
  KvGrid,
  KvHeading,
  KvLink,
  KvProvider,
  KvStack,
  KvText,
  KvVisuallyHidden,
} from './components/foundations'
import { KvButton, KvButtonGroup, KvIconButton } from './components/actions'
import {
  KvCheckbox,
  KvCombobox,
  KvField,
  KvFileInput,
  KvInput,
  KvRadioGroup,
  KvSelect,
  KvSlider,
  KvSwitch,
  KvTextarea,
} from './components/forms'
import { KvBreadcrumbs, KvDropdownMenu, KvPagination, KvSteps, KvTabs } from './components/navigation'
import { KvAlertDialog, KvDialog, KvDrawer, KvPopover, KvTooltip } from './components/overlays'
import { KvAccordion, KvCard, KvTable } from './components/data'
import {
  KvAlert,
  KvBadge,
  KvEmptyState,
  KvProgress,
  KvSkeleton,
  KvSpinner,
  KvToastProvider,
} from './components/feedback'

export * from './types'
export * from './composables/useKvControllable'
export * from './composables/useKvFocusTrap'
export * from './composables/useKvId'
export * from './composables/useKvPosition'
export * from './components/foundations'
export * from './components/actions'
export * from './components/forms'
export * from './components/navigation'
export * from './components/overlays'
export * from './components/data'
export * from './components/feedback'

const components = {
  KvProvider,
  KvContainer,
  KvStack,
  KvCluster,
  KvGrid,
  KvDivider,
  KvVisuallyHidden,
  KvHeading,
  KvText,
  KvLink,
  KvCode,
  KvButton,
  KvIconButton,
  KvButtonGroup,
  KvField,
  KvInput,
  KvTextarea,
  KvSelect,
  KvCombobox,
  KvCheckbox,
  KvRadioGroup,
  KvSwitch,
  KvSlider,
  KvFileInput,
  KvTabs,
  KvBreadcrumbs,
  KvPagination,
  KvSteps,
  KvDropdownMenu,
  KvDialog,
  KvAlertDialog,
  KvDrawer,
  KvPopover,
  KvTooltip,
  KvCard,
  KvAccordion,
  KvTable,
  KvAlert,
  KvBadge,
  KvProgress,
  KvSpinner,
  KvSkeleton,
  KvEmptyState,
  KvToastProvider,
}

export const KinkyVibes: Plugin = {
  install(app: App) {
    for (const [name, component] of Object.entries(components)) app.component(name, component)
  },
}

export default KinkyVibes
