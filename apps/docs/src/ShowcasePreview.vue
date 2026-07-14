<script setup lang="ts">
import { ref } from 'vue'
import {
  KvAlert,
  KvButton,
  KvField,
  KvHeading,
  KvInput,
  KvPopover,
  KvTable,
  KvTabs,
  type KvSortState,
} from '@kinky-vibes/ui'
import type { ShowcasePreviewName } from './showcase'

defineProps<{ component: ShowcasePreviewName }>()

const actionCount = ref(0)
const fieldValue = ref('AX-17')
const activeTab = ref('status')
const alertVisible = ref(true)
const sort = ref<KvSortState>({ key: 'signal', direction: 'asc' })
const selectedKeys = ref<Array<string | number>>([])

const tabs = [
  { id: 'status', label: 'Status' },
  { id: 'routing', label: 'Routing' },
]

const rows = [
  { id: 'AX-17', signal: 'AX-17', state: 'Stable' },
  { id: 'CR-91', signal: 'CR-91', state: 'Review' },
]

const columns = [
  { key: 'signal', label: 'Signal', sortable: true },
  { key: 'state', label: 'State' },
]
</script>

<template>
  <KvHeading v-if="component === 'KvHeading'" :level="3" eyebrow="System / 01">Pressure systems</KvHeading>

  <div v-else-if="component === 'KvButton'" class="docs-showcase-action">
    <KvButton @click="actionCount += 1">Transmit signal</KvButton>
    <span aria-live="polite">{{ actionCount ? `Transmissions: ${actionCount}` : 'Ready' }}</span>
  </div>

  <KvField v-else-if="component === 'KvField'" label="Call sign" description="Local identifier">
    <KvInput v-model="fieldValue" />
  </KvField>

  <KvTabs v-else-if="component === 'KvTabs'" v-model="activeTab" :items="tabs" label="Showcase routes">
    <template #default="{ item }">
      <p class="docs-showcase-tab-panel">{{ item.label }} channel selected.</p>
    </template>
  </KvTabs>

  <KvPopover v-else-if="component === 'KvPopover'" trigger-label="Show overlay details" placement="top">
    <template #trigger>Show overlay</template>
    <p class="docs-popover-copy">Positioned context remains inside the visible scene.</p>
  </KvPopover>

  <KvTable
    v-else-if="component === 'KvTable'"
    v-model:sort="sort"
    v-model:selected-keys="selectedKeys"
    :items="rows"
    :columns="columns"
    row-key="id"
    selectable
    caption="Live signal records"
  />

  <div v-else-if="component === 'KvAlert'" class="docs-showcase-feedback">
    <KvAlert v-if="alertVisible" title="Review required" status="warning" dismissible @dismiss="alertVisible = false">
      One channel is outside its expected range.
    </KvAlert>
    <KvButton v-else variant="secondary" @click="alertVisible = true">Restore alert</KvButton>
  </div>
</template>
