import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('desktop search supports shortcut, keyboard navigation, dismissal, and empty state', async ({ page }) => {
  await page.goto('/#/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Pressure')
  await page.keyboard.press('ControlOrMeta+k')
  const search = page.getByRole('combobox', { name: 'Search documentation' })
  await expect(search).toBeFocused()
  await search.fill('combobox')
  await expect(page.getByRole('option', { name: /KvCombobox/ })).toBeVisible()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('heading', { level: 1, name: 'KvCombobox' })).toBeVisible()

  await search.fill('drawer')
  await expect(page.getByRole('listbox', { name: 'Search results' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('listbox', { name: 'Search results' })).toBeHidden()
  await search.fill('definitely-not-a-kv-component')
  await expect(page.getByText('No results', { exact: true })).toBeVisible()
  await expect(page.getByText('0 results found.', { exact: true })).toBeAttached()
  await page.getByRole('heading', { level: 1, name: 'KvCombobox' }).click()
  await expect(page.getByRole('listbox', { name: 'Search results' })).toBeHidden()
})

test('mobile search opens from a compact trigger and follows arrow and Enter keys', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/#/')
  const trigger = page.getByRole('button', { name: 'Search documentation' })
  await trigger.click()
  const dialog = page.getByRole('dialog', { name: 'Search documentation' })
  await expect(dialog).toBeVisible()
  const search = dialog.getByRole('combobox', { name: 'Search documentation' })
  await expect(search).toBeFocused()
  await search.fill('installation')
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('ArrowUp')
  await page.keyboard.press('Enter')
  await expect(page.getByRole('heading', { level: 1, name: 'Installation' })).toBeVisible()
  await expect(dialog).toBeHidden()
})

test('search exposes a recoverable fetch error state', async ({ page }) => {
  await page.route('**/search-index.json', (route) => route.fulfill({ status: 503, body: 'unavailable' }))
  await page.goto('/#/')
  await page.getByRole('combobox', { name: 'Search documentation' }).fill('button')
  await expect(page.getByRole('alert')).toContainText('Search offline')
  await expect(page.getByRole('alert')).toContainText('navigating from the menu')
})

test('showcase assets load and every embedded component remains interactive', async ({ page }) => {
  await page.goto('/#/')
  const hero = page.locator('[data-showcase-image="hero"]')
  await expect(hero).toHaveAttribute('loading', 'eager')
  await expect(hero).toHaveAttribute('fetchpriority', 'high')
  await expect.poll(() => hero.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth)).toBeGreaterThan(0)

  await page.getByRole('tab', { name: 'Output' }).click()
  await expect(page.getByRole('tabpanel')).toContainText('Output channel')
  const monitoring = page.getByRole('switch', { name: 'Monitoring' })
  await expect(monitoring).toHaveAttribute('aria-checked', 'true')
  await monitoring.click()
  await expect(monitoring).toHaveAttribute('aria-checked', 'false')
  await page.getByRole('button', { name: 'Advance' }).click()
  await expect(page.getByRole('progressbar', { name: 'Sequence pressure' })).toHaveAttribute('aria-valuenow', '76')

  const landingEditorialImages = page.locator('[data-editorial-image]')
  await expect(landingEditorialImages).toHaveCount(4)
  for (const image of await landingEditorialImages.all()) {
    await image.scrollIntoViewIfNeeded()
    await expect(image).toHaveAttribute('loading', 'lazy')
    await expect(image).toHaveAttribute('decoding', 'async')
    await expect(image).toHaveAttribute('alt', '')
    await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth)).toBeGreaterThan(0)
  }

  await page.goto('/#/components')
  const categoryImages = page.locator('[data-showcase-scene] [data-showcase-image]')
  await expect(categoryImages).toHaveCount(7)
  for (const image of await categoryImages.all()) {
    await image.scrollIntoViewIfNeeded()
    await expect(image).toHaveAttribute('loading', 'lazy')
    await expect(image).toHaveAttribute('decoding', 'async')
    await expect(image).toHaveAttribute('alt', '')
    await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth)).toBeGreaterThan(0)
  }

  await expect(page.locator('[data-showcase-scene="foundations"] h3')).toContainText('Pressure systems')
  await page.getByRole('button', { name: 'Transmit signal' }).click()
  await expect(page.locator('[data-showcase-scene="actions"]')).toContainText('Transmissions: 1')
  await page.getByRole('textbox', { name: 'Call sign' }).fill('BK-04')
  await expect(page.getByRole('textbox', { name: 'Call sign' })).toHaveValue('BK-04')
  await page.getByRole('tab', { name: 'Routing' }).click()
  await expect(page.locator('[data-showcase-scene="navigation"] [role="tabpanel"]')).toContainText('Routing channel selected')

  const overlayScene = page.locator('[data-showcase-scene="overlays"] .docs-category-scene')
  await page.getByRole('button', { name: 'Show overlay details' }).click()
  const popover = page.getByRole('dialog').filter({ hasText: 'Positioned context' })
  await expect(popover).toBeVisible()
  const [sceneBox, popoverBox] = await Promise.all([overlayScene.boundingBox(), popover.boundingBox()])
  expect(sceneBox).not.toBeNull()
  expect(popoverBox).not.toBeNull()
  expect(popoverBox!.x).toBeGreaterThanOrEqual(sceneBox!.x - 1)
  expect(popoverBox!.x + popoverBox!.width).toBeLessThanOrEqual(sceneBox!.x + sceneBox!.width + 1)
  expect(popoverBox!.y).toBeGreaterThanOrEqual(sceneBox!.y - 1)
  expect(popoverBox!.y + popoverBox!.height).toBeLessThanOrEqual(sceneBox!.y + sceneBox!.height + 1)

  const dataScene = page.locator('[data-showcase-scene="data-disclosure"]')
  await dataScene.getByRole('button', { name: 'Signal' }).click()
  await expect(dataScene.getByRole('columnheader', { name: 'Signal' })).toHaveAttribute('aria-sort', 'descending')
  const feedbackScene = page.locator('[data-showcase-scene="feedback"]')
  await feedbackScene.getByRole('button', { name: 'Dismiss' }).click()
  await expect(feedbackScene.locator('.kv-alert')).toBeHidden()
  await expect(feedbackScene.getByRole('button', { name: 'Restore alert' })).toBeVisible()

  const editorialPages = [
    ['/#/installation', 'page-installation'],
    ['/#/tokens', 'page-tokens'],
    ['/#/guides/ssr', 'page-ssr'],
    ['/#/guides/customization', 'page-customization'],
    ['/#/accessibility', 'page-accessibility'],
  ] as const
  for (const [path, marker] of editorialPages) {
    await page.goto(path)
    const image = page.locator(`[data-editorial-image="${marker}"]`)
    await image.scrollIntoViewIfNeeded()
    await expect(image).toHaveAttribute('loading', 'lazy')
    await expect(image).toHaveAttribute('decoding', 'async')
    await expect(image).toHaveAttribute('alt', '')
    await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth)).toBeGreaterThan(0)
  }
})

