import { defineComponent, h, ref } from 'vue'
import * as UI from '@kinky-vibes/ui'
import { KvMenuIcon, KvSearchIcon } from '@kinky-vibes/ui/icons'

const options = [
  { value: 'alpha', label: 'Alpha channel' },
  { value: 'bravo', label: 'Bravo channel' },
  { value: 'charlie', label: 'Charlie channel' },
]

const tabs = [
  { id: 'status', label: 'Status' },
  { id: 'routing', label: 'Routing' },
  { id: 'archive', label: 'Archive', disabled: true },
]

const previewBlock = (label: string) => h('span', { class: 'docs-preview-block' }, label)

const ToastTrigger = defineComponent({
  setup() {
    const { toast } = UI.useKvToast()
    return () => h(UI.KvButton, {
      onClick: () => toast({ title: 'Signal stored', description: 'The local operation completed.', status: 'success' }),
    }, () => 'Create toast')
  },
})

export default defineComponent({
  name: 'ComponentPreview',
  props: { name: { type: String, required: true } },
  setup(props) {
    const text = ref('AX-17')
    const choice = ref('alpha')
    const checked = ref(true)
    const slider = ref(38)
    const page = ref(3)
    const tab = ref('status')
    const accordion = ref<string | string[]>(['signal'])
    const overlayOpen = ref(false)
    const sort = ref<UI.KvSortState>({ key: 'signal', direction: 'asc' })
    const selected = ref<Array<string | number>>(['AX-17'])
    const rows = [
      { id: 'AX-17', signal: 'AX-17', state: 'Stable', load: '38%' },
      { id: 'BK-04', signal: 'BK-04', state: 'Standby', load: '12%' },
      { id: 'CR-91', signal: 'CR-91', state: 'Review', load: '74%' },
    ]

    return () => {
      switch (props.name) {
        case 'KvProvider':
          return h(UI.KvProvider, { tokens: { '--kv-color-signal': '#f05a28' }, grain: false }, () => h('div', { class: 'docs-inset' }, 'Locally overridden provider'))
        case 'KvContainer':
          return h(UI.KvContainer, { size: 'sm' }, () => previewBlock('Constrained measure'))
        case 'KvStack':
          return h(UI.KvStack, { gap: 'sm' }, () => [previewBlock('Layer 01'), previewBlock('Layer 02'), previewBlock('Layer 03')])
        case 'KvCluster':
          return h(UI.KvCluster, { gap: 'sm' }, () => [previewBlock('Alpha'), previewBlock('Bravo'), previewBlock('Charlie')])
        case 'KvGrid':
          return h(UI.KvGrid, { min: '8rem', gap: 'sm' }, () => [previewBlock('Grid 01'), previewBlock('Grid 02'), previewBlock('Grid 03')])
        case 'KvDivider':
          return h(UI.KvStack, { gap: 'md' }, () => ['Above', h(UI.KvDivider), 'Below'])
        case 'KvVisuallyHidden':
          return h(UI.KvVisuallyHidden, { focusable: true, as: 'a', href: '#preview-target' }, () => 'Skip preview')
        case 'KvHeading':
          return h(UI.KvHeading, { level: 3, eyebrow: 'Section 04' }, () => 'Pressure systems')
        case 'KvText':
          return h(UI.KvText, { tone: 'muted' }, () => 'Neutral interface copy remains calm against the hard visual frame.')
        case 'KvLink':
          return h(UI.KvLink, { href: '#/installation' }, () => 'Read installation guide')
        case 'KvCode':
          return h(UI.KvCode, { block: true }, () => `import { KvButton } from '@kinky-vibes/ui'`)
        case 'KvButton':
          return h(UI.KvCluster, () => [h(UI.KvButton, () => 'Transmit'), h(UI.KvButton, { variant: 'secondary' }, () => 'Hold'), h(UI.KvButton, { loading: true }, () => 'Working')])
        case 'KvIconButton':
          return h(UI.KvIconButton, { label: 'Open menu' }, () => h(KvMenuIcon))
        case 'KvButtonGroup':
          return h(UI.KvButtonGroup, { label: 'View density', attached: true }, () => [h(UI.KvButton, { variant: 'secondary' }, () => 'Tight'), h(UI.KvButton, { variant: 'secondary' }, () => 'Wide')])
        case 'KvField':
          return h(UI.KvField, { label: 'Signal', description: 'A short local identifier.', error: 'Identifier already in use.', required: true }, () => h(UI.KvInput, { modelValue: text.value, 'onUpdate:modelValue': (value: string | number) => (text.value = String(value)) }))
        case 'KvInput':
          return h(UI.KvInput, { modelValue: text.value, placeholder: 'Identifier', 'aria-label': 'Identifier', 'onUpdate:modelValue': (value: string | number) => (text.value = String(value)) })
        case 'KvTextarea':
          return h(UI.KvTextarea, { modelValue: text.value, 'aria-label': 'Notes', 'onUpdate:modelValue': (value: string | number) => (text.value = String(value)) })
        case 'KvSelect':
          return h(UI.KvSelect, { modelValue: choice.value, options, 'aria-label': 'Channel', 'onUpdate:modelValue': (value: string | number) => (choice.value = String(value)) })
        case 'KvCombobox':
          return h(UI.KvCombobox, { modelValue: choice.value, options, placeholder: 'Find channel', 'aria-label': 'Channel', 'onUpdate:modelValue': (value: string) => (choice.value = value) })
        case 'KvCheckbox':
          return h(UI.KvCheckbox, { modelValue: checked.value, label: 'Record local diagnostics', description: 'Stored only for this session.', 'onUpdate:modelValue': (value: boolean) => (checked.value = value) })
        case 'KvRadioGroup':
          return h(UI.KvRadioGroup, { modelValue: choice.value, label: 'Channel', options, 'onUpdate:modelValue': (value: string | number) => (choice.value = String(value)) })
        case 'KvSwitch':
          return h(UI.KvSwitch, { modelValue: checked.value, label: 'Monitoring', description: 'Updates are immediate.', 'onUpdate:modelValue': (value: boolean) => (checked.value = value) })
        case 'KvSlider':
          return h(UI.KvSlider, { modelValue: slider.value, 'aria-label': 'Calibration', 'onUpdate:modelValue': (value: number) => (slider.value = value) })
        case 'KvFileInput':
          return h(UI.KvFileInput, { accept: '.json,.txt', prompt: 'Load record' })
        case 'KvTabs':
          return h(UI.KvTabs, { modelValue: tab.value, items: tabs, 'onUpdate:modelValue': (value: string) => (tab.value = value) }, { default: ({ item }: any) => h('p', `Panel for ${item.label}.`) })
        case 'KvBreadcrumbs':
          return h(UI.KvBreadcrumbs, { items: [{ label: 'System', href: '#/' }, { label: 'Channels', href: '#/components' }, { label: 'AX-17' }] })
        case 'KvPagination':
          return h(UI.KvPagination, { modelValue: page.value, total: 93, pageSize: 10, 'onUpdate:modelValue': (value: number) => (page.value = value) })
        case 'KvSteps':
          return h(UI.KvSteps, { current: 1, items: [{ id: 'route', label: 'Route' }, { id: 'review', label: 'Review' }, { id: 'commit', label: 'Commit' }] })
        case 'KvDropdownMenu':
          return h(UI.KvDropdownMenu, { items: [{ id: 'inspect', label: 'Inspect' }, { id: 'duplicate', label: 'Duplicate' }, { id: 'remove', label: 'Remove', danger: true }] }, { trigger: () => 'Channel actions' })
        case 'KvDialog':
          return h('div', [h(UI.KvButton, { onClick: () => (overlayOpen.value = true) }, () => 'Open dialog'), h(UI.KvDialog, { open: overlayOpen.value, title: 'Review routing', description: 'Confirm the local configuration.', 'onUpdate:open': (value: boolean) => (overlayOpen.value = value) }, { default: () => h('p', 'Focusable controls remain contained until the dialog closes.'), footer: ({ close }: any) => h(UI.KvButton, { onClick: close }, () => 'Done') })])
        case 'KvAlertDialog':
          return h('div', [h(UI.KvButton, { variant: 'danger', onClick: () => (overlayOpen.value = true) }, () => 'Remove record'), h(UI.KvAlertDialog, { open: overlayOpen.value, title: 'Remove record?', description: 'This local operation cannot be undone.', destructive: true, 'onUpdate:open': (value: boolean) => (overlayOpen.value = value), onConfirm: () => (overlayOpen.value = false) })])
        case 'KvDrawer':
          return h('div', [h(UI.KvButton, { onClick: () => (overlayOpen.value = true) }, () => 'Open drawer'), h(UI.KvDrawer, { open: overlayOpen.value, title: 'Signal inspector', 'onUpdate:open': (value: boolean) => (overlayOpen.value = value) }, { default: () => h('p', 'Inspect responsive edge-mounted content.') })])
        case 'KvPopover':
          return h(UI.KvPopover, { triggerLabel: 'Show details', placement: 'bottom-start' }, { trigger: () => 'Show details', default: () => h('p', { class: 'docs-popover-copy' }, 'Position flips and shifts inside the viewport.') })
        case 'KvTooltip':
          return h(UI.KvTooltip, { text: 'Inspect channel metadata' }, () => h('button', { class: 'kv-button kv-button--secondary kv-button--md', type: 'button' }, 'Focus or hover'))
        case 'KvCard':
          return h(UI.KvCard, { interactive: true }, { header: () => h(UI.KvBadge, { status: 'success', dot: true }, () => 'Stable'), default: () => [h(UI.KvHeading, { level: 4 }, () => 'Signal AX-17'), h(UI.KvText, { tone: 'muted' }, () => 'Nominal local output.')] })
        case 'KvAccordion':
          return h(UI.KvAccordion, { modelValue: accordion.value, multiple: true, items: [{ id: 'signal', title: 'Signal', content: 'Current signal parameters.' }, { id: 'history', title: 'History', content: 'Recorded local changes.' }], 'onUpdate:modelValue': (value: string | string[]) => (accordion.value = value) })
        case 'KvTable':
          return h(UI.KvTable, { items: rows, columns: [{ key: 'signal', label: 'Signal', sortable: true }, { key: 'state', label: 'State' }, { key: 'load', label: 'Load', align: 'end' }], rowKey: 'id', selectable: true, sort: sort.value, selectedKeys: selected.value, 'onUpdate:sort': (value: UI.KvSortState) => (sort.value = value), 'onUpdate:selectedKeys': (value: Array<string | number>) => (selected.value = value) })
        case 'KvAlert':
          return h(UI.KvAlert, { title: 'Review required', status: 'warning' }, () => 'One channel is outside its expected range.')
        case 'KvBadge':
          return h(UI.KvCluster, () => [h(UI.KvBadge, { status: 'success', dot: true }, () => 'Stable'), h(UI.KvBadge, { status: 'warning' }, () => 'Review'), h(UI.KvBadge, { status: 'error' }, () => 'Offline')])
        case 'KvProgress':
          return h(UI.KvProgress, { value: slider.value, label: 'Calibration', showValue: true })
        case 'KvSpinner':
          return h(UI.KvSpinner, { label: 'Loading preview' })
        case 'KvSkeleton':
          return h(UI.KvStack, { gap: 'sm' }, () => [h(UI.KvSkeleton, { width: '45%', height: '1.5rem' }), h(UI.KvSkeleton), h(UI.KvSkeleton, { width: '75%' })])
        case 'KvEmptyState':
          return h(UI.KvEmptyState, { title: 'No records', description: 'Create a local record to begin.' }, { icon: () => h(KvSearchIcon, { size: 28 }), default: () => h(UI.KvButton, () => 'Create record') })
        case 'KvToastProvider':
          return h(UI.KvToastProvider, null, () => h(ToastTrigger))
        default:
          return h('p', 'Preview unavailable.')
      }
    }
  },
})
