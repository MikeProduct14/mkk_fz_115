import { test, expect } from '@playwright/test'

// ============================================================
// ТЕСТЫ АВТОРИЗАЦИИ (без storageState — используем свежий контекст)
// ============================================================

test.use({ storageState: { cookies: [], origins: [] } })

test.describe('Страница входа /login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('отображает форму входа', async ({ page }) => {
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('показывает ошибку при неверных credentials', async ({ page }) => {
    await page.fill('input[type="email"]', 'wrong@wrong.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')

    // Должна появиться ошибка
    await expect(page.locator('text=/ошибка|неверн|invalid/i')).toBeVisible({ timeout: 5000 })
  })

  test('показывает ошибку при пустом email', async ({ page }) => {
    await page.fill('input[type="password"]', 'somepassword')
    await page.click('button[type="submit"]')
    // HTML5 валидация или серверная ошибка
    const emailInput = page.locator('input[type="email"]')
    const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid)
    expect(isInvalid).toBe(true)
  })

  test('есть ссылка на регистрацию', async ({ page }) => {
    await expect(page.locator('a[href="/register"]')).toBeVisible()
  })

  test('редиректит на dashboard после успешного входа', async ({ page }) => {
    // Этот тест требует TEST_PASSWORD в .env.test
    const password = process.env.TEST_PASSWORD
    if (!password) {
      test.skip()
      return
    }
    await page.fill('input[type="email"]', process.env.TEST_EMAIL || 'playwright@test.com')
    await page.fill('input[type="password"]', password)
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard**', { timeout: 10000 })
    expect(page.url()).toContain('/dashboard')
  })
})

test.describe('Страница регистрации /register', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register')
  })

  test('отображает форму регистрации', async ({ page }) => {
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[name="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('показывает ошибку при коротком пароле', async ({ page }) => {
    await page.fill('input[type="email"]', 'newuser@test.com')
    await page.fill('input[type="password"]', '123')
    await page.click('button[type="submit"]')
    await expect(page.locator('text=/пароль|password/i')).toBeVisible({ timeout: 5000 })
  })

  test('есть ссылка на вход', async ({ page }) => {
    await expect(page.locator('a[href="/login"]')).toBeVisible()
  })
})

test.describe('Защита роутов', () => {
  test('редиректит с /dashboard на /login без авторизации', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForURL('**/login**', { timeout: 5000 })
    expect(page.url()).toContain('/login')
  })

  test('редиректит с /dashboard/clients на /login без авторизации', async ({ page }) => {
    await page.goto('/dashboard/clients')
    await page.waitForURL('**/login**', { timeout: 5000 })
    expect(page.url()).toContain('/login')
  })

  test('редиректит с /dashboard/settings на /login без авторизации', async ({ page }) => {
    await page.goto('/dashboard/settings')
    await page.waitForURL('**/login**', { timeout: 5000 })
    expect(page.url()).toContain('/login')
  })
})