test('editorial pages stay within the compact viewport', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  for (const path of ['/#/installation', '/#/tokens', '/#/guides/ssr', '/#/guides/customization', '/#/accessibility']) {
    await page.goto(path)
    await page.locator('[data-editorial-image]').scrollIntoViewIfNeeded()
    const width = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }))
    expect(width.scroll).toBeLessThanOrEqual(width.client + 1)
  }
})

test('responsive drawer traps focus, closes through every path, restores focus, and locks scroll', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/#/components')
  const menu = page.getByRole('button', { name: 'Menu' })
  await expect(menu).toBeVisible()
  await menu.click()
  const drawer = page.getByRole('dialog', { name: 'Documentation' })
  await expect(drawer).toBeVisible()
  await expect(page.locator('html')).toHaveCSS('overflow', 'hidden')
  await expect(drawer.getByRole('button', { name: 'Close' })).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(drawer.getByRole('link', { name: 'Accessibility' })).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(drawer.getByRole('button', { name: 'Close' })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(drawer).toBeHidden()
  await expect(menu).toBeFocused()
  await expect(page.locator('html')).not.toHaveCSS('overflow', 'hidden')

  await menu.click()
  await page.locator('.kv-overlay--drawer').click({ position: { x: 370, y: 400 } })
  await expect(drawer).toBeHidden()
  await expect(menu).toBeFocused()

  await menu.click()
  await drawer.getByRole('link', { name: 'Button', exact: true }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'KvButton' })).toBeVisible()
  await expect(drawer).toBeHidden()
  await expect(page.locator('html')).not.toHaveCSS('overflow', 'hidden')
  const width = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }))
  expect(width.scroll).toBeLessThanOrEqual(width.client + 1)
})

test('catalog category navigation tracks sections and details expose adjacent components', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/#/components')
  await expect(page.getByRole('heading', { level: 2, name: 'Foundations 11 components' })).toBeVisible()
  await expect(page.getByRole('heading', { level: 2, name: 'Feedback 7 components' })).toBeAttached()
  const feedback = page.getByRole('button', { name: 'Feedback 7' })
  await feedback.click()
  await expect(feedback).toHaveAttribute('aria-current', 'true')
  await expect.poll(() => page.locator('[data-category="Feedback"]').evaluate((element) => Math.round(element.getBoundingClientRect().top))).toBeLessThan(110)

  await page.goto('/#/components/button')
  await expect(page).toHaveTitle('KvButton — KinkyVibes UI')
  const adjacent = page.getByRole('navigation', { name: 'Adjacent components' })
  await expect(adjacent.getByRole('link', { name: /Previous component KvCode/ })).toBeVisible()
  await adjacent.getByRole('link', { name: /Next component KvIconButton/ }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'KvIconButton' })).toBeVisible()
})

