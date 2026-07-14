import actionsLarge from './assets/showcase/actions-960.webp'
import actionsSmall from './assets/showcase/actions-480.webp'
import dataDisclosureLarge from './assets/showcase/data-disclosure-960.webp'
import dataDisclosureSmall from './assets/showcase/data-disclosure-480.webp'
import feedbackLarge from './assets/showcase/feedback-960.webp'
import feedbackSmall from './assets/showcase/feedback-480.webp'
import formsLarge from './assets/showcase/forms-960.webp'
import formsSmall from './assets/showcase/forms-480.webp'
import foundationsLarge from './assets/showcase/foundations-960.webp'
import foundationsSmall from './assets/showcase/foundations-480.webp'
import heroLarge from './assets/showcase/hero-1600.webp'
import heroSmall from './assets/showcase/hero-800.webp'
import navigationLarge from './assets/showcase/navigation-960.webp'
import navigationSmall from './assets/showcase/navigation-480.webp'
import overlaysLarge from './assets/showcase/overlays-960.webp'
import overlaysSmall from './assets/showcase/overlays-480.webp'

export type ShowcaseCategory =
  | 'Foundations'
  | 'Actions'
  | 'Forms'
  | 'Navigation'
  | 'Overlays'
  | 'Data & Disclosure'
  | 'Feedback'

export type ShowcasePreviewName =
  | 'KvHeading'
  | 'KvButton'
  | 'KvField'
  | 'KvTabs'
  | 'KvPopover'
  | 'KvTable'
  | 'KvAlert'

export interface ShowcaseImage {
  src: string
  srcset: string
  width: number
  height: number
}

export interface ShowcaseScene {
  category: ShowcaseCategory
  slug: string
  index: string
  description: string
  preview: ShowcasePreviewName
  image: ShowcaseImage
}

function image(src: string, small: string, width: number, height: number, smallWidth: number): ShowcaseImage {
  return { src, srcset: `${small} ${smallWidth}w, ${src} ${width}w`, width, height }
}

export const heroImage = image(heroLarge, heroSmall, 1600, 1000, 800)

export const showcaseScenes: readonly ShowcaseScene[] = [
  {
    category: 'Foundations',
    slug: 'foundations',
    index: '01',
    description: 'Type, rhythm, and structure locked to one deliberate system.',
    preview: 'KvHeading',
    image: image(foundationsLarge, foundationsSmall, 960, 720, 480),
  },
  {
    category: 'Actions',
    slug: 'actions',
    index: '02',
    description: 'Mechanical controls with explicit hierarchy and state.',
    preview: 'KvButton',
    image: image(actionsLarge, actionsSmall, 960, 720, 480),
  },
  {
    category: 'Forms',
    slug: 'forms',
    index: '03',
    description: 'Input assemblies that keep labels, guidance, and errors connected.',
    preview: 'KvField',
    image: image(formsLarge, formsSmall, 960, 720, 480),
  },
  {
    category: 'Navigation',
    slug: 'navigation',
    index: '04',
    description: 'Clear routes through dense application structures.',
    preview: 'KvTabs',
    image: image(navigationLarge, navigationSmall, 960, 720, 480),
  },
  {
    category: 'Overlays',
    slug: 'overlays',
    index: '05',
    description: 'Layered context that stays bounded, positioned, and keyboard-aware.',
    preview: 'KvPopover',
    image: image(overlaysLarge, overlaysSmall, 960, 720, 480),
  },
  {
    category: 'Data & Disclosure',
    slug: 'data-disclosure',
    index: '06',
    description: 'Records, state, and progressive detail built on semantic HTML.',
    preview: 'KvTable',
    image: image(dataDisclosureLarge, dataDisclosureSmall, 960, 720, 480),
  },
  {
    category: 'Feedback',
    slug: 'feedback',
    index: '07',
    description: 'Signals that remain concise, semantic, and impossible to miss.',
    preview: 'KvAlert',
    image: image(feedbackLarge, feedbackSmall, 960, 720, 480),
  },
]
