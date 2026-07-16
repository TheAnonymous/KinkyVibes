<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch, type ComponentPublicInstance } from 'vue'
import {
  KvBadge,
  KvButton,
  KvCard,
  KvCode,
  KvContainer,
  KvDrawer,
  KvHeading,
  KvProgress,
  KvProvider,
  KvSwitch,
  KvTabs,
  KvText,
  KvVisuallyHidden,
} from '@kinky-vibes/ui'
import { KvChevronLeftIcon, KvChevronRightIcon, KvMenuIcon } from '@kinky-vibes/ui/icons'
import ComponentPreview from './ComponentPreview'
import DocsNavigation from './DocsNavigation.vue'
import DocsPageRail from './DocsPageRail.vue'
import DocsSearch from './DocsSearch.vue'
import DocsSectionHeading from './DocsSectionHeading.vue'
import EditorialVisual from './EditorialVisual.vue'
import ShowcasePreview from './ShowcasePreview.vue'
import TokenExplorer from './TokenExplorer.vue'
import { categories, componentDocs, type ComponentDoc } from './catalog'
import { featureStories, pageVisuals, systemFieldImage } from './editorial'
import { heroImage, showcaseScenes } from './showcase'

const route = ref('/')
const routeSection = ref('')
const navOpen = ref(false)
const copied = ref(false)
const navTrigger = ref<HTMLButtonElement | null>(null)
const heroTab = ref('system')
const heroMonitoring = ref(true)
const heroProgress = ref(68)
const heroImpulse = ref(false)
const activeCategory = ref(categories[0] ?? '')
const activeSection = ref('')
const scrollProgress = ref(0)
const routeEpoch = ref(0)
const categorySections = new Map<string, HTMLElement>()
let categoryObserver: IntersectionObserver | undefined
let sectionObserver: IntersectionObserver | undefined
let heroImpulseTimer: number | undefined

const heroTabs = [
  { id: 'system', label: 'System' },
  { id: 'output', label: 'Output' },
]

const normalizeRoute = () => {
  const previousRoute = route.value
  const raw = window.location.hash.slice(1) || '/'
  const [path, search = ''] = raw.split('?')
  route.value = path || '/'
  routeSection.value = new URLSearchParams(search).get('section') ?? ''
  navOpen.value = false
  if (previousRoute !== route.value) {
    routeEpoch.value += 1
    window.scrollTo({ top: 0 })
  }
  document.title = pageTitle(route.value)
  void syncRequestedSection()
}

function updateScrollProgress() {
  const available = document.documentElement.scrollHeight - window.innerHeight
  scrollProgress.value = available > 0 ? Math.min(1, Math.max(0, window.scrollY / available)) : 0
  updateActiveSectionFromScroll()
}

onMounted(() => {
  normalizeRoute()
  window.addEventListener('hashchange', normalizeRoute)
  window.addEventListener('scroll', updateScrollProgress, { passive: true })
  updateScrollProgress()
})
onBeforeUnmount(() => {
  window.removeEventListener('hashchange', normalizeRoute)
  window.removeEventListener('scroll', updateScrollProgress)
  categoryObserver?.disconnect()
  sectionObserver?.disconnect()
  window.clearTimeout(heroImpulseTimer)
})

const currentComponent = computed(() => {
  const match = route.value.match(/^\/components\/(.+)$/)
  return match ? componentDocs.find((entry) => entry.slug === match[1]) : undefined
})

const currentComponentIndex = computed(() => currentComponent.value ? componentDocs.indexOf(currentComponent.value) : -1)
const previousComponent = computed(() => currentComponentIndex.value > 0 ? componentDocs[currentComponentIndex.value - 1] : undefined)
const nextComponent = computed(() => currentComponentIndex.value >= 0 ? componentDocs[currentComponentIndex.value + 1] : undefined)

interface PageSection {
  id: string
  label: string
}

const staticPageSections: Record<string, PageSection[]> = {
  '/installation': [
    { id: 'package', label: 'Package' },
    { id: 'imports', label: 'Named imports' },
    { id: 'plugin', label: 'Global plugin' },
  ],
  '/tokens': [{ id: 'explorer', label: 'Token explorer' }],
  '/guides/ssr': [
    { id: 'nuxt-plugin', label: 'Nuxt plugin' },
    { id: 'hydration', label: 'Hydration rules' },
  ],
  '/guides/customization': [
    { id: 'scoped-overrides', label: 'Scoped overrides' },
    { id: 'css-boundary', label: 'CSS boundary' },
  ],
  '/accessibility': [
    { id: 'manual-checklist', label: 'Manual checklist' },
    { id: 'scope-statement', label: 'Scope statement' },
  ],
}

