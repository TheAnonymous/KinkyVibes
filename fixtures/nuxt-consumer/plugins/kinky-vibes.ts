import { KinkyVibes } from '@kinky-vibes/ui'
import '@kinky-vibes/ui/styles.css'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(KinkyVibes)
})
