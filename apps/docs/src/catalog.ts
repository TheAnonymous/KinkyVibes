export interface ApiProp {
  name: string
  type: string
  default?: string
  description: string
}

export interface ComponentDoc {
  name: string
  slug: string
  category: string
  description: string
  props: ApiProp[]
  keyboard?: string[]
  code: string
}

const commonSize: ApiProp = { name: 'size', type: 'KvSize', default: "'md'", description: 'Controls the mechanical control height.' }
const model: ApiProp = { name: 'modelValue', type: 'varies', description: 'Controlled value. Pair with update:modelValue or v-model.' }
const open: ApiProp = { name: 'open', type: 'boolean', description: 'Controlled open state. Pair with update:open or v-model:open.' }

function doc(name: string, category: string, description: string, props: ApiProp[] = [], keyboard?: string[], code?: string): ComponentDoc {
  const slug = name.replace(/^Kv/, '').replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
  return {
    name,
    slug,
    category,
    description,
    props,
    keyboard,
    code: code ?? `<${name}>Neutral content</${name}>`,
  }
}

export const componentDocs: ComponentDoc[] = [
  doc('KvProvider', 'Foundations', 'Establishes tokens, typography, grain, and a local override boundary.', [
    { name: 'tokens', type: 'Record<string, string>', default: '{}', description: 'Overrides --kv-* variables on this subtree.' },
    { name: 'grain', type: 'boolean', default: 'true', description: 'Enables the subtle CSS-only surface texture.' },
  ], undefined, `<KvProvider :tokens="{ '--kv-color-signal': '#f43' }">…</KvProvider>`),
  doc('KvContainer', 'Foundations', 'Constrains page content to a readable responsive measure.', [{ name: 'size', type: "'sm' | 'md' | 'lg' | 'full'", default: "'lg'", description: 'Maximum content width.' }]),
  doc('KvStack', 'Foundations', 'Arranges children vertically with tokenized spacing.', [{ name: 'gap', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Space between children.' }]),
  doc('KvCluster', 'Foundations', 'Wraps related controls and content on a horizontal axis.', [{ name: 'justify', type: "'start' | 'center' | 'end' | 'between'", default: "'start'", description: 'Main-axis distribution.' }]),
  doc('KvGrid', 'Foundations', 'Creates an auto-fitting responsive grid without breakpoint props.', [{ name: 'min', type: 'string', default: "'15rem'", description: 'Minimum track width.' }]),
  doc('KvDivider', 'Foundations', 'Separates regions visually and semantically.', [{ name: 'orientation', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: 'Separator axis.' }]),
  doc('KvVisuallyHidden', 'Foundations', 'Keeps accessible text available without visual layout.', [{ name: 'focusable', type: 'boolean', default: 'false', description: 'Reveals the content when focused.' }]),
  doc('KvHeading', 'Foundations', 'Industrial condensed display heading with valid semantic levels.', [{ name: 'level', type: '1 | 2 | 3 | 4 | 5 | 6', default: '2', description: 'Rendered heading level.' }, { name: 'eyebrow', type: 'string', description: 'Optional signal label above the heading.' }]),
  doc('KvText', 'Foundations', 'Body copy with size and tone controls.', [{ name: 'tone', type: "'default' | 'muted' | 'signal'", default: "'default'", description: 'Semantic text color.' }]),
  doc('KvLink', 'Foundations', 'A high-contrast text link with external-link safety.', [{ name: 'href', type: 'string', description: 'Destination URL.' }, { name: 'external', type: 'boolean', default: 'false', description: 'Opens a new protected browsing context.' }]),
  doc('KvCode', 'Foundations', 'Inline or block monospace technical content.', [{ name: 'block', type: 'boolean', default: 'false', description: 'Renders a preformatted code block.' }]),

  doc('KvButton', 'Actions', 'Primary action with variants, sizes, loading, and slot affordances.', [commonSize, { name: 'variant', type: 'KvVariant', default: "'primary'", description: 'Visual action hierarchy.' }, { name: 'loading', type: 'boolean', default: 'false', description: 'Disables the action and exposes busy state.' }], ['Enter / Space — activate'], `<KvButton variant="primary">Transmit</KvButton>`),
  doc('KvIconButton', 'Actions', 'Square icon-only action that requires an accessible label.', [{ name: 'label', type: 'string', description: 'Required accessible name.' }, commonSize], ['Enter / Space — activate'], `<KvIconButton label="Open menu"><KvMenuIcon /></KvIconButton>`),
  doc('KvButtonGroup', 'Actions', 'Labels and groups related actions.', [{ name: 'label', type: 'string', description: 'Accessible group name.' }, { name: 'attached', type: 'boolean', default: 'false', description: 'Collapses spacing between controls.' }]),

  doc('KvField', 'Forms', 'Connects label, description, error, required state, and input IDs automatically.', [{ name: 'label', type: 'string', description: 'Visible field label.' }, { name: 'description', type: 'string', description: 'Helpful text connected through aria-describedby.' }, { name: 'error', type: 'string', description: 'Error text and invalid state; validation remains consumer-owned.' }], undefined, `<KvField label="Signal" description="Short identifier"><KvInput /></KvField>`),
  doc('KvInput', 'Forms', 'Textual and native date/time input types with controlled or default state.', [model, commonSize, { name: 'type', type: "text | email | password | search | number | date | time | datetime-local | …", default: "'text'", description: 'Native input type.' }]),
  doc('KvTextarea', 'Forms', 'Multiline text entry with consumer-controlled validation.', [model, { name: 'rows', type: 'number', default: '4', description: 'Initial visible row count.' }]),
  doc('KvSelect', 'Forms', 'Styled semantic native select retaining platform keyboard behavior.', [model, { name: 'options', type: 'KvSelectOption[]', default: '[]', description: 'Available native options.' }], ['Arrow keys — move', 'Home / End — first or last', 'Enter — commit on supported platforms']),
  doc('KvCombobox', 'Forms', 'Filterable listbox with complete active-option keyboard handling.', [model, { name: 'options', type: 'KvComboboxOption[]', default: '[]', description: 'Searchable choices.' }], ['Arrow Up / Down — move', 'Home / End — first or last', 'Enter — select', 'Escape — close']),
  doc('KvCheckbox', 'Forms', 'Boolean or indeterminate choice with label and description.', [model, { name: 'indeterminate', type: 'boolean', default: 'false', description: 'Shows a mixed visual state.' }], ['Space — toggle']),
  doc('KvRadioGroup', 'Forms', 'Named native radio set in a semantic fieldset.', [model, { name: 'options', type: 'KvSelectOption[]', default: '[]', description: 'Mutually exclusive choices.' }], ['Arrow keys — move and select', 'Space — select']),
  doc('KvSwitch', 'Forms', 'Immediate boolean setting using the switch role.', [model, { name: 'label', type: 'string', description: 'Visible and accessible label.' }], ['Space / Enter — toggle']),
  doc('KvSlider', 'Forms', 'Native range control with signal progress and optional value output.', [model, { name: 'min / max / step', type: 'number', description: 'Native numeric range contract.' }], ['Arrow keys — adjust one step', 'Page Up / Down — larger adjustment', 'Home / End — limits']),
  doc('KvFileInput', 'Forms', 'Styled native file picker that emits a stable File array.', [{ name: 'accept', type: 'string', description: 'Native accepted file types.' }, { name: 'multiple', type: 'boolean', default: 'false', description: 'Allows more than one file.' }], ['Enter / Space — open system picker']),

  doc('KvTabs', 'Navigation', 'Automatic-activation tab set with horizontal or vertical orientation.', [model, { name: 'items', type: 'KvTabItem[]', description: 'Tab IDs, labels, and disabled state.' }], ['Arrow keys — select adjacent tab', 'Home / End — first or last tab']),
  doc('KvBreadcrumbs', 'Navigation', 'Semantic path navigation with a current-page marker.', [{ name: 'items', type: 'KvBreadcrumbItem[]', description: 'Ordered path segments.' }]),
  doc('KvPagination', 'Navigation', 'Controlled or default pagination with bounded page updates.', [model, { name: 'total', type: 'number', description: 'Total consumer-owned item count.' }, { name: 'pageSize', type: 'number', default: '10', description: 'Items represented per page.' }]),
  doc('KvSteps', 'Navigation', 'Read-only ordered process indicator.', [{ name: 'items', type: 'KvStep[]', description: 'Ordered step metadata.' }, { name: 'current', type: 'number | string', default: '0', description: 'Current index or step ID.' }]),
  doc('KvDropdownMenu', 'Navigation', 'Positioned action menu with roving focus and outside handling.', [open, { name: 'items', type: 'KvMenuItem[]', description: 'Menu actions and disabled state.' }, { name: 'placement', type: 'KvPlacement', default: "'bottom-start'", description: 'Preferred placement; flips and shifts at edges.' }], ['Arrow Up / Down — move', 'Home / End — first or last', 'Enter / Space — invoke', 'Escape — close and restore focus']),

  doc('KvDialog', 'Overlays', 'Modal surface with focus trap, restoration, Escape, outside handling, and scroll lock.', [open, { name: 'title', type: 'string', description: 'Accessible modal title.' }, { name: 'closeOnOutside', type: 'boolean', default: 'true', description: 'Allows backdrop dismissal.' }], ['Tab / Shift+Tab — cycle inside', 'Escape — close and restore focus']),
  doc('KvAlertDialog', 'Overlays', 'Interruptive confirmation surface with initial cancel focus.', [open, { name: 'destructive', type: 'boolean', default: 'false', description: 'Marks the confirm action as destructive.' }], ['Tab / Shift+Tab — cycle inside', 'Escape — cancel and restore focus']),
  doc('KvDrawer', 'Overlays', 'Edge-mounted modal panel sharing the dialog focus contract.', [open, { name: 'side', type: "'left' | 'right'", default: "'right'", description: 'Viewport edge.' }], ['Tab / Shift+Tab — cycle inside', 'Escape — close and restore focus']),
  doc('KvPopover', 'Overlays', 'Non-modal positioned content with flip, shift, outside, and Escape handling.', [open, { name: 'placement', type: 'KvPlacement', default: "'bottom'", description: 'Preferred placement.' }], ['Escape — close and restore focus']),
  doc('KvTooltip', 'Overlays', 'Delayed hover/focus description rendered through a safe teleport.', [{ name: 'text', type: 'string', description: 'Tooltip content.' }, { name: 'delay', type: 'number', default: '350', description: 'Open delay in milliseconds.' }], ['Focus — show', 'Escape / Blur — hide']),

  doc('KvCard', 'Data & Disclosure', 'Steel surface for grouped, optionally interactive content.', [{ name: 'padding', type: "'none' | 'sm' | 'md' | 'lg'", default: "'md'", description: 'Body inset.' }]),
  doc('KvAccordion', 'Data & Disclosure', 'Single or multi-open disclosure regions using semantic heading buttons.', [model, { name: 'items', type: 'KvAccordionItem[]', description: 'Disclosure headings and optional content.' }, { name: 'multiple', type: 'boolean', default: 'false', description: 'Allows several open panels.' }], ['Enter / Space — toggle panel']),
  doc('KvTable', 'Data & Disclosure', 'Semantic typed table with controlled sorting and row selection; data transforms stay consumer-owned.', [{ name: 'items', type: 'T[]', description: 'Rows in display order.' }, { name: 'columns', type: 'KvTableColumn<T>[]', description: 'Column metadata and optional value accessors.' }, { name: 'rowKey', type: 'keyof T | (item: T) => string | number', description: 'Stable row identity.' }, { name: 'sort', type: 'KvSortState', description: 'Controlled sort indicator; no internal data sorting.' }, { name: 'selectedKeys', type: '(string | number)[]', description: 'Controlled selection keys.' }], ['Enter / Space — sort header or toggle checkbox']),

  doc('KvAlert', 'Feedback', 'Inline neutral or status message with optional dismissal.', [{ name: 'status', type: 'KvStatus', default: "'neutral'", description: 'Status color and live-region priority.' }]),
  doc('KvBadge', 'Feedback', 'Compact status or metadata label.', [{ name: 'status', type: 'KvStatus', default: "'neutral'", description: 'Semantic color.' }, { name: 'dot', type: 'boolean', default: 'false', description: 'Adds a visible state marker.' }]),
  doc('KvProgress', 'Feedback', 'Determinate or indeterminate progress with an accessible label.', [{ name: 'value', type: 'number | undefined', description: 'Omit for indeterminate progress.' }, { name: 'max', type: 'number', default: '100', description: 'Completion value.' }]),
  doc('KvSpinner', 'Feedback', 'Compact mechanical loading indicator with status text.', [{ name: 'label', type: 'string', default: "'Loading'", description: 'Screen-reader status label.' }, commonSize]),
  doc('KvSkeleton', 'Feedback', 'Non-semantic placeholder for nearby loading state.', [{ name: 'width / height', type: 'string', description: 'CSS dimensions.' }]),
  doc('KvEmptyState', 'Feedback', 'Centered no-content state with icon and action slots.', [{ name: 'title', type: 'string', description: 'Concise empty-state heading.' }, { name: 'description', type: 'string', description: 'Recovery guidance.' }]),
  doc('KvToastProvider', 'Feedback', 'Provides useKvToast and renders timed, actionable status notifications.', [{ name: 'placement', type: "'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'", default: "'bottom-right'", description: 'Viewport stack position.' }, { name: 'defaultDuration', type: 'number', default: '5000', description: 'Default dismissal timeout; zero persists.' }], ['Tab — reach actions when present', 'Enter / Space — invoke or dismiss'], `const { toast } = useKvToast()\ntoast({ title: 'Signal stored', status: 'success' })`),
]

export const categories = [...new Set(componentDocs.map((entry) => entry.category))]

export const staticPages = [
  { title: 'Introduction', path: '/', text: 'Industrial-underground Vue 3 design system' },
  { title: 'Installation', path: '/installation', text: 'Install plugin named imports styles package' },
  { title: 'Tokens', path: '/tokens', text: 'CSS variables colors spacing typography customization' },
  { title: 'Components', path: '/components', text: 'All component categories and public APIs' },
  { title: 'SSR & Nuxt', path: '/guides/ssr', text: 'Server rendering hydration Nuxt imports teleports' },
  { title: 'Customization', path: '/guides/customization', text: 'Token overrides stable classes dark theme' },
  { title: 'Accessibility', path: '/accessibility', text: 'Keyboard screen reader checklist best effort axe' },
]