const currentPageSections = computed<PageSection[]>(() => {
  if (currentComponent.value) {
    return [
      { id: 'preview', label: 'Preview' },
      { id: 'api', label: 'API' },
      ...(currentComponent.value.keyboard?.length ? [{ id: 'keyboard', label: 'Keyboard' }] : []),
    ]
  }
  return staticPageSections[route.value] ?? []
})
const railMetadata = computed(() => {
  if (currentComponent.value) {
    return [
      { label: 'Category', value: currentComponent.value.category },
      { label: 'Catalog', value: `${String(currentComponentIndex.value + 1).padStart(2, '0')} / ${componentDocs.length}` },
      { label: 'Props', value: String(currentComponent.value.props.length) },
      { label: 'Keyboard', value: currentComponent.value.keyboard?.length ? 'Supported' : 'Native / N.A.' },
    ]
  }
  const type = route.value === '/tokens' ? 'Reference' : route.value === '/installation' ? 'Start' : 'Guide'
  const index = Math.max(0, currentPageSections.value.findIndex((section) => section.id === activeSection.value))
  return [
    { label: 'Page type', value: type },
    { label: 'Section', value: `${index + 1} / ${currentPageSections.value.length}` },
    { label: 'Sections', value: String(currentPageSections.value.length) },
  ]
})

function updateActiveSectionFromScroll() {
  if (!currentPageSections.value.length) return
  const activationLine = window.innerWidth <= 800 ? 160 : 120
  const passed = currentPageSections.value.filter((section) => {
    const element = document.getElementById(section.id)
    return element ? element.getBoundingClientRect().top <= activationLine : false
  })
  activeSection.value = passed.at(-1)?.id ?? currentPageSections.value[0]?.id ?? ''
}

async function syncRequestedSection() {
  await nextTick()
  initializeSectionObserver()
  const requested = currentPageSections.value.find((section) => section.id === routeSection.value)
  if (!requested) {
    updateActiveSectionFromScroll()
    return
  }
  activeSection.value = requested.id
  window.requestAnimationFrame(() => {
    const element = document.getElementById(requested.id)
    if (!element) return
    const root = document.documentElement
    const previousBehavior = root.style.scrollBehavior
    root.style.scrollBehavior = 'auto'
    element.scrollIntoView({ block: 'start', behavior: 'auto' })
    activeSection.value = requested.id
    window.requestAnimationFrame(() => { root.style.scrollBehavior = previousBehavior })
  })
}

function initializeSectionObserver() {
  sectionObserver?.disconnect()
  if (!currentPageSections.value.length || !('IntersectionObserver' in window)) return
  sectionObserver = new IntersectionObserver(updateActiveSectionFromScroll, { rootMargin: '-64px 0px -55% 0px', threshold: [0, 0.1, 0.5] })
  currentPageSections.value.forEach((section) => {
    const element = document.getElementById(section.id)
    if (element) sectionObserver?.observe(element)
  })
}

const staticPageTitles: Record<string, string> = {
  '/': 'KinkyVibes UI — Industrial Vue components',
  '/installation': 'Installation — KinkyVibes UI',
  '/tokens': 'Token explorer — KinkyVibes UI',
  '/components': 'Components — KinkyVibes UI',
  '/guides/ssr': 'SSR & Nuxt — KinkyVibes UI',
  '/guides/customization': 'Customization — KinkyVibes UI',
  '/accessibility': 'Accessibility — KinkyVibes UI',
}

const isKnownRoute = computed(() => Boolean(staticPageTitles[route.value] || currentComponent.value))

function pageTitle(path: string) {
  const match = path.match(/^\/components\/(.+)$/)
  const component = match ? componentDocs.find((entry) => entry.slug === match[1]) : undefined
  return component ? `${component.name} — KinkyVibes UI` : (staticPageTitles[path] ?? 'Page not found — KinkyVibes UI')
}

function categoryCount(category: string) {
  return componentDocs.filter((entry) => entry.category === category).length
}

