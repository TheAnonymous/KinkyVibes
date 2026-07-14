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
import DocsSearch from './DocsSearch.vue'
import EditorialVisual from './EditorialVisual.vue'
import ShowcasePreview from './ShowcasePreview.vue'
import { categories, componentDocs, type ComponentDoc } from './catalog'
import { featureStories, pageVisuals, systemFieldImage } from './editorial'
import { heroImage, showcaseScenes } from './showcase'

const route = ref('/')
const navOpen = ref(false)
const copied = ref(false)
const navTrigger = ref<HTMLButtonElement | null>(null)
const heroTab = ref('system')
const heroMonitoring = ref(true)
const heroProgress = ref(68)
const activeCategory = ref(categories[0] ?? '')
const categorySections = new Map<string, HTMLElement>()
let categoryObserver: IntersectionObserver | undefined

const heroTabs = [
  { id: 'system', label: 'System' },
  { id: 'output', label: 'Output' },
]

const normalizeRoute = () => {
  route.value = window.location.hash.slice(1) || '/'
  navOpen.value = false
  window.scrollTo({ top: 0 })
  document.title = pageTitle(route.value)
}

onMounted(() => {
  normalizeRoute()
  window.addEventListener('hashchange', normalizeRoute)
})
onBeforeUnmount(() => {
  window.removeEventListener('hashchange', normalizeRoute)
  categoryObserver?.disconnect()
})

const currentComponent = computed(() => {
  const match = route.value.match(/^\/components\/(.+)$/)
  return match ? componentDocs.find((entry) => entry.slug === match[1]) : undefined
})

const currentComponentIndex = computed(() => currentComponent.value ? componentDocs.indexOf(currentComponent.value) : -1)
const previousComponent = computed(() => currentComponentIndex.value > 0 ? componentDocs[currentComponentIndex.value - 1] : undefined)
const nextComponent = computed(() => currentComponentIndex.value >= 0 ? componentDocs[currentComponentIndex.value + 1] : undefined)

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
  }, { rootMargin: '-5rem 0px -55% 0px', threshold: [0, 0.1, 0.25, 0.5] })
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

const tokens = [
  ['--kv-color-bg', '#0d0d0e', 'Root background'],
  ['--kv-color-surface', '#151516', 'Asphalt surface'],
  ['--kv-color-surface-raised', '#1c1c1e', 'Raised steel surface'],
  ['--kv-color-text', '#e9e4d8', 'Bone text'],
  ['--kv-color-text-muted', '#a29e96', 'Muted text'],
  ['--kv-color-signal', '#e22832', 'Primary signal'],
  ['--kv-color-focus', '#f0cf63', 'Keyboard focus'],
  ['--kv-space-2', '0.5rem', 'Compact gap'],
  ['--kv-space-4', '1rem', 'Standard gap'],
  ['--kv-space-6', '2rem', 'Section gap'],
  ['--kv-radius-sm', '1px', 'Control corner'],
  ['--kv-shadow-hard', '4px 4px 0 #000', 'Mechanical shadow'],
]

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
}

function restoreNavigationFocus() {
  window.setTimeout(() => navTrigger.value?.focus(), 0)
}
</script>