test('sidebar marks every public route and document titles follow navigation', async ({ page }) => {
  const routes = [
    ['/#/', 'Introduction', 'KinkyVibes UI — Industrial Vue components'],
    ['/#/installation', 'Installation', 'Installation — KinkyVibes UI'],
    ['/#/tokens', 'Token explorer', 'Token explorer — KinkyVibes UI'],
    ['/#/components', 'All components', 'Components — KinkyVibes UI'],
    ['/#/guides/ssr', 'SSR & Nuxt', 'SSR & Nuxt — KinkyVibes UI'],
    ['/#/guides/customization', 'Customization', 'Customization — KinkyVibes UI'],
    ['/#/accessibility', 'Accessibility', 'Accessibility — KinkyVibes UI'],
  ] as const
  for (const [path, link, title] of routes) {
    await page.goto(path)
    await expect(page.getByRole('navigation', { name: 'Documentation' }).getByRole('link', { name: link, exact: true })).toHaveAttribute('aria-current', 'page')
    await expect(page).toHaveTitle(title)
  }
  await page.goto('/#/components/dialog')
  await expect(page.getByRole('navigation', { name: 'Documentation' }).getByRole('link', { name: 'Dialog', exact: true })).toHaveAttribute('aria-current', 'page')
  await expect(page).toHaveTitle('KvDialog — KinkyVibes UI')
})

for (const width of [320, 375]) {
  test(`open mobile states do not cause horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 812 })
    await page.goto('/#/components')
    const assertNoOverflow = async () => {
      const dimensions = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }))
      expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.client + 1)
    }
    await assertNoOverflow()
    await page.getByRole('button', { name: 'Search documentation' }).click()
    await assertNoOverflow()
    await page.keyboard.press('Escape')
    await page.getByRole('button', { name: 'Menu' }).click()
    await assertNoOverflow()
  })
}

test('opened mobile search and drawer have no critical axe violations', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/#/components')
  await page.getByRole('button', { name: 'Search documentation' }).click()
  let results = await new AxeBuilder({ page }).analyze()
  expect(results.violations.filter((violation) => violation.impact === 'critical')).toEqual([])
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: 'Menu' }).click()
  results = await new AxeBuilder({ page }).analyze()
  expect(results.violations.filter((violation) => violation.impact === 'critical')).toEqual([])
})

test('tabs and combobox implement documented keyboard movement', async ({ page }) => {
  await page.goto('/#/components/tabs')
  const status = page.getByRole('tab', { name: 'Status' })
  await status.focus()
  await page.keyboard.press('ArrowRight')
  await expect(page.getByRole('tab', { name: 'Routing' })).toHaveAttribute('aria-selected', 'true')
  await page.keyboard.press('End')
  await expect(page.getByRole('tab', { name: 'Routing' })).toHaveAttribute('aria-selected', 'true')

  await page.goto('/#/components/combobox')
  const combobox = page.getByRole('combobox', { name: 'Channel' })
  await combobox.fill('br')
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')
  await expect(combobox).toHaveValue('Bravo channel')
  await expect(page.getByRole('listbox')).toBeHidden()
})

test('dialog traps focus, handles Escape, restores focus, and locks scroll', async ({ page }) => {
  await page.goto('/#/components/dialog')
  const trigger = page.getByRole('button', { name: 'Open dialog' })
  await trigger.click()
  const dialog = page.getByRole('dialog', { name: 'Review routing' })
  await expect(dialog).toBeVisible()
  await expect(page.locator('html')).toHaveCSS('overflow', 'hidden')
  await expect(page.getByRole('button', { name: 'Close' })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(trigger).toBeFocused()
  await expect(page.locator('html')).not.toHaveCSS('overflow', 'hidden')
})

test('table emits state while toast announces feedback', async ({ page }) => {
  await page.goto('/#/components/table')
  await page.getByRole('button', { name: /Signal/ }).click()
  await expect(page.getByRole('columnheader', { name: /Signal/ })).toHaveAttribute('aria-sort', 'descending')
  await page.getByRole('checkbox', { name: 'Select row 2' }).check()
  await expect(page.getByRole('checkbox', { name: 'Select row 2' })).toBeChecked()

  await page.goto('/#/components/toast-provider')
  await page.getByRole('button', { name: 'Create toast' }).click()
  await expect(page.getByRole('status')).toContainText('Signal stored')
})

for (const path of ['/#/', '/#/components', '/#/components/dialog', '/#/components/field', '/#/accessibility']) {
  test(`representative page ${path} has no critical axe violations`, async ({ page }) => {
    await page.goto(path)
    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations.filter((violation) => violation.impact === 'critical')).toEqual([])
  })
}
