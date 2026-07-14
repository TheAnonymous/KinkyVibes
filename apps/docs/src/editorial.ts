import featureCssLarge from './assets/showcase/feature-css-720.webp'
import featureCssSmall from './assets/showcase/feature-css-360.webp'
import featureFocusLarge from './assets/showcase/feature-focus-720.webp'
import featureFocusSmall from './assets/showcase/feature-focus-360.webp'
import featureSsrLarge from './assets/showcase/feature-ssr-720.webp'
import featureSsrSmall from './assets/showcase/feature-ssr-360.webp'
import pageAccessibilityLarge from './assets/showcase/page-accessibility-1200.webp'
import pageAccessibilitySmall from './assets/showcase/page-accessibility-600.webp'
import pageCustomizationLarge from './assets/showcase/page-customization-1200.webp'
import pageCustomizationSmall from './assets/showcase/page-customization-600.webp'
import pageInstallationLarge from './assets/showcase/page-installation-1200.webp'
import pageInstallationSmall from './assets/showcase/page-installation-600.webp'
import pageSsrLarge from './assets/showcase/page-ssr-1200.webp'
import pageSsrSmall from './assets/showcase/page-ssr-600.webp'
import pageTokensLarge from './assets/showcase/page-tokens-1200.webp'
import pageTokensSmall from './assets/showcase/page-tokens-600.webp'
import systemFieldLarge from './assets/showcase/system-field-1600.webp'
import systemFieldSmall from './assets/showcase/system-field-800.webp'
import type { ShowcaseImage } from './showcase'

export interface FeatureStory {
  code: string
  slug: string
  title: string
  description: string
  image: ShowcaseImage
}

function image(src: string, small: string, width: number, height: number, smallWidth: number): ShowcaseImage {
  return { src, srcset: `${small} ${smallWidth}w, ${src} ${width}w`, width, height }
}

export const systemFieldImage = image(systemFieldLarge, systemFieldSmall, 1600, 640, 800)

export const featureStories: readonly FeatureStory[] = [
  {
    code: 'FOCUS',
    slug: 'feature-focus',
    title: 'Interaction owned locally',
    description: 'Focus traps, restoration, scroll lock, keyboard movement, and viewport positioning ship inside the package.',
    image: image(featureFocusLarge, featureFocusSmall, 720, 480, 360),
  },
  {
    code: 'SSR',
    slug: 'feature-ssr',
    title: 'Server first',
    description: 'Vue useId keeps identifiers deterministic. Browser APIs wait for mount, while teleports hydrate in place.',
    image: image(featureSsrLarge, featureSsrSmall, 720, 480, 360),
  },
  {
    code: 'CSS',
    slug: 'feature-css',
    title: 'Stable surface contract',
    description: 'Override documented --kv-* tokens or target stable kv-* classes. The standard look remains tree-shakeable.',
    image: image(featureCssLarge, featureCssSmall, 720, 480, 360),
  },
]

export const pageVisuals = {
  installation: image(pageInstallationLarge, pageInstallationSmall, 1200, 600, 600),
  tokens: image(pageTokensLarge, pageTokensSmall, 1200, 600, 600),
  ssr: image(pageSsrLarge, pageSsrSmall, 1200, 600, 600),
  customization: image(pageCustomizationLarge, pageCustomizationSmall, 1200, 600, 600),
  accessibility: image(pageAccessibilityLarge, pageAccessibilitySmall, 1200, 600, 600),
} as const
