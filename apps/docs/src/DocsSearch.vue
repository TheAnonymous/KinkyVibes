<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { KvSearchIcon } from '@kinky-vibes/ui/icons'

interface SearchEntry {
  title: string
  path: string
  text: string
  kind: 'page' | 'component'
  category?: string
}

const query = ref('')
const entries = ref<SearchEntry[]>([])
const loadState = ref<'loading' | 'ready' | 'error'>('loading')
const resultsOpen = ref(false)
const mobileOpen = ref(false)
const activeIndex = ref(-1)
const desktopInput = ref<HTMLInputElement | null>(null)
const mobileInput = ref<HTMLInputElement | null>(null)
const desktopRoot = ref<HTMLElement | null>(null)
const mobilePanel = ref<HTMLElement | null>(null)
const mobileTrigger = ref<HTMLButtonElement | null>(null)
let previousOverflow = ''

const results = computed(() => {
  const needle = query.value.trim().toLocaleLowerCase()
  if (!needle) return []
  return entries.value
    .filter((entry) => `${entry.title} ${entry.text} ${entry.category ?? ''}`.toLocaleLowerCase().includes(needle))
    .slice(0, 8)
})

const hasQuery = computed(() => query.value.trim().length > 0)
const showPanel = computed(() => resultsOpen.value && hasQuery.value)
const liveMessage = computed(() => {
  if (!hasQuery.value) return ''
  if (loadState.value === 'error') return 'Search is unavailable.'
  const count = results.value.length
  return `${count} ${count === 1 ? 'result' : 'results'} found.`
})

watch(query, () => {
  resultsOpen.value = true
  activeIndex.value = results.value.length ? 0 : -1
})

watch(results, (value) => {
  if (!value.length) activeIndex.value = -1
  else if (activeIndex.value < 0 || activeIndex.value >= value.length) activeIndex.value = 0
})

function resultId(scope: 'desktop' | 'mobile', index: number) {
  return `docs-search-${scope}-result-${index}`
}

function onSearchKeydown(event: KeyboardEvent, scope: 'desktop' | 'mobile') {
  if (event.key === 'Escape') {
    event.preventDefault()
    if (scope === 'mobile') closeMobile()
    else resultsOpen.value = false
    return
  }
  if (!results.value.length) return
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    resultsOpen.value = true
    activeIndex.value = (activeIndex.value + 1) % results.value.length
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    resultsOpen.value = true
    activeIndex.value = (activeIndex.value - 1 + results.value.length) % results.value.length
  } else if (event.key === 'Enter' && activeIndex.value >= 0) {
    event.preventDefault()
    selectResult(results.value[activeIndex.value]!)
  }
}

function onMobilePanelKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    closeMobile()
    return
  }
  if (event.key !== 'Tab' || !mobilePanel.value) return
  const focusable = [...mobilePanel.value.querySelectorAll<HTMLElement>('input, a[href], button:not([disabled])')]
  const first = focusable[0]
  const last = focusable.at(-1)
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last?.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first?.focus()
  }
}

function selectResult(entry: SearchEntry) {
  window.location.hash = entry.path
  query.value = ''
  resultsOpen.value = false
  if (mobileOpen.value) closeMobile(false)
}

async function openMobile() {
  if (mobileOpen.value) {
    mobileInput.value?.focus()
    return
  }
  mobileOpen.value = true
  resultsOpen.value = hasQuery.value
  previousOverflow = document.documentElement.style.overflow
  document.documentElement.style.overflow = 'hidden'
  await nextTick()
  mobileInput.value?.focus()
}

function closeMobile(restoreFocus = true) {
  if (!mobileOpen.value) return
  mobileOpen.value = false
  resultsOpen.value = false
  document.documentElement.style.overflow = previousOverflow
  if (restoreFocus) void nextTick(() => mobileTrigger.value?.focus())
}

function onDocumentPointerdown(event: PointerEvent) {
  const target = event.target as Node
  if (mobileOpen.value) {
    if (!mobilePanel.value?.contains(target)) closeMobile()
    return
  }
  if (!desktopRoot.value?.contains(target)) resultsOpen.value = false
}

function onShortcut(event: KeyboardEvent) {
  if (!(event.ctrlKey || event.metaKey) || event.key.toLocaleLowerCase() !== 'k') return
  event.preventDefault()
  if (window.matchMedia('(max-width: 40rem)').matches) void openMobile()
  else {
    resultsOpen.value = hasQuery.value
    desktopInput.value?.focus()
  }
}

