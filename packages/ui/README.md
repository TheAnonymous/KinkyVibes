# @kinky-vibes/ui

Industrial-underground Vue 3 components. Import named components from
`@kinky-vibes/ui`, the complete theme from `@kinky-vibes/ui/styles.css`, or
tokens alone from `@kinky-vibes/ui/tokens.css`.

The package requires Vue 3.5 or newer and has no runtime dependency other than
its Vue peer.

## 1.0 semantic contracts

- `KvAlert` is silent by default. Set `announce="polite"` for `role="status"`
  or `announce="assertive"` for `role="alert"`; visual `status` only controls
  color.
- `KvTooltip` requires exactly one HTML element in its default slot. It forwards
  positioning ref, hover/focus events, and `aria-describedby` to that element
  without adding a focusable wrapper.
