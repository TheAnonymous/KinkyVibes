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

const quickTargets: SearchEntry[] = [
  { title: 'Components', path: '/components', text: 'Browse all 44 production primitives', kind: 'page', category: 'Reference' },
  { title: 'Installation', path: '/installation', text: 'Install the package and import styles', kind: 'page', category: 'Start' },
  { title: 'Token explorer', path: '/tokens', text: 'Search every exported CSS variable', kind: 'page', category: 'Theme' },
  { title: 'Accessibility', path: '/accessibility', text: 'Keyboard, focus, live regions, and reduced motion', kind: 'page', category: 'Quality' },
  { title: 'KvButton', path: '/components/button', text: 'Primary action states and variants', kind: 'component', category: 'Actions' },
]

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

const hasQuery = computed(() => query.value.trim().length > 0)
const results = computed(() => {
  const needle = query.value.trim().toLocaleLowerCase()
  if (!needle || loadState.value !== 'ready') return []
  const words = needle.split(/\s+/).filter(Boolean)
  return entries.value
    .map((entry) => {
      const title = entry.title.toLocaleLowerCase()
      const category = (entry.category ?? '').toLocaleLowerCase()
      const haystack = `${title} ${category} ${entry.text.toLocaleLowerCase()}`
      if (!words.every((word) => haystack.includes(word))) return null
      let score = 0
      if (title === needle) score += 100
      if (title.startsWith(needle)) score += 60
      if (title.includes(needle)) score += 35
      if (category === needle) score += 20
      score += words.filter((word) => title.includes(word)).length * 12
      score += entry.kind === 'component' ? 4 : 0
      return { entry, score }
    })
    .filter((result): result is { entry: SearchEntry; score: number } => Boolean(result))
    .sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title))
    .slice(0, 8)
    .map((result) => result.entry)
})
const panelEntries = computed(() => hasQuery.value ? results.value : quickTargets)
const showPanel = computed(() => resultsOpen.value)
const liveMessage = computed(() => {
  if (!resultsOpen.value) return ''
  if (!hasQuery.value) return `${quickTargets.length} quick destinations available.`
  if (loadState.value === 'error') return 'Search is unavailable. Retry loading the index.'
  if (loadState.value === 'loading') return 'Loading search index.'
  const count = results.value.length
  return `${count} ${count === 1 ? 'result' : 'results'} found.`
})

watch(query, () => {
  resultsOpen.value = true
  activeIndex.value = panelEntries.value.length ? 0 : -1
})
watch(panelEntries, (value) => {
  if (!value.length) activeIndex.value = -1
  else if (activeIndex.value < 0 || activeIndex.value >= value.length) activeIndex.value = 0
})

function highlightParts(value: string) {
  const needle = query.value.trim()
  if (!needle) return [{ text: value, match: false }]
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const expression = new RegExp(`(${escaped})`, 'ig')
  return value.split(expression).filter(Boolean).map((text) => ({ text, match: text.toLocaleLowerCase() === needle.toLocaleLowerCase() }))
}

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
  if (!panelEntries.value.length) return
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    resultsOpen.value = true
    activeIndex.value = (activeIndex.value + 1) % panelEntries.value.length
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    resultsOpen.value = true
    activeIndex.value = (activeIndex.value - 1 + panelEntries.value.length) % panelEntries.value.length
  } else if (event.key === 'Home') {
    event.preventDefault()
    activeIndex.value = 0
  } else if (event.key === 'End') {
    event.preventDefault()
    activeIndex.value = panelEntries.value.length - 1
  } else if (event.key === 'Enter' && activeIndex.value >= 0) {
    event.preventDefault()
    selectResult(panelEntries.value[activeIndex.value]!)
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
  resultsOpen.value = true
  activeIndex.value = panelEntries.value.length ? 0 : -1
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
    resultsOpen.value = true
    activeIndex.value = panelEntries.value.length ? 0 : -1
    desktopInput.value?.focus()
  }
}

