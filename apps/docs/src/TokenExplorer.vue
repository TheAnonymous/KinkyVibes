<script setup lang="ts">
import { computed, ref } from 'vue'
import { copyText } from './clipboard'
import { tokenGroups, tokenInventory, type TokenRecord } from './generated/tokens'

const query = ref('')
const group = ref('All')
const copied = ref('')
let copyTimer: number | undefined

const filteredTokens = computed(() => {
  const needle = query.value.trim().toLocaleLowerCase()
  return tokenInventory.filter((token) => {
    const matchesGroup = group.value === 'All' || token.group === group.value
    const matchesQuery = !needle || `${token.name} ${token.value} ${token.group}`.toLocaleLowerCase().includes(needle)
    return matchesGroup && matchesQuery
  })
})

function previewStyle(token: TokenRecord) {
  if (token.preview === 'color') return { background: `var(${token.name})` }
  if (token.preview === 'shadow') return { boxShadow: `var(${token.name})` }
  if (token.preview === 'size') return { width: `min(100%, var(${token.name}))` }
  return undefined
}

async function copyToken(token: TokenRecord) {
  await copyText(`${token.name}: ${token.value};`)
  copied.value = token.name
  clearTimeout(copyTimer)
  copyTimer = window.setTimeout(() => (copied.value = ''), 1500)
}
</script>

<template>
  <section id="explorer" class="docs-token-explorer docs-section-anchor" aria-labelledby="token-explorer-title">
    <div class="docs-token-explorer__header">
      <div>
        <span>Inventory / built CSS</span>
        <h2 id="token-explorer-title">All exported tokens</h2>
      </div>
      <output aria-live="polite">{{ filteredTokens.length }} of {{ tokenInventory.length }} tokens</output>
    </div>
    <div class="docs-token-explorer__controls">
      <label>
        <span>Filter tokens</span>
        <input v-model="query" type="search" placeholder="Search name or value" />
      </label>
      <div class="docs-token-groups" role="group" aria-label="Token groups">
        <button
          v-for="item in ['All', ...tokenGroups]"
          :key="item"
          type="button"
          :aria-pressed="group === item"
          @click="group = item"
        >{{ item }}</button>
      </div>
    </div>
    <div v-if="filteredTokens.length" class="docs-token-grid">
      <article v-for="token in filteredTokens" :key="token.name" class="docs-token" :data-token-group="token.group">
        <span class="docs-token__preview" :data-preview="token.preview" :style="previewStyle(token)" aria-hidden="true">
          <span v-if="token.preview === 'type'">Aa</span>
          <span v-else-if="token.preview === 'motion'"></span>
          <span v-else-if="token.preview === 'value'">{{ token.value }}</span>
        </span>
        <span class="docs-token__group">{{ token.group }}</span>
        <code>{{ token.name }}</code>
        <strong>{{ token.value }}</strong>
        <button type="button" :aria-label="`Copy ${token.name} declaration`" @click="copyToken(token)">
          {{ copied === token.name ? 'Copied' : 'Copy declaration' }}
        </button>
      </article>
    </div>
    <div v-else class="docs-token-empty" role="status">
      <strong>No matching tokens</strong>
      <span>Clear the search or choose another group.</span>
      <button type="button" @click="query = ''; group = 'All'">Reset filters</button>
    </div>
    <span class="kv-visually-hidden" aria-live="polite">{{ copied ? `${copied} declaration copied.` : '' }}</span>
  </section>
</template>
