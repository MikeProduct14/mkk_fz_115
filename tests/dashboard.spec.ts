import { test, expect } from '@playwright/test'

// ============================================================
// ТЕСТЫ DASHBOARD (авторизованный пользователь)
// ============================================================

test.describe('Dashboard главная', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard')
  })

  test('загружается без ошибок', async ({ page }) => {
    await expect(page).not.toHaveURL('/login')
    await expect(page.locator('h1')).toBeVisible()
  })

  test('отображает навигацию', async ({ page }) => {
    await expect(page.locator('nav, aside')).toBeVisible()
    await expect(page.locator('a[href="/dashboard/clients"]')).toBeVisible()
    await expect(page.locator('a[href="/dashboard/settings"]')).toBeVisible()
  })

  test('отображает статистику клиентов', async ({ page }) => {
    // Карточки со счётчиками
    await expect(page.locator('text=/клиент|проверк/i').first()).toBeVisible()
  })

  test('кнопка "Добавить клиента" ведёт на /clients/new', async ({ page }) => {
    const btn = page.locator('a[href="/dashboard/clients/new"]').first()
    await expect(btn).toBeVisible()
  })
})

test.describe('Навигация', () => {
  test('переход на список клиентов', async ({ page }) => {
    await page.goto('/dashboard')
    await page.click('a[href="/dashboard/clients"]')
    await expect(page).toHaveURL(/\/dashboard\/clients/)
    await expect(page.locator('h1')).toBeVisible()
  })

  test('переход на настройки', async ({ page }) => {
    await page.goto('/dashboard')
    await page.click('a[href="/dashboard/settings"]')
    await expect(page).toHaveURL(/\/dashboard\/settings/)
    await expect(page.locator('h1')).toBeVisible()
  })

  test('переход на ПВК', async ({ page }) => {
    await page.goto('/dashboard')
    const pvkLink = page.locator('a[href="/dashboard/pvk"]')
    if (await pvkLink.isVisible()) {
      await pvkLink.click()
      await expect(page).toHaveURL(/\/dashboard\/pvk/)
    }
  })

  test('выход из системы', async ({ page }) => {
    await page.goto('/dashboard')
    // Ищем кнопку выхода
    const signOutBtn = page.locator('button:has-text("Выйти"), a:has-text("Выйти")').first()
    if (await signOutBtn.isVisible()) {
      await signOutBtn.click()
      await page.waitForURL('**/login**', { timeout: 5000 })
      expect(page.url()).toContain('/login')
    }
  })
})

test.describe('Список клиентов', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/clients')
  })

  test('загружается без ошибок', async ({ page }) => {
    await expect(page.locator('h1')).toBeVisible()
    // Либо таблица с клиентами, либо сообщение "нет клиентов"
    const hasClients = await page.locator('table').isVisible()
    const isEmpty = await page.locator('text=/клиент|добавить/i').isVisible()
    expect(hasClients || isEmpty).toBe(true)
  })

  test('кнопка "Новый клиент" ведёт на форму', async ({ page }) => {
    const btn = page.locator('a[href="/dashboard/clients/new"]').first()
    await expect(btn).toBeVisible()
    await btn.click()
    await expect(page).toHaveURL(/\/clients\/new/)
  })
})
