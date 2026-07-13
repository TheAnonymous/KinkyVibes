# Contributing

Use Node.js 22 or newer and npm 12.

```sh
npm ci
npm run check
npm run test:e2e
```

The docs intentionally resolve `@kinky-vibes/ui` through its built `dist`
exports. Run `npm run build:ui` before starting the documentation app after a
clean checkout.

User-visible package changes require a changeset:

```sh
npm run changeset
```

Keep components SSR-safe: access browser APIs only from mounted hooks or event
handlers. New interactive patterns need keyboard tests and a documented
keyboard contract. Do not add runtime UI dependencies to `packages/ui`.
