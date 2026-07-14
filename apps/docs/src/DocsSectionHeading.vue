<script setup lang="ts">
import { ref } from 'vue'
import { copyText } from './clipboard'

const props = defineProps<{ id: string; title: string; route: string }>()
const copied = ref(false)
let timer: number | undefined

const href = () => `#${props.route}?section=${props.id}`

async function copyLink() {
  const url = new URL(window.location.href)
  url.hash = href().slice(1)
  await copyText(url.toString())
  copied.value = true
  clearTimeout(timer)
  timer = window.setTimeout(() => (copied.value = false), 1500)
}
</script>

<template>
  <div :id="id" class="docs-section-heading docs-section-anchor">
    <h2><a :href="href()">{{ title }}</a></h2>
    <button type="button" :aria-label="`Copy link to ${title}`" @click="copyLink">{{ copied ? 'Copied' : 'Copy link' }}</button>
    <span class="kv-visually-hidden" aria-live="polite">{{ copied ? `Link to ${title} copied.` : '' }}</span>
  </div>
</template>
