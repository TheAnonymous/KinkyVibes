<script setup lang="ts">
import { ref } from 'vue'
import { KvButton, KvField, KvInput, KvProvider } from '@kinky-vibes/ui'
import { KvCheckIcon } from '@kinky-vibes/ui/icons'

const value = ref('packed-consumer')
</script>

<template>
  <KvProvider>
    <main>
      <KvField label="Package signal">
        <KvInput v-model="value" />
      </KvField>
      <KvButton><KvCheckIcon /> Packed export works</KvButton>
    </main>
  </KvProvider>
</template>
