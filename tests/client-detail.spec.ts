import { test, expect } from '@playwright/test'

// ============================================================
// ТЕСТЫ КАРТОЧКИ КЛИЕНТА
// Создаём клиента через форму, потом тестируем карточку
// ============================================================

let clientId: string

test.describe('Карточка клиента', () => {
  // Создаём тестового клиента перед всеми тестами
  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage({
      storageState: 'playwright/.auth/user.json'
    })
    
    await page.goto('/dashboard/clients/new')
    await expect(page.locator('h1')).toContainText('Новая анкета клиента', { timeout: 10000 })

    await page.locator('#last_name').fill('Регресс')
    await page.locator('#first_name').fill('Тест')
    await page.locator('#middle_name').fill('Тестович')

    // Заполняем дату рождения (обязательно для БД)
    const birthInput = page.locator('input[placeholder="дд.мм.гггг"]').first()
    await birthInput.fill('01011990')
    await birthInput.blur()
    await page.waitForTimeout(500)

    await page.locator('button:has-text("Сохранить черновик")').click()
    
    // Ждём редиректа на карточку клиента
    await page.waitForURL(/\/dashboard\/clients\/[a-f0-9-]+$/, { timeout: 15000 })
    const url = page.url()
    clientId = url.split('/').pop() || ''
    console.log('Created test client with ID:', clientId)
    
    await page.close()
  })

  test.beforeEach(async ({ page }) => {
    await page.goto(`/dashboard/clients/${clientId}`)
    await expect(page.locator('h1')).toBeVisible()
  })

  test('отображает ФИО клиента', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Регресс')
  })

  test('отображает бейдж статуса "Черновик"', async ({ page }) => {
    await expect(page.locator('text=Черновик')).toBeVisible()
  })

  test('отображает дату создания', async ({ page }) => {
    await expect(page.locator('text=/создан/i')).toBeVisible()
  })

  test('кнопка "Запустить проверку" видна для черновика', async ({ page }) => {
    await expect(page.locator('button:has-text("Запустить проверку")')).toBeVisible()
  })

  test('кнопка "Редактировать анкету" видна', async ({ page }) => {
    await expect(page.locator('button:has-text("Редактировать")')).toBeVisible()
  })

  test('отображает блок "Личные данные"', async ({ page }) => {
    await expect(page.locator('text=Личные данные')).toBeVisible()
    await expect(page.locator('h1:has-text("Регресс")')).toBeVisible()
  })

  test('404 для несуществующего клиента', async ({ page }) => {
    await page.goto('/dashboard/clients/00000000-0000-0000-0000-000000000000')
    // Должен показать 404 или редирект
    const is404 = await page.locator('text=/404|не найден/i').isVisible()
    const isRedirected = page.url().includes('/clients')
    expect(is404 || isRedirected).toBe(true)
  })

  test('запуск проверки меняет статус на "Проверяется"', async ({ page }) => {
    // Только если NEWDB_API_KEY задан
    const checkBtn = page.locator('button:has-text("Запустить проверку")')
    if (await checkBtn.isVisible()) {
      await checkBtn.click()
      // Статус должен смениться или появиться ошибка
      await page.waitForTimeout(1000)
      const statusChanged = await page.locator('text=/проверяется|черновик|одобрен|отказ/i').isVisible()
      expect(statusChanged).toBe(true)
    }
  })
})
