import { expect, test } from '@playwright/test'

test.skip(({ browserName }) => browserName !== 'chromium', 'Visual baselines use Chromium for deterministic rasterization.')

test('landing is stable at desktop and compact widths', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/#/')
  await expect(page).toHaveScreenshot('landing-1440.png', { fullPage: true })

  await page.setViewportSize({ width: 375, height: 812 })
  await page.reload()
  await expect(page).toHaveScreenshot('landing-375.png', { fullPage: true })
})

test('button states and open overlay remain stable', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/#/components/button')
  const demo = page.locator('.docs-demo-section')
  await expect(demo).toHaveScreenshot('button-normal-disabled-loading.png')
  await page.getByRole('button', { name: 'Transmit' }).hover()
  await page.getByRole('button', { name: 'Hold' }).focus()
  await expect(demo).toHaveScreenshot('button-hover-focus.png')

  await page.goto('/#/components/dialog')
  await page.getByRole('button', { name: 'Open dialog' }).click()
  await expect(page).toHaveScreenshot('dialog-open.png')
})

test('error and loading surfaces remain stable', async ({ page }) => {
  await page.goto('/#/components/field')
  await expect(page.locator('.docs-demo-section')).toHaveScreenshot('field-error.png')
  await page.goto('/#/components/alert')
  await expect(page.locator('.docs-demo-section')).toHaveScreenshot('alert-warning.png')
  await page.goto('/#/components/progress')
  await expect(page.locator('.docs-demo-section')).toHaveScreenshot('progress-normal.png')
  await page.goto('/#/components/skeleton')
  await expect(page.locator('.docs-demo-section')).toHaveScreenshot('skeleton-loading.png')
})
