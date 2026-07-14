<script setup lang="ts">
import type { ShowcaseImage } from './showcase'

defineProps<{
  image: ShowcaseImage
  label: string
  marker: string
}>()
</script>

<template>
  <figure class="docs-page-visual">
    <img
      class="docs-showcase-image docs-page-visual__image"
      :data-editorial-image="marker"
      :src="image.src"
      :srcset="image.srcset"
      sizes="(max-width: 64rem) calc(100vw - 2rem), 48rem"
      :width="image.width"
      :height="image.height"
      alt=""
      loading="lazy"
      decoding="async"
    />
    <figcaption><span>Field study</span>{{ label }}</figcaption>
  </figure>
</template>
