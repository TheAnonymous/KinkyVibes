<script setup lang="ts">
export interface RailSection {
  id: string
  label: string
}

defineProps<{
  route: string
  activeSection: string
  sections: RailSection[]
  metadata: Array<{ label: string; value: string }>
}>()

defineEmits<{ navigate: [section: string] }>()
</script>

<template>
  <aside class="docs-page-rail" aria-label="On this page">
    <div class="docs-page-rail__identity">
      <span>On this page</span>
      <strong>{{ sections.find((section) => section.id === activeSection)?.label ?? sections[0]?.label }}</strong>
    </div>
    <dl>
      <div v-for="item in metadata" :key="item.label"><dt>{{ item.label }}</dt><dd>{{ item.value }}</dd></div>
    </dl>
    <nav aria-label="Page sections">
      <a
        v-for="(section, index) in sections"
        :key="section.id"
        :href="`#${route}?section=${section.id}`"
        :aria-current="activeSection === section.id ? 'location' : undefined"
        @click="$emit('navigate', section.id)"
      ><span>{{ String(index + 1).padStart(2, '0') }}</span>{{ section.label }}</a>
    </nav>
  </aside>
</template>
