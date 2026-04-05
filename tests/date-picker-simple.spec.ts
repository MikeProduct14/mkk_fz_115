import { test, expect } from '@playwright/test'

// Простые тесты DatePicker без авторизации
// Используем страницу регистрации где тоже есть формы

test.describe('DatePicker - базовые проверки', () => {
  test('страница с формой загружается', async ({ page }) => {
    await page.goto('http://localhost:3001/register')
    
    // Проверяем что страница загрузилась
    await expect(page.locator('h1')).toContainText('Регистрация')
  })
})

// Для полноценного тестирования DatePicker нужно:
// 1. Создать тестового пользователя test@test.com / test123456
// 2. Запустить: npx playwright test date-picker.spec.ts