<template>
  <KvProvider>
    <KvVisuallyHidden as="a" href="#main-content" focusable>Skip to content</KvVisuallyHidden>
    <div class="docs-shell">
      <header class="docs-topbar">
        <a class="docs-brand" href="#/" aria-label="KinkyVibes UI home">
          <span class="docs-brand__mark" aria-hidden="true">KV</span>
          <span>KinkyVibes <small>UI / 0.1</small></span>
        </a>
        <DocsSearch />
        <a class="docs-github" href="https://github.com/kinky-vibes/kinky-vibes" rel="noreferrer">GitHub</a>
        <button ref="navTrigger" class="docs-nav-toggle" type="button" :aria-expanded="navOpen" aria-label="Menu" @click="navOpen = true">
          <KvMenuIcon :size="20" aria-hidden="true" /><span>Menu</span>
        </button>
      </header>

      <aside class="docs-sidebar">
        <DocsNavigation :route="route" />
      </aside>

      <KvDrawer v-model:open="navOpen" title="Documentation" description="Navigate the KinkyVibes system." side="left" size="sm" @close="restoreNavigationFocus">
        <DocsNavigation :route="route" @navigate="navOpen = false" />
      </KvDrawer>

      <main id="main-content" class="docs-main" tabindex="-1">
        <template v-if="route === '/'">
          <section class="docs-hero">
            <div class="docs-hero__copy">
              <KvBadge status="error" dot>Vue 3.5+ / TypeScript</KvBadge>
              <h1>Pressure.<br /><span>Structure.</span><br />Signal.</h1>
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
              <KvCard class="docs-hero__control" padding="sm">
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
            <figcaption><span>Field / 00</span><strong>One system. Every layer.</strong></figcaption>
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
          <article class="docs-article">
            <KvHeading :level="1" eyebrow="Start / 01">Installation</KvHeading>
            <KvText size="lg" tone="muted">Vue is the only peer. Import the complete dark theme once at the application boundary.</KvText>
            <EditorialVisual :image="pageVisuals.installation" marker="page-installation" label="Module / load path" />
            <h2>Package</h2>
            <KvCode block>npm install @kinky-vibes/ui vue</KvCode>
            <h2>Named imports</h2>
            <KvCode block>import { KvButton, KvField, KvInput } from '@kinky-vibes/ui'
import '@kinky-vibes/ui/styles.css'</KvCode>
            <h2>Global plugin</h2>
            <KvCode block>import { createApp } from 'vue'
import { KinkyVibes } from '@kinky-vibes/ui'
import '@kinky-vibes/ui/styles.css'

createApp(App).use(KinkyVibes).mount('#app')</KvCode>
            <div class="docs-callout"><strong>Tree shaking</strong><p>Prefer named imports. The optional plugin intentionally references every component for global registration.</p></div>
          </article>
        </KvContainer>

        <KvContainer v-else-if="route === '/tokens'" size="md">
          <article class="docs-article">
            <KvHeading :level="1" eyebrow="Theme / 01">Token explorer</KvHeading>
            <KvText size="lg" tone="muted">Every supported theme boundary uses the --kv-* namespace. Import tokens.css alone when the default component styling is not required.</KvText>
            <EditorialVisual :image="pageVisuals.tokens" marker="page-tokens" label="Material / token matrix" />
            <div class="docs-token-grid">
              <div v-for="token in tokens" :key="token[0]" class="docs-token">
                <span class="docs-token__swatch" :style="{ background: token[1] }"></span>
                <code>{{ token[0] }}</code><strong>{{ token[1] }}</strong><small>{{ token[2] }}</small>
              </div>
            </div>
          </article>
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
                  loading="lazy"
                  decoding="async"
                />
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
          <article class="docs-article">
            <nav class="docs-breadcrumb" aria-label="Breadcrumb"><a href="#/components">Components</a><span aria-hidden="true">/</span><span>{{ currentComponent.category }}</span><span aria-hidden="true">/</span><span aria-current="page">{{ currentComponent.name }}</span></nav>
            <KvHeading :level="1" :eyebrow="currentComponent.category">{{ currentComponent.name }}</KvHeading>
            <KvText size="lg" tone="muted">{{ currentComponent.description }}</KvText>
            <section class="docs-demo-section">
              <div class="docs-demo-label"><span>Live example</span><span>Interactive</span></div>
              <div class="docs-demo"><ComponentPreview :name="currentComponent.name" /></div>
              <div class="docs-code-wrap">
                <KvCode block>{{ currentComponent.code }}</KvCode>
                <button type="button" @click="copyCode(currentComponent.code)">{{ copied ? 'Copied' : 'Copy' }}</button>
              </div>
            </section>
            <section>
              <h2>API</h2>
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
              <h2>Keyboard</h2>
              <ul class="docs-keyboard"><li v-for="item in currentComponent.keyboard" :key="item">{{ item }}</li></ul>
            </section>
            <nav class="docs-component-pagination" aria-label="Adjacent components">
              <a v-if="previousComponent" :href="componentHref(previousComponent)"><KvChevronLeftIcon :size="18" aria-hidden="true" /><span><small>Previous component</small><strong>{{ previousComponent.name }}</strong></span></a>
              <span v-else aria-hidden="true"></span>
              <a v-if="nextComponent" :href="componentHref(nextComponent)"><span><small>Next component</small><strong>{{ nextComponent.name }}</strong></span><KvChevronRightIcon :size="18" aria-hidden="true" /></a>
            </nav>
          </article>
        </KvContainer>

        <KvContainer v-else-if="route === '/guides/ssr'" size="md">
          <article class="docs-article">
            <KvHeading :level="1" eyebrow="Guide / SSR">Vue SSR & Nuxt</KvHeading>
            <KvText size="lg" tone="muted">All modules can be imported without a DOM. IDs use Vue’s hydration-aware useId, and browser observers attach only after mount.</KvText>
            <EditorialVisual :image="pageVisuals.ssr" marker="page-ssr" label="Boundary / aligned output" />
            <h2>Nuxt plugin</h2>
            <KvCode block>// plugins/kinky-vibes.ts
