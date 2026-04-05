import { test, expect } from '@playwright/test'

// ============================================================
// ТЕСТЫ НАСТРОЕК ОРГАНИЗАЦИИ
// ============================================================

test.describe('Страница настроек /dashboard/settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/settings')
    await expect(page.locator('h1')).toBeVisible()
  })

  test('отображает форму настроек', async ({ page }) => {
    await expect(page.locator('input[name="inn"], input[placeholder*="ИНН"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('показывает ошибку при невалидном ИНН', async ({ page }) => {
    const innInput = page.locator('input[name="inn"], input[placeholder*="ИНН"]').first()
    await innInput.fill('123') // Слишком короткий
    await innInput.blur()
    // Ошибка валидации или сообщение
    await expect(page.locator('text=/инн|цифр/i')).toBeVisible({ timeout: 3000 })
  })

  test('автозаполнение по ИНН Сбербанка', async ({ page }) => {
    const innInput = page.locator('input[name="inn"], input[placeholder*="ИНН"]').first()
    await innInput.fill('7707083893')
    await innInput.blur()

    // Ждём загрузки данных
    await page.waitForTimeout(2000)

    // Поле названия должно заполниться
    const nameInput = page.locator('input[name="name"], input[placeholder*="назван"]').first()
    const nameValue = await nameInput.inputValue()
    expect(nameValue.length).toBeGreaterThan(0)
  })

  test('поле типа организации содержит МКК и МФК', async ({ page }) => {
    const select = page.locator('select, [role="combobox"]').first()
    await select.click()
    await expect(page.locator('text=МКК')).toBeVisible()
    await expect(page.locator('text=МФК')).toBeVisible()
  })

  test('DatePicker для даты ПВК работает', async ({ page }) => {
    // Находим поле даты ПВК
    const dateInput = page.locator('input[placeholder="дд.мм.гггг"]').first()
    await dateInput.fill('01012024')
    await expect(dateInput).toHaveValue('01.01.2024')
  })

  test('сохраняет данные организации', async ({ page }) => {
    // Заполняем минимальные данные
    const innInput = page.locator('input[name="inn"], input[placeholder*="ИНН"]').first()
    await innInput.fill('7707083893')
    await innInput.blur()
    await page.waitForTimeout(2000)

    // Выбираем тип организации
    const orgTypeSelect = page.locator('[role="combobox"]').first()
    await orgTypeSelect.click()
    await page.locator('text=МКК').click()

    // Заполняем ФИО СДЛ
    const sdlInput = page.locator('input[name="sdl_name"], input[placeholder*="ФИО"]').first()
    if (await sdlInput.isVisible()) {
      await sdlInput.fill('Иванов Иван Иванович')
    }

    await page.click('button[type="submit"]')

    // Должен появиться toast об успехе или редирект
    await expect(
      page.locator('text=/сохран|успешно/i').first()
    ).toBeVisible({ timeout: 5000 })
  })
})
