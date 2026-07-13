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

for (const path of ['/#/', '/#/components/dialog', '/#/components/field']) {
  test(`representative page ${path} has no critical axe violations`, async ({ page }) => {
    await page.goto(path)
    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations.filter((violation) => violation.impact === 'critical')).toEqual([])
  })
}