import { KinkyVibes } from '@kinky-vibes/ui'
import '@kinky-vibes/ui/styles.css'

export default defineNuxtPlugin((nuxtApp) =&gt; {
  nuxtApp.vueApp.use(KinkyVibes)
})</KvCode>
            <h2>Hydration rules</h2>
            <ul><li>Keep controlled values identical on server and first client render.</li><li>Do not derive defaultOpen from viewport state.</li><li>Teleport targets must exist before the component mounts.</li></ul>
            <div class="docs-callout"><strong>Verified paths</strong><p>The repository renders representative components with Vue renderToString, builds a Nuxt fixture, and installs the packed tarball into isolated Vue and Nuxt consumers.</p></div>
          </article>
        </KvContainer>

        <KvContainer v-else-if="route === '/guides/customization'" size="md">
          <article class="docs-article">
            <KvHeading :level="1" eyebrow="Guide / Theme">Customization</KvHeading>
            <KvText size="lg" tone="muted">KinkyVibes remains a single dark theme. Customize emphasis and rhythm by overriding tokens rather than branching into theme modes.</KvText>
            <EditorialVisual :image="pageVisuals.customization" marker="page-customization" label="Surface / controlled override" />
            <h2>Scoped overrides</h2>
            <KvCode block>&lt;KvProvider :tokens="{
  '--kv-color-signal': '#ff4d00',
  '--kv-space-4': '1.125rem'
}"&gt;
  &lt;App /&gt;
&lt;/KvProvider&gt;</KvCode>
            <h2>CSS boundary</h2>
            <KvCode block>.operations-panel {
  --kv-color-surface: #121416;
  --kv-shadow-hard: 6px 6px 0 #000;
}</KvCode>
            <p>Stable kv-* classes are available for narrow integration adjustments. Token overrides are less coupled and should be the default.</p>
          </article>
        </KvContainer>

        <KvContainer v-else-if="route === '/accessibility'" size="md">
          <article class="docs-article">
            <KvHeading :level="1" eyebrow="Quality / A11Y">Accessibility</KvHeading>
            <KvText size="lg" tone="muted">Semantics, keyboard behavior, focus visibility, reduced motion, and live regions are tested as engineering requirements.</KvText>
            <EditorialVisual :image="pageVisuals.accessibility" marker="page-accessibility" label="Control / differentiated state" />
            <h2>Manual checklist</h2>
            <ul class="docs-checklist"><li>Complete every interactive example with keyboard only.</li><li>Confirm focus remains visible against all surfaces.</li><li>Verify dialog focus enters, cycles, and returns to the trigger.</li><li>Review labels, descriptions, errors, and live updates in NVDA, VoiceOver, or Orca.</li><li>Zoom to 200% at 375px and confirm no two-dimensional page overflow.</li><li>Enable reduced motion and verify non-essential transitions collapse.</li></ul>
            <div class="docs-callout"><strong>Scope statement</strong><p>Automated axe checks on representative pages must report no critical violations. This evidence is best effort and is not a formal WCAG conformance declaration.</p></div>
          </article>
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
          <span>@kinky-vibes/ui v0.1.0</span>
          <span>Released under the <a href="https://github.com/kinky-vibes/kinky-vibes/blob/main/LICENSE" rel="noreferrer">MIT License</a></span>
          <a href="https://github.com/kinky-vibes/kinky-vibes" rel="noreferrer">GitHub ↗</a>
        </footer>
      </main>
    </div>
  </KvProvider>
</template>