function categorySlug(category: string) {
  return category.toLocaleLowerCase().replace(/\s*&\s*/g, '-').replace(/\s+/g, '-')
}

function setCategorySection(category: string, element: Element | ComponentPublicInstance | null) {
  if (element instanceof HTMLElement) categorySections.set(category, element)
  else categorySections.delete(category)
}

function initializeCategoryObserver() {
  categoryObserver?.disconnect()
  if (route.value !== '/components' || !('IntersectionObserver' in window)) return
  categoryObserver = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio || a.boundingClientRect.top - b.boundingClientRect.top)
    const category = visible[0]?.target.getAttribute('data-category')
    if (category) activeCategory.value = category
  }, { rootMargin: '-80px 0px -55% 0px', threshold: [0, 0.1, 0.25, 0.5] })
  categorySections.forEach((element) => categoryObserver?.observe(element))
}

function scrollToCategory(category: string) {
  const section = categorySections.get(category)
  if (!section) return
  activeCategory.value = category
  const top = section.getBoundingClientRect().top + window.scrollY - 80
  const root = document.documentElement
  const previousBehavior = root.style.scrollBehavior
  root.style.scrollBehavior = 'auto'
  window.scrollTo({ top, behavior: 'auto' })
  window.requestAnimationFrame(() => { root.style.scrollBehavior = previousBehavior })
}

watch(route, async (path) => {
  categoryObserver?.disconnect()
  if (path !== '/components') return
  activeCategory.value = categories[0] ?? ''
  await nextTick()
  initializeCategoryObserver()
})

watch(activeCategory, async (category) => {
  await nextTick()
  document.querySelector<HTMLElement>(`[data-category-button="${categorySlug(category)}"]`)?.scrollIntoView({ block: 'nearest', inline: 'center' })
})

async function copyCode(code: string) {
  await navigator.clipboard.writeText(code)
  copied.value = true
  window.setTimeout(() => (copied.value = false), 1400)
}

function componentHref(component: ComponentDoc) {
  return `#/components/${component.slug}`
}

function goTo(path: string) {
  window.location.hash = path
}

function advanceSequence() {
  heroProgress.value = heroProgress.value >= 92 ? 32 : heroProgress.value + 8
  window.clearTimeout(heroImpulseTimer)
  heroImpulse.value = false
  window.requestAnimationFrame(() => {
    heroImpulse.value = true
    heroImpulseTimer = window.setTimeout(() => (heroImpulse.value = false), 360)
  })
}

</script>

