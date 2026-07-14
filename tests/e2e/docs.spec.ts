import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('landing and component search navigate through public documentation', async ({ page }) => {
  await page.goto('/#/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Pressure')
  await page.getByRole('searchbox', { name: 'Search documentation' }).fill('combobox')
  await expect(page.getByRole('link', { name: /KvCombobox/ })).toBeVisible()
  await page.getByRole('link', { name: /KvCombobox/ }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'KvCombobox' })).toBeVisible()
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
})

test('responsive navigation opens without horizontal page overflow', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/#/components')
  const menu = page.getByRole('button', { name: 'Menu' })
  await expect(menu).toBeVisible()
  await menu.click()
  await expect(page.getByRole('navigation', { name: 'Documentation' })).toBeVisible()
  await page.getByRole('link', { name: 'Button', exact: true }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'KvButton' })).toBeVisible()
  const width = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }))
  expect(width.scroll).toBeLessThanOrEqual(width.client + 1)
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

for (const path of ['/#/', '/#/components', '/#/components/dialog', '/#/components/field']) {
  test(`representative page ${path} has no critical axe violations`, async ({ page }) => {
    await page.goto(path)
    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations.filter((violation) => violation.impact === 'critical')).toEqual([])
  })
}
