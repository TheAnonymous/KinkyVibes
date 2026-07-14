// Generated from packages/ui/dist/tokens.css by scripts/generate-tokens.ts.
// Do not edit by hand. The docs build checks the built stylesheet against source before writing this file.
export type TokenPreview = 'color' | 'shadow' | 'size' | 'type' | 'motion' | 'value'

export interface TokenRecord {
  name: string
  value: string
  group: string
  preview: TokenPreview
}

export const tokenGroups = [
  "Color",
  "Typography",
  "Space & Size",
  "Surface",
  "Layering",
  "Motion"
] as const

export const tokenInventory: readonly TokenRecord[] = [
  {
    "name": "--kv-color-void",
    "value": "#090909",
    "group": "Color",
    "preview": "color"
  },
  {
    "name": "--kv-color-bg",
    "value": "#0d0d0e",
    "group": "Color",
    "preview": "color"
  },
  {
    "name": "--kv-color-surface",
    "value": "#151516",
    "group": "Color",
    "preview": "color"
  },
  {
    "name": "--kv-color-surface-raised",
    "value": "#1c1c1e",
    "group": "Color",
    "preview": "color"
  },
  {
    "name": "--kv-color-surface-sunken",
    "value": "#101011",
    "group": "Color",
    "preview": "color"
  },
  {
    "name": "--kv-color-steel",
    "value": "#29292c",
    "group": "Color",
    "preview": "color"
  },
  {
    "name": "--kv-color-steel-bright",
    "value": "#3a3a3e",
    "group": "Color",
    "preview": "color"
  },
  {
    "name": "--kv-color-border",
    "value": "#444449",
    "group": "Color",
    "preview": "color"
  },
  {
    "name": "--kv-color-border-strong",
    "value": "#68686f",
    "group": "Color",
    "preview": "color"
  },
  {
    "name": "--kv-color-text",
    "value": "#e9e4d8",
    "group": "Color",
    "preview": "color"
  },
  {
    "name": "--kv-color-text-muted",
    "value": "#a29e96",
    "group": "Color",
    "preview": "color"
  },
  {
    "name": "--kv-color-text-faint",
    "value": "#74716c",
    "group": "Color",
    "preview": "color"
  },
  {
    "name": "--kv-color-signal",
    "value": "#e22832",
    "group": "Color",
    "preview": "color"
  },
  {
    "name": "--kv-color-signal-hover",
    "value": "#ff3842",
    "group": "Color",
    "preview": "color"
  },
  {
    "name": "--kv-color-signal-active",
    "value": "#ba111b",
    "group": "Color",
    "preview": "color"
  },
  {
    "name": "--kv-color-on-signal",
    "value": "#fff8ed",
    "group": "Color",
    "preview": "color"
  },
  {
    "name": "--kv-color-info",
    "value": "#72a7c7",
    "group": "Color",
    "preview": "color"
  },
  {
    "name": "--kv-color-success",
    "value": "#72a278",
    "group": "Color",
    "preview": "color"
  },
  {
    "name": "--kv-color-warning",
    "value": "#d2a63d",
    "group": "Color",
    "preview": "color"
  },
  {
    "name": "--kv-color-error",
    "value": "#ed4b54",
    "group": "Color",
    "preview": "color"
  },
  {
    "name": "--kv-color-focus",
    "value": "#f0cf63",
    "group": "Color",
    "preview": "color"
  },
  {
    "name": "--kv-font-body",
    "value": "\"KV Inter\", Inter, ui-sans-serif, system-ui, sans-serif",
    "group": "Typography",
    "preview": "type"
  },
  {
    "name": "--kv-font-display",
    "value": "\"KV Saira\", \"KV Barlow Condensed\", \"Arial Narrow\", ui-sans-serif, sans-serif",
    "group": "Typography",
    "preview": "type"
  },
  {
    "name": "--kv-font-mono",
    "value": "\"SFMono-Regular\", Consolas, \"Liberation Mono\", monospace",
    "group": "Typography",
    "preview": "type"
  },
  {
    "name": "--kv-font-body-weight",
    "value": "440",
    "group": "Typography",
    "preview": "type"
  },
  {
    "name": "--kv-font-display-weight",
    "value": "820",
    "group": "Typography",
    "preview": "type"
  },
  {
    "name": "--kv-font-display-width",
    "value": "58",
    "group": "Typography",
    "preview": "type"
  },
  {
    "name": "--kv-font-size-xs",
    "value": "0.6875rem",
    "group": "Typography",
    "preview": "type"
  },
  {
    "name": "--kv-font-size-sm",
    "value": "0.8125rem",
    "group": "Typography",
    "preview": "type"
  },
  {
    "name": "--kv-font-size-md",
    "value": "0.9375rem",
    "group": "Typography",
    "preview": "type"
  },
  {
    "name": "--kv-font-size-lg",
    "value": "1.125rem",
    "group": "Typography",
    "preview": "type"
  },
  {
    "name": "--kv-font-size-xl",
    "value": "1.5rem",
    "group": "Typography",
    "preview": "type"
  },
  {
    "name": "--kv-font-size-2xl",
    "value": "clamp(2rem, 5vw, 3.75rem)",
    "group": "Typography",
    "preview": "type"
  },
  {
    "name": "--kv-line-height-tight",
    "value": "0.82",
    "group": "Typography",
    "preview": "type"
  },
  {
    "name": "--kv-line-height-body",
    "value": "1.48",
    "group": "Typography",
    "preview": "type"
  },
  {
    "name": "--kv-letter-display",
    "value": "-0.018em",
    "group": "Typography",
    "preview": "type"
  },
  {
    "name": "--kv-letter-label",
    "value": "0.135em",
    "group": "Typography",
    "preview": "type"
  },
  {
    "name": "--kv-space-1",
    "value": "0.25rem",
    "group": "Space & Size",
    "preview": "size"
  },
  {
    "name": "--kv-space-2",
    "value": "0.5rem",
    "group": "Space & Size",
    "preview": "size"
  },
  {
    "name": "--kv-space-3",
    "value": "0.75rem",
    "group": "Space & Size",
    "preview": "size"
  },
  {
    "name": "--kv-space-4",
    "value": "1rem",
    "group": "Space & Size",
    "preview": "size"
  },
  {
    "name": "--kv-space-5",
    "value": "1.5rem",
    "group": "Space & Size",
    "preview": "size"
  },
  {
    "name": "--kv-space-6",
    "value": "2rem",
    "group": "Space & Size",
    "preview": "size"
  },
  {
    "name": "--kv-space-7",
    "value": "3rem",
    "group": "Space & Size",
    "preview": "size"
  },
  {
    "name": "--kv-space-8",
    "value": "4rem",
    "group": "Space & Size",
    "preview": "size"
  },
  {
    "name": "--kv-control-sm",
    "value": "2rem",
    "group": "Space & Size",
    "preview": "size"
  },
  {
    "name": "--kv-control-md",
    "value": "2.625rem",
    "group": "Space & Size",
    "preview": "size"
  },
  {
    "name": "--kv-control-lg",
    "value": "3.25rem",
    "group": "Space & Size",
    "preview": "size"
  },
  {
    "name": "--kv-radius-sm",
    "value": "1px",
    "group": "Space & Size",
    "preview": "size"
  },
  {
    "name": "--kv-radius-md",
    "value": "2px",
    "group": "Space & Size",
    "preview": "size"
  },
  {
    "name": "--kv-border",
    "value": "1px solid var(--kv-color-border)",
    "group": "Surface",
    "preview": "value"
  },
  {
    "name": "--kv-border-strong",
    "value": "1px solid var(--kv-color-border-strong)",
    "group": "Surface",
    "preview": "value"
  },
  {
    "name": "--kv-shadow-hard",
    "value": "4px 4px 0 #000",
    "group": "Surface",
    "preview": "shadow"
  },
  {
    "name": "--kv-shadow-signal",
    "value": "4px 4px 0 #62070d",
    "group": "Surface",
    "preview": "shadow"
  },
  {
    "name": "--kv-shadow-overlay",
    "value": "8px 8px 0 rgb(0 0 0 / 65%)",
    "group": "Surface",
    "preview": "shadow"
  },
  {
    "name": "--kv-z-dropdown",
    "value": "900",
    "group": "Layering",
    "preview": "value"
  },
  {
    "name": "--kv-z-overlay",
    "value": "1000",
    "group": "Layering",
    "preview": "value"
  },
  {
    "name": "--kv-z-toast",
    "value": "1100",
    "group": "Layering",
    "preview": "value"
  },
  {
    "name": "--kv-duration-fast",
    "value": "90ms",
    "group": "Motion",
    "preview": "motion"
  },
  {
    "name": "--kv-duration-normal",
    "value": "160ms",
    "group": "Motion",
    "preview": "motion"
  },
  {
    "name": "--kv-duration-slow",
    "value": "240ms",
    "group": "Motion",
    "preview": "motion"
  },
  {
    "name": "--kv-ease-mechanical",
    "value": "cubic-bezier(0.2, 0, 0, 1)",
    "group": "Motion",
    "preview": "motion"
  },
  {
    "name": "--kv-ease-enter",
    "value": "cubic-bezier(0.16, 1, 0.3, 1)",
    "group": "Motion",
    "preview": "motion"
  },
  {
    "name": "--kv-ease-exit",
    "value": "cubic-bezier(0.7, 0, 0.84, 0)",
    "group": "Motion",
    "preview": "motion"
  },
  {
    "name": "--kv-motion-shift",
    "value": "0.375rem",
    "group": "Motion",
    "preview": "motion"
  },
  {
    "name": "--kv-container-sm",
    "value": "42rem",
    "group": "Space & Size",
    "preview": "size"
  },
  {
    "name": "--kv-container-md",
    "value": "64rem",
    "group": "Space & Size",
    "preview": "size"
  },
  {
    "name": "--kv-container-lg",
    "value": "80rem",
    "group": "Space & Size",
    "preview": "size"
  }
]