<template>
  <KvProvider>
    <KvVisuallyHidden as="a" href="#main-content" focusable>Skip to content</KvVisuallyHidden>
    <div class="docs-shell">
      <div class="docs-scroll-progress" :style="{ transform: `scaleX(${scrollProgress})` }" aria-hidden="true"></div>
      <div :key="routeEpoch" class="docs-route-wipe" aria-hidden="true"></div>
      <header class="docs-topbar">
        <a class="docs-brand" href="#/" aria-label="KinkyVibes UI home">
          <span class="docs-brand__mark" aria-hidden="true">KV</span>
          <span>KinkyVibes <small>UI / 1.0</small></span>
        </a>
        <DocsSearch />
        <a class="docs-github" href="https://github.com/TheAnonymous/KinkyVibes" rel="noreferrer">GitHub</a>
        <button ref="navTrigger" class="docs-nav-toggle" type="button" :aria-expanded="navOpen" aria-label="Menu" @click="navOpen = true">
          <KvMenuIcon :size="20" aria-hidden="true" /><span>Menu</span>
        </button>
      </header>

      <aside class="docs-sidebar">
        <DocsNavigation :route="route" />
      </aside>

      <KvDrawer v-model:open="navOpen" title="Documentation" description="Navigate the KinkyVibes system." side="left" size="sm">
        <DocsNavigation :route="route" @navigate="navOpen = false" />
      </KvDrawer>

      <main id="main-content" class="docs-main" tabindex="-1" :data-route-section="routeSection" :data-active-section="activeSection">
        <template v-if="route === '/'">
          <section class="docs-hero">
            <div class="docs-hero__copy">
              <KvBadge status="error" dot>Vue 3.5+ / TypeScript</KvBadge>
              <h1>
                <span class="docs-hero__word">Pressure.</span>
                <span class="docs-hero__word docs-hero__word--signal">Structure.</span>
                <span class="docs-hero__word">Signal.</span>
              </h1>
              <KvText size="lg" tone="muted">A single-theme Vue framework forged for dense, deliberate interfaces. No runtime UI dependencies. No decorative compromise.</KvText>
              <div class="docs-hero__actions">
                <KvButton @click="goTo('/installation')">Install package</KvButton>
                <a class="docs-secondary-link" href="#/components">Explore 44 components →</a>
              </div>
            </div>
            <div class="docs-hero__visual">
              <img
                class="docs-showcase-image docs-hero__image"
                data-showcase-image="hero"
                :src="heroImage.src"
                :srcset="heroImage.srcset"
                sizes="(max-width: 64rem) 100vw, 46vw"
                :width="heroImage.width"
                :height="heroImage.height"
                alt=""
                loading="eager"
                decoding="async"
                fetchpriority="high"
              />
              <span class="docs-image-coordinate" aria-hidden="true">FIELD / 59.91N · 10.75E</span>
              <KvCard class="docs-hero__control" :class="{ 'is-advanced': heroImpulse }" padding="sm">
                <template #header>
                  <div class="docs-control-header">
                    <span>Live control</span>
                    <KvBadge status="success" dot>Online</KvBadge>
                  </div>
                </template>
                <KvTabs v-model="heroTab" :items="heroTabs" label="Hero control channels">
                  <template #default="{ item }">
                    <div class="docs-control-panel">
                      <span>{{ item.label }} channel / AX-17</span>
                      <KvProgress :value="heroProgress" label="Sequence pressure" show-value />
                      <div class="docs-control-panel__actions">
                        <KvSwitch v-model="heroMonitoring" label="Monitoring" />
                        <KvButton size="sm" @click="advanceSequence">Advance</KvButton>
                      </div>
                    </div>
                  </template>
                </KvTabs>
              </KvCard>
            </div>
          </section>
          <section class="docs-stats" aria-label="Package characteristics">
            <div><strong>00</strong><span>UI runtime dependencies</span></div>
            <div><strong>44</strong><span>Public components</span></div>
            <div><strong>03</strong><span>SSR smoke layers</span></div>
            <div><strong>01</strong><span>Dark theme</span></div>
          </section>
          <figure class="docs-system-field">
            <img
              class="docs-showcase-image docs-system-field__image"
              data-editorial-image="system-field"
              :src="systemFieldImage.src"
              :srcset="systemFieldImage.srcset"
              sizes="(max-width: 64rem) 100vw, calc(100vw - 17.5rem)"
              :width="systemFieldImage.width"
              :height="systemFieldImage.height"
              alt=""
              loading="lazy"
              decoding="async"
            />
            <figcaption><span>Field / 00 · 59.91N</span><strong>One system. Every layer.</strong></figcaption>
          </figure>
          <KvContainer size="md">
            <section class="docs-section">
              <KvHeading eyebrow="System / 01">Built as infrastructure</KvHeading>
              <div class="docs-feature-grid">
                <article v-for="feature in featureStories" :key="feature.code">
                  <img
                    class="docs-showcase-image docs-feature-image"
                    :data-editorial-image="feature.slug"
                    :src="feature.image.src"
                    :srcset="feature.image.srcset"
                    sizes="(max-width: 64rem) calc(100vw - 3rem), 16rem"
                    :width="feature.image.width"
                    :height="feature.image.height"
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                  <div class="docs-feature-grid__body"><span>{{ feature.code }}</span><h3>{{ feature.title }}</h3><p>{{ feature.description }}</p></div>
                </article>
              </div>
            </section>
          </KvContainer>
        </template>

        <KvContainer v-else-if="route === '/installation'" size="md">
          <div class="docs-content-layout">
          <article class="docs-article docs-reveal-group">
            <KvHeading :level="1" eyebrow="Start / 01">Installation</KvHeading>
            <KvText size="lg" tone="muted">Vue is the only peer. Import the complete dark theme once at the application boundary.</KvText>
            <EditorialVisual :image="pageVisuals.installation" marker="page-installation" label="Module / load path" />
            <DocsSectionHeading id="package" title="Package" :route="route" />
            <KvCode block>npm install @kinky-vibes/ui vue</KvCode>
            <DocsSectionHeading id="imports" title="Named imports" :route="route" />
            <KvCode block>import { KvButton, KvField, KvInput } from '@kinky-vibes/ui'
