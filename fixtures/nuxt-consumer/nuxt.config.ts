export default defineNuxtConfig({
  ssr: true,
  compatibilityDate: '2026-07-01',
  devtools: { enabled: false },
  nitro: { preset: 'node-server' },
  typescript: { strict: true },
})