onMounted(async () => {
  document.addEventListener('pointerdown', onDocumentPointerdown)
  document.addEventListener('keydown', onShortcut)
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}search-index.json`)
    if (!response.ok) throw new Error(`Search index returned ${response.status}`)
    entries.value = await response.json() as SearchEntry[]
    loadState.value = 'ready'
  } catch {
    entries.value = []
    loadState.value = 'error'
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocumentPointerdown)
  document.removeEventListener('keydown', onShortcut)
  if (mobileOpen.value) document.documentElement.style.overflow = previousOverflow
})
</script>

<template>
  <div ref="desktopRoot" class="docs-search docs-search--desktop" role="search">
    <KvSearchIcon :size="17" aria-hidden="true" />
    <label class="kv-visually-hidden" for="docs-search-desktop">Search documentation</label>
    <input
      id="docs-search-desktop"
      ref="desktopInput"
      v-model="query"
      type="search"
      role="combobox"
      placeholder="Search documentation"
      autocomplete="off"
      aria-autocomplete="list"
      aria-controls="docs-search-desktop-results"
      :aria-expanded="showPanel"
      :aria-activedescendant="activeIndex >= 0 && showPanel ? resultId('desktop', activeIndex) : undefined"
      @focus="resultsOpen = hasQuery"
      @keydown="onSearchKeydown($event, 'desktop')"
    />
    <kbd>⌘K</kbd>
    <div v-if="showPanel" id="docs-search-desktop-results" class="docs-search__results" role="listbox" aria-label="Search results">
      <a
        v-for="(result, index) in results"
        :id="resultId('desktop', index)"
        :key="result.path"
        :href="`#${result.path}`"
        role="option"
        :aria-selected="activeIndex === index"
        @pointermove="activeIndex = index"
        @click.prevent="selectResult(result)"
      >
        <span class="docs-search__meta">{{ result.kind }}<template v-if="result.category"> / {{ result.category }}</template></span>
        <strong>{{ result.title }}</strong>
        <span>{{ result.text.slice(0, 96) }}</span>
      </a>
      <div v-if="loadState === 'error'" class="docs-search__state" role="alert"><strong>Search offline</strong><span>The index could not be loaded. Try navigating from the menu.</span></div>
      <div v-else-if="!results.length" class="docs-search__state"><strong>No results</strong><span>Try a component, category, or guide name.</span></div>
    </div>
  </div>

  <button ref="mobileTrigger" class="docs-search-trigger" type="button" aria-label="Search documentation" aria-haspopup="dialog" :aria-expanded="mobileOpen" @click="openMobile">
    <KvSearchIcon :size="19" aria-hidden="true" />
  </button>

  <Teleport to="body">
  <div v-if="mobileOpen" class="docs-mobile-search" @pointerdown.self="closeMobile()">
    <section ref="mobilePanel" class="docs-mobile-search__panel" role="dialog" aria-modal="true" aria-label="Search documentation" @keydown="onMobilePanelKeydown">
      <div class="docs-mobile-search__field">
        <KvSearchIcon :size="18" aria-hidden="true" />
        <label class="kv-visually-hidden" for="docs-search-mobile">Search documentation</label>
        <input
          id="docs-search-mobile"
          ref="mobileInput"
          v-model="query"
          type="search"
          role="combobox"
          placeholder="Search docs"
          autocomplete="off"
          aria-autocomplete="list"
          aria-controls="docs-search-mobile-results"
          :aria-expanded="showPanel"
          :aria-activedescendant="activeIndex >= 0 && showPanel ? resultId('mobile', activeIndex) : undefined"
          @focus="resultsOpen = hasQuery"
          @keydown="onSearchKeydown($event, 'mobile')"
        />
        <button type="button" aria-label="Close search" @click="closeMobile()">×</button>
      </div>
      <div v-if="showPanel" id="docs-search-mobile-results" class="docs-search__results docs-search__results--mobile" role="listbox" aria-label="Search results">
        <a
          v-for="(result, index) in results"
          :id="resultId('mobile', index)"
          :key="result.path"
          :href="`#${result.path}`"
          role="option"
          :aria-selected="activeIndex === index"
          @pointermove="activeIndex = index"
          @click.prevent="selectResult(result)"
        >
          <span class="docs-search__meta">{{ result.kind }}<template v-if="result.category"> / {{ result.category }}</template></span>
          <strong>{{ result.title }}</strong>
          <span>{{ result.text.slice(0, 96) }}</span>
        </a>
        <div v-if="loadState === 'error'" class="docs-search__state" role="alert"><strong>Search offline</strong><span>The index could not be loaded. Try navigating from the menu.</span></div>
        <div v-else-if="!results.length" class="docs-search__state"><strong>No results</strong><span>Try a component, category, or guide name.</span></div>
      </div>
    </section>
  </div>
  </Teleport>

  <span class="kv-visually-hidden" aria-live="polite" aria-atomic="true">{{ liveMessage }}</span>
</template>