import '@kinky-vibes/ui/styles.css'</KvCode>
            <DocsSectionHeading id="plugin" title="Global plugin" :route="route" />
            <KvCode block>import { createApp } from 'vue'
import { KinkyVibes } from '@kinky-vibes/ui'
import '@kinky-vibes/ui/styles.css'

createApp(App).use(KinkyVibes).mount('#app')</KvCode>
            <div class="docs-callout"><strong>Tree shaking</strong><p>Prefer named imports. The optional plugin intentionally references every component for global registration.</p></div>
          </article>
          <DocsPageRail :route="route" :active-section="activeSection" :sections="currentPageSections" :metadata="railMetadata" @navigate="activeSection = $event" />
          </div>
        </KvContainer>

        <KvContainer v-else-if="route === '/tokens'" size="md">
          <div class="docs-content-layout">
          <article class="docs-article docs-reveal-group">
            <KvHeading :level="1" eyebrow="Theme / 01">Token explorer</KvHeading>
            <KvText size="lg" tone="muted">Every supported theme boundary uses the --kv-* namespace. Import tokens.css alone when the default component styling is not required.</KvText>
            <EditorialVisual :image="pageVisuals.tokens" marker="page-tokens" label="Material / token matrix" />
            <TokenExplorer />
          </article>
          <DocsPageRail :route="route" :active-section="activeSection" :sections="currentPageSections" :metadata="railMetadata" @navigate="activeSection = $event" />
          </div>
        </KvContainer>

        <KvContainer v-else-if="route === '/components'" size="lg">
          <article class="docs-article docs-showcase-page">
            <KvHeading :level="1" eyebrow="Reference / 44">Components</KvHeading>
            <KvText size="lg" tone="muted">Neutral primitives for application structure, input, navigation, disclosure, overlays, and feedback.</KvText>
            <nav class="docs-category-nav" aria-label="Component categories">
              <button
                v-for="category in categories"
                :key="category"
                type="button"
                :data-category-button="categorySlug(category)"
                :aria-current="activeCategory === category ? 'true' : undefined"
                @click="scrollToCategory(category)"
              ><span>{{ category }}</span><small>{{ categoryCount(category) }}</small></button>
            </nav>
            <section
              v-for="scene in showcaseScenes"
              :key="scene.category"
              :ref="(element) => setCategorySection(scene.category, element)"
              class="docs-component-section"
              :data-showcase-scene="scene.slug"
              :data-category="scene.category"
            >
              <div class="docs-component-section__heading">
                <h2>{{ scene.category }} <small>{{ categoryCount(scene.category) }} components</small></h2>
                <p><span>{{ scene.index }}</span>{{ scene.description }}</p>
              </div>
              <div class="docs-category-scene">
                <img
                  class="docs-showcase-image docs-category-scene__image"
                  :data-showcase-image="scene.slug"
                  :src="scene.image.src"
                  :srcset="scene.image.srcset"
                  sizes="(max-width: 64rem) 100vw, 60rem"
                  :width="scene.image.width"
                  :height="scene.image.height"
                  alt=""
                  :loading="scene.category === categories[0] ? 'eager' : 'lazy'"
                  decoding="async"
                />
                <span class="docs-image-coordinate" aria-hidden="true">{{ scene.index }} / 59.91N · 10.75E</span>
                <div class="docs-category-scene__preview">
                  <div class="docs-demo-label"><span>Live example</span><span>{{ scene.preview }}</span></div>
                  <div class="docs-category-scene__control">
                    <ShowcasePreview :component="scene.preview" />
                  </div>
                </div>
              </div>
              <div class="docs-component-grid">
                <a v-for="component in componentDocs.filter((entry) => entry.category === scene.category)" :key="component.name" :href="componentHref(component)">
                  <span class="docs-component-grid__index">{{ String(componentDocs.indexOf(component) + 1).padStart(2, '0') }}</span>
                  <strong>{{ component.name }}</strong><span>{{ component.description }}</span><span class="docs-component-grid__action">View reference <KvChevronRightIcon :size="15" aria-hidden="true" /></span>
                </a>
              </div>
            </section>
          </article>
        </KvContainer>

        <KvContainer v-else-if="currentComponent" size="md">
          <div class="docs-content-layout">
          <article class="docs-article docs-reveal-group">
            <nav class="docs-breadcrumb" aria-label="Breadcrumb"><a href="#/components">Components</a><span aria-hidden="true">/</span><span>{{ currentComponent.category }}</span><span aria-hidden="true">/</span><span aria-current="page">{{ currentComponent.name }}</span></nav>
            <KvHeading :level="1" :eyebrow="currentComponent.category">{{ currentComponent.name }}</KvHeading>
            <KvText size="lg" tone="muted">{{ currentComponent.description }}</KvText>
            <section class="docs-demo-section">
              <DocsSectionHeading id="preview" title="Preview" :route="route" />
              <div class="docs-demo-label"><span>Live example</span><span>Interactive</span></div>
              <div class="docs-demo"><ComponentPreview :name="currentComponent.name" /></div>
              <div class="docs-code-wrap">
                <KvCode block>{{ currentComponent.code }}</KvCode>
                <button type="button" @click="copyCode(currentComponent.code)">{{ copied ? 'Copied' : 'Copy' }}</button>
              </div>
            </section>
            <section>
              <DocsSectionHeading id="api" title="API" :route="route" />
              <div class="docs-api-wrap">
                <table class="docs-api-table">
                  <thead><tr><th>Prop</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
                  <tbody>
                    <tr v-for="prop in currentComponent.props" :key="prop.name"><td><code>{{ prop.name }}</code></td><td><code>{{ prop.type }}</code></td><td>{{ prop.default ?? '—' }}</td><td>{{ prop.description }}</td></tr>
                    <tr v-if="!currentComponent.props.length"><td colspan="4">This primitive is primarily slot-driven.</td></tr>
                  </tbody>
                </table>
              </div>
            </section>
            <section v-if="currentComponent.keyboard?.length">
              <DocsSectionHeading id="keyboard" title="Keyboard" :route="route" />
              <ul class="docs-keyboard"><li v-for="item in currentComponent.keyboard" :key="item">{{ item }}</li></ul>
            </section>
            <nav class="docs-component-pagination" aria-label="Adjacent components">
              <a v-if="previousComponent" :href="componentHref(previousComponent)"><KvChevronLeftIcon :size="18" aria-hidden="true" /><span><small>Previous component</small><strong>{{ previousComponent.name }}</strong></span></a>
              <span v-else aria-hidden="true"></span>
              <a v-if="nextComponent" :href="componentHref(nextComponent)"><span><small>Next component</small><strong>{{ nextComponent.name }}</strong></span><KvChevronRightIcon :size="18" aria-hidden="true" /></a>
            </nav>
          </article>
          <DocsPageRail :route="route" :active-section="activeSection" :sections="currentPageSections" :metadata="railMetadata" @navigate="activeSection = $event" />
          </div>
        </KvContainer>

        <KvContainer v-else-if="route === '/guides/ssr'" size="md">
          <div class="docs-content-layout">
          <article class="docs-article docs-reveal-group">
            <KvHeading :level="1" eyebrow="Guide / SSR">Vue SSR & Nuxt</KvHeading>
            <KvText size="lg" tone="muted">All modules can be imported without a DOM. IDs use Vue’s hydration-aware useId, and browser observers attach only after mount.</KvText>
            <EditorialVisual :image="pageVisuals.ssr" marker="page-ssr" label="Boundary / aligned output" />
            <DocsSectionHeading id="nuxt-plugin" title="Nuxt plugin" :route="route" />
            <KvCode block>// plugins/kinky-vibes.ts
