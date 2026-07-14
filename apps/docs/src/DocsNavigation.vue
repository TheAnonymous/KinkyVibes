<script setup lang="ts">
import { computed } from 'vue'
import { categories, componentDocs } from './catalog'

const props = defineProps<{ route: string }>()
const emit = defineEmits<{ navigate: [] }>()

const currentSlug = computed(() => props.route.match(/^\/components\/(.+)$/)?.[1])

function isCurrent(path: string) {
  return props.route === path ? 'page' : undefined
}
</script>

<template>
  <nav class="docs-navigation" aria-label="Documentation" @click="emit('navigate')">
    <div class="docs-nav-section">
      <span class="docs-nav-label">Start</span>
      <a href="#/" :aria-current="isCurrent('/')">Introduction</a>
      <a href="#/installation" :aria-current="isCurrent('/installation')">Installation</a>
      <a href="#/tokens" :aria-current="isCurrent('/tokens')">Token explorer</a>
      <a href="#/components" :aria-current="isCurrent('/components')">All components</a>
    </div>
    <div v-for="category in categories" :key="category" class="docs-nav-section">
      <span class="docs-nav-label">{{ category }}</span>
      <a
        v-for="component in componentDocs.filter((entry) => entry.category === category)"
        :key="component.name"
        :href="`#/components/${component.slug}`"
        :aria-current="currentSlug === component.slug ? 'page' : undefined"
      >{{ component.name.replace('Kv', '') }}</a>
    </div>
    <div class="docs-nav-section">
      <span class="docs-nav-label">Guides</span>
      <a href="#/guides/ssr" :aria-current="isCurrent('/guides/ssr')">SSR &amp; Nuxt</a>
      <a href="#/guides/customization" :aria-current="isCurrent('/guides/customization')">Customization</a>
      <a href="#/accessibility" :aria-current="isCurrent('/accessibility')">Accessibility</a>
    </div>
  </nav>
</template>
