import { test as setup, expect } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

const authFile = 'playwright/.auth/user.json'

// Тестовый пользователь создан в Supabase с тем же паролем что у основного аккаунта
// Задайте TEST_EMAIL и TEST_PASSWORD в .env.test или передайте через env
const TEST_EMAIL = process.env.TEST_EMAIL || 'playwright@test.com'
// ВАЖНО: пароль должен совпадать с паролем от mike140488@gmail.com
const TEST_PASSWORD = process.env.TEST_PASSWORD || ''

setup('authenticate', async ({ page }) => {
  if (!TEST_PASSWORD) {
    throw new Error(
      'TEST_PASSWORD не задан. Создайте файл .env.test с TEST_PASSWORD=ваш_пароль'
    )
  }

  const dir = path.dirname(authFile)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  await page.goto('/login')
  await expect(page.locator('form').first()).toBeVisible({ timeout: 10000 })

  await page.fill('input[type="email"]', TEST_EMAIL)
  await page.fill('input[type="password"]', TEST_PASSWORD)
  await page.click('button[type="submit"]')

  await page.waitForTimeout(3000)
  await page.screenshot({ path: 'playwright/debug-login.png' })
  console.log('Current URL after submit:', page.url())
  // Ищем текст ошибки на странице
  const errorText = await page.locator('[class*="red"], [class*="error"], [role="alert"]').allInnerTexts().catch(() => [])
  console.log('Error elements:', errorText)
  const bodyText = await page.locator('body').innerText().catch(() => '')
  console.log('Body snippet:', bodyText.slice(0, 500))

  await page.waitForURL('**/dashboard**', { timeout: 15000 })
  await page.context().storageState({ path: authFile })
  console.log('✓ Auth state saved')
})