import { KinkyVibes } from '@kinky-vibes/ui'
import '@kinky-vibes/ui/styles.css'

export default defineNuxtPlugin((nuxtApp) =&gt; {
  nuxtApp.vueApp.use(KinkyVibes)
})</KvCode>
            <DocsSectionHeading id="hydration" title="Hydration rules" :route="route" />
            <ul><li>Keep controlled values identical on server and first client render.</li><li>Do not derive defaultOpen from viewport state.</li><li>Teleport targets must exist before the component mounts.</li></ul>
            <div class="docs-callout"><strong>Verified paths</strong><p>The repository renders representative components with Vue renderToString, builds a Nuxt fixture, and installs the packed tarball into isolated Vue and Nuxt consumers.</p></div>
          </article>
          <DocsPageRail :route="route" :active-section="activeSection" :sections="currentPageSections" :metadata="railMetadata" @navigate="activeSection = $event" />
          </div>
        </KvContainer>

        <KvContainer v-else-if="route === '/guides/customization'" size="md">
          <div class="docs-content-layout">
          <article class="docs-article docs-reveal-group">
            <KvHeading :level="1" eyebrow="Guide / Theme">Customization</KvHeading>
            <KvText size="lg" tone="muted">KinkyVibes remains a single dark theme. Customize emphasis and rhythm by overriding tokens rather than branching into theme modes.</KvText>
            <EditorialVisual :image="pageVisuals.customization" marker="page-customization" label="Surface / controlled override" />
            <DocsSectionHeading id="scoped-overrides" title="Scoped overrides" :route="route" />
            <KvCode block>&lt;KvProvider :tokens="{
  '--kv-color-signal': '#ff4d00',
  '--kv-space-4': '1.125rem'
}"&gt;
  &lt;App /&gt;
