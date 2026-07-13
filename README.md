# KinkyVibes UI

An uncompromising dark Vue 3 component library with an industrial-underground
visual language. The public package has no UI runtime dependencies: focus,
overlays, positioning, keyboard behavior, and icons are implemented locally.

> The project is pre-1.0 while its package, SSR, Nuxt, accessibility, and
> browser matrices are being proven. The first fully verified release will be
> `1.0.0`.

## Install

```sh
npm install @kinky-vibes/ui vue
```

```ts
import { createApp } from 'vue'
import { KinkyVibes } from '@kinky-vibes/ui'
import '@kinky-vibes/ui/styles.css'

createApp(App).use(KinkyVibes).mount('#app')
```

Named imports are recommended and tree-shakeable:

```vue
<script setup lang="ts">
import { KvButton, KvField, KvInput } from '@kinky-vibes/ui'
</script>

<template>
  <KvField label="Signal" description="A short, neutral identifier.">
    <KvInput placeholder="AX-17" />
  </KvField>
</template>
```

Import `@kinky-vibes/ui/tokens.css` instead of the full stylesheet when you
only need the documented `--kv-*` design tokens.

## Workspace

- `packages/ui` — publishable Vue/TypeScript library.
- `apps/docs` — responsive showcase which imports only the built package.
- `fixtures/vue-consumer` and `fixtures/nuxt-consumer` — package and SSR smoke
  projects.
- `tests` — unit, browser, accessibility, and visual coverage.

Node.js 22 or newer is required. See [CONTRIBUTING.md](./CONTRIBUTING.md) for
the complete local workflow.

## Documentation site

The showcase is deployed from `apps/docs/dist` with GitHub Pages on every push
to `main`. The workflow derives the correct Vite base path from the repository
name, so the site works both as a project page and as an account page.

## Accessibility scope

The project tests semantics, keyboard interaction, focus behavior, and
representative pages with axe. This is best-effort engineering evidence, not a
formal WCAG conformance claim.

## License

[MIT](./LICENSE)