async function loadIndex() {
  loadState.value = 'loading'
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}search-index.json`, { cache: 'no-store' })
    if (!response.ok) throw new Error(`Search index returned ${response.status}`)
    entries.value = await response.json() as SearchEntry[]
    loadState.value = 'ready'
  } catch {
    entries.value = []
    loadState.value = 'error'
  }
}

onMounted(() => {
  document.addEventListener('pointerdown', onDocumentPointerdown)
  document.addEventListener('keydown', onShortcut)
  void loadIndex()
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
      @focus="resultsOpen = true; activeIndex = panelEntries.length ? 0 : -1"
      @keydown="onSearchKeydown($event, 'desktop')"
    />
    <kbd>⌘K</kbd>
    <div v-if="showPanel" class="docs-search__results">
      <div id="docs-search-desktop-results" role="listbox" aria-label="Search results">
        <a
          v-for="(result, index) in panelEntries"
          :id="resultId('desktop', index)"
          :key="result.path"
          :href="`#${result.path}`"
          role="option"
          :aria-selected="activeIndex === index"
          @pointermove="activeIndex = index"
          @click.prevent="selectResult(result)"
        >
          <span class="docs-search__meta">{{ result.kind }}<template v-if="result.category"> / {{ result.category }}</template></span>
          <strong><template v-for="(part, partIndex) in highlightParts(result.title)" :key="partIndex"><mark v-if="part.match">{{ part.text }}</mark><template v-else>{{ part.text }}</template></template></strong>
          <span><template v-for="(part, partIndex) in highlightParts(result.text.slice(0, 110))" :key="partIndex"><mark v-if="part.match">{{ part.text }}</mark><template v-else>{{ part.text }}</template></template></span>
        </a>
      </div>
      <div v-if="loadState === 'error'" class="docs-search__state" role="alert"><strong>Search offline</strong><span>The index could not be loaded.</span><button type="button" @click="loadIndex">Retry search</button></div>
      <div v-else-if="hasQuery && loadState === 'ready' && !results.length" class="docs-search__state" role="status"><strong>No results</strong><span>Try a component, category, or guide name.</span></div>
      <div v-else-if="hasQuery && loadState === 'loading'" class="docs-search__state" role="status"><strong>Loading search</strong><span>Preparing the local index.</span></div>
      <div v-else-if="!hasQuery" class="docs-search__hint"><span>Quick destinations</span><span>↑↓ move · Enter open</span></div>
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
            @focus="resultsOpen = true"
            @keydown="onSearchKeydown($event, 'mobile')"
          />
          <button type="button" aria-label="Close search" @click="closeMobile()">×</button>
        </div>
        <div v-if="showPanel" class="docs-search__results docs-search__results--mobile">
          <div id="docs-search-mobile-results" role="listbox" aria-label="Search results">
            <a
              v-for="(result, index) in panelEntries"
              :id="resultId('mobile', index)"
              :key="result.path"
              :href="`#${result.path}`"
              role="option"
              :aria-selected="activeIndex === index"
              @pointermove="activeIndex = index"
              @click.prevent="selectResult(result)"
            >
              <span class="docs-search__meta">{{ result.kind }}<template v-if="result.category"> / {{ result.category }}</template></span>
              <strong><template v-for="(part, partIndex) in highlightParts(result.title)" :key="partIndex"><mark v-if="part.match">{{ part.text }}</mark><template v-else>{{ part.text }}</template></template></strong>
              <span>{{ result.text.slice(0, 110) }}</span>
            </a>
          </div>
          <div v-if="loadState === 'error'" class="docs-search__state" role="alert"><strong>Search offline</strong><span>The index could not be loaded.</span><button type="button" @click="loadIndex">Retry search</button></div>
          <div v-else-if="hasQuery && loadState === 'ready' && !results.length" class="docs-search__state" role="status"><strong>No results</strong><span>Try a component, category, or guide name.</span></div>
          <div v-else-if="hasQuery && loadState === 'loading'" class="docs-search__state" role="status"><strong>Loading search</strong><span>Preparing the local index.</span></div>
          <div v-else-if="!hasQuery" class="docs-search__hint"><span>Quick destinations</span><span>↑↓ move · Enter open</span></div>
        </div>
      </section>
    </div>
  </Teleport>

  <span class="kv-visually-hidden" aria-live="polite" aria-atomic="true">{{ liveMessage }}</span>
</template>