&lt;/KvProvider&gt;</KvCode>
            <DocsSectionHeading id="css-boundary" title="CSS boundary" :route="route" />
            <KvCode block>.operations-panel {
  --kv-color-surface: #121416;
  --kv-shadow-hard: 6px 6px 0 #000;
}</KvCode>
            <p>Stable kv-* classes are available for narrow integration adjustments. Token overrides are less coupled and should be the default.</p>
          </article>
          <DocsPageRail :route="route" :active-section="activeSection" :sections="currentPageSections" :metadata="railMetadata" @navigate="activeSection = $event" />
          </div>
        </KvContainer>

        <KvContainer v-else-if="route === '/accessibility'" size="md">
          <div class="docs-content-layout">
          <article class="docs-article docs-reveal-group">
            <KvHeading :level="1" eyebrow="Quality / A11Y">Accessibility</KvHeading>
            <KvText size="lg" tone="muted">Semantics, keyboard behavior, focus visibility, reduced motion, and live regions are tested as engineering requirements.</KvText>
            <EditorialVisual :image="pageVisuals.accessibility" marker="page-accessibility" label="Control / differentiated state" />
            <DocsSectionHeading id="manual-checklist" title="Manual checklist" :route="route" />
            <ul class="docs-checklist"><li>Complete every interactive example with keyboard only.</li><li>Confirm focus remains visible against all surfaces.</li><li>Verify dialog focus enters, cycles, and returns to the trigger.</li><li>Review labels, descriptions, errors, and live updates in NVDA, VoiceOver, or Orca.</li><li>Zoom to 200% at 375px and confirm no two-dimensional page overflow.</li><li>Enable reduced motion and verify non-essential transitions collapse.</li></ul>
            <DocsSectionHeading id="scope-statement" title="Scope statement" :route="route" />
            <div class="docs-callout"><strong>Automated checks</strong><p>Automated axe checks on representative pages must report no critical violations. This evidence is best effort and is not a formal WCAG conformance declaration.</p></div>
          </article>
          <DocsPageRail :route="route" :active-section="activeSection" :sections="currentPageSections" :metadata="railMetadata" @navigate="activeSection = $event" />
          </div>
        </KvContainer>

        <KvContainer v-else size="sm">
          <article class="docs-not-found"><strong>404</strong><KvHeading>Route not found</KvHeading><a href="#/">Return to introduction</a></article>
        </KvContainer>

        <section v-if="isKnownRoute" class="docs-end-cta" aria-labelledby="docs-end-cta-title">
          <span>System / ready</span>
          <div><h2 id="docs-end-cta-title">Build with pressure.</h2><p>Install the package or inspect every production-ready primitive.</p></div>
          <div class="docs-end-cta__actions"><a href="#/installation">Install UI</a><a href="#/components">Browse components</a></div>
        </section>
        <footer class="docs-footer">
          <span>@kinky-vibes/ui v1.0.0</span>
          <span>Released under the <a href="https://github.com/TheAnonymous/KinkyVibes/blob/main/LICENSE" rel="noreferrer">MIT License</a></span>
          <a href="https://github.com/TheAnonymous/KinkyVibes" rel="noreferrer">GitHub ↗</a>
        </footer>
      </main>
    </div>
  </KvProvider>
</template>
