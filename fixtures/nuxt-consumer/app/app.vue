<script setup lang="ts">
import { ref } from 'vue'
import { KvField, KvInput, KvProvider, KvTabs } from '@kinky-vibes/ui'

const signal = ref('nuxt-ssr')
const tab = ref('status')
const items = [
  { id: 'status', label: 'Status' },
  { id: 'routing', label: 'Routing' },
]
</script>

<template>
  <KvProvider>
    <main>
      <h1>Nuxt package fixture</h1>
      <KvField label="SSR signal" description="Rendered on the server with deterministic IDs.">
        <KvInput v-model="signal" />
      </KvField>
      <KvTabs v-model="tab" :items="items">
        <template #default="{ item }">Panel: {{ item.label }}</template>
      </KvTabs>
    </main>
  </KvProvider>
</template>
